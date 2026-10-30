import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimulationProvider } from './context/SimulationContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import DataExplorer from './pages/DataExplorer';
import Forecasting from './pages/Forecasting';
import FarePredictor from './pages/FarePredictor';
import Anomalies from './pages/Anomalies';
import Network from './pages/Network';
import RealTime from './pages/RealTime';

function App() {
  return (
    <SimulationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="explorer" element={<DataExplorer />} />
            <Route path="forecasting" element={<Forecasting />} />
            <Route path="fare" element={<FarePredictor />} />
            <Route path="anomalies" element={<Anomalies />} />
            <Route path="network" element={<Network />} />
            <Route path="realtime" element={<RealTime />} />
            <Route path="simulation" element={<RealTime />} />
            <Route path="simulate" element={<RealTime />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SimulationProvider>
  );
}

export default App;
