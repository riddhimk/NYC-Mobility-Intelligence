import os
import json
import time
import pandas as pd
from kafka import KafkaProducer

def json_serializer(data):
    return json.dumps(data).encode("utf-8")

def main():
    print("Starting Kafka Taxi Event Simulator...")
    producer = KafkaProducer(
        bootstrap_servers=['localhost:29092'],
        value_serializer=json_serializer
    )

    # Load a small chunk of data to simulate live stream
    # We will just load one partition from curated
    curated_path = "data/curated/trips"
    # Find a parquet file
    parquet_files = []
    for root, dirs, files in os.walk(curated_path):
        for f in files:
            if f.endswith(".parquet"):
                parquet_files.append(os.path.join(root, f))
    
    if not parquet_files:
        print("No curated data found to simulate!")
        return

    print(f"Loading data from {parquet_files[0]}...")
    df = pd.read_parquet(parquet_files[0])
    
    # We will simulate 1000 events
    sample_df = df.sample(1000).fillna(0)
    
    print("Beginning stream...")
    count = 0
    for _, row in sample_df.iterrows():
        event = row.to_dict()
        # Convert timestamps to string
        if pd.notnull(event.get('pickup_datetime')):
            event['pickup_datetime'] = str(event['pickup_datetime'])
        if pd.notnull(event.get('dropoff_datetime')):
            event['dropoff_datetime'] = str(event['dropoff_datetime'])
            
        producer.send('taxi-events', event)
        count += 1
        if count % 100 == 0:
            print(f"Sent {count} events...")
        # Simulate real-time delay
        time.sleep(0.1)

    producer.flush()
    print("Stream finished!")

if __name__ == "__main__":
    main()
