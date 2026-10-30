import time
import os
import glob
os.environ["SPARK_LOCAL_IP"] = "127.0.0.1"

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, lit, unix_timestamp, dayofweek, hour, year, month, coalesce

def standardize_dataframe(df, vehicle_type, common_cols):
    cols_lower = [c.lower() for c in df.columns]
    
    def get_col(candidates):
        matches = [c for c in candidates if c in cols_lower]
        if matches:
            return coalesce(*[col(df.columns[cols_lower.index(c)]) for c in matches])
        return lit(None)
        
    df = df.withColumn("pickup_datetime", get_col(["pickup_datetime", "tpep_pickup_datetime", "lpep_pickup_datetime", "trip_pickup_datetime"]).cast("timestamp"))
    df = df.withColumn("dropoff_datetime", get_col(["dropoff_datetime", "tpep_dropoff_datetime", "lpep_dropoff_datetime", "trip_dropoff_datetime"]).cast("timestamp"))
    df = df.withColumn("trip_distance", get_col(["trip_distance", "trip_miles"]).cast("double"))
    df = df.withColumn("fare_amount", get_col(["fare_amount", "fare_amt", "base_passenger_fare"]).cast("double"))
    
    total_cols = [c for c in ["total_amount", "total_amt"] if c in cols_lower]
    if total_cols:
        df = df.withColumn("total_amount", coalesce(*[col(df.columns[cols_lower.index(c)]) for c in total_cols]).cast("double"))
    else:
        df = df.withColumn("total_amount", col("fare_amount").cast("double"))
        
    df = df.withColumn("PULocationID", get_col(["pulocationid"]).cast("integer"))
    df = df.withColumn("DOLocationID", get_col(["dolocationid"]).cast("integer"))
    df = df.withColumn("vehicle_type", lit(vehicle_type).cast("string"))
    
    return df.select(*common_cols)

def main():
    start_time = time.time()
    print("="*60)
    print("🚀 STARTING PHASE 2: HARMONIZATION & CLEANING (AUTO-CLEANUP)")
    print("="*60)
    
    spark = SparkSession.builder \
        .appName("NYC Mobility - Harmonization") \
        .config("spark.driver.memory", "20g") \
        .config("spark.executor.memory", "20g") \
        .config("spark.memory.offHeap.enabled", "true") \
        .config("spark.memory.offHeap.size", "16g") \
        .config("spark.sql.shuffle.partitions", "1000") \
        .config("spark.sql.session.timeZone", "UTC") \
        .config("spark.ui.showConsoleProgress", "true") \
        .getOrCreate()
        
    spark.sparkContext.setLogLevel("WARN")
        
    base_dir = os.path.abspath("data/raw")
    out_path = "data/curated/trips"
    os.makedirs(out_path, exist_ok=True)
    common_cols = [
        "vehicle_type", "pickup_datetime", "dropoff_datetime", 
        "PULocationID", "DOLocationID", "trip_distance", "fare_amount", "total_amount"
    ]

    print("\n[1/3] Starting File-by-File Processing (Bypassing Parquet Merge Issues)")
    
    for process_year in range(2009, 2026):
        year_path = f"{out_path}/pickup_year={process_year}"
        
        # Check if already processed
        if os.path.exists(year_path) and len(os.listdir(year_path)) > 0:
            print(f"      ⏭️  Skipping {process_year}... (Already processed)")
            continue
            
        # Find all raw files for this year
        year_files = []
        for veh in ["yellow", "green", "fhv", "fhvhv"]:
            year_files.extend(glob.glob(f"{base_dir}/{veh}/*_{process_year}-*.parquet"))
            
        if not year_files:
            continue
            
        print(f"      ⚙️  Processing Year {process_year} ({len(year_files)} files)...")
        t_year = time.time()
        
        df_year = None
        for f in year_files:
            veh_type = os.path.basename(os.path.dirname(f))
            try:
                df_file = spark.read.parquet(f"file://{f}")
                df_clean_file = standardize_dataframe(df_file, veh_type, common_cols)
                if df_year is None:
                    df_year = df_clean_file
                else:
                    df_year = df_year.unionByName(df_clean_file)
            except Exception as e:
                print(f"         ⚠️ Could not process file {os.path.basename(f)}: {e}")
                
        if df_year is None:
            continue
            
        df_clean = df_year.filter(
            (col("pickup_datetime") >= "2009-01-01") & 
            (col("pickup_datetime") < "2026-01-01") &
            (col("dropoff_datetime") >= col("pickup_datetime")) &
            (year("pickup_datetime") == process_year)
        )
        df_clean = df_clean.filter(
            (col("trip_distance").isNull() | (col("trip_distance") >= 0)) &
            (col("fare_amount").isNull() | (col("fare_amount") >= 0))
        )
        
        df_feat = df_clean \
            .withColumn("trip_duration_sec", unix_timestamp("dropoff_datetime") - unix_timestamp("pickup_datetime")) \
            .withColumn("pickup_month", month("pickup_datetime")) \
            .withColumn("day_of_week", dayofweek("pickup_datetime")) \
            .withColumn("pickup_hour", hour("pickup_datetime")) \
            .withColumn("pickup_year", lit(process_year))

        temp_path = f"{out_path}_temp_{process_year}"
        
        try:
            df_feat.write.mode("overwrite").partitionBy("pickup_month", "vehicle_type").parquet(temp_path)
            os.rename(temp_path, year_path)
            print(f"      ✅ Year {process_year} completed in {(time.time() - t_year)/60:.2f} minutes.")
            
            # CRITICAL DISK SPACE MANAGEMENT: Delete the massive raw files for this year now that they are curated
            print(f"      🧹 Deleting raw {process_year} files to free up disk space...")
            for f in year_files:
                try:
                    os.remove(f)
                except Exception:
                    pass
            
        except Exception as e:
            print(f"      ❌ Failed writing year {process_year}: {e}")
            break
            
    total_time = time.time() - start_time
    print(f"\n✅ PHASE 2 COMPLETE IN {total_time/60:.2f} MINUTES")

if __name__ == "__main__":
    main()
