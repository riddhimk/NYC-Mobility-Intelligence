import time
import os
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, count
from pyspark.ml.feature import VectorAssembler, StandardScaler, StringIndexer, OneHotEncoder
from pyspark.ml.regression import RandomForestRegressor
from pyspark.ml.clustering import KMeans
from pyspark.ml.evaluation import RegressionEvaluator
from pyspark.ml import Pipeline

def main():
    start_time = time.time()
    print("="*60)
    print("🚀 STARTING PHASE 4: MACHINE LEARNING (RESUMABLE)")
    print("="*60)
    
    spark = SparkSession.builder \
        .appName("NYC Mobility - ML") \
        .config("spark.driver.memory", "20g") \
        .config("spark.executor.memory", "20g") \
        .config("spark.memory.offHeap.enabled", "true") \
        .config("spark.memory.offHeap.size", "16g") \
        .config("spark.sql.shuffle.partitions", "1000") \
        .config("spark.ui.showConsoleProgress", "true") \
        .getOrCreate()
        
    spark.sparkContext.setLogLevel("WARN")
        
    # Paths
    curated_path = "data/curated/trips"
    checkpoint_path = "data/checkpoints/ml_features.parquet"
    
    # ---------------------------------------------------------
    # 1. Feature Engineering Checkpoint
    # ---------------------------------------------------------
    print("\n[1/4] Checking for pre-computed ML Features...")
    
    if os.path.exists(checkpoint_path) and len(os.listdir(checkpoint_path)) > 0:
        print("      ⏭️  Checkpoint found! Loading pre-computed features directly.")
        ml_data = spark.read.parquet(checkpoint_path)
    else:
        print("      ⚙️  No checkpoint found. Computing ML Features from scratch...")
        t0 = time.time()
        df = spark.read.parquet(curated_path)
        
        df_clean = df.filter(
            (col("fare_amount") >= 2.5) & (col("fare_amount") <= 200) & 
            (col("trip_distance") > 0.1) & (col("trip_distance") <= 100) &
            (col("trip_duration_sec") > 60) & (col("trip_duration_sec") <= 10800) &
            col("vehicle_type").isNotNull() &
            col("PULocationID").isNotNull() &
            col("DOLocationID").isNotNull()
        )
        
        veh_indexer = StringIndexer(inputCol="vehicle_type", outputCol="vehicle_type_idx", handleInvalid="keep")
        veh_encoder = OneHotEncoder(inputCols=["vehicle_type_idx"], outputCols=["vehicle_type_vec"])
        
        df_clean = df_clean.withColumn("PU_str", col("PULocationID").cast("string")) \
                           .withColumn("DO_str", col("DOLocationID").cast("string"))
                             
        pu_indexer = StringIndexer(inputCol="PU_str", outputCol="pu_idx", handleInvalid="keep")
        do_indexer = StringIndexer(inputCol="DO_str", outputCol="do_idx", handleInvalid="keep")
                      
        assembler = VectorAssembler(
            inputCols=["trip_distance", "trip_duration_sec", "pickup_hour", "day_of_week", "vehicle_type_vec", "pu_idx", "do_idx"],
            outputCol="features",
            handleInvalid="skip"
        )
        
        pipeline = Pipeline(stages=[veh_indexer, veh_encoder, pu_indexer, do_indexer, assembler])
        
        print("      Applying Feature Engineering pipeline...")
        featured_df = pipeline.fit(df_clean).transform(df_clean)
        ml_data = featured_df.select("features", col("fare_amount").alias("label"))
        
        print(f"      Saving computed features to {checkpoint_path}...")
        ml_data.write.mode("overwrite").parquet(checkpoint_path)
        print(f"      ✅ Features computed & saved in {(time.time() - t0)/60:.2f} minutes.")
        ml_data = spark.read.parquet(checkpoint_path)

    # ---------------------------------------------------------
    # 2. Fare Prediction (Random Forest)
    # ---------------------------------------------------------
    print("\n[2/4] Fare Prediction Model (Random Forest) ---")
    t0 = time.time()
    train_data, test_data = ml_data.randomSplit([0.8, 0.2], seed=42)
    
    rf = RandomForestRegressor(
        featuresCol="features", 
        labelCol="label", 
        numTrees=10,  
        maxDepth=8,   
        maxBins=300, 
        seed=42
    )
    
    print("      Training Random Forest model (THIS WILL TAKE HOURS)...")
    print("      Spark Console Progress Bars should appear below...")
    rf_model = rf.fit(train_data)
    
    print("      Evaluating model on test data...")
    predictions = rf_model.transform(test_data)
    evaluator = RegressionEvaluator(labelCol="label", predictionCol="prediction", metricName="rmse")
    rmse = evaluator.evaluate(predictions)
    r2 = evaluator.evaluate(predictions, {evaluator.metricName: "r2"})
    
    print(f"      Model Performance -> RMSE: ${rmse:.2f} | R²: {r2:.4f}")
    print(f"      Fare Prediction complete in {(time.time() - t0)/60:.2f} minutes.")
    
    # ---------------------------------------------------------
    # 3. Zone Clustering
    # ---------------------------------------------------------
    print("\n[3/4] Zone Clustering (K-Means) ---")
    t0 = time.time()
    # Need original data for this
    df = spark.read.parquet(curated_path)
    zone_stats = df.filter(col("PULocationID").isNotNull()).groupBy("PULocationID").agg(
        avg("fare_amount").alias("avg_fare"),
        avg("trip_distance").alias("avg_distance"),
        count("*").alias("total_trips")
    ).na.drop()
    
    vec_assembler = VectorAssembler(
        inputCols=["avg_fare", "avg_distance", "total_trips"], 
        outputCol="features"
    )
    scaler = StandardScaler(inputCol="features", outputCol="scaledFeatures", withStd=True, withMean=True)
    
    zone_features = vec_assembler.transform(zone_stats)
    zone_scaled = scaler.fit(zone_features).transform(zone_features)
    
    kmeans = KMeans(featuresCol="scaledFeatures", k=5, seed=42)
    kmeans_model = kmeans.fit(zone_scaled)
    print(f"      Clustering complete in {(time.time() - t0)/60:.2f} minutes.")
    
    # ---------------------------------------------------------
    # 4. Model Export
    # ---------------------------------------------------------
    print("\n[4/4] Saving Models to data/models/ ...")
    t0 = time.time()
    os.makedirs("data/models", exist_ok=True)
    rf_model.write().overwrite().save("data/models/fare_prediction_rf")
    kmeans_model.write().overwrite().save("data/models/zone_clustering_kmeans")
    print(f"      Saving complete in {(time.time() - t0)/60:.2f} minutes.")
    
    total_time = time.time() - start_time
    print("\n" + "="*60)
    print(f"✅ PHASE 4 COMPLETE IN {total_time/60:.2f} MINUTES")
    print("="*60)

if __name__ == "__main__":
    main()
