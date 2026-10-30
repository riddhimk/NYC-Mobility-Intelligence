import os
os.environ["SPARK_LOCAL_IP"] = "127.0.0.1"
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, count, sum
import pymongo
import os

def main():
    # Initialize Spark
    spark = SparkSession.builder \
        .appName("NYC Mobility - Mongo Export") \
        .config("spark.driver.memory", "8g") \
        .getOrCreate()
        
    print("Loading curated data for aggregation...")
    df = spark.read.parquet("data/curated/trips")
    df.createOrReplaceTempView("trips")
    
    # Connect to MongoDB
    print("Connecting to MongoDB at localhost:27017...")
    client = pymongo.MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=5000)
    db = client["nyc_mobility"]
    
    # 1. Monthly Trends
    print("Aggregating Monthly Trends...")
    monthly = spark.sql("""
        SELECT pickup_month, COUNT(*) as total_trips, SUM(total_amount) as total_revenue
        FROM trips
        GROUP BY pickup_month
    """).toPandas()
    
    db.monthly_trends.drop()
    if not monthly.empty:
        db.monthly_trends.insert_many(monthly.to_dict("records"))
        
    # 2. Hourly Demand
    print("Aggregating Hourly Demand...")
    hourly = spark.sql("""
        SELECT pickup_hour, COUNT(*) as total_trips
        FROM trips
        GROUP BY pickup_hour
    """).toPandas()
    
    db.hourly_demand.drop()
    if not hourly.empty:
        db.hourly_demand.insert_many(hourly.to_dict("records"))
        
    # 3. Top Pickup Zones (NEW)
    print("Aggregating Top Pickup Zones for Data Explorer...")
    df_zones = spark.read.csv("data/raw/taxi_zone_lookup.csv", header=True, inferSchema=True)
    df_zones.createOrReplaceTempView("zones")
    
    zones_agg = spark.sql("""
        SELECT z.Zone as zone, z.Borough as borough, COUNT(*) as trips
        FROM trips t
        JOIN zones z ON t.PULocationID = z.LocationID
        GROUP BY z.Zone, z.Borough
        ORDER BY trips DESC
        LIMIT 250
    """).toPandas()
    
    db.top_zones.drop()
    if not zones_agg.empty:
        db.top_zones.insert_many(zones_agg.to_dict("records"))
    
    print("Successfully exported all aggregated analytics to MongoDB!")

if __name__ == "__main__":
    main()
