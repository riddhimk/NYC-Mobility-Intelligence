import os
import json
os.environ["SPARK_LOCAL_IP"] = "127.0.0.1"

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, from_json, current_timestamp, window
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, IntegerType, TimestampType

def write_to_mongo(df, epoch_id):
    # We will write the aggregated batch to MongoDB
    import pymongo
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["mobility_db"]
    collection = db["streaming_statistics"]
    
    records = df.toJSON().map(lambda j: json.loads(j)).collect()
    if records:
        collection.insert_many(records)
    client.close()

def main():
    print("Starting Spark Structured Streaming Consumer...")
    
    # We need to specify the kafka package
    spark = SparkSession.builder \
        .appName("NYC Mobility - Streaming") \
        .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.4") \
        .getOrCreate()
        
    spark.sparkContext.setLogLevel("WARN")

    schema = StructType([
        StructField("vehicle_type", StringType(), True),
        StructField("pickup_datetime", StringType(), True),
        StructField("dropoff_datetime", StringType(), True),
        StructField("PULocationID", IntegerType(), True),
        StructField("DOLocationID", IntegerType(), True),
        StructField("trip_distance", DoubleType(), True),
        StructField("fare_amount", DoubleType(), True),
        StructField("total_amount", DoubleType(), True)
    ])

    df = spark \
        .readStream \
        .format("kafka") \
        .option("kafka.bootstrap.servers", "localhost:29092") \
        .option("subscribe", "taxi-events") \
        .option("startingOffsets", "latest") \
        .load()

    # Parse JSON
    parsed_df = df.selectExpr("CAST(value AS STRING)") \
        .select(from_json(col("value"), schema).alias("data")) \
        .select("data.*")
        
    # Add a processing timestamp for windowing
    stream_df = parsed_df.withColumn("processing_time", current_timestamp())

    # Windowed Aggregation (10 second tumbling window)
    windowed_agg = stream_df \
        .groupBy(window(col("processing_time"), "10 seconds")) \
        .agg({"total_amount": "sum", "trip_distance": "avg", "*": "count"}) \
        .withColumnRenamed("sum(total_amount)", "revenue") \
        .withColumnRenamed("avg(trip_distance)", "avg_distance") \
        .withColumnRenamed("count(1)", "trip_count")
        
    # We flatten the window struct to save easily to mongo
    output_df = windowed_agg.select(
        col("window.start").cast("string").alias("window_start"),
        col("window.end").cast("string").alias("window_end"),
        col("revenue"),
        col("avg_distance"),
        col("trip_count")
    )

    query = output_df.writeStream \
        .foreachBatch(write_to_mongo) \
        .outputMode("update") \
        .start()

    print("Listening to Kafka...")
    # Wait 60 seconds then stop for demonstration
    query.awaitTermination(timeout=60)
    print("Stream processing stopped.")

if __name__ == "__main__":
    main()
