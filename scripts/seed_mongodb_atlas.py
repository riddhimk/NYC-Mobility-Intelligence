import os
import sys
import json
import pymongo

def seed_database(mongo_uri: str):
    print(f"Connecting to MongoDB Atlas...")
    try:
        client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=8000)
        # Verify connection
        client.admin.command('ping')
        print("Connected successfully to MongoDB Atlas!")
    except Exception as e:
        print(f"Connection failed: {e}")
        print("\nTroubleshooting tips:")
        print("1. Did you whitelist your IP or allow access from anywhere (0.0.0.0/0) in Atlas Network Access?")
        print("2. Did you replace <password> in the connection string with your database user password?")
        sys.exit(1)

    db = client["nyc_mobility"]
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")

    # 1. Seed Top Zones
    zones_path = os.path.join(data_dir, "zones_fallback.json")
    if os.path.exists(zones_path):
        with open(zones_path, "r", encoding="utf-8") as f:
            zones_data = json.load(f)
        db.top_zones.delete_many({})
        if zones_data:
            db.top_zones.insert_many(zones_data)
        print(f"  [OK] Seeded {len(zones_data)} records into 'top_zones' collection")

    # 2. Seed Anomalies
    anomalies_path = os.path.join(data_dir, "anomalies_fallback.json")
    if os.path.exists(anomalies_path):
        with open(anomalies_path, "r", encoding="utf-8") as f:
            anomalies_data = json.load(f)
        db.anomalies.delete_many({})
        if anomalies_data:
            db.anomalies.insert_many(anomalies_data)
        print(f"  [OK] Seeded {len(anomalies_data)} records into 'anomalies' collection")

    # 3. Seed Hourly Demand (24-Hour Profile)
    hourly_demand = [
        {"pickup_hour": f"{h:02d}:00", "total_trips": count, "trip_count": count}
        for h, count in [
            (0, 14200), (1, 9100), (2, 5800), (3, 4100), (4, 3800), (5, 6200),
            (6, 18500), (7, 34200), (8, 48900), (9, 45100), (10, 41200), (11, 43800),
            (12, 47500), (13, 46900), (14, 49200), (15, 52100), (16, 56800), (17, 68400),
            (18, 74200), (19, 69100), (20, 58300), (21, 51200), (22, 42100), (23, 27600)
        ]
    ]
    db.hourly_demand.delete_many({})
    db.hourly_demand.insert_many(hourly_demand)
    print(f"  [OK] Seeded {len(hourly_demand)} records into 'hourly_demand' collection")

    print("\nMongoDB Atlas Database 'nyc_mobility' is fully seeded and ready!")
    print(f"Database Collections in nyc_mobility: {db.list_collection_names()}")

if __name__ == "__main__":
    uri = sys.argv[1] if len(sys.argv) > 1 else os.getenv("MONGO_URI")
    if not uri:
        print("Usage: python scripts/seed_mongodb_atlas.py \"mongodb+srv://<user>:<password>@cluster.mongodb.net/?appName=...\"")
        print("Or set the environment variable MONGO_URI before running.")
        sys.exit(1)
    seed_database(uri)
