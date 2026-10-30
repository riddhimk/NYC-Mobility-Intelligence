import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, ShieldAlert, Target, Scale, Clock, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function Anomalies() {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/anomalies`)
      .then(res => setAnomalies(res.data.anomalies))
      .catch(console.error);
  }, []);

  const handleResolve = (id: string) => {
    setResolvedIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const activeCount = anomalies.filter(a => !resolvedIds.has(a.id)).length;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Explainable AI: Anomaly Detection</h2>
        <p className="text-text-secondary max-w-3xl">
          Suspicious trips automatically flagged by our Machine Learning models and Spark Data Quality rules. 
          Each alert provides explainable context on why the algorithm flagged the trip.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-2">
        <div className={`border px-6 py-3 rounded-xl flex items-center gap-4 transition-all duration-500 ${
          activeCount > 0 
            ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
            : 'bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
        }`}>
          {activeCount > 0 ? (
            <ShieldAlert className="text-red-500" size={28} />
          ) : (
            <CheckCircle className="text-green-500" size={28} />
          )}
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${activeCount > 0 ? 'text-red-300' : 'text-green-300'}`}>
              {activeCount > 0 ? 'Critical Interventions' : 'All Clear'}
            </p>
            <p className="text-2xl font-bold text-white">{activeCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 overflow-y-auto custom-scrollbar pb-10">
        {anomalies.map((a, idx) => {
          const isResolved = resolvedIds.has(a.id);
          
          return (
            <div key={idx} className={`bg-bg-panel border rounded-xl p-6 flex flex-col transition-all duration-500 ${
              isResolved 
                ? 'border-border/50 opacity-50 grayscale scale-[0.98]' 
                : 'border-border hover:border-red-500/30'
            }`}>
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={18} className={isResolved ? "text-gray-500" : "text-red-400"} />
                    <h3 className={`text-lg font-bold ${isResolved ? "text-gray-400 line-through" : "text-white"}`}>
                      {a.type}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-secondary font-mono">
                    <span className="bg-bg-dark px-2 py-1 rounded">ID: {a.id}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {a.time}</span>
                    <span className="flex items-center gap-1"><MapPin size={12}/> {a.zone}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase text-text-secondary font-semibold mb-1">AI Confidence</span>
                  <span className={`px-2 py-1 rounded font-mono text-sm font-bold ${
                    isResolved 
                      ? 'bg-gray-800 text-gray-500' 
                      : a.score > 90 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {a.score}%
                  </span>
                </div>
              </div>

              {/* Explainable AI Body */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-bg-dark rounded-lg p-3 border border-border">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary uppercase mb-2">
                    <Scale size={14} /> Actual Observation
                  </div>
                  <div className={`text-sm font-mono ${isResolved ? 'text-gray-500' : 'text-white'}`}>
                    {a.details}
                  </div>
                </div>
                <div className="bg-bg-dark rounded-lg p-3 border border-border">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary uppercase mb-2">
                    <Target size={14} /> Model Expectation
                  </div>
                  <div className={`text-sm font-mono ${isResolved ? 'text-gray-500' : 'text-nyc-yellow'}`}>
                    {a.expected}
                  </div>
                </div>
              </div>

              {/* Footer / Action */}
              <div className="mt-auto flex justify-end items-center pt-4 border-t border-border">
                {isResolved ? (
                  <div className="flex items-center gap-2 text-sm text-green-500 font-bold bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                    <CheckCircle size={16} /> Resolved
                  </div>
                ) : (
                  <button 
                    onClick={() => handleResolve(a.id)}
                    className="flex items-center gap-2 text-sm text-red-400 font-bold bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/20 transition-colors cursor-pointer"
                  >
                    <AlertCircle size={16} /> {a.action}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
