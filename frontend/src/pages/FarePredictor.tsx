import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, MapPin, Navigation, Clock, DollarSign, BrainCircuit, Info, ShieldCheck, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface LocationInfo {
  id: string;
  borough: string;
  lat: number;
  lng: number;
}

const NYC_LOCATIONS: LocationInfo[] = [
  // Manhattan
  { id: "Times Sq", borough: "Manhattan", lat: 40.7580, lng: -73.9855 },
  { id: "Midtown Center", borough: "Manhattan", lat: 40.7549, lng: -73.9840 },
  { id: "Penn Station", borough: "Manhattan", lat: 40.7506, lng: -73.9935 },
  { id: "Chelsea", borough: "Manhattan", lat: 40.7465, lng: -74.0014 },
  { id: "Upper East Side", borough: "Manhattan", lat: 40.7736, lng: -73.9566 },
  { id: "Upper West Side", borough: "Manhattan", lat: 40.7870, lng: -73.9754 },
  { id: "Financial District", borough: "Manhattan", lat: 40.7075, lng: -74.0113 },
  { id: "East Village", borough: "Manhattan", lat: 40.7265, lng: -73.9815 },
  { id: "Harlem", borough: "Manhattan", lat: 40.8116, lng: -73.9465 },
  { id: "Washington Heights", borough: "Manhattan", lat: 40.8417, lng: -73.9393 },
  // Airports & Major Terminals
  { id: "Grand Central", borough: "Airports & Terminals", lat: 40.7527, lng: -73.9772 },
  { id: "JFK Airport", borough: "Airports & Terminals", lat: 40.6413, lng: -73.7781 },
  { id: "LaGuardia Airport", borough: "Airports & Terminals", lat: 40.7769, lng: -73.8740 },
  { id: "Newark Airport (EWR)", borough: "Airports & Terminals", lat: 40.6895, lng: -74.1745 },
  // Brooklyn
  { id: "Downtown Brooklyn", borough: "Brooklyn", lat: 40.6924, lng: -73.9875 },
  { id: "DUMBO", borough: "Brooklyn", lat: 40.7033, lng: -73.9890 },
  { id: "Williamsburg", borough: "Brooklyn", lat: 40.7081, lng: -73.9571 },
  { id: "Park Slope", borough: "Brooklyn", lat: 40.6710, lng: -73.9770 },
  { id: "Coney Island", borough: "Brooklyn", lat: 40.5755, lng: -73.9707 },
  // Queens
  { id: "Long Island City", borough: "Queens", lat: 40.7447, lng: -73.9485 },
  { id: "Astoria", borough: "Queens", lat: 40.7644, lng: -73.9235 },
  { id: "Flushing", borough: "Queens", lat: 40.7675, lng: -73.8331 },
  // The Bronx
  { id: "Yankee Stadium / South Bronx", borough: "The Bronx", lat: 40.8296, lng: -73.9262 },
  { id: "Fordham", borough: "The Bronx", lat: 40.8617, lng: -73.8906 },
  // Staten Island
  { id: "St. George Ferry", borough: "Staten Island", lat: 40.6432, lng: -74.0736 },
  { id: "Staten Island Mall", borough: "Staten Island", lat: 40.5835, lng: -74.1610 },
];

const BOROUGHS = [
  "Manhattan",
  "Airports & Terminals",
  "Brooklyn",
  "Queens",
  "The Bronx",
  "Staten Island",
];

