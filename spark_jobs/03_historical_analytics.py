import os
os.environ["SPARK_LOCAL_IP"] = "127.0.0.1"
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, sum, count, avg

def main():
    spark = SparkSession.builder \
        .appName("NYC Mobility - Analytics") \
        .config("spark.driver.memory", "8g") \
        .config("spark.executor.memory", "8g") \
        .config("spark.sql.session.timeZone", "UTC") \
        .getOrCreate()
        
    print("Loading curated data...")
    # Load the curated trips data
    df_trips = spark.read.parquet("data/curated/trips")
    df_trips.createOrReplaceTempView("trips")
    
    # Load the Taxi Zone Lookup Table (CSV)
    df_zones = spark.read.csv("data/raw/taxi_zone_lookup.csv", header=True, inferSchema=True)
    df_zones.createOrReplaceTempView("zones")
    
    # --- Trend Analytics ---
    print("\n--- Trend Analytics ---")
    
    # 1. Trips and Revenue by Month
    print("Trips and Revenue by Month:")
    monthly_trend = spark.sql("""
        SELECT pickup_month, 
               COUNT(*) as total_trips, 
               SUM(total_amount) as total_revenue, 
               AVG(fare_amount) as avg_fare,
               AVG(trip_distance) as avg_distance
        FROM trips
        GROUP BY pickup_month
        ORDER BY pickup_month
    """)
    monthly_trend.show()
    
    # 2. Demand Patterns by Hour of Day
    print("Demand Patterns by Hour of Day (Top 5 Hours):")
    hourly_demand = spark.sql("""
        SELECT pickup_hour, COUNT(*) as total_trips
        FROM trips
        GROUP BY pickup_hour
        ORDER BY total_trips DESC
        LIMIT 5
    """)
    hourly_demand.show()

    # --- Geographical Enrichment ---
    print("\n--- Geographical Enrichment ---")
    
    # 3. Top Pickup Zones
    print("Top Pickup Zones:")
    top_pickup_zones = spark.sql("""
        SELECT z.Zone, z.Borough, COUNT(*) as trips
        FROM trips t
        JOIN zones z ON t.PULocationID = z.LocationID
        GROUP BY z.Zone, z.Borough
        ORDER BY trips DESC
        LIMIT 10
    """)
    top_pickup_zones.show(truncate=False)

    # 4. Origin-Destination Flows (Mobility Network)
    print("Top Origin-Destination Corridors:")
    od_flows = spark.sql("""
        SELECT pu.Zone as Pickup_Zone, do.Zone as Dropoff_Zone, COUNT(*) as trip_count
        FROM trips t
        JOIN zones pu ON t.PULocationID = pu.LocationID
        JOIN zones do ON t.DOLocationID = do.LocationID
        WHERE t.PULocationID IS NOT NULL AND t.DOLocationID IS NOT NULL
          AND pu.Zone != 'NV' AND do.Zone != 'NV'
        GROUP BY pu.Zone, do.Zone
        ORDER BY trip_count DESC
        LIMIT 10
    """)
    od_flows.show(truncate=False)
    
    print("Analytics complete!")

if __name__ == "__main__":
    main()
