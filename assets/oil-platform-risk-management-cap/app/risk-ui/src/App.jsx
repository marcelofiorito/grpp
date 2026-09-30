import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import IncidentList from './pages/IncidentList.jsx';
import IncidentForm from './pages/IncidentForm.jsx';
import IncidentDetail from './pages/IncidentDetail.jsx';
import PlatformList from './pages/PlatformList.jsx';
import CriticalAlert from './components/CriticalAlert.jsx';

export default function App() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/incidents', label: 'Incidentes', icon: '⚠️' },
    { path: '/platforms', label: 'Plataformas', icon: '🛢️' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <header className="app-header">
        <div className="app-header-logo">⛽ RiskOil</div>
        <div className="app-header-subtitle">Gerenciamento de Riscos — Plataformas de Petróleo</div>
      </header>

      <div className="app-layout">
        {/* Sidebar */}
        <aside className="app-sidebar">
          <div className="nav-section">Menu</div>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </aside>

        {/* Conteúdo principal */}
        <main className="app-main">
          <CriticalAlert />
          <Routes>
            <Route path="/"               element={<Dashboard />} />
            <Route path="/incidents"      element={<IncidentList />} />
            <Route path="/incidents/new"  element={<IncidentForm />} />
            <Route path="/incidents/:id"  element={<IncidentDetail />} />
            <Route path="/incidents/:id/edit" element={<IncidentForm />} />
            <Route path="/platforms"      element={<PlatformList />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
