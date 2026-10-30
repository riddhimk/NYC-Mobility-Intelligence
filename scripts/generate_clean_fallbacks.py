import json
import os

nodes = [
    {"id": "Times Sq", "group": 1, "lat": 40.7580, "lng": -73.9855, "pickups": "48,210", "dropoffs": "52,109", "peak_hour": "19:00 - 22:00", "top_dest": "Penn Station", "avg_fare": "$18.50", "centrality": 4.9},
    {"id": "Midtown Center", "group": 1, "lat": 40.7549, "lng": -73.9840, "pickups": "55,302", "dropoffs": "51,109", "peak_hour": "08:00 - 10:00", "top_dest": "Upper East Side", "avg_fare": "$16.25", "centrality": 4.8},
    {"id": "Penn Station", "group": 1, "lat": 40.7506, "lng": -73.9935, "pickups": "68,912", "dropoffs": "62,330", "peak_hour": "16:00 - 19:00", "top_dest": "Midtown Center", "avg_fare": "$17.80", "centrality": 4.9},
    {"id": "Chelsea", "group": 1, "lat": 40.7465, "lng": -74.0014, "pickups": "28,451", "dropoffs": "26,104", "peak_hour": "21:00 - 02:00", "top_dest": "Financial District", "avg_fare": "$15.10", "centrality": 3.9},
    {"id": "Upper East Side", "group": 1, "lat": 40.7736, "lng": -73.9566, "pickups": "42,201", "dropoffs": "44,505", "peak_hour": "07:00 - 09:00", "top_dest": "Midtown Center", "avg_fare": "$19.90", "centrality": 4.3},
    {"id": "Upper West Side", "group": 1, "lat": 40.7870, "lng": -73.9754, "pickups": "37,890", "dropoffs": "39,120", "peak_hour": "08:00 - 10:00", "top_dest": "Times Sq", "avg_fare": "$18.20", "centrality": 4.1},
    {"id": "Financial District", "group": 1, "lat": 40.7075, "lng": -74.0113, "pickups": "34,109", "dropoffs": "36,902", "peak_hour": "17:00 - 19:00", "top_dest": "Downtown Brooklyn", "avg_fare": "$21.50", "centrality": 4.2},
    {"id": "East Village", "group": 1, "lat": 40.7265, "lng": -73.9815, "pickups": "29,410", "dropoffs": "31,200", "peak_hour": "22:00 - 03:00", "top_dest": "Williamsburg", "avg_fare": "$14.80", "centrality": 3.8},
    {"id": "Harlem", "group": 1, "lat": 40.8116, "lng": -73.9465, "pickups": "21,340", "dropoffs": "24,190", "peak_hour": "08:00 - 11:00", "top_dest": "Midtown Center", "avg_fare": "$22.40", "centrality": 3.5},
    {"id": "Washington Heights", "group": 1, "lat": 40.8417, "lng": -73.9393, "pickups": "16,780", "dropoffs": "18,400", "peak_hour": "17:00 - 20:00", "top_dest": "Harlem", "avg_fare": "$24.50", "centrality": 3.2},
    {"id": "Grand Central", "group": 2, "lat": 40.7527, "lng": -73.9772, "pickups": "58,400", "dropoffs": "56,200", "peak_hour": "08:00 - 10:00", "top_dest": "Financial District", "avg_fare": "$17.20", "centrality": 4.7},
    {"id": "JFK Airport", "group": 2, "lat": 40.6413, "lng": -73.7781, "pickups": "96,405", "dropoffs": "72,302", "peak_hour": "15:00 - 22:00", "top_dest": "Midtown Center", "avg_fare": "$70.00", "centrality": 4.8},
    {"id": "LaGuardia Airport", "group": 2, "lat": 40.7769, "lng": -73.8740, "pickups": "88,102", "dropoffs": "49,201", "peak_hour": "14:00 - 21:00", "top_dest": "Midtown Center", "avg_fare": "$42.50", "centrality": 4.7},
    {"id": "Newark Airport (EWR)", "group": 2, "lat": 40.6895, "lng": -74.1745, "pickups": "24,190", "dropoffs": "19,800", "peak_hour": "16:00 - 21:00", "top_dest": "Penn Station", "avg_fare": "$85.00", "centrality": 3.6},
    {"id": "Downtown Brooklyn", "group": 3, "lat": 40.6924, "lng": -73.9875, "pickups": "28,405", "dropoffs": "29,103", "peak_hour": "18:00 - 20:00", "top_dest": "Financial District", "avg_fare": "$16.75", "centrality": 4.0},
    {"id": "DUMBO", "group": 3, "lat": 40.7033, "lng": -73.9890, "pickups": "19,200", "dropoffs": "21,450", "peak_hour": "18:00 - 21:00", "top_dest": "Midtown Center", "avg_fare": "$23.10", "centrality": 3.7},
    {"id": "Williamsburg", "group": 3, "lat": 40.7081, "lng": -73.9571, "pickups": "32,504", "dropoffs": "28,105", "peak_hour": "22:00 - 04:00", "top_dest": "East Village", "avg_fare": "$18.50", "centrality": 3.9},
    {"id": "Park Slope", "group": 3, "lat": 40.6710, "lng": -73.9770, "pickups": "17,800", "dropoffs": "19,200", "peak_hour": "07:30 - 09:30", "top_dest": "Financial District", "avg_fare": "$19.80", "centrality": 3.4},
    {"id": "Coney Island", "group": 3, "lat": 40.5755, "lng": -73.9707, "pickups": "9,450", "dropoffs": "11,200", "peak_hour": "13:00 - 18:00", "top_dest": "Downtown Brooklyn", "avg_fare": "$34.40", "centrality": 2.8},
    {"id": "Long Island City", "group": 3, "lat": 40.7447, "lng": -73.9485, "pickups": "27,100", "dropoffs": "29,400", "peak_hour": "08:00 - 10:00", "top_dest": "Grand Central", "avg_fare": "$17.20", "centrality": 3.9},
    {"id": "Astoria", "group": 3, "lat": 40.7644, "lng": -73.9235, "pickups": "23,400", "dropoffs": "24,800", "peak_hour": "18:00 - 21:00", "top_dest": "Midtown Center", "avg_fare": "$22.60", "centrality": 3.6},
    {"id": "Flushing", "group": 3, "lat": 40.7675, "lng": -73.8331, "pickups": "18,900", "dropoffs": "20,100", "peak_hour": "12:00 - 15:00", "top_dest": "LaGuardia Airport", "avg_fare": "$21.80", "centrality": 3.3},
    {"id": "Yankee Stadium / South Bronx", "group": 3, "lat": 40.8296, "lng": -73.9262, "pickups": "19,800", "dropoffs": "22,400", "peak_hour": "18:00 - 22:00", "top_dest": "Harlem", "avg_fare": "$25.90", "centrality": 3.4},
    {"id": "Fordham", "group": 3, "lat": 40.8617, "lng": -73.8906, "pickups": "14,200", "dropoffs": "16,100", "peak_hour": "16:00 - 19:00", "top_dest": "Yankee Stadium / South Bronx", "avg_fare": "$28.00", "centrality": 3.0},
    {"id": "St. George Ferry", "group": 3, "lat": 40.6432, "lng": -74.0736, "pickups": "11,400", "dropoffs": "12,900", "peak_hour": "07:00 - 09:30", "top_dest": "Financial District", "avg_fare": "$32.50", "centrality": 2.9},
    {"id": "Staten Island Mall", "group": 3, "lat": 40.5835, "lng": -74.1610, "pickups": "7,800", "dropoffs": "9,200", "peak_hour": "14:00 - 18:00", "top_dest": "St. George Ferry", "avg_fare": "$29.10", "centrality": 2.5}
]

