import React from 'react';
import { useSimulation } from '../context/SimulationContext';

interface TaxiLightButtonProps {
  className?: string;
  showSubtitle?: boolean;
}

export const TaxiLightButton: React.FC<TaxiLightButtonProps> = ({ 
  className = '',
  showSubtitle = false 
}) => {
  const { isSimulating, toggleSimulation } = useSimulation();

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      {/* Outer Rooftop Mount Fixture */}
      <button
        onClick={toggleSimulation}
        type="button"
        aria-pressed={isSimulating}
        title={isSimulating ? "Click to Stop Simulation" : "Click to Start Simulation"}
        className={`relative group cursor-pointer select-none transition-all duration-300 px-5 py-2 rounded-t-2xl rounded-b-lg border-2 flex items-center justify-center gap-2.5 shadow-md ${
          isSimulating
            ? 'taxi-light-on border-yellow-300 scale-[1.03]'
            : 'taxi-light-off border-neutral-700 hover:border-neutral-500'
        }`}
        style={{
          minWidth: '138px',
          height: '42px',
        }}
      >
        {/* Left Taxi Cab Fin/Bracket Detail */}
        <span 
          className={`h-4 w-1 rounded-sm transition-colors duration-300 ${
            isSimulating ? 'bg-black/40' : 'bg-neutral-600'
          }`} 
        />

        {/* Center Taxi Light Text */}
        <span 
          className={`text-sm font-extrabold uppercase tracking-widest transition-colors duration-300 ${
            isSimulating ? 'text-black' : 'text-white'
          }`}
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            letterSpacing: '0.12em',
          }}
        >
          Simulate
        </span>

        {/* Right Taxi Cab Fin/Bracket Detail */}
        <span 
          className={`h-4 w-1 rounded-sm transition-colors duration-300 ${
            isSimulating ? 'bg-black/40' : 'bg-neutral-600'
          }`} 
        />

        {/* Animated Beacon Dot */}
        <span className="relative flex h-2 w-2 ml-0.5">
          {isSimulating && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-60"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            isSimulating ? 'bg-black' : 'bg-neutral-500'
          }`}></span>
        </span>
      </button>

      {/* Roof Bracket Mount Base */}
      <div className={`h-1.5 w-24 rounded-b-md transition-colors duration-300 ${
        isSimulating ? 'bg-yellow-600/90 shadow-[0_2px_8px_rgba(255,193,7,0.5)]' : 'bg-neutral-900 border-t border-neutral-800'
      }`} />

      {showSubtitle && (
        <span className={`text-[10px] mt-1 font-semibold uppercase tracking-wider ${
          isSimulating ? 'text-nyc-yellow' : 'text-text-secondary'
        }`}>
          {isSimulating ? 'Status: Streaming' : 'Status: Standby'}
        </span>
      )}
    </div>
  );
};

export default TaxiLightButton;

