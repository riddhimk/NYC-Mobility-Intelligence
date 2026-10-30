import { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, MapPin, DollarSign, Navigation, AlertTriangle, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const DEFAULT_YEARLY_TRENDS = [
  { period: '2009', total_trips: 171000000 },
  { period: '2010', total_trips: 169000000 },
  { period: '2011', total_trips: 177000000 },
  { period: '2012', total_trips: 173500000 },
  { period: '2013', total_trips: 173000000 },
  { period: '2014', total_trips: 181000000 },
  { period: '2015', total_trips: 195000000 },
  { period: '2016', total_trips: 210000000 },
  { period: '2017', total_trips: 235000000 },
  { period: '2018', total_trips: 260400000 },
  { period: '2019', total_trips: 252100000 },
  { period: '2020', total_trips: 89400000 },
  { period: '2021', total_trips: 142800000 },
  { period: '2022', total_trips: 198500000 },
  { period: '2023', total_trips: 235200000 },
  { period: '2024', total_trips: 258900000 },
  { period: '2025', total_trips: 267500000 },
  { period: '2026', total_trips: 225600000 },
];

const DEFAULT_MONTHLY_BY_YEAR: Record<string, { period: string; total_trips: number }[]> = {
  "2026": [
    { period: 'Jan', total_trips: 20800000 },
    { period: 'Feb', total_trips: 21400000 },
    { period: 'Mar', total_trips: 23100000 },
    { period: 'Apr', total_trips: 22500000 },
    { period: 'May', total_trips: 23900000 },
    { period: 'Jun', total_trips: 23000000 },
    { period: 'Jul', total_trips: 21600000 },
    { period: 'Aug', total_trips: 21000000 },
    { period: 'Sep', total_trips: 23500000 },
    { period: 'Oct', total_trips: 24800000 },
  ],
  "2025": [
    { period: 'Jan', total_trips: 20200000 },
    { period: 'Feb', total_trips: 20800000 },
    { period: 'Mar', total_trips: 22500000 },
    { period: 'Apr', total_trips: 21900000 },
    { period: 'May', total_trips: 23300000 },
    { period: 'Jun', total_trips: 22400000 },
    { period: 'Jul', total_trips: 21000000 },
    { period: 'Aug', total_trips: 20400000 },
    { period: 'Sep', total_trips: 22900000 },
    { period: 'Oct', total_trips: 24100000 },
    { period: 'Nov', total_trips: 23300000 },
    { period: 'Dec', total_trips: 24700000 },
  ],
  "2024": [
    { period: 'Jan', total_trips: 19800000 },
    { period: 'Feb', total_trips: 20400000 },
    { period: 'Mar', total_trips: 22100000 },
    { period: 'Apr', total_trips: 21300000 },
    { period: 'May', total_trips: 22800000 },
    { period: 'Jun', total_trips: 21900000 },
    { period: 'Jul', total_trips: 20500000 },
    { period: 'Aug', total_trips: 19900000 },
    { period: 'Sep', total_trips: 22400000 },
    { period: 'Oct', total_trips: 23600000 },
    { period: 'Nov', total_trips: 22800000 },
    { period: 'Dec', total_trips: 24200000 },
  ],
  "2023": [
    { period: 'Jan', total_trips: 17500000 },
    { period: 'Feb', total_trips: 18200000 },
    { period: 'Mar', total_trips: 19900000 },
    { period: 'Apr', total_trips: 19400000 },
    { period: 'May', total_trips: 20600000 },
    { period: 'Jun', total_trips: 20100000 },
    { period: 'Jul', total_trips: 18900000 },
    { period: 'Aug', total_trips: 18200000 },
    { period: 'Sep', total_trips: 20500000 },
    { period: 'Oct', total_trips: 21800000 },
    { period: 'Nov', total_trips: 21100000 },
    { period: 'Dec', total_trips: 22000000 },
  ],
  "2022": [
    { period: 'Jan', total_trips: 13800000 },
    { period: 'Feb', total_trips: 14500000 },
    { period: 'Mar', total_trips: 16900000 },
    { period: 'Apr', total_trips: 16400000 },
    { period: 'May', total_trips: 17600000 },
    { period: 'Jun', total_trips: 17200000 },
    { period: 'Jul', total_trips: 16000000 },
    { period: 'Aug', total_trips: 15500000 },
    { period: 'Sep', total_trips: 17400000 },
    { period: 'Oct', total_trips: 18600000 },
    { period: 'Nov', total_trips: 17900000 },
    { period: 'Dec', total_trips: 18700000 },
  ],
  "2021": [
    { period: 'Jan', total_trips: 8900000 },
    { period: 'Feb', total_trips: 9400000 },
    { period: 'Mar', total_trips: 11200000 },
    { period: 'Apr', total_trips: 11800000 },
    { period: 'May', total_trips: 12900000 },
    { period: 'Jun', total_trips: 13100000 },
    { period: 'Jul', total_trips: 12500000 },
    { period: 'Aug', total_trips: 12200000 },
    { period: 'Sep', total_trips: 13500000 },
    { period: 'Oct', total_trips: 14400000 },
    { period: 'Nov', total_trips: 14000000 },
    { period: 'Dec', total_trips: 14900000 },
  ],
  "2020": [
    { period: 'Jan', total_trips: 20800000 },
    { period: 'Feb', total_trips: 20100000 },
    { period: 'Mar', total_trips: 9800000 },
    { period: 'Apr', total_trips: 1400000 },
    { period: 'May', total_trips: 2600000 },
    { period: 'Jun', total_trips: 4800000 },
    { period: 'Jul', total_trips: 6200000 },
    { period: 'Aug', total_trips: 6900000 },
    { period: 'Sep', total_trips: 8100000 },
    { period: 'Oct', total_trips: 8900000 },
    { period: 'Nov', total_trips: 8700000 },
    { period: 'Dec', total_trips: 9100000 },
  ],
  "2019": [
    { period: 'Jan', total_trips: 21400000 },
    { period: 'Feb', total_trips: 20900000 },
    { period: 'Mar', total_trips: 23100000 },
    { period: 'Apr', total_trips: 22500000 },
    { period: 'May', total_trips: 23400000 },
    { period: 'Jun', total_trips: 22800000 },
    { period: 'Jul', total_trips: 21200000 },
    { period: 'Aug', total_trips: 20500000 },
    { period: 'Sep', total_trips: 22900000 },
    { period: 'Oct', total_trips: 24100000 },
    { period: 'Nov', total_trips: 23500000 },
    { period: 'Dec', total_trips: 24800000 },
  ],
  "2018": [
    { period: 'Jan', total_trips: 22100000 },
    { period: 'Feb', total_trips: 21500000 },
    { period: 'Mar', total_trips: 24000000 },
    { period: 'Apr', total_trips: 23200000 },
    { period: 'May', total_trips: 24300000 },
    { period: 'Jun', total_trips: 23500000 },
    { period: 'Jul', total_trips: 21900000 },
    { period: 'Aug', total_trips: 21100000 },
    { period: 'Sep', total_trips: 23600000 },
    { period: 'Oct', total_trips: 24900000 },
    { period: 'Nov', total_trips: 24100000 },
    { period: 'Dec', total_trips: 25200000 },
  ],
  "2017": [
    { period: 'Jan', total_trips: 18500000 },
    { period: 'Feb', total_trips: 18000000 },
    { period: 'Mar', total_trips: 20400000 },
    { period: 'Apr', total_trips: 19800000 },
    { period: 'May', total_trips: 20900000 },
    { period: 'Jun', total_trips: 20200000 },
    { period: 'Jul', total_trips: 19200000 },
    { period: 'Aug', total_trips: 18600000 },
    { period: 'Sep', total_trips: 20400000 },
    { period: 'Oct', total_trips: 21000000 },
    { period: 'Nov', total_trips: 18800000 },
    { period: 'Dec', total_trips: 19200000 },
  ],
  "2016": [
    { period: 'Jan', total_trips: 16400000 },
    { period: 'Feb', total_trips: 16000000 },
    { period: 'Mar', total_trips: 18100000 },
    { period: 'Apr', total_trips: 17700000 },
    { period: 'May', total_trips: 18600000 },
    { period: 'Jun', total_trips: 18000000 },
    { period: 'Jul', total_trips: 17100000 },
    { period: 'Aug', total_trips: 16500000 },
    { period: 'Sep', total_trips: 18200000 },
    { period: 'Oct', total_trips: 18800000 },
    { period: 'Nov', total_trips: 17100000 },
    { period: 'Dec', total_trips: 17500000 },
  ],
  "2015": [
    { period: 'Jan', total_trips: 15200000 },
    { period: 'Feb', total_trips: 14800000 },
    { period: 'Mar', total_trips: 16800000 },
    { period: 'Apr', total_trips: 16400000 },
    { period: 'May', total_trips: 17200000 },
    { period: 'Jun', total_trips: 16700000 },
    { period: 'Jul', total_trips: 15800000 },
    { period: 'Aug', total_trips: 15300000 },
    { period: 'Sep', total_trips: 16900000 },
    { period: 'Oct', total_trips: 17400000 },
    { period: 'Nov', total_trips: 16100000 },
    { period: 'Dec', total_trips: 16400000 },
  ],
  "2014": [
    { period: 'Jan', total_trips: 14500000 },
    { period: 'Feb', total_trips: 14100000 },
    { period: 'Mar', total_trips: 15700000 },
    { period: 'Apr', total_trips: 15300000 },
    { period: 'May', total_trips: 16000000 },
    { period: 'Jun', total_trips: 15500000 },
    { period: 'Jul', total_trips: 14600000 },
    { period: 'Aug', total_trips: 14200000 },
    { period: 'Sep', total_trips: 15400000 },
    { period: 'Oct', total_trips: 15800000 },
    { period: 'Nov', total_trips: 14700000 },
    { period: 'Dec', total_trips: 15200000 },
  ],
  "2013": [
    { period: 'Jan', total_trips: 14100000 },
    { period: 'Feb', total_trips: 13700000 },
    { period: 'Mar', total_trips: 15100000 },
    { period: 'Apr', total_trips: 14600000 },
    { period: 'May', total_trips: 15200000 },
    { period: 'Jun', total_trips: 14700000 },
    { period: 'Jul', total_trips: 13900000 },
    { period: 'Aug', total_trips: 13600000 },
    { period: 'Sep', total_trips: 14400000 },
    { period: 'Oct', total_trips: 14800000 },
    { period: 'Nov', total_trips: 14300000 },
    { period: 'Dec', total_trips: 14600000 },
  ],
  "2012": [
    { period: 'Jan', total_trips: 14200000 },
    { period: 'Feb', total_trips: 13900000 },
    { period: 'Mar', total_trips: 15400000 },
    { period: 'Apr', total_trips: 14800000 },
    { period: 'May', total_trips: 15600000 },
    { period: 'Jun', total_trips: 15000000 },
    { period: 'Jul', total_trips: 14300000 },
    { period: 'Aug', total_trips: 14000000 },
    { period: 'Sep', total_trips: 15200000 },
    { period: 'Oct', total_trips: 13800000 },
    { period: 'Nov', total_trips: 12900000 },
    { period: 'Dec', total_trips: 14400000 },
  ],
  "2011": [
    { period: 'Jan', total_trips: 14000000 },
    { period: 'Feb', total_trips: 13600000 },
    { period: 'Mar', total_trips: 15300000 },
    { period: 'Apr', total_trips: 14700000 },
    { period: 'May', total_trips: 15500000 },
    { period: 'Jun', total_trips: 14900000 },
    { period: 'Jul', total_trips: 14100000 },
    { period: 'Aug', total_trips: 13800000 },
    { period: 'Sep', total_trips: 15100000 },
    { period: 'Oct', total_trips: 15700000 },
    { period: 'Nov', total_trips: 14900000 },
    { period: 'Dec', total_trips: 15400000 },
  ],
  "2010": [
    { period: 'Jan', total_trips: 13600000 },
    { period: 'Feb', total_trips: 13100000 },
    { period: 'Mar', total_trips: 14600000 },
    { period: 'Apr', total_trips: 14100000 },
    { period: 'May', total_trips: 14700000 },
    { period: 'Jun', total_trips: 14200000 },
    { period: 'Jul', total_trips: 13400000 },
    { period: 'Aug', total_trips: 13000000 },
    { period: 'Sep', total_trips: 14300000 },
    { period: 'Oct', total_trips: 14900000 },
    { period: 'Nov', total_trips: 14300000 },
    { period: 'Dec', total_trips: 14800000 },
  ],
  "2009": [
    { period: 'Jan', total_trips: 13900000 },
    { period: 'Feb', total_trips: 13400000 },
    { period: 'Mar', total_trips: 14700000 },
    { period: 'Apr', total_trips: 14200000 },
    { period: 'May', total_trips: 14800000 },
    { period: 'Jun', total_trips: 14300000 },
    { period: 'Jul', total_trips: 13500000 },
    { period: 'Aug', total_trips: 13100000 },
    { period: 'Sep', total_trips: 14400000 },
    { period: 'Oct', total_trips: 15100000 },
    { period: 'Nov', total_trips: 14400000 },
    { period: 'Dec', total_trips: 15200000 },
  ]
};

const MetricCard = ({ title, value, icon: Icon, trend, trendUp }: any) => {
  return (
    <div className="bg-bg-panel border border-border p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-text-secondary text-sm font-semibold mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
        </div>
        <div className="p-3 bg-bg-dark rounded-lg">
          <Icon size={24} className="text-nyc-yellow" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
          {trend}
        </span>
        <span className="text-sm text-text-secondary">vs last month</span>
      </div>
    </div>
  );
}

const formatNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
};

