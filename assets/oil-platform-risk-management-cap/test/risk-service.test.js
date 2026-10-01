/**
 * Testes do Serviço de Gerenciamento de Riscos
 * Utiliza banco SQLite em memória via @cap-js/sqlite
 */
const cds = require('@sap/cds');

// Configurar ambiente de teste
process.env.NODE_ENV = 'test';

// Usar helper nativo do CDS para testes
const { GET, POST, PATCH, axios } = cds.test('.').in(__dirname + '/..');

// Desabilitar erros de axios para testar respostas de erro
axios.defaults.validateStatus = () => true;

describe('RiskManagementService', () => {

  // ── Testes de criação de incidentes ────────────────────────────────────────

  describe('Incidents — CREATE', () => {
    let platformId = 'aaaaaaaa-0001-0000-0000-000000000001';

    it('deve criar incidente com campos obrigatórios válidos', async () => {
      const res = await POST('/api/risk/Incidents', {
        ID: cds.utils.uuid(),
        title: 'Teste de incidente válido',
        platform_ID: platformId,
        area: 'Deck Principal',
        severity: 'Medium',
        type: 'Operational'
      });

      expect(res.status).toBe(201);
      expect(res.data.title).toBe('Teste de incidente válido');
    });

    it('deve retornar erro ao criar incidente sem título', async () => {
      const res = await POST('/api/risk/Incidents', {
        ID: cds.utils.uuid(),
        platform_ID: platformId,
        area: 'Deck',
        severity: 'Medium',
        type: 'Operational'
      });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('deve criar AlertLog ao registrar incidente Crítico', async () => {
      const incidentId = cds.utils.uuid();

      const res = await POST('/api/risk/Incidents', {
        ID: incidentId,
        title: 'Incidente Crítico de Teste',
        platform_ID: platformId,
        area: 'Sala de Máquinas',
        severity: 'Critical',
        type: 'Safety'
      });

      expect(res.status).toBe(201);

      // Aguardar processamento assíncrono do alerta
      await new Promise(resolve => setTimeout(resolve, 200));

      const alerts = await GET(`/api/risk/AlertLogs?$filter=incident_ID eq ${incidentId}`);
      expect(alerts.status).toBe(200);
      expect(alerts.data.value.length).toBeGreaterThan(0);
      expect(alerts.data.value[0].channel).toBe('in-app');
    });
  });

  // ── Testes de atualização de ações corretivas ──────────────────────────────

  describe('CorrectiveActions — UPDATE', () => {
    let incidentId;
    let actionId;
    const platformId = 'aaaaaaaa-0001-0000-0000-000000000001';

    beforeAll(async () => {
      // Criar incidente base
      incidentId = cds.utils.uuid();
      await POST('/api/risk/Incidents', {
        ID: incidentId,
        title: 'Incidente Base para Ação',
        platform_ID: platformId,
        area: 'Deck',
        severity: 'Low',
        type: 'Operational'
      });

      // Criar ação corretiva
      actionId = cds.utils.uuid();
      await POST('/api/risk/CorrectiveActions', {
        ID: actionId,
        incident_ID: incidentId,
        description: 'Ação de teste',
        responsiblePerson: 'Técnico Teste',
        dueDate: '2026-12-31',
        status: 'Pending'
      });
    });

    it('deve definir completedAt ao marcar ação como Completed', async () => {
      const res = await PATCH(`/api/risk/CorrectiveActions(${actionId})`, {
        status: 'Completed'
      });

      expect(res.status).toBe(200);
      expect(res.data.status).toBe('Completed');
      expect(res.data.completedAt).toBeDefined();
    });
  });

  // ── Testes do Dashboard ────────────────────────────────────────────────────

  describe('getDashboardSummary', () => {
    it('deve retornar contagens corretas de incidentes', async () => {
      const platformId = 'aaaaaaaa-0001-0000-0000-000000000001';
      const res = await GET(`/api/risk/getDashboardSummary(platformId=${platformId})`);

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(typeof res.data.totalOpen).toBe('number');
      expect(typeof res.data.totalCritical).toBe('number');
      expect(typeof res.data.totalResolved).toBe('number');
      expect(typeof res.data.overdueActions).toBe('number');
    }, 10000);
  });
});