links = [
    {"source": "JFK Airport", "target": "Midtown Center", "value": 95},
    {"source": "JFK Airport", "target": "Times Sq", "value": 90},
    {"source": "JFK Airport", "target": "Penn Station", "value": 80},
    {"source": "JFK Airport", "target": "Downtown Brooklyn", "value": 65},
    {"source": "LaGuardia Airport", "target": "Midtown Center", "value": 88},
    {"source": "LaGuardia Airport", "target": "Upper East Side", "value": 75},
    {"source": "LaGuardia Airport", "target": "Astoria", "value": 60},
    {"source": "LaGuardia Airport", "target": "Grand Central", "value": 70},
    {"source": "Newark Airport (EWR)", "target": "Penn Station", "value": 55},
    {"source": "Newark Airport (EWR)", "target": "Financial District", "value": 45},
    {"source": "Times Sq", "target": "Penn Station", "value": 85},
    {"source": "Times Sq", "target": "Chelsea", "value": 65},
    {"source": "Midtown Center", "target": "Grand Central", "value": 80},
    {"source": "Midtown Center", "target": "Upper East Side", "value": 75},
    {"source": "Upper East Side", "target": "Upper West Side", "value": 60},
    {"source": "Penn Station", "target": "Financial District", "value": 70},
    {"source": "Chelsea", "target": "East Village", "value": 55},
    {"source": "East Village", "target": "Financial District", "value": 50},
    {"source": "Upper West Side", "target": "Harlem", "value": 48},
    {"source": "Harlem", "target": "Washington Heights", "value": 42},
    {"source": "Financial District", "target": "DUMBO", "value": 65},
    {"source": "Financial District", "target": "Downtown Brooklyn", "value": 60},
    {"source": "East Village", "target": "Williamsburg", "value": 68},
    {"source": "Downtown Brooklyn", "target": "Park Slope", "value": 52},
    {"source": "Park Slope", "target": "Coney Island", "value": 35},
    {"source": "Midtown Center", "target": "Long Island City", "value": 65},
    {"source": "Grand Central", "target": "Long Island City", "value": 58},
    {"source": "Astoria", "target": "Upper East Side", "value": 52},
    {"source": "Flushing", "target": "LaGuardia Airport", "value": 45},
    {"source": "Harlem", "target": "Yankee Stadium / South Bronx", "value": 55},
    {"source": "Washington Heights", "target": "Yankee Stadium / South Bronx", "value": 45},
    {"source": "Yankee Stadium / South Bronx", "target": "Fordham", "value": 40},
    {"source": "Financial District", "target": "St. George Ferry", "value": 38},
    {"source": "St. George Ferry", "target": "Staten Island Mall", "value": 32},
    {"source": "Park Slope", "target": "St. George Ferry", "value": 28}
]

