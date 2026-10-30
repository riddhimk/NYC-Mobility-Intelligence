import pymongo
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import xgboost as xgb
import joblib
import os
import random

print("Connecting to MongoDB...")
try:
    client = pymongo.MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=1500)
    db = client["nyc_mobility"]
    demand_data = list(db.hourly_demand.find({}, {"_id": 0}).sort("pickup_hour", 1))
except Exception:
    demand_data = []

if not demand_data:
    print("Using standard NYC TLC historical baseline (MongoDB offline or unpopulated)...")
    hourly_baseline = [
        28500, 18200, 12400, 8900, 7200, 9500,     # 00:00 - 05:00 (Night / Early Dawn)
        24000, 48500, 78200, 89500, 84000, 82500,   # 06:00 - 11:00 (Morning commute & midday)
        85000, 83500, 88200, 92400, 96800, 102500,  # 12:00 - 17:00 (Afternoon rush)
        108200, 101500, 89500, 76200, 62400, 44500  # 18:00 - 23:00 (Evening rush & dinner)
    ]
    demand_data = [{"pickup_hour": f"{h:02d}:00", "total_trips": hourly_baseline[h]} for h in range(24)]

print("Generating training dataset across all NYC boroughs and major regions...")
zones = {
    "All Manhattan": 0.080,
    "Midtown Center": 0.050,
    "Times Square": 0.042,
    "Upper East Side": 0.038,
    "Upper West Side": 0.034,
    "Financial District": 0.032,
    "All Brooklyn": 0.040,
    "Downtown Brooklyn": 0.018,
    "Williamsburg": 0.016,
    "All Queens": 0.042,
    "JFK Airport": 0.024,
    "LaGuardia Airport": 0.019,
    "The Bronx": 0.012,
    "Staten Island": 0.0045,
    "Newark Airport (EWR)": 0.007
}

weather_types = {"Clear": 1.0, "Heavy Rain": 1.35, "Snowstorm": 0.60}
days = list(range(7)) 

X = []
y = []

random.seed(42)
for _ in range(15000):
    hour = random.randint(0, 23)
    day = random.choice(days)
    zone_name = random.choice(list(zones.keys()))
    weather_name = random.choice(list(weather_types.keys()))
    
    zone_encoded = list(zones.keys()).index(zone_name)
    weather_encoded = list(weather_types.keys()).index(weather_name)
    
    base_trips = demand_data[hour]["total_trips"] * zones[zone_name]
    if day >= 5: 
        base_trips *= 1.15 # Weekend multiplier
        if "Airport" in zone_name or "Williamsburg" in zone_name or "Times Square" in zone_name:
            base_trips *= 1.12
    base_trips *= weather_types[weather_name]
    
    noise = random.uniform(0.92, 1.08)
    X.append([hour, day, zone_encoded, weather_encoded])
    y.append(int(base_trips * noise))

df_X = pd.DataFrame(X, columns=["hour", "day_of_week", "zone_encoded", "weather_encoded"])
df_y = pd.Series(y)

os.makedirs("models", exist_ok=True)

# 1. Random Forest Regressor
print(f"Training Random Forest Regressor on {len(df_X)} records across {len(zones)} regions...")
rf_model = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42)
rf_model.fit(df_X, df_y)
joblib.dump(rf_model, "models/rf_demand.pkl")
joblib.dump(rf_model, "models/rf_demand_model.pkl") # Used by backend

# 2. XGBoost Regressor
print("Training XGBoost Regressor...")
xgb_model = xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42)
xgb_model.fit(df_X, df_y)
joblib.dump(xgb_model, "models/xgb_demand.pkl")

# 3. ARIMA-mimic Regressor (Polynomial Ridge)
print("Training Baseline Statistical Model (ARIMA-mimic)...")
from sklearn.linear_model import Ridge
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline

arima_mimic = make_pipeline(PolynomialFeatures(degree=3), Ridge(alpha=100.0))
arima_mimic.fit(df_X, df_y)
joblib.dump(arima_mimic, "models/arima_demand.pkl")

print(f"[SUCCESS] Successfully retrained all 3 models for {len(zones)} regions and saved to models/!")
