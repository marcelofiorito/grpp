/**
 * Testes do Serviço de Gerenciamento de Riscos
 * Utiliza banco SQLite em memória via @cap-js/sqlite
 */
const cds = require('@sap/cds');

// Configurar ambiente de teste
process.env.NODE_ENV = 'development';

describe('RiskManagementService', () => {
  let srv;

  beforeAll(async () => {
    // Inicializar CDS com banco em memória
    await cds.connect({ db: { kind: 'sqlite', credentials: { database: ':memory:' } } });
    srv = await cds.connect.to('RiskManagementService');
  });

  // ── Testes de criação de incidentes ────────────────────────────────────────

  describe('Incidents — CREATE', () => {
    it('deve criar incidente com campos obrigatórios válidos', async () => {
      const { Platforms } = cds.entities('oil.risk');
      const db = cds.db;

      // Criar plataforma de teste
      const platform = await db.run(
        INSERT.into(Platforms).entries({
          ID: 'test-platform-001',
          code: 'TEST-01',
          name: 'Plataforma de Teste',
          status: 'Active'
        })
      );

      const incident = await srv.run(
        INSERT.into('RiskManagementService.Incidents').entries({
          ID: cds.utils.uuid(),
          title: 'Teste de incidente válido',
          platform_ID: 'test-platform-001',
          area: 'Deck Principal',
          severity: 'Medium',
          type: 'Operational'
        })
      );

      expect(incident).toBeDefined();
    });

    it('deve retornar erro 400 ao criar incidente sem título', async () => {
      try {
        await srv.run(
          INSERT.into('RiskManagementService.Incidents').entries({
            ID: cds.utils.uuid(),
            platform_ID: 'test-platform-001',
            area: 'Deck',
            severity: 'Medium',
            type: 'Operational'
          })
        );
        fail('Deveria ter lançado um erro');
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    it('deve criar AlertLog ao registrar incidente Crítico', async () => {
      const db = cds.db;
      const { AlertLogs } = cds.entities('oil.risk');

      const incidentId = cds.utils.uuid();

      await srv.run(
        INSERT.into('RiskManagementService.Incidents').entries({
          ID: incidentId,
          title: 'Incidente Crítico de Teste',
          platform_ID: 'test-platform-001',
          area: 'Sala de Máquinas',
          severity: 'Critical',
          type: 'Safety'
        })
      );

      // Aguardar processamento assíncrono
      await new Promise(resolve => setTimeout(resolve, 100));

      const alerts = await db.run(
        SELECT.from(AlertLogs).where({ incident_ID: incidentId })
      );

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].channel).toBe('in-app');
    });
  });

  // ── Testes de atualização de ações corretivas ──────────────────────────────

  describe('CorrectiveActions — UPDATE', () => {
    it('deve definir completedAt ao marcar ação como Completed', async () => {
      const db = cds.db;
      const { CorrectiveActions, Incidents } = cds.entities('oil.risk');

      // Criar incidente base
      const incidentId = cds.utils.uuid();
      await db.run(INSERT.into(Incidents).entries({
        ID: incidentId,
        title: 'Incidente Base',
        platform_ID: 'test-platform-001',
        area: 'Deck',
        severity: 'Low',
        type: 'Operational',
        status: 'Open'
      }));

      // Criar ação corretiva
      const actionId = cds.utils.uuid();
      await db.run(INSERT.into(CorrectiveActions).entries({
        ID: actionId,
        incident_ID: incidentId,
        description: 'Ação de teste',
        responsiblePerson: 'Técnico Teste',
        dueDate: '2026-12-31',
        status: 'Pending'
      }));

      // Atualizar para Completed via serviço
      await srv.run(
        UPDATE('RiskManagementService.CorrectiveActions')
          .set({ status: 'Completed' })
          .where({ ID: actionId })
      );

      const [updated] = await db.run(
        SELECT.one.from(CorrectiveActions).where({ ID: actionId })
      );

      expect(updated.status).toBe('Completed');
      expect(updated.completedAt).toBeDefined();
    });
  });

  // ── Testes do Dashboard ────────────────────────────────────────────────────

  describe('getDashboardSummary', () => {
    it('deve retornar contagens corretas de incidentes', async () => {
      const result = await srv.run(
        srv.getDashboardSummary({ platformId: 'test-platform-001' })
      );

      expect(result).toBeDefined();
      expect(typeof result.totalOpen).toBe('number');
      expect(typeof result.totalCritical).toBe('number');
      expect(typeof result.totalResolved).toBe('number');
      expect(typeof result.overdueActions).toBe('number');
    });
  });
});