// Haversine distance with NYC road network grid detour factor (1.32x)
function computeHaversineDistance(locA: LocationInfo, locB: LocationInfo): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = (locB.lat - locA.lat) * (Math.PI / 180);
  const dLng = (locB.lng - locA.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(locA.lat * (Math.PI / 180)) *
      Math.cos(locB.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const roadFactor = 1.32;
  const dist = R * c * roadFactor;
  return Math.max(0.8, Math.round(dist * 10) / 10);
}

// Estimate realistic trip duration based on distance, airport highway speeds, and time of day traffic
function estimateTripDuration(dist: number, timeStr: string, isAirport: boolean): number {
  const [hourStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10) || 12;

  let speedMph: number;
  if ((hour >= 7 && hour <= 10) || (hour >= 16 && hour <= 19)) {
    // Peak Rush Hour Congestion
    speedMph = isAirport && dist > 7 ? 17 : 11;
  } else if (hour >= 21 || hour < 6) {
    // Night / Light Traffic
    speedMph = isAirport && dist > 7 ? 34 : 24;
  } else {
    // Standard Midday / Afternoon Traffic
    speedMph = isAirport && dist > 7 ? 24 : 16;
  }

  const durationMinutes = (dist / speedMph) * 60;
  return Math.max(4, Math.round(durationMinutes));
}

export default function FarePredictor() {
  const [pickup, setPickup] = useState("Times Sq");
  const [dropoff, setDropoff] = useState("JFK Airport");
  const [distance, setDistance] = useState("17.4");
  const [duration, setDuration] = useState("55");
  const [time, setTime] = useState("17:30");
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-calculate distance and duration when pickup, dropoff, or time changes
  useEffect(() => {
    if (pickup === dropoff) {
      setValidationError("Pickup and dropoff locations cannot be identical.");
      return;
    }
    setValidationError(null);

    const locA = NYC_LOCATIONS.find(l => l.id === pickup);
    const locB = NYC_LOCATIONS.find(l => l.id === dropoff);

    if (locA && locB) {
      const dist = computeHaversineDistance(locA, locB);
      const isAirport = locA.borough === "Airports & Terminals" || locB.borough === "Airports & Terminals";
      const dur = estimateTripDuration(dist, time, isAirport);

      setDistance(dist.toFixed(1));
      setDuration(dur.toString());
    }
  }, [pickup, dropoff, time]);

  // When user selects a pickup equal to current dropoff, auto-swap dropoff to an alternative
  const handlePickupChange = (newPickup: string) => {
    if (newPickup === dropoff) {
      // Pick a distinct sensible dropoff
      const alt = NYC_LOCATIONS.find(l => l.id !== newPickup && l.id !== "Times Sq")?.id || "Midtown Center";
      setDropoff(alt);
    }
    setPickup(newPickup);
  };

  // When user selects a dropoff equal to current pickup, auto-swap pickup to an alternative
  const handleDropoffChange = (newDropoff: string) => {
    if (newDropoff === pickup) {
      const alt = NYC_LOCATIONS.find(l => l.id !== newDropoff && l.id !== "JFK Airport")?.id || "Penn Station";
      setPickup(alt);
    }
    setDropoff(newDropoff);
  };

  const runPrediction = async () => {
    if (pickup === dropoff) {
      setValidationError("Pickup and dropoff cannot be the same. Please choose distinct locations.");
      return;
    }

    setLoading(true);
    setValidationError(null);
    await new Promise(r => setTimeout(r, 600));

    try {
      const res = await axios.post(`${API_BASE_URL}/api/predict_fare`, {
        pickup,
        dropoff,
        distance: parseFloat(distance),
        duration: parseFloat(duration),
        time
      });
      setResult(res.data);
    } catch (err) {
      console.error("Fare prediction request failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const pickupLocation = NYC_LOCATIONS.find(l => l.id === pickup);
  const dropoffLocation = NYC_LOCATIONS.find(l => l.id === dropoff);
  const isInterBorough = pickupLocation && dropoffLocation && pickupLocation.borough !== dropoffLocation.borough;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Machine Learning: Fare Predictor</h2>
        <p className="text-text-secondary max-w-3xl leading-relaxed">
          Powered by our trained <span className="text-nyc-yellow font-bold">Random Forest Regressor</span> and official NYC TLC fare rules.
          Select any pickup and dropoff locations across all 5 NYC boroughs. Route distance is automatically calculated from high-resolution GPS coordinates.
        </p>
      </div>

      {validationError && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-semibold">{validationError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input Form */}
        <div className="bg-bg-panel border border-border rounded-xl p-6 shadow-lg flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="text-cyan-400" /> Trip Parameters
            </h3>
            {isInterBorough && (
              <span className="text-xs bg-accent-cyan/15 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-full font-mono font-semibold">
                Inter-Borough Route
              </span>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            
            {/* Origin & Destination Selectors */}
            <div className="flex flex-col sm:flex-row gap-4">
              
              {/* Pickup Selector */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider flex items-center justify-between">
                  <span>Pickup Location</span>
                  <span className="text-[10px] text-green-400 font-mono">Origin</span>
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 z-10" />
                  <select 
                    value={pickup} 
                    onChange={(e) => handlePickupChange(e.target.value)} 
                    className="w-full bg-bg-dark border border-border rounded-lg pl-9 pr-4 py-3 text-white outline-none focus:border-cyan-500 transition-colors cursor-pointer text-sm"
                  >
                    {BOROUGHS.map(b => (
                      <optgroup key={b} label={b}>
                        {NYC_LOCATIONS.filter(l => l.borough === b).map(loc => (
                          <option 
                            key={loc.id} 
                            value={loc.id}
                            disabled={loc.id === dropoff}
                          >
                            {loc.id} {loc.id === dropoff ? "(Selected as Dropoff)" : ""}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dropoff Selector */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider flex items-center justify-between">
                  <span>Dropoff Location</span>
                  <span className="text-[10px] text-red-400 font-mono">Destination</span>
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400 z-10" />
                  <select 
                    value={dropoff} 
                    onChange={(e) => handleDropoffChange(e.target.value)} 
                    className="w-full bg-bg-dark border border-border rounded-lg pl-9 pr-4 py-3 text-white outline-none focus:border-cyan-500 transition-colors cursor-pointer text-sm"
                  >
                    {BOROUGHS.map(b => (
                      <optgroup key={b} label={b}>
                        {NYC_LOCATIONS.filter(l => l.borough === b).map(loc => (
                          <option 
                            key={loc.id} 
                            value={loc.id}
                            disabled={loc.id === pickup}
                          >
                            {loc.id} {loc.id === pickup ? "(Selected as Pickup)" : ""}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Calculated Distance & Duration */}
            <div className="flex flex-col sm:flex-row gap-4">
              
              {/* Distance */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                  Est. Distance (miles)
                </label>
                <div className="relative">
                  <Navigation size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nyc-yellow" />
                  <input 
                    type="text" 
                    readOnly 
                    value={`${distance} mi`} 
                    className="w-full bg-bg-dark/70 border border-dashed border-border rounded-lg pl-9 pr-4 py-3 text-nyc-yellow font-mono font-bold outline-none cursor-not-allowed select-none transition-colors" 
                    title="Distance is automatically computed via GPS coordinate routing and cannot be edited directly."
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                  Est. Duration (mins)
                </label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input 
                    type="text" 
                    readOnly 
                    value={`${duration} mins`} 
                    className="w-full bg-bg-dark/70 border border-dashed border-border rounded-lg pl-9 pr-4 py-3 text-cyan-300 font-mono font-bold outline-none cursor-not-allowed select-none transition-colors" 
                    title="Trip duration is calculated based on distance and the selected pickup time's traffic conditions."
                  />
                </div>
              </div>

            </div>

            {/* Time of Day */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Pickup Time (24h Traffic Matrix)</label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="time" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                  className="w-full bg-bg-dark border border-border rounded-lg pl-9 pr-4 py-3 text-white outline-none focus:border-cyan-500 transition-colors cursor-pointer" 
                />
              </div>
              <p className="text-[11px] text-text-secondary mt-1.5">
                Adjusting time updates rush hour surcharges ($2.50 peak / $1.00 overnight) and recalculates traffic-adjusted duration.
              </p>
            </div>

            <button 
              onClick={runPrediction}
              disabled={loading || pickup === dropoff}
              className="mt-3 flex items-center justify-center gap-2 bg-nyc-yellow text-bg-dark font-bold px-8 py-4 rounded-lg hover:bg-yellow-400 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(255,193,7,0.3)] hover:shadow-[0_0_25px_rgba(255,193,7,0.5)] cursor-pointer"
            >
              {loading ? (
                <><BrainCircuit size={20} className="animate-pulse" /> Evaluating PySpark ML Pipeline...</>
              ) : (
                <><DollarSign size={20} /> Predict Fare</>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-bg-panel border border-border rounded-xl p-6 shadow-lg flex flex-col justify-center items-center relative overflow-hidden">
          {!result && !loading && (
            <div className="text-center text-text-secondary flex flex-col items-center gap-4 opacity-60">
              <div className="w-20 h-20 rounded-full bg-bg-dark border border-border flex items-center justify-center text-cyan-400">
                <BrainCircuit size={40} />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg mb-1">Inference Engine Ready</h4>
                <p className="text-sm max-w-sm">
                  Select your origin and destination across any NYC borough to generate an ML-powered fare prediction.
                </p>
              </div>
            </div>
          )}
          
          {loading && (
            <div className="text-center text-cyan-400 flex flex-col items-center gap-4">
              <BrainCircuit size={64} className="animate-pulse" />
              <p className="animate-pulse font-mono tracking-wide">Executing Feature Transformers & Regressor...</p>
            </div>
          )}

          {result && !loading && (
            <div className="w-full h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-text-secondary font-bold uppercase tracking-wider text-xs mb-1">Predicted Fare</h3>
                    <div className="text-xs text-cyan-400 font-mono">{pickup} ➔ {dropoff}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 ${
                    result.confidence > 90 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  }`}>
                    <ShieldCheck size={14} />
                    {result.confidence}% Confidence
                  </span>
                </div>
                
                <div className="flex flex-col items-center justify-center mb-8 bg-bg-dark/50 border border-border p-6 rounded-xl">
                  <span className="text-6xl font-extrabold text-white mb-2 tracking-tight">
                    ${result.predicted_fare.toFixed(2)}
                  </span>
                  <span className="text-text-secondary font-mono text-sm">
                    Expected Band: <span className="text-white">${result.lower_bound.toFixed(2)}</span> - <span className="text-white">${result.upper_bound.toFixed(2)}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-bg-dark border border-border p-3 rounded-lg text-center">
                    <div className="text-[10px] text-text-secondary uppercase font-semibold">Route Distance</div>
                    <div className="text-lg font-bold text-white font-mono">{distance} mi</div>
                  </div>
                  <div className="bg-bg-dark border border-border p-3 rounded-lg text-center">
                    <div className="text-[10px] text-text-secondary uppercase font-semibold">Travel Time</div>
                    <div className="text-lg font-bold text-cyan-400 font-mono">{duration} mins</div>
                  </div>
                </div>
              </div>

              <div className="bg-bg-dark border border-border p-4 rounded-lg flex items-start gap-3">
                <Info className="text-nyc-yellow shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-white text-sm font-bold mb-1">Machine Learning Feature Reasoning</h4>
                  <p className="text-text-secondary text-xs leading-relaxed">
                    {result.insight}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
