/**
 * Cliente da API — consome o serviço CAP OData
 */
const BASE_URL = '/api/risk';

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!response.ok) {
    let errorMsg = `Erro ${response.status}`;
    try {
      const err = await response.json();
      errorMsg = err?.error?.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  const text = await response.text();
  if (!text) return null;
  const data = JSON.parse(text);
  return data?.value !== undefined ? data.value : data;
}

// ── Plataformas ──────────────────────────────────────────────────────────────

export async function fetchPlatforms() {
  return request(`${BASE_URL}/Platforms?$orderby=code`);
}

// ── Incidentes ───────────────────────────────────────────────────────────────

export async function fetchIncidents(filters = {}) {
  const params = new URLSearchParams();
  params.append('$expand', 'platform,actions');
  params.append('$orderby', 'occurredAt desc');
  params.append('$count', 'true');

  const filterClauses = [];
  if (filters.platformId) filterClauses.push(`platform_ID eq ${filters.platformId}`);
  if (filters.severity)   filterClauses.push(`severity eq '${filters.severity}'`);
  if (filters.status)     filterClauses.push(`status eq '${filters.status}'`);
  if (filters.type)       filterClauses.push(`type eq '${filters.type}'`);
  if (filters.search)     filterClauses.push(`contains(tolower(title), '${filters.search.toLowerCase()}')`);
  if (filterClauses.length) params.append('$filter', filterClauses.join(' and '));

  const data = await request(`${BASE_URL}/Incidents?${params}`);
  return data;
}

export async function fetchIncidentById(id) {
  return request(`${BASE_URL}/Incidents(${id})?$expand=platform,actions,alertLogs`);
}

export async function createIncident(data) {
  return request(`${BASE_URL}/Incidents`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateIncident(id, data) {
  return request(`${BASE_URL}/Incidents(${id})`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

// ── Ações Corretivas ─────────────────────────────────────────────────────────

export async function createCorrectiveAction(data) {
  return request(`${BASE_URL}/CorrectiveActions`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateCorrectiveAction(id, data) {
  return request(`${BASE_URL}/CorrectiveActions(${id})`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export async function fetchDashboardSummary(platformId) {
  const params = platformId
    ? `getDashboardSummary(platformId=${platformId})`
    : 'getDashboardStats()';
  return request(`${BASE_URL}/${params}`);
}

export async function fetchIncidentTrend(platformId, days = 30) {
  const pidParam = platformId ? `platformId=${platformId},` : 'platformId=null,';
  return request(`${BASE_URL}/getIncidentTrend(${pidParam}days=${days})`);
}

// ── Alertas ──────────────────────────────────────────────────────────────────

export async function fetchCriticalAlerts() {
  return request(`${BASE_URL}/Incidents?$filter=severity eq 'Critical' and status ne 'Closed' and status ne 'Resolved'&$orderby=occurredAt desc&$top=10`);
}