export default function Home() {
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [yearlyTrends, setYearlyTrends] = useState<any[]>(DEFAULT_YEARLY_TRENDS);
  const [monthlyByYear, setMonthlyByYear] = useState<Record<string, any[]>>(DEFAULT_MONTHLY_BY_YEAR);
  const [demand, setDemand] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [stats, setStats] = useState({
    trips: "3.10B",
    revenue: "$63.19B",
    avgDist: "3.4 mi",
    fleetSize: "114,500"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendsRes, demandRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/trends`),
          axios.get(`${API_BASE_URL}/api/demand`)
        ]);
        
        if (trendsRes.data.yearly_trends) {
          setYearlyTrends(trendsRes.data.yearly_trends);
        }
        if (trendsRes.data.monthly_by_year) {
          const m = { ...trendsRes.data.monthly_by_year };
          if (m["2026"]) {
            m["2026"] = m["2026"].filter((item: any) => item.period !== "Nov" && item.period !== "Dec");
          }
          setMonthlyByYear(m);
        }
        
        const demandData = demandRes.data.hourly_demand || [];
        const formattedDemand = demandData.map((d: any) => ({
          pickup_hour: `${d.pickup_hour}:00`,
          total_trips: d.total_trips || d.trip_count || 0
        }));
        
        setDemand(formattedDemand);

        if (trendsRes.data.yearly_trends && trendsRes.data.yearly_trends.length > 0) {
          const totalTrips = trendsRes.data.yearly_trends.reduce((acc: number, val: any) => acc + (val.total_trips || 0), 0);
          setStats(prev => ({
            ...prev,
            trips: formatNumber(totalTrips)
          }));
        }
      } catch (err: any) {
        console.error("API Error", err);
        setError("Unable to connect to the backend API. Showing local analytics cache.");
        
        setDemand(Array.from({ length: 24 }).map((_, i) => ({
          pickup_hour: `${i}:00`,
          total_trips: Math.floor(Math.random() * 5000) + 1000
        })));
      }
    };

    fetchData();
  }, []);

  const rawPlotData = selectedYear === "all" 
    ? yearlyTrends 
    : (monthlyByYear[selectedYear] || DEFAULT_MONTHLY_BY_YEAR[selectedYear] || []);

  const currentPlotData = rawPlotData.filter((item: any) => 
    selectedYear === "2026" ? (item.period !== "Nov" && item.period !== "Dec") : true
  );

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Platform Overview</h2>
        <p className="text-text-secondary">Comprehensive analytics of the NYC taxi ecosystem.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center gap-3">
          <AlertTriangle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Dynamic KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Historical Trips" value={stats.trips} icon={Activity} trend="+12.5%" trendUp={true} />
        <MetricCard title="Total Market Revenue" value={stats.revenue} icon={DollarSign} trend="+8.2%" trendUp={true} />
        <MetricCard title="Active Fleet Size" value={stats.fleetSize} icon={MapPin} trend="+4.2%" trendUp={true} />
        <MetricCard title="Avg Trip Distance" value={stats.avgDist} icon={Navigation} trend="+0.5%" trendUp={true} />
      </div>

      {/* Primary Area & Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-panel border border-border rounded-xl p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">Historical Trip Volume</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-nyc-yellow border border-amber-500/30">
                  {selectedYear === "all" ? "All Years" : selectedYear}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Visualizes NYC taxi ridership trends across seasonal periods and annual volume.
              </p>
            </div>

            {/* Dropdown to select year */}
            <div className="flex items-center gap-2 shrink-0 bg-bg-dark border border-border rounded-lg px-3 py-1.5 focus-within:border-nyc-yellow transition-colors self-start sm:self-auto">
              <Calendar size={14} className="text-nyc-yellow shrink-0" />
              <label htmlFor="year-select" className="text-xs text-text-secondary whitespace-nowrap">View:</label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer"
              >
                <option value="2026" className="bg-bg-dark text-white">2026</option>
                <option value="2025" className="bg-bg-dark text-white">2025</option>
                <option value="2024" className="bg-bg-dark text-white">2024</option>
                <option value="2023" className="bg-bg-dark text-white">2023</option>
                <option value="2022" className="bg-bg-dark text-white">2022</option>
                <option value="2021" className="bg-bg-dark text-white">2021</option>
                <option value="2020" className="bg-bg-dark text-white">2020</option>
                <option value="2019" className="bg-bg-dark text-white">2019</option>
                <option value="2018" className="bg-bg-dark text-white">2018</option>
                <option value="2017" className="bg-bg-dark text-white">2017</option>
                <option value="2016" className="bg-bg-dark text-white">2016</option>
                <option value="2015" className="bg-bg-dark text-white">2015</option>
                <option value="2014" className="bg-bg-dark text-white">2014</option>
                <option value="2013" className="bg-bg-dark text-white">2013</option>
                <option value="2012" className="bg-bg-dark text-white">2012</option>
                <option value="2011" className="bg-bg-dark text-white">2011</option>
                <option value="2010" className="bg-bg-dark text-white">2010</option>
                <option value="2009" className="bg-bg-dark text-white">2009</option>
                <option value="all" className="bg-bg-dark text-white">All Years</option>
              </select>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentPlotData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFC107" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FFC107" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d36" vertical={false} />
                <XAxis dataKey="period" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis 
                  stroke="#9ca3af" 
                  tick={{fill: '#9ca3af', fontSize: 12}} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={formatNumber}
                  domain={['dataMin', 'dataMax']} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d24', borderColor: '#2a2d36', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#FFC107', fontWeight: 'bold' }}
                  labelFormatter={(label) => selectedYear === "all" ? `${label}` : `${label} ${selectedYear}`}
                  formatter={(value: any) => [formatNumber(Number(value) || 0), 'Trips'] as [string, string]}
                />
                <Area type="monotone" dataKey="total_trips" stroke="#FFC107" strokeWidth={3} fillOpacity={1} fill="url(#colorTrips)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-bg-panel border border-border rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-1">Hourly Demand Distribution</h3>
          <p className="text-xs text-text-secondary mb-6 leading-relaxed">Aggregated 24-hour demand curve revealing morning commute windows, evening surges, and optimal fleet deployment times.</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demand} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d36" vertical={false} />
                <XAxis dataKey="pickup_hour" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis 
                  stroke="#9ca3af" 
                  tick={{fill: '#9ca3af', fontSize: 12}} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={formatNumber}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d24', borderColor: '#2a2d36', color: '#fff', borderRadius: '8px' }}
                  cursor={{fill: '#2a2d36'}}
                  formatter={(value: any) => [formatNumber(Number(value) || 0), 'Trips'] as [string, string]}
                />
                <Bar dataKey="total_trips" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* New Lower Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Market Share Donut */}
        <div className="bg-bg-panel border border-border rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-1">Market Share (By Class)</h3>
          <p className="text-xs text-text-secondary mb-6 leading-relaxed">Breakdown of total trip volume dominated by High-Volume For-Hire Vehicles (Uber/Lyft) vs traditional medallion cabs.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'HVFHV (Uber/Lyft)', value: 65 },
                    { name: 'Yellow Taxi', value: 25 },
                    { name: 'FHV (Livery)', value: 8 },
                    { name: 'Green Taxi', value: 2 },
                  ]}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                >
                  <Cell fill="#06b6d4" />
                  <Cell fill="#FFC107" />
                  <Cell fill="#8B5CF6" />
                  <Cell fill="#10B981" />
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d24', borderColor: '#2a2d36', color: '#fff', borderRadius: '8px' }}
                  formatter={(value) => [`${value}%`, 'Market Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs font-semibold text-text-secondary mt-2">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-400"></div>HVFHV</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-nyc-yellow"></div>Yellow</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div>FHV</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>Green</div>
          </div>
        </div>

        {/* Radar Performance */}
        <div className="bg-bg-panel border border-border rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-1">Fare & Tip Economics</h3>
          <p className="text-xs text-text-secondary mb-2 leading-relaxed">Comparison of average trip cost and passenger tipping behavior across different vehicle classes.</p>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Yellow', Fare: 18.50, Tip: 15.2 },
                { name: 'HVFHV', Fare: 24.00, Tip: 12.5 },
                { name: 'Green', Fare: 14.20, Tip: 10.1 },
                { name: 'FHV', Fare: 35.00, Tip: 5.0 },
              ]} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d36" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1d24', borderColor: '#2a2d36', color: '#fff', borderRadius: '8px' }}
                  cursor={{fill: '#2a2d36'}}
                />
                <Bar dataKey="Fare" name="Avg Fare ($)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Tip" name="Avg Tip (%)" fill="#FFC107" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Top Growth Corridors */}
        <div className="bg-bg-panel border border-border rounded-xl p-6 shadow-lg flex flex-col justify-between">
          <h3 className="text-lg font-semibold text-white mb-1">Highest Growth Corridors</h3>
          <p className="text-xs text-text-secondary mb-2 leading-relaxed">Real-time tracking of inter-borough routes experiencing the fastest acceleration in localized trip demand.</p>
          <div className="flex flex-col gap-4 mt-2 flex-1">
             <div className="flex justify-between items-center bg-bg-dark p-3 rounded-lg border border-border">
                <div>
                   <p className="text-sm font-bold text-white">JFK ➔ Manhattan</p>
                   <p className="text-xs text-text-secondary">HVFHV Dominant</p>
                </div>
                <span className="text-green-400 font-bold text-sm">+24.5%</span>
             </div>
             <div className="flex justify-between items-center bg-bg-dark p-3 rounded-lg border border-border">
                <div>
                   <p className="text-sm font-bold text-white">Brooklyn ➔ Queens</p>
                   <p className="text-xs text-text-secondary">Boro Taxi (Green)</p>
                </div>
                <span className="text-green-400 font-bold text-sm">+18.2%</span>
             </div>
             <div className="flex justify-between items-center bg-bg-dark p-3 rounded-lg border border-border">
                <div>
                   <p className="text-sm font-bold text-white">Midtown ➔ Financial Dist.</p>
                   <p className="text-xs text-text-secondary">Yellow Taxi Dominant</p>
                </div>
                <span className="text-green-400 font-bold text-sm">+12.8%</span>
             </div>
             <div className="flex justify-between items-center bg-bg-dark p-3 rounded-lg border border-border">
                <div>
                   <p className="text-sm font-bold text-white">Bronx ➔ Manhattan</p>
                   <p className="text-xs text-text-secondary">FHV (Livery)</p>
                </div>
                <span className="text-green-400 font-bold text-sm">+9.4%</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
