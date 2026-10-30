import { NavLink, Outlet } from 'react-router-dom';
import { DollarSign, LayoutDashboard, Table, TrendingUp, AlertTriangle, Network, Activity } from 'lucide-react';

export default function Layout() {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Overview' },
    { to: '/explorer', icon: Table, label: 'Data Explorer' },
    { to: '/forecasting', icon: TrendingUp, label: 'Demand Forecasting' },
    { to: '/fare', icon: DollarSign, label: 'Fare Predictor' },
    { to: '/anomalies', icon: AlertTriangle, label: 'Anomalies' },
    { to: '/network', icon: Network, label: 'Mobility Network' },
    { to: '/realtime', icon: Activity, label: 'Real-Time Simulation' },
  ];

  return (
    <div className="flex h-screen bg-bg-dark text-text-primary overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-panel border-r border-border flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-nyc-yellow flex items-center justify-center font-bold text-bg-dark">
              NY
            </div>
            <h1 className="font-bold text-lg leading-tight tracking-wide uppercase text-white">
              Mobility<br /><span className="text-nyc-yellow">Intelligence</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-nyc-yellow text-bg-dark font-semibold'
                    : 'text-text-secondary hover:bg-border hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-bg-panel border-b border-border flex items-center justify-between px-8">
          <div className="text-sm font-medium text-text-secondary">
            NYC Taxi & Limousine Commission (TLC) Trip Record Analytics
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan"></span>
              </span>
              <span className="text-sm font-medium text-accent-cyan">System Online</span>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
