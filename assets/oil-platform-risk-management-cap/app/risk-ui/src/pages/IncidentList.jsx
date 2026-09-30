import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchIncidents, fetchPlatforms } from '../api/client.js';

const SEVERITY_LABELS = { Critical: 'Crítica', High: 'Alta', Medium: 'Média', Low: 'Baixa' };
const STATUS_LABELS = { Open: 'Aberto', InProgress: 'Em Andamento', Resolved: 'Resolvido', Closed: 'Fechado' };
const TYPE_LABELS = { Operational: 'Operacional', Safety: 'Segurança', Environmental: 'Ambiental', Equipment: 'Equipamento', Process: 'Processo' };

export default function IncidentList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [incidents, setIncidents] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({
    platformId: '',
    severity: searchParams.get('severity') || '',
    status: '',
    type: '',
    search: ''
  });

  useEffect(() => {
    fetchPlatforms().then(p => setPlatforms(p || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchIncidents(filters)
      .then(data => setIncidents(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Incidentes</h1>
        <button className="btn btn-primary" onClick={() => navigate('/incidents/new')}>
          + Novo Incidente
        </button>
      </div>

      {/* Filtros */}
      <div className="section-card" style={{ padding: '1rem' }}>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <input
            className="form-input"
            placeholder="🔍 Buscar por título…"
            value={filters.search}
            onChange={e => handleFilter('search', e.target.value)}
            style={{ minWidth: 200 }}
          />
          <select className="form-select" value={filters.platformId} onChange={e => handleFilter('platformId', e.target.value)} style={{ minWidth: 160 }}>
            <option value="">Todas as plataformas</option>
            {platforms.map(p => <option key={p.ID} value={p.ID}>{p.code}</option>)}
          </select>
          <select className="form-select" value={filters.severity} onChange={e => handleFilter('severity', e.target.value)}>
            <option value="">Qualquer severidade</option>
            {Object.entries(SEVERITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select className="form-select" value={filters.status} onChange={e => handleFilter('status', e.target.value)}>
            <option value="">Qualquer status</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select className="form-select" value={filters.type} onChange={e => handleFilter('type', e.target.value)}>
            <option value="">Qualquer tipo</option>
            {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {Object.values(filters).some(Boolean) && (
            <button className="btn btn-secondary" onClick={() => setFilters({ platformId: '', severity: '', status: '', type: '', search: '' })}>
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando incidentes…</div>
      ) : incidents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div>Nenhum incidente encontrado com os filtros selecionados.</div>
        </div>
      ) : (
        <div className="section-card" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Plataforma</th>
                <th>Área</th>
                <th>Severidade</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Data Ocorrência</th>
                <th>Responsável</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(inc => (
                <tr key={inc.ID}>
                  <td>
                    <Link to={`/incidents/${inc.ID}`} style={{ color: '#0070f2', fontWeight: 600 }}>
                      {inc.title}
                    </Link>
                  </td>
                  <td>{inc.platform?.code || '—'}</td>
                  <td>{inc.area}</td>
                  <td>
                    <span className={`severity-badge severity-${inc.severity}`}>
                      {SEVERITY_LABELS[inc.severity] || inc.severity}
                    </span>
                  </td>
                  <td>{TYPE_LABELS[inc.type] || inc.type}</td>
                  <td>
                    <span className={`status-badge status-${inc.status}`}>
                      {STATUS_LABELS[inc.status] || inc.status}
                    </span>
                  </td>
                  <td>{inc.occurredAt ? new Date(inc.occurredAt).toLocaleString('pt-BR') : '—'}</td>
                  <td>{inc.assignedTo || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
