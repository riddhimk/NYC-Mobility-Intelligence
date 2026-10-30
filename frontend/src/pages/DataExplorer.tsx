import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Filter, Download, ChevronDown } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function DataExplorer() {
  const [zones, setZones] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterBorough, setFilterBorough] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/zones`)
      .then(res => setZones(res.data.zones))
      .catch(console.error);
  }, []);

  // Compute unique boroughs for the filter dropdown
  const uniqueBoroughs = ["All", ...Array.from(new Set(zones.map(z => z.borough)))];

  // Apply Search and Filter logic
  const filteredZones = zones.filter(z => {
    const matchesSearch = z.zone.toLowerCase().includes(search.toLowerCase());
    const matchesBorough = filterBorough === "All" || z.borough === filterBorough;
    return matchesSearch && matchesBorough;
  });

  // Export CSV function
  const exportCSV = () => {
    if (filteredZones.length === 0) return;
    
    const headers = ["Rank,Taxi Zone,Borough,Total Trips"];
    const rows = filteredZones.map((z, idx) => 
      `${idx + 1},"${z.zone}","${z.borough}",${z.trips}`
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "nyc_mobility_zones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Data Explorer</h2>
          <p className="text-text-secondary">Explore, filter, and export aggregated historical trip records across all NYC taxi zones.</p>
        </div>
        <div className="text-xs font-mono text-text-secondary bg-bg-panel border border-border px-3 py-1.5 rounded-lg">
          Displaying <span className="text-nyc-yellow font-bold">{filteredZones.length}</span> of <span className="text-white font-bold">{zones.length}</span> Zones
        </div>
      </div>

      <div className="flex gap-4 relative z-30 flex-wrap">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by zone name..." 
            className="w-full bg-bg-panel border border-border rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-white transition-colors cursor-pointer ${
              filterBorough !== "All" 
                ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400" 
                : "bg-bg-panel border-border hover:bg-border"
            }`}
          >
            <Filter size={20} /> 
            {filterBorough === "All" ? "Filter" : filterBorough}
            <ChevronDown size={16} />
          </button>
          
          {showFilterMenu && (
            <>
              {/* Backdrop to close menu when clicking outside */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowFilterMenu(false)} 
              />
              
              <div className="absolute right-0 mt-2 w-48 bg-bg-panel border border-border rounded-lg shadow-2xl z-50 overflow-hidden py-1">
                {uniqueBoroughs.map(b => (
                  <button
                    key={b}
                    onClick={() => {
                      setFilterBorough(b);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-bg-dark transition-colors cursor-pointer flex items-center justify-between ${
                      filterBorough === b ? 'text-cyan-400 font-bold bg-bg-dark' : 'text-white'
                    }`}
                  >
                    <span>{b === "All" ? "All Boroughs" : b}</span>
                    {filterBorough === b && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Export CSV Button */}
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 bg-nyc-yellow text-bg-dark font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
        >
          <Download size={20} /> Export CSV
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-bg-panel border border-border rounded-xl shadow-lg flex flex-col overflow-hidden">
        {/* Scrollable Viewport with sticky header */}
        <div className="overflow-x-auto overflow-y-auto max-h-[68vh] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-bg-dark border-b border-border text-text-secondary text-sm uppercase tracking-wider sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 font-semibold bg-bg-dark">Rank</th>
                <th className="px-6 py-4 font-semibold bg-bg-dark">Taxi Zone</th>
                <th className="px-6 py-4 font-semibold bg-bg-dark">Borough</th>
                <th className="px-6 py-4 font-semibold text-right bg-bg-dark">Total Trips</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-white">
              {filteredZones.length > 0 ? (
                filteredZones.map((zone, idx) => (
                  <tr key={idx} className="hover:bg-bg-dark/80 transition-colors">
                    <td className="px-6 py-4 text-text-secondary font-mono text-sm">#{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-white">{zone.zone}</td>
                    <td className="px-6 py-4">
                      <span className="bg-bg-dark border border-border px-2.5 py-1 rounded text-xs text-gray-300 font-medium">
                        {zone.borough}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-nyc-yellow font-bold">
                      {zone.trips.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-text-secondary">
                    No zones found matching your search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-bg-dark/60 border-t border-border flex justify-between items-center text-xs text-text-secondary">
          <span>Official NYC TLC Taxi Zone Records</span>
          <span>Showing {filteredZones.length} entries</span>
        </div>
      </div>
    </div>
  );
}
