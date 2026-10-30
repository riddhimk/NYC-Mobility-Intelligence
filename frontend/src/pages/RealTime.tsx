import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Activity, Radio, MapPin, Clock } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useSimulation } from '../context/SimulationContext';
import TaxiLightButton from '../components/TaxiLightButton';
import { API_BASE_URL, WS_BASE_URL } from '../config/api';

interface TaxiEvent {
  event_type: string;
  pickup: string;
  dropoff: string;
  fare: number;
  distance?: string;
  timestamp: string;
}

export default function RealTime() {
  const { isSimulating } = useSimulation();
  const [events, setEvents] = useState<TaxiEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [totalFare, setTotalFare] = useState(0);
  const [nodes, setNodes] = useState<any[]>([]);
  const maxEvents = 10;
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch nodes on mount
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/network`)
      .then(res => setNodes(res.data.nodes))
      .catch(console.error);
  }, []);

  // Control simulation WebSocket based on isSimulating state
  useEffect(() => {
    if (!isSimulating) {
      setIsConnected(false);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    let reconnectTimeout: any;
    let isMounted = true;
    
    function connect() {
      if (!isMounted) return;
      const ws = new WebSocket(WS_BASE_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isMounted) setIsConnected(true);
      };
      
      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data: TaxiEvent = JSON.parse(event.data);
          setEvents((prev) => [data, ...prev].slice(0, maxEvents));
          setTotalFare((prev) => prev + data.fare);
        } catch (e) {
          console.error("Error parsing WS event", e);
        }
      };

      ws.onclose = () => {
        if (!isMounted) return;
        setIsConnected(false);
        // Auto-reconnect every 3 seconds only if simulation is still active
        if (isMounted) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isSimulating]);

  const center: [number, number] = [40.7306, -73.9352];

  const getCoords = (zoneName: string) => {
    const node = nodes.find(n => n.id === zoneName);
    return node ? [node.lat, node.lng] as [number, number] : null;
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Real-Time Simulation</h2>
          <p className="text-text-secondary">Simulated live feed of taxi trips entering the Spark Structured Streaming pipeline.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <TaxiLightButton />

          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
            isSimulating && isConnected 
              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
              : isSimulating
              ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
              : 'bg-neutral-800/80 border-neutral-700 text-neutral-400'
          }`}>
            <Radio size={18} className={isSimulating && isConnected ? "animate-pulse" : ""} />
            <span className="text-sm font-semibold tracking-wide">
              {isSimulating ? (isConnected ? 'LIVE FEED ACTIVE' : 'CONNECTING...') : 'SIMULATION STANDBY'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Live Stats & Map */}
        <div className="lg:col-span-2 flex flex-col gap-6 min-h-0">
          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="bg-bg-panel border border-border rounded-xl p-6">
              <p className="text-text-secondary text-sm font-medium mb-2">Events Processed (Session)</p>
              <h3 className="text-4xl font-bold text-white flex items-center gap-3">
                {events.length > 0 ? events.length + Math.floor(totalFare / 10) : 0}
                <Activity size={24} className="text-accent-cyan animate-pulse" />
              </h3>
            </div>
            <div className="bg-bg-panel border border-border rounded-xl p-6">
              <p className="text-text-secondary text-sm font-medium mb-2">Live Revenue (Session)</p>
              <h3 className="text-4xl font-bold text-nyc-yellow flex items-center gap-3">
                ${totalFare.toFixed(2)}
              </h3>
            </div>
          </div>
          
          <div className="bg-bg-panel border border-border rounded-xl flex-1 overflow-hidden relative shadow-lg">
            {nodes.length > 0 ? (
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
                
                {/* Draw Live Trips */}
                {events.map((evt, idx) => {
                  const pickupCoords = getCoords(evt.pickup);
                  const dropoffCoords = getCoords(evt.dropoff);
                  
                  // Make recent events more opaque
                  const opacity = 1 - (idx / maxEvents);
                  
                  return (
                    <React.Fragment key={`${evt.timestamp}-${idx}`}>
                      {pickupCoords && dropoffCoords && (
                        <Polyline 
                          positions={[pickupCoords, dropoffCoords]}
                          color="#06b6d4"
                          weight={2}
                          opacity={opacity * 0.8}
                          dashArray="5, 10"
                          className="animate-pulse"
                        />
                      )}
                      {pickupCoords && (
                        <CircleMarker
                          center={pickupCoords}
                          radius={6}
                          pathOptions={{ fillColor: '#22c55e', fillOpacity: opacity, color: '#1a1d24', weight: 1, opacity }}
                        >
                          <Popup>Pickup: {evt.pickup}</Popup>
                        </CircleMarker>
                      )}
                      {dropoffCoords && (
                        <CircleMarker
                          center={dropoffCoords}
                          radius={6}
                          pathOptions={{ fillColor: '#ef4444', fillOpacity: opacity, color: '#1a1d24', weight: 1, opacity }}
                        >
                          <Popup>Dropoff: {evt.dropoff}</Popup>
                        </CircleMarker>
                      )}
                    </React.Fragment>
                  );
                })}
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-text-secondary flex-col gap-4">
                <div className="w-16 h-16 bg-bg-dark rounded-full flex items-center justify-center relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-20"></span>
                  <Activity size={32} className="text-accent-cyan" />
                </div>
                <p>Loading geographical coordinates...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Event Stream Feed */}
        <div className="bg-bg-panel border border-border rounded-xl p-4 flex flex-col min-h-0">
          <h3 className="text-lg font-semibold text-white mb-4 px-2 shrink-0">Incoming Event Stream</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {events.length === 0 && (
              <div className="text-center text-text-secondary py-12 px-4 flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSimulating ? 'bg-nyc-yellow/20 text-nyc-yellow animate-pulse' : 'bg-neutral-800 text-neutral-500'}`}>
                  <Activity size={24} />
                </div>
                <p className="text-sm font-medium">
                  {isSimulating 
                    ? "Simulation active! Waiting for incoming trip events..." 
                    : "Simulation is on standby. Toggle the 'Simulate' Taxi Light above to start live streaming."}
                </p>
              </div>
            )}
            {events.map((evt, idx) => (
              <div key={idx} className="bg-bg-dark border border-border p-4 rounded-lg shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-mono font-bold bg-accent-cyan/20 text-accent-cyan px-2 py-1 rounded">
                    {evt.event_type}
                  </span>
                  <div className="flex items-center gap-1 text-text-secondary text-xs">
                    <Clock size={12} />
                    {evt.timestamp}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-white">
                    <MapPin size={14} className="text-green-500" />
                    <span className="truncate">{evt.pickup}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white">
                    <MapPin size={14} className="text-red-500" />
                    <span className="truncate">{evt.dropoff}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                    <span className="text-xs text-text-secondary font-mono flex items-center gap-1">
                      {evt.distance || "~3.2 mi"}
                    </span>
                    <span className="font-mono text-nyc-yellow font-bold">${evt.fare.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
