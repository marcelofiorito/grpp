import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchIncidentById, updateIncident, createCorrectiveAction, updateCorrectiveAction } from '../api/client.js';

const SEVERITY_LABELS = { Critical: 'Crítica', High: 'Alta', Medium: 'Média', Low: 'Baixa' };
const STATUS_LABELS   = { Open: 'Aberto', InProgress: 'Em Andamento', Resolved: 'Resolvido', Closed: 'Fechado' };
const TYPE_LABELS     = { Operational: 'Operacional', Safety: 'Segurança', Environmental: 'Ambiental', Equipment: 'Equipamento', Process: 'Processo' };
const ACTION_STATUS   = { Pending: 'Pendente', InProgress: 'Em Andamento', Completed: 'Concluída', Overdue: 'Vencida' };

const EMPTY_ACTION = { description: '', responsiblePerson: '', dueDate: '', notes: '' };

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showActionForm, setShowActionForm] = useState(false);
  const [actionForm, setActionForm] = useState(EMPTY_ACTION);
  const [actionErrors, setActionErrors] = useState({});
  const [savingAction, setSavingAction] = useState(false);
  const [toast, setToast]         = useState('');

  const load = () => {
    setLoading(true);
    fetchIncidentById(id)
      .then(setIncident)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateIncident(id, { status: newStatus });
      setToast(`Status atualizado para "${STATUS_LABELS[newStatus]}"`);
      load();
    } catch (err) {
      setToast('Erro ao atualizar status: ' + err.message);
    }
  };

  const handleSaveAction = async () => {
    const errs = {};
    if (!actionForm.description.trim())       errs.description = 'Descrição obrigatória.';
    if (!actionForm.responsiblePerson.trim())  errs.responsiblePerson = 'Responsável obrigatório.';
    if (!actionForm.dueDate)                   errs.dueDate = 'Prazo obrigatório.';
    setActionErrors(errs);
    if (Object.keys(errs).length) return;

    setSavingAction(true);
    try {
      await createCorrectiveAction({ ...actionForm, incident_ID: id });
      setShowActionForm(false);
      setActionForm(EMPTY_ACTION);
      setToast('Ação corretiva adicionada!');
      load();
    } catch (err) {
      setActionErrors({ _global: err.message });
    } finally {
      setSavingAction(false);
    }
  };

  const handleCompleteAction = async (actionId) => {
    try {
      await updateCorrectiveAction(actionId, { status: 'Completed' });
      setToast('Ação marcada como concluída!');
      load();
    } catch (err) {
      setToast('Erro: ' + err.message);
    }
  };

  if (loading) return <div className="loading">Carregando incidente…</div>;
  if (!incident) return <div className="empty-state"><div>Incidente não encontrado.</div></div>;

  return (
    <div>
      {toast && (
        <div className="alert-banner" style={{ background: '#d5f0e0', borderColor: '#107e3e', color: '#0d5d28', marginBottom: '1rem' }}>
          ✅ {toast}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex gap-2 items-center" style={{ marginBottom: '0.25rem' }}>
            <span className={`severity-badge severity-${incident.severity}`}>
              {SEVERITY_LABELS[incident.severity]}
            </span>
            <span className={`status-badge status-${incident.status}`}>
              {STATUS_LABELS[incident.status]}
            </span>
          </div>
          <h1 className="page-title">{incident.title}</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate(`/incidents/${id}/edit`)}>
            ✏️ Editar
          </button>
          {(incident.status === 'Open' || incident.status === 'InProgress') && (
            <button className="btn btn-secondary" onClick={() => handleStatusChange('Resolved')}>
              ✅ Fechar Incidente
            </button>
          )}
        </div>
      </div>

      {/* Informações gerais */}
      <div className="section-card">
        <div className="section-title">Informações Gerais</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 2rem' }}>
          <div><span className="text-muted">Plataforma</span><div>{incident.platform?.code} — {incident.platform?.name}</div></div>
          <div><span className="text-muted">Área</span><div>{incident.area}</div></div>
          <div><span className="text-muted">Tipo</span><div>{TYPE_LABELS[incident.type] || incident.type}</div></div>
          <div><span className="text-muted">Data da Ocorrência</span><div>{incident.occurredAt ? new Date(incident.occurredAt).toLocaleString('pt-BR') : '—'}</div></div>
          <div><span className="text-muted">Relatado por</span><div>{incident.reportedBy || '—'}</div></div>
          <div><span className="text-muted">Responsável</span><div>{incident.assignedTo || '—'}</div></div>
          {incident.resolvedAt && (
            <div><span className="text-muted">Resolvido em</span><div>{new Date(incident.resolvedAt).toLocaleString('pt-BR')}</div></div>
          )}
        </div>
        {incident.description && (
          <div style={{ marginTop: '1rem' }}>
            <span className="text-muted">Descrição</span>
            <div style={{ marginTop: '0.25rem', lineHeight: 1.6 }}>{incident.description}</div>
          </div>
        )}
      </div>

      {/* Ações Corretivas */}
      <div className="section-card">
        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Ações Corretivas</div>
          <button className="btn btn-primary" style={{ fontSize: '0.85rem' }} onClick={() => setShowActionForm(true)}>
            + Adicionar Ação
          </button>
        </div>

        {showActionForm && (
          <div style={{ background: '#f9f9f9', border: '1px solid #e4e4e4', borderRadius: 6, padding: '1rem', marginBottom: '1rem' }}>
            <div className="section-title" style={{ fontSize: '0.9rem' }}>Nova Ação Corretiva</div>
            {actionErrors._global && <div className="form-error" style={{ marginBottom: 8 }}>{actionErrors._global}</div>}
            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label required">Descrição da Ação</label>
                <textarea
                  className="form-textarea"
                  value={actionForm.description}
                  onChange={e => setActionForm(p => ({ ...p, description: e.target.value }))}
                  style={{ minHeight: 60 }}
                />
                {actionErrors.description && <span className="form-error">{actionErrors.description}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Responsável</label>
                <input className="form-input" value={actionForm.responsiblePerson} onChange={e => setActionForm(p => ({ ...p, responsiblePerson: e.target.value }))} />
                {actionErrors.responsiblePerson && <span className="form-error">{actionErrors.responsiblePerson}</span>}
              </div>
              <div className="form-group">
                <label className="form-label required">Prazo</label>
                <input type="date" className="form-input" value={actionForm.dueDate} onChange={e => setActionForm(p => ({ ...p, dueDate: e.target.value }))} />
                {actionErrors.dueDate && <span className="form-error">{actionErrors.dueDate}</span>}
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Observações</label>
              <textarea className="form-textarea" style={{ minHeight: 50 }} value={actionForm.notes} onChange={e => setActionForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={handleSaveAction} disabled={savingAction}>
                {savingAction ? 'Salvando…' : 'Salvar Ação'}
              </button>
              <button className="btn btn-secondary" onClick={() => { setShowActionForm(false); setActionForm(EMPTY_ACTION); setActionErrors({}); }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {(!incident.actions || incident.actions.length === 0) ? (
          <div className="text-muted">Nenhuma ação corretiva registrada.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Responsável</th>
                <th>Prazo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {incident.actions.map(action => (
                <tr key={action.ID} style={action.status === 'Overdue' ? { background: '#fff8f8' } : {}}>
                  <td>{action.description}</td>
                  <td>{action.responsiblePerson}</td>
                  <td style={action.status === 'Overdue' ? { color: '#bb0000', fontWeight: 600 } : {}}>
                    {action.dueDate}
                    {action.status === 'Overdue' && ' ⚠️'}
                  </td>
                  <td>
                    <span className={`status-badge status-${action.status}`}>
                      {ACTION_STATUS[action.status] || action.status}
                    </span>
                  </td>
                  <td>
                    {action.status !== 'Completed' && (
                      <button className="link-btn" onClick={() => handleCompleteAction(action.ID)}>
                        Concluir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Histórico de alertas */}
      {incident.alertLogs && incident.alertLogs.length > 0 && (
        <div className="section-card">
          <div className="section-title">Histórico de Alertas</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Destinatário</th>
                <th>Canal</th>
                <th>Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {incident.alertLogs.map(log => (
                <tr key={log.ID}>
                  <td>{new Date(log.sentAt).toLocaleString('pt-BR')}</td>
                  <td>{log.recipient}</td>
                  <td>{log.channel}</td>
                  <td>{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-2">
        <Link to="/incidents" className="link-btn">← Voltar para lista de incidentes</Link>
      </div>
    </div>
  );
}
