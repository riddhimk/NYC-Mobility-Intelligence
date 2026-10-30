import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Network as NetworkIcon, Info, Users, Activity, Navigation, DollarSign, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface NetworkNode {
  id: string;
  group: number;
  lat: number;
  lng: number;
  pickups?: string;
  dropoffs?: string;
  peak_hour?: string;
  top_dest?: string;
  avg_fare?: string;
  centrality?: number;
}

interface NetworkLink {
  source: string;
  target: string;
  value: number;
}

export default function Network() {
  const [graphData, setGraphData] = useState<{ nodes: NetworkNode[]; links: NetworkLink[] }>({ nodes: [], links: [] });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/network`)
      .then(res => setGraphData(res.data))
      .catch(console.error);
  }, []);

  const center: [number, number] = [40.7306, -73.9352];

  const getNode = (id: string): NetworkNode | undefined => graphData.nodes.find((n) => n.id === id);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full relative">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Real-World Mobility Flow</h2>
        <p className="text-text-secondary max-w-4xl leading-relaxed">
          Taxi flows projected onto a real geographic map of New York City using Leaflet. 
          The edges represent high-volume trip corridors identified by Spark GraphFrames, 
          while nodes denote major taxi zones.
        </p>
      </div>

      <div className="flex gap-4 mb-2">
        <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-panel px-3 py-1.5 rounded-lg border border-border">
          <div className="w-3 h-3 rounded-full bg-[#FFC107]"></div> Manhattan Core
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-panel px-3 py-1.5 rounded-lg border border-border">
          <div className="w-3 h-3 rounded-full bg-[#06b6d4]"></div> Airports & Transit
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-panel px-3 py-1.5 rounded-lg border border-border">
          <div className="w-3 h-3 rounded-full bg-[#aa3bff]"></div> Outer Boroughs
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-panel px-3 py-1.5 rounded-lg border border-border">
          <Info size={14} /> Tip: Click on any marker to see deep analytics for that specific zone.
        </div>
      </div>

      <div className="bg-bg-panel border border-border rounded-xl flex-1 overflow-hidden relative shadow-lg">
        {graphData.nodes.length > 0 ? (
          <MapContainer 
            center={center} 
            zoom={11} 
            style={{ height: '100%', width: '100%', background: '#1a1d24' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {/* Draw Edges */}
            {graphData.links.map((link: any, i) => {
              const src = getNode(link.source);
              const tgt = getNode(link.target);
              if (src && tgt) {
                return (
                  <Polyline 
                    key={i}
                    positions={[[src.lat, src.lng], [tgt.lat, tgt.lng]]}
                    color="rgba(156, 163, 175, 0.4)"
                    weight={Math.min(link.value / 15, 6)}
                    interactive={false}
                  />
                );
              }
              return null;
            })}

            {/* Draw Nodes */}
            {graphData.nodes.map((node: any, i) => (
              <CircleMarker
                key={i}
                center={[node.lat, node.lng]}
                radius={12}
                interactive={true}
                pathOptions={{ 
                  fillColor: node.group === 1 ? '#FFC107' : node.group === 2 ? '#06b6d4' : '#aa3bff',
                  fillOpacity: 1,
                  color: '#1a1d24',
                  weight: 2
                }}
              >
                <Popup minWidth={260}>
                  <div className="p-2 w-full">
                    <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
                      <strong className="block text-lg text-white">{node.id}</strong>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        node.group === 1 ? 'bg-[#FFC107]/20 text-[#FFC107]' : 
                        node.group === 2 ? 'bg-[#06b6d4]/20 text-[#06b6d4]' : 
                        'bg-[#aa3bff]/20 text-[#aa3bff]'
                      }`}>
                        {node.group === 1 ? 'Manhattan' : node.group === 2 ? 'Transit' : 'Outer'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-gray-300">
                      
                      <div className="flex items-start gap-2">
                        <Users size={16} className="text-gray-500 mt-0.5" />
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase font-semibold">Pickups</div>
                          <div className="font-medium text-white">{node.pickups || "N/A"}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Activity size={16} className="text-gray-500 mt-0.5" />
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase font-semibold">Peak Demand</div>
                          <div className="font-medium text-white">{node.peak_hour || "N/A"}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Navigation size={16} className="text-gray-500 mt-0.5" />
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase font-semibold">Top Dest.</div>
                          <div className="font-medium text-white">{node.top_dest || "N/A"}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <DollarSign size={16} className="text-gray-500 mt-0.5" />
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase font-semibold">Avg Fare</div>
                          <div className="font-medium text-nyc-yellow">{node.avg_fare || "N/A"}</div>
                        </div>
                      </div>

                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                       <span className="text-xs text-gray-400 flex items-center gap-1">
                         <TrendingUp size={14} className="text-cyan-400" /> PageRank Centrality
                       </span>
                       <span className="text-sm font-bold text-white">{node.centrality || "N/A"}</span>
                    </div>

                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-text-secondary">
            <NetworkIcon className="animate-spin mr-3 text-nyc-yellow" size={24} />
            Loading geographic coordinates...
          </div>
        )}
      </div>
    </div>
  );
}
