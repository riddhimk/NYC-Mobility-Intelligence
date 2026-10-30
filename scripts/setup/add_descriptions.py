import re

with open("frontend/src/pages/Home.tsx", "r") as f:
    content = f.read()

replacements = [
    (r'<h3 className="text-lg font-semibold text-white mb-6">Historical Trip Volume</h3>',
     '<h3 className="text-lg font-semibold text-white mb-1">Historical Trip Volume</h3>\n          <p className="text-xs text-text-secondary mb-6 leading-relaxed">Visualizes the macro trend of NYC taxi ridership, highlighting seasonal peaks, market recovery phases, and overall network utilization.</p>'),
     
    (r'<h3 className="text-lg font-semibold text-white mb-6">Hourly Demand Distribution</h3>',
     '<h3 className="text-lg font-semibold text-white mb-1">Hourly Demand Distribution</h3>\n          <p className="text-xs text-text-secondary mb-6 leading-relaxed">Aggregated 24-hour demand curve revealing morning commute windows, evening surges, and optimal fleet deployment times.</p>'),
     
    (r'<h3 className="text-lg font-semibold text-white mb-6">Market Share \(By Class\)</h3>',
     '<h3 className="text-lg font-semibold text-white mb-1">Market Share (By Class)</h3>\n          <p className="text-xs text-text-secondary mb-6 leading-relaxed">Breakdown of total trip volume dominated by High-Volume For-Hire Vehicles (Uber/Lyft) vs traditional medallion cabs.</p>'),
     
    (r'<h3 className="text-lg font-semibold text-white mb-2">Class Performance Analysis</h3>',
     '<h3 className="text-lg font-semibold text-white mb-1">Class Performance Analysis</h3>\n          <p className="text-xs text-text-secondary mb-2 leading-relaxed">Multivariate comparison evaluating operational efficiency, tip %, and passenger wait times across competing vehicle classes.</p>'),
     
    (r'<h3 className="text-lg font-semibold text-white mb-2">Highest Growth Corridors</h3>',
     '<h3 className="text-lg font-semibold text-white mb-1">Highest Growth Corridors</h3>\n          <p className="text-xs text-text-secondary mb-2 leading-relaxed">Real-time tracking of inter-borough routes experiencing the fastest acceleration in localized trip demand.</p>')
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open("frontend/src/pages/Home.tsx", "w") as f:
    f.write(content)
