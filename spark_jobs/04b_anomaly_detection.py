import time
import pymongo
import uuid
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, mean, stddev, when, lit

def main():
    start_time = time.time()
    print("="*60)
    print("🚀 STARTING PHASE 4b: SPARK ANOMALY DETECTION")
    print("="*60)
    
    spark = SparkSession.builder \
        .appName("NYC Mobility - Anomalies") \
        .config("spark.driver.bindAddress", "127.0.0.1") \
        .config("spark.driver.memory", "10g") \
        .getOrCreate()
        
    spark.sparkContext.setLogLevel("WARN")
    
    print("Loading curated trips data (6.5M rows)...")
    df = spark.read.parquet("data/curated/trips")
    
    print("Calculating Global Statistical Means...")
    stats = df.select(
        mean(col("fare_amount")).alias("mean_fare"),
        stddev(col("fare_amount")).alias("std_fare")
    ).collect()[0]
    
    mean_fare = stats["mean_fare"]
    std_fare = stats["std_fare"]
    
    print("Applying Distributed Spark Rules (Speed, Physics, Z-Scores)...")
    # Calculate average speed in MPH
    df = df.withColumn("speed_mph", (col("trip_distance") / (col("trip_duration_sec") / 3600)))
    
    df = df.withColumn("anomaly_type", 
        when(col("speed_mph") > 85, lit("Speed Violation"))
        .when((col("trip_distance") == 0) & (col("fare_amount") > 100), lit("Zero Distance High Fare"))
        .when(col("fare_amount") < 0, lit("Negative Fare"))
        .when(col("fare_amount") > (mean_fare + 4 * std_fare), lit("Extreme Outlier Fare (Z > 4)"))
        .otherwise(lit("Valid"))
    )
    
    print("Filtering and isolating anomalous records...")
    flagged = df.filter(col("anomaly_type") != "Valid")
    
    print("Collecting anomalies for MongoDB export...")
    results = flagged.limit(100).collect()
    
    # Write to MongoDB
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["nyc_mobility"]
    collection = db["anomalies"]
    
    collection.drop() # Clear previous run
    
    docs = []
    for row in results:
        anomaly_type = row["anomaly_type"]
        score = 80
        action = "Manual Review"
        
        if anomaly_type == "Speed Violation":
            speed = row['speed_mph']
            details = f"Avg Speed: {speed:.1f} mph" if speed else "Avg Speed: Infinite"
            expected = "Speed < 65 mph"
            action = "Flag driver for review"
            score = 95
        elif anomaly_type == "Zero Distance High Fare":
            details = f"Distance: 0.0 mi, Fare: ${row['fare_amount']:.2f}"
            expected = "Distance > 5 mi for high fare"
            action = "Flag for payment audit"
            score = 98
        elif anomaly_type == "Negative Fare":
            details = f"Fare: ${row['fare_amount']:.2f}"
            expected = "Fare >= $2.50"
            action = "Drop from financial reporting"
            score = 99
        else:
            details = f"Fare: ${row['fare_amount']:.2f}"
            expected = f"Fare closer to mean (${mean_fare:.2f})"
            action = "Verify trip length/tolls"
            score = 92
            
        docs.append({
            "id": f"TRP-{str(uuid.uuid4())[:8].upper()}",
            "type": anomaly_type,
            "score": score,
            "zone": f"Zone {row['PULocationID']}",
            "model": "Spark Rule/Z-Score",
            "details": details,
            "expected": expected,
            "action": action,
            "time": row["pickup_datetime"].strftime("%Y-%m-%d %H:%M")
        })
        
    if docs:
        collection.insert_many(docs)
        print(f"✅ Extracted and Inserted {len(docs)} highly anomalous trips into MongoDB.")
    else:
        print("✅ No anomalies found!")
        
    print(f"Total processing time: {(time.time() - start_time):.2f} seconds.")

if __name__ == "__main__":
    main()