with open("data/network_fallback.json", "w", encoding="utf-8") as f:
    json.dump({"nodes": nodes, "links": links}, f, indent=2)

anomalies = [
    {
        "id": "TRP-9021",
        "type": "Zero Distance High Fare",
        "score": 98,
        "zone": "JFK Airport",
        "model": "Isolation Forest",
        "details": "Distance: 0.0 mi, Fare: $150.00",
        "expected": "Distance > 10 mi for $150 fare",
        "action": "Flag for payment audit",
        "time": "5 minutes ago"
    },
    {
        "id": "TRP-1123",
        "type": "Extreme Duration (Z > 4.5)",
        "score": 94,
        "zone": "Times Sq",
        "model": "Z-Score Threshold (Z=4.5)",
        "details": "Duration: 14.2 hrs, Distance: 2.1 mi",
        "expected": "Duration < 45 mins for 2 mi",
        "action": "Flag as GPS system error",
        "time": "14 minutes ago"
    },
    {
        "id": "TRP-4451",
        "type": "Negative Fare Amount",
        "score": 99,
        "zone": "Midtown Center",
        "model": "Rule-based Data Quality",
        "details": "Fare: -$45.00",
        "expected": "Fare >= $3.00 initial charge",
        "action": "Drop from financial reporting",
        "time": "28 minutes ago"
    },
    {
        "id": "TRP-8832",
        "type": "Speed Violation (> 85 mph)",
        "score": 95,
        "zone": "LaGuardia Airport",
        "model": "Physical Constraints Engine",
        "details": "Avg Speed: 120.4 mph, Distance: 8.2 mi in 4.1 mins",
        "expected": "Speed < 65 mph on Grand Central Pkwy",
        "action": "Flag driver for safety review",
        "time": "39 minutes ago"
    },
    {
        "id": "TRP-5192",
        "type": "Extreme Outlier Fare (Z > 4)",
        "score": 96,
        "zone": "Financial District",
        "model": "Z-Score Threshold (Z=5.2)",
        "details": "Fare: $348.50, Distance: 3.2 mi",
        "expected": "Fare < $35.00 for short Downtown trip",
        "action": "Audit meter calibration and tolls",
        "time": "48 minutes ago"
    },
    {
        "id": "TRP-6321",
        "type": "Impossible Teleportation (GPS Jump)",
        "score": 97,
        "zone": "Downtown Brooklyn",
        "model": "Geospatial Discontinuity Engine",
        "details": "Jumped 18.5 mi in 28 seconds (2,378 mph)",
        "expected": "Max physical velocity < 80 mph",
        "action": "Quarantine corrupt GPS trajectory",
        "time": "1 hour ago"
    },
    {
        "id": "TRP-7714",
        "type": "Phantom Surge Multiplier",
        "score": 91,
        "zone": "Williamsburg",
        "model": "DBSCAN Spatial Density Cluster",
        "details": "Congestion Surcharge: $48.00 at 03:30 AM",
        "expected": "Congestion fee capped at $2.75",
        "action": "Reverse unauthorized rate surge",
        "time": "1 hour ago"
    },
    {
        "id": "TRP-3209",
        "type": "Reverse Meter Running",
        "score": 93,
        "zone": "Harlem",
        "model": "Spark Monotonic Integrity Validator",
        "details": "Fare decreased from $32.00 to $12.00 mid-trip",
        "expected": "Cumulative meter fare strictly monotonic",
        "action": "Inspect taximeter hardware tampering",
        "time": "2 hours ago"
    },
    {
        "id": "TRP-4882",
        "type": "Cross-Borough Teleportation",
        "score": 96,
        "zone": "Staten Island Mall",
        "model": "Spatial Speed Engine",
        "details": "Staten Island to Bronx in 4 mins (Distance: 27.5 mi)",
        "expected": "Route travel time >= 45 mins",
        "action": "Flag sensor spoofing event",
        "time": "2 hours ago"
    },
    {
        "id": "TRP-2195",
        "type": "Stalled Gridlock Outlier",
        "score": 88,
        "zone": "Penn Station",
        "model": "Congestion Anomaly Classifier",
        "details": "Duration: 6.2 hrs, Distance: 0.4 mi, Idle: 94%",
        "expected": "Trip duration < 30 mins for 0.4 mi",
        "action": "Investigate vehicle breakdown",
        "time": "3 hours ago"
    },
    {
        "id": "TRP-8103",
        "type": "Excessive Distance Local Hop",
        "score": 92,
        "zone": "Upper East Side",
        "model": "Geofence Circuitry Model",
        "details": "Pickup & Dropoff 2 blocks apart, Recorded: 42.1 mi",
        "expected": "Distance < 1.0 mi between adjacent avenues",
        "action": "Audit driver route padding",
        "time": "3 hours ago"
    },
    {
        "id": "TRP-1049",
        "type": "Duplicate Transaction Hash",
        "score": 99,
        "zone": "Grand Central",
        "model": "Idempotency Filter",
        "details": "Exact identical fare $24.80 billed 3x in 10ms",
        "expected": "Single transaction per trip token",
        "action": "Trigger automated payment refund",
        "time": "4 hours ago"
    },
    {
        "id": "TRP-6628",
        "type": "Toll Avoidance Route Deviation",
        "score": 86,
        "zone": "Long Island City",
        "model": "Route Geometry Auditor",
        "details": "Detour factor: 4.8x normal path length",
        "expected": "Detour ratio < 1.6x optimal path",
        "action": "Log route efficiency score",
        "time": "4 hours ago"
    },
    {
        "id": "TRP-9452",
        "type": "Passenger Capacity Violation",
        "score": 90,
        "zone": "East Village",
        "model": "Vehicle Regulatory Rules",
        "details": "Passenger count recorded: 12 in 4-passenger sedan",
        "expected": "Max passengers <= 5 for standard medallion",
        "action": "Flag dispatch record for correction",
        "time": "5 hours ago"
    },
    {
        "id": "TRP-3810",
        "type": "Midnight Surge Spike",
        "score": 89,
        "zone": "Coney Island",
        "model": "Temporal Outlier Model",
        "details": "Base fare spiked 500% with no adverse weather",
        "expected": "Standard rate sheet without citywide emergency",
        "action": "Review pricing override logs",
        "time": "6 hours ago"
    },
    {
        "id": "TRP-5521",
        "type": "Airport Perimeter Disconnect",
        "score": 94,
        "zone": "Newark Airport (EWR)",
        "model": "Airport Geofence Monitor",
        "details": "Interstate flat rate missing required port toll",
        "expected": "NJ interstate fee + tunnel toll included",
        "action": "Reconcile port authority toll log",
        "time": "7 hours ago"
    },
    {
        "id": "TRP-7390",
        "type": "Expressway Speed Anomaly",
        "score": 95,
        "zone": "Yankee Stadium / South Bronx",
        "model": "Physical Constraints Engine",
        "details": "Major Deegan Expressway speed: 104 mph",
        "expected": "Speed limit <= 50 mph",
        "action": "Submit safety report",
        "time": "8 hours ago"
    },
    {
        "id": "TRP-4019",
        "type": "Sub-Zero Fare With Surcharge",
        "score": 99,
        "zone": "Astoria",
        "model": "Rule-based Data Quality",
        "details": "Fare: -$12.50 with positive tip $5.00",
        "expected": "Total amount must be strictly positive",
        "action": "Drop from financial reporting",
        "time": "9 hours ago"
    },
    {
        "id": "TRP-8472",
        "type": "Verrazzano Bridge Toll Discrepancy",
        "score": 92,
        "zone": "St. George Ferry",
        "model": "Toll Matrix Engine",
        "details": "Crossed Verrazzano Bridge without toll record",
        "expected": "E-ZPass toll record of $6.94",
        "action": "Verify transponder telemetry",
        "time": "10 hours ago"
    },
    {
        "id": "TRP-6184",
        "type": "Outlier Route Loop",
        "score": 87,
        "zone": "Fordham",
        "model": "Isolation Forest",
        "details": "Circled the same 4-block perimeter 14 times",
        "expected": "Linear or goal-directed path trajectory",
        "action": "Review driver trip log",
        "time": "11 hours ago"
    }
]

with open("data/anomalies_fallback.json", "w", encoding="utf-8") as f:
    json.dump(anomalies, f, indent=2)

print(f"Generated data/network_fallback.json with {len(nodes)} nodes and {len(links)} links.")
print(f"Generated data/anomalies_fallback.json with {len(anomalies)} anomalies.")

