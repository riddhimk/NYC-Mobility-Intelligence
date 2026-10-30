import React, { createContext, useContext, useState, useEffect } from 'react';

interface SimulationContextType {
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  toggleSimulation: () => void;
}

const SimulationContext = createContext<SimulationContextType>({
  isSimulating: false,
  setIsSimulating: () => {},
  toggleSimulation: () => {},
});

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSimulating, setIsSimulating] = useState<boolean>(() => {
    return localStorage.getItem('nyc_taxi_simulation_active') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('nyc_taxi_simulation_active', String(isSimulating));
  }, [isSimulating]);

  const toggleSimulation = () => {
    setIsSimulating((prev) => !prev);
  };

  return (
    <SimulationContext.Provider value={{ isSimulating, setIsSimulating, toggleSimulation }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => useContext(SimulationContext);

