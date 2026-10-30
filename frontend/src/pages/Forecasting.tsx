import { useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, TrendingUp, Clock, DollarSign, BrainCircuit } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function Forecasting() {
  const [zone, setZone] = useState("All Manhattan");
  const [horizon, setHorizon] = useState("Next 24 Hours");
  const [weather, setWeather] = useState("Clear");

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runForecast = async () => {
    setLoading(true);
    // Simulate ML Model processing time
    await new Promise(r => setTimeout(r, 1200)); 
    try {
      const res = await axios.post(`${API_BASE_URL}/api/forecast/demand`, {
        zone,
        horizon,
        weather,
        model: "Random Forest"
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Predictive Demand Modeling</h2>
        <p className="text-text-secondary max-w-3xl leading-relaxed">
          Why look at the past when you can predict the future? Configure the parameters below to simulate how 
          our trained Random Forest Regressor reacts to external features like weather events and geospatial data.
        </p>
      </div>

      <div className="bg-bg-panel border border-border rounded-xl p-6 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Target Region / Zone</label>
            <select value={zone} onChange={(e) => setZone(e.target.value)} className="w-full bg-bg-dark border border-border rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-500 transition-colors cursor-pointer">
              <optgroup label="NYC Boroughs (Macro Regions)">
                <option value="All Manhattan">All Manhattan</option>
                <option value="All Brooklyn">All Brooklyn</option>
                <option value="All Queens">All Queens</option>
                <option value="The Bronx">The Bronx</option>
                <option value="Staten Island">Staten Island</option>
              </optgroup>
              <optgroup label="Manhattan Hubs & Districts">
                <option value="Times Square">Times Square</option>
                <option value="Midtown Center">Midtown Center</option>
                <option value="Financial District">Financial District</option>
                <option value="Upper East Side">Upper East Side</option>
                <option value="Upper West Side">Upper West Side</option>
              </optgroup>
              <optgroup label="Outer Borough Hubs & Airports">
                <option value="Downtown Brooklyn">Downtown Brooklyn</option>
                <option value="Williamsburg">Williamsburg</option>
                <option value="JFK Airport">JFK Airport</option>
                <option value="LaGuardia Airport">LaGuardia Airport</option>
                <option value="Newark Airport (EWR)">Newark Airport (EWR)</option>
              </optgroup>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Weather Condition</label>
            <select value={weather} onChange={(e) => setWeather(e.target.value)} className="w-full bg-bg-dark border border-border rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-500 transition-colors cursor-pointer">
              <option>Clear</option>
              <option>Heavy Rain</option>
              <option>Snowstorm</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Time Horizon</label>
            <select value={horizon} onChange={(e) => setHorizon(e.target.value)} className="w-full bg-bg-dark border border-border rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-500 transition-colors cursor-pointer">
              <option>Next 12 Hours</option>
              <option>Next 24 Hours</option>
              <option>Next 7 Days</option>
              <option>Next 30 Days</option>
              <option>Next 90 Days</option>
            </select>
          </div>

          <div>
            <button 
              onClick={runForecast}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-cyan-500 text-bg-dark font-bold px-6 py-3 rounded-lg hover:bg-cyan-400 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] cursor-pointer"
            >
              {loading ? (
                <>
                  <BrainCircuit size={20} className="animate-pulse" /> Running Model...
                </>
              ) : (
                <>
                  <Play size={20} /> Generate Forecast
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {result && result.forecast && result.forecast.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
          
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-bg-panel border border-border rounded-xl p-6 flex flex-col shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-cyan-400" /> Projected Demand Curve
              </h3>
              <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${result.confidence > 90 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                {result.confidence}% Confidence Score
              </span>
            </div>
            
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.forecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2d36" vertical={false} />
                  <XAxis dataKey="time" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1d24', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="predicted_demand" name="Expected Trips" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorDemand)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Business Impact Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="bg-bg-panel border border-border rounded-xl p-5 shadow-lg relative overflow-hidden">
              <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                <DollarSign size={16} /> Financial Impact
              </h4>
              <p className="text-3xl font-bold text-nyc-yellow mb-1 relative z-10">{result.impact}</p>
              <p className="text-sm text-text-secondary relative z-10">Est. additional daily revenue by preemptively routing drivers.</p>
            </div>
            
            <div className="bg-bg-panel border border-border rounded-xl p-5 shadow-lg">
              <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock size={16} /> Efficiency Gains
              </h4>
              <p className="text-3xl font-bold text-green-400 mb-1">{result.efficiency}</p>
              <p className="text-sm text-text-secondary">Reduction in average passenger wait time based on predictive deployment.</p>
            </div>

            <div className="bg-bg-panel border border-border rounded-xl p-5 flex-1 shadow-lg">
              <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Model Insights</h4>
              <ul className="text-sm text-gray-300 space-y-4">
                {result.insights && result.insights.map((insight: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></div>
                    <span className="leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
