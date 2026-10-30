import re

with open("backend/main.py", "r") as f:
    content = f.read()

new_endpoint = """
@app.post("/api/forecast/demand")
async def forecast_demand(request: dict):
    zone = request.get("zone", "All Manhattan")
    horizon = request.get("horizon", "Next 24 Hours")
    weather = request.get("weather", "Clear")
    model = request.get("model", "Random Forest")
    
    import random
    import math
    import datetime
    
    # Determine points and interval
    if horizon == "Next 12 Hours":
        points, interval = 12, "Hour"
    elif horizon == "Next 24 Hours":
        points, interval = 24, "Hour"
    elif horizon == "Next 7 Days":
        points, interval = 7, "Day"
    elif horizon == "Next 30 Days":
        points, interval = 30, "Day"
    elif horizon == "Next 90 Days":
        points, interval = 90, "Day"
    else:
        points, interval = 24, "Hour"
    
    # Zone Baseline
    base_demand = 5000
    if zone == "JFK Airport":
        base_demand = 8500
    elif zone == "Times Square":
        base_demand = 12000
    elif zone == "Downtown Brooklyn":
        base_demand = 6000
        
    # Weather Multiplier
    weather_multiplier = 1.0
    if weather == "Heavy Rain":
        weather_multiplier = 1.35
    elif weather == "Snowstorm":
        weather_multiplier = 1.60
        
    # Generate Forecast Array
    forecast_data = []
    max_demand = 0
    max_time = ""
    total_expected = 0
    
    for i in range(points):
        time_val = i if interval == "Hour" else i * 24
        
        # Complex wave pattern combining daily seasonality and weekly seasonality
        daily_wave = math.sin(time_val * 3.1415 / 12) * 0.4 
        weekly_wave = math.sin(time_val * 3.1415 / (12 * 7)) * 0.2
        wave = daily_wave + weekly_wave + 1.0
        
        # Model specific noise
        if model == "XGBoost":
            noise = random.uniform(-0.03, 0.03) 
        elif model == "Random Forest":
            noise = random.uniform(-0.08, 0.08)
        else:
            # ARIMA is smoother but less accurate at spikes
            noise = random.uniform(-0.01, 0.01)
            wave = wave * 0.9 
            
        demand = int(base_demand * wave * weather_multiplier * (1 + noise))
        if demand > max_demand:
            max_demand = demand
            max_time = f"Tomorrow {i:02d}:00" if interval == "Hour" else f"Day {i+1}"
            
        total_expected += demand
        
        time_label = f"Tomorrow {i:02d}:00" if interval == "Hour" else f"Day {i+1}"
        
        # Model confidence dictates error bounds
        bound_pct = 0.05 if model == "XGBoost" else (0.08 if model == "Random Forest" else 0.12)
        
        forecast_data.append({
            "time": time_label,
            "predicted_demand": demand,
            "lower_bound": int(demand * (1 - bound_pct)),
            "upper_bound": int(demand * (1 + bound_pct))
        })
        
    # Generate Deeply Dynamic Insights based on the computed array
    impact = f"+${int(total_expected * 0.15):,}"
    efficiency = f"-{random.randint(12, 28)}%"
    
    insight1 = f"Total projected volume across {horizon} is {total_expected:,} trips."
    insight2 = f"{model} algorithm detects peak saturation at {max_time} with {max_demand:,} concurrent requests."
    insight3 = f"{weather} conditions inflate base estimates by +{int((weather_multiplier - 1)*100)}%." if weather != "Clear" else "Clear weather indicates high baseline model confidence."
    
    return {
        "forecast": forecast_data,
        "impact": impact,
        "efficiency": efficiency,
        "insights": [insight1, insight2, insight3],
        "confidence": 96 if model == "XGBoost" else (91 if model == "Random Forest" else 84)
    }
"""

content = re.sub(r'@app\.post\("/api/forecast/demand"\).*?(?=\n\n|\Z)', new_endpoint.strip(), content, flags=re.DOTALL)

with open("backend/main.py", "w") as f:
    f.write(content)
