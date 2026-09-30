import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCriticalAlerts } from '../api/client.js';

export default function CriticalAlert() {
  const [criticals, setCriticals] = useState([]);

  const load = async () => {
    try {
      const data = await fetchCriticalAlerts();
      setCriticals(data || []);
    } catch {}
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000); // Atualizar a cada 60s
    return () => clearInterval(interval);
  }, []);

  if (!criticals.length) return null;

  return (
    <div className="alert-banner critical">
      <span style={{ fontSize: '1.2rem' }}>🚨</span>
      <strong>{criticals.length} incidente(s) crítico(s) em aberto</strong>
      {criticals.slice(0, 2).map(i => (
        <Link key={i.ID} to={`/incidents/${i.ID}`} style={{ color: '#7d0000', marginLeft: 8 }}>
          {i.title}
        </Link>
      ))}
      {criticals.length > 2 && (
        <Link to="/incidents?severity=Critical" style={{ color: '#7d0000', marginLeft: 8 }}>
          +{criticals.length - 2} mais
        </Link>
      )}
    </div>
  );
}
