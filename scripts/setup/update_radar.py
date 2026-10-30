import re

with open("frontend/src/pages/Home.tsx", "r") as f:
    content = f.read()

old_radar_block = r'<h3 className="text-lg font-semibold text-white mb-1">Class Performance Analysis</h3>.*?</RadarChart>\n            </ResponsiveContainer>\n          </div>\n        </div>'

new_bar_block = """<h3 className="text-lg font-semibold text-white mb-1">Fare & Tip Economics</h3>
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
        </div>"""

content = re.sub(old_radar_block, new_bar_block, content, flags=re.DOTALL)

with open("frontend/src/pages/Home.tsx", "w") as f:
    f.write(content)
