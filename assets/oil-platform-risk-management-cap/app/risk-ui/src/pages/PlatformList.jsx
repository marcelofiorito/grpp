import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPlatforms, fetchIncidents } from '../api/client.js';

const STATUS_LABELS = { Active: 'Ativa', Inactive: 'Inativa', Maintenance: 'Manutenção' };

export default function PlatformList() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState([]);
  const [stats, setStats]         = useState({});
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPlatforms().then(async (list) => {
      setPlatforms(list || []);
      // Buscar contagem de incidentes abertos por plataforma
      const counts = {};
      for (const p of (list || [])) {
        const incs = await fetchIncidents({ platformId: p.ID, status: 'Open' }).catch(() => []);
        counts[p.ID] = incs.length;
      }
      setStats(counts);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Carregando plataformas…</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Plataformas</h1>
      </div>

      {platforms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛢️</div>
          <div>Nenhuma plataforma cadastrada.</div>
        </div>
      ) : (
        <div className="section-card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Localização</th>
                <th>Status</th>
                <th>Incidentes Abertos</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map(p => (
                <tr key={p.ID}>
                  <td><strong>{p.code}</strong></td>
                  <td>{p.name}</td>
                  <td style={{ fontSize: '0.85rem', color: '#6a6d70' }}>{p.location || '—'}</td>
                  <td>
                    <span className={`status-badge ${
                      p.status === 'Active'      ? 'status-Resolved' :
                      p.status === 'Maintenance' ? 'status-InProgress' :
                      'status-Closed'
                    }`}>
                      {STATUS_LABELS[p.status] || p.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: stats[p.ID] > 0 ? '#bb0000' : '#107e3e' }}>
                      {stats[p.ID] ?? '—'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="link-btn"
                      onClick={() => navigate(`/incidents?platformId=${p.ID}`)}
                    >
                      Ver incidentes →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
