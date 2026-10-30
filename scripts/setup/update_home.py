import re

with open("frontend/src/pages/Home.tsx", "r") as f:
    content = f.read()

# Add new imports
new_imports = "import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';"
content = re.sub(r"import \{ AreaChart.*\} from 'recharts';", new_imports, content)

# Add new charts inside the return block
new_charts = """
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Market Share Donut */}
        <div className="bg-bg-panel border border-border rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Market Share (By Class)</h3>
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
          <h3 className="text-lg font-semibold text-white mb-2">Class Performance Analysis</h3>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                { metric: 'Avg Fare', Yellow: 85, HVFHV: 65, Green: 45 },
                { metric: 'Trip Dist.', Yellow: 60, HVFHV: 90, Green: 50 },
                { metric: 'Tip %', Yellow: 95, HVFHV: 70, Green: 60 },
                { metric: 'Speed', Yellow: 65, HVFHV: 85, Green: 70 },
                { metric: 'Wait Time', Yellow: 80, HVFHV: 95, Green: 40 },
              ]}>
                <PolarGrid stroke="#2a2d36" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Radar name="Yellow Taxi" dataKey="Yellow" stroke="#FFC107" fill="#FFC107" fillOpacity={0.4} />
                <Radar name="HVFHV" dataKey="HVFHV" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1d24', borderColor: '#2a2d36', color: '#fff', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Top Growth Corridors */}
        <div className="bg-bg-panel border border-border rounded-xl p-6 shadow-lg flex flex-col justify-between">
          <h3 className="text-lg font-semibold text-white mb-2">Highest Growth Corridors</h3>
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
"""

content = re.sub(r'    </div>\n  \);\n}', new_charts, content)

with open("frontend/src/pages/Home.tsx", "w") as f:
    f.write(content)
