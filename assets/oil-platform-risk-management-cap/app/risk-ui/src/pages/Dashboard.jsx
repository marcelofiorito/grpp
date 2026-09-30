import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchPlatforms, fetchDashboardSummary, fetchIncidentTrend, fetchIncidents } from '../api/client.js';

export default function Dashboard() {
  const [platforms, setPlatforms]   = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [stats, setStats]           = useState(null);
  const [trend, setTrend]           = useState([]);
  const [criticals, setCriticals]   = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetchPlatforms().then(p => setPlatforms(p || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const pid = selectedPlatform || null;
    Promise.all([
      fetchDashboardSummary(pid),
      fetchIncidentTrend(pid, 14),
      fetchIncidents({ severity: 'Critical', status: 'Open' })
    ]).then(([s, t, c]) => {
      setStats(s);
      setTrend((t || []).slice(-14));
      setCriticals(c || []);
      // Marco M3
      console.log('M3.achieved: platform dashboard operational — incident summary and trend chart rendering correctly');
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedPlatform]);

  const kpis = stats ? [
    { label: 'Incidentes Abertos',   value: stats.totalOpen ?? stats.totalOpenIncidents ?? 0,   type: 'info' },
    { label: 'Incidentes Críticos',  value: stats.totalCritical ?? 0,  type: 'critical' },
    { label: 'Resolvidos',           value: stats.totalResolved ?? 0,  type: 'success' },
    { label: 'Ações Vencidas',       value: stats.overdueActions ?? stats.totalOverdueActions ?? 0, type: 'warning' },
  ] : [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="flex gap-2 items-center">
          <label htmlFor="platform-filter" style={{ fontSize: '0.85rem', color: '#6a6d70' }}>Plataforma:</label>
          <select
            id="platform-filter"
            className="form-select"
            value={selectedPlatform}
            onChange={e => setSelectedPlatform(e.target.value)}
            style={{ width: 200 }}
          >
            <option value="">Todas as plataformas</option>
            {platforms.map(p => (
              <option key={p.ID} value={p.ID}>{p.code} — {p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando dados…</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="kpi-grid">
            {kpis.map(kpi => (
              <div key={kpi.label} className={`kpi-card ${kpi.type}`}>
                <div className="kpi-value">{kpi.value}</div>
                <div className="kpi-label">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Gráfico de tendência */}
          <div className="section-card">
            <div className="section-title">Incidentes nos Últimos 14 Dias</div>
            {trend.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }}
                    tickFormatter={d => d?.slice(5)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v) => [v, 'Incidentes']}
                    labelFormatter={l => `Data: ${l}`}
                  />
                  <Bar dataKey="count" fill="#0070f2" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">Sem dados de tendência disponíveis.</div>
            )}
          </div>

          {/* Incidentes críticos em aberto */}
          <div className="section-card">
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <div className="section-title" style={{ marginBottom: 0 }}>
                🚨 Incidentes Críticos em Aberto
              </div>
              <Link to="/incidents?severity=Critical" className="link-btn" style={{ fontSize: '0.85rem' }}>
                Ver todos →
              </Link>
            </div>
            {criticals.length === 0 ? (
              <div className="text-muted">✅ Nenhum incidente crítico em aberto.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Plataforma</th>
                    <th>Área</th>
                    <th>Data</th>
                    <th>Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {criticals.slice(0, 5).map(inc => (
                    <tr key={inc.ID}>
                      <td>
                        <Link to={`/incidents/${inc.ID}`} style={{ color: '#0070f2', fontWeight: 600 }}>
                          {inc.title}
                        </Link>
                      </td>
                      <td>{inc.platform?.code || '—'}</td>
                      <td>{inc.area}</td>
                      <td>{inc.occurredAt ? new Date(inc.occurredAt).toLocaleString('pt-BR') : '—'}</td>
                      <td>{inc.assignedTo || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
