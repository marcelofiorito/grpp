import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPlatforms, createIncident, updateIncident, fetchIncidentById } from '../api/client.js';

const SEVERITY_OPTIONS = [
  { value: 'Low',      label: 'Baixa' },
  { value: 'Medium',   label: 'Média' },
  { value: 'High',     label: 'Alta' },
  { value: 'Critical', label: 'Crítica ⚠️' },
];

const TYPE_OPTIONS = [
  { value: 'Operational',   label: 'Operacional' },
  { value: 'Safety',        label: 'Segurança' },
  { value: 'Environmental', label: 'Ambiental' },
  { value: 'Equipment',     label: 'Equipamento' },
  { value: 'Process',       label: 'Processo' },
];

const STATUS_OPTIONS = [
  { value: 'Open',       label: 'Aberto' },
  { value: 'InProgress', label: 'Em Andamento' },
  { value: 'Resolved',   label: 'Resolvido' },
  { value: 'Closed',     label: 'Fechado' },
];

const EMPTY_FORM = {
  title: '', description: '', platform_ID: '', area: '',
  severity: 'Medium', type: 'Operational', status: 'Open',
  reportedBy: '', assignedTo: '', occurredAt: ''
};

export default function IncidentForm() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = Boolean(id && id !== 'new');

  const [form, setForm]           = useState(EMPTY_FORM);
  const [platforms, setPlatforms] = useState([]);
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);
  const [showCriticalWarning, setShowCriticalWarning] = useState(false);
  const [toast, setToast]         = useState('');

  useEffect(() => {
    fetchPlatforms().then(p => setPlatforms(p || []));
    if (isEdit) {
      fetchIncidentById(id).then(inc => {
        if (inc) {
          setForm({
            title: inc.title || '',
            description: inc.description || '',
            platform_ID: inc.platform_ID || inc.platform?.ID || '',
            area: inc.area || '',
            severity: inc.severity || 'Medium',
            type: inc.type || 'Operational',
            status: inc.status || 'Open',
            reportedBy: inc.reportedBy || '',
            assignedTo: inc.assignedTo || '',
            occurredAt: inc.occurredAt ? inc.occurredAt.slice(0, 16) : ''
          });
        }
      });
    }
  }, [id]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim())       errs.title       = 'Título é obrigatório.';
    if (!form.platform_ID)        errs.platform_ID = 'Plataforma é obrigatória.';
    if (!form.area.trim())        errs.area        = 'Área é obrigatória.';
    if (!form.severity)           errs.severity    = 'Severidade é obrigatória.';
    if (!form.type)               errs.type        = 'Tipo é obrigatório.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (form.severity === 'Critical' && !showCriticalWarning && !isEdit) {
      setShowCriticalWarning(true);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        occurredAt: form.occurredAt ? new Date(form.occurredAt).toISOString() : undefined
      };
      if (isEdit) {
        await updateIncident(id, payload);
        setToast('Incidente atualizado com sucesso!');
      } else {
        const created = await createIncident(payload);
        setToast('Incidente registrado com sucesso!');
        setTimeout(() => navigate(`/incidents/${created?.ID || ''}`), 1200);
        return;
      }
      setTimeout(() => navigate(`/incidents/${id}`), 1200);
    } catch (err) {
      setErrors({ _global: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Editar Incidente' : 'Registrar Novo Incidente'}</h1>
      </div>

      {toast && (
        <div className="alert-banner" style={{ background: '#d5f0e0', borderColor: '#107e3e', color: '#0d5d28', marginBottom: '1rem' }}>
          ✅ {toast}
        </div>
      )}

      {errors._global && (
        <div className="alert-banner critical" style={{ marginBottom: '1rem' }}>
          ❌ {errors._global}
        </div>
      )}

      {/* Aviso de incidente crítico */}
      {showCriticalWarning && (
        <div className="alert-banner critical" style={{ marginBottom: '1rem', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
          <strong>⚠️ Atenção: Incidente Crítico</strong>
          <p>Ao salvar, um alerta será enviado automaticamente para o responsável designado e a equipe de supervisão. Confirme para prosseguir.</p>
          <div className="flex gap-2 mt-1">
            <button className="btn btn-danger" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Salvando…' : 'Confirmar e Registrar'}
            </button>
            <button className="btn btn-secondary" onClick={() => setShowCriticalWarning(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group full-width">
            <label className="form-label required">Título</label>
            <input
              className="form-input"
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Descreva brevemente o incidente"
              maxLength={200}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">Plataforma</label>
            <select className="form-select" value={form.platform_ID} onChange={e => handleChange('platform_ID', e.target.value)}>
              <option value="">Selecione a plataforma…</option>
              {platforms.map(p => <option key={p.ID} value={p.ID}>{p.code} — {p.name}</option>)}
            </select>
            {errors.platform_ID && <span className="form-error">{errors.platform_ID}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">Área da Plataforma</label>
            <input
              className="form-input"
              value={form.area}
              onChange={e => handleChange('area', e.target.value)}
              placeholder="Ex: Deck Principal, Sala de Máquinas"
              maxLength={100}
            />
            {errors.area && <span className="form-error">{errors.area}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">Severidade</label>
            <select className="form-select" value={form.severity} onChange={e => handleChange('severity', e.target.value)}>
              {SEVERITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.severity && <span className="form-error">{errors.severity}</span>}
          </div>

          <div className="form-group">
            <label className="form-label required">Tipo de Incidente</label>
            <select className="form-select" value={form.type} onChange={e => handleChange('type', e.target.value)}>
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.type && <span className="form-error">{errors.type}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Data e Hora da Ocorrência</label>
            <input
              type="datetime-local"
              className="form-input"
              value={form.occurredAt}
              onChange={e => handleChange('occurredAt', e.target.value)}
            />
          </div>

          {isEdit && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => handleChange('status', e.target.value)}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Relatado por</label>
            <input
              className="form-input"
              value={form.reportedBy}
              onChange={e => handleChange('reportedBy', e.target.value)}
              placeholder="Nome de quem registrou"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Responsável Designado</label>
            <input
              className="form-input"
              value={form.assignedTo}
              onChange={e => handleChange('assignedTo', e.target.value)}
              placeholder="Nome do responsável pela resolução"
              maxLength={100}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label className="form-label">Descrição</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Descreva o incidente em detalhes: o que aconteceu, impacto inicial, ações imediatas tomadas…"
            />
          </div>
        </div>

        {!showCriticalWarning && (
          <div className="flex gap-2 mt-2">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvando…' : isEdit ? 'Salvar Alterações' : 'Registrar Incidente'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancelar
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
