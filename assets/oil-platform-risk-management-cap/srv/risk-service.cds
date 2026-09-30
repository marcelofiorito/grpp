using { oil.risk as db } from '../db/schema';

/**
 * Serviço de Gerenciamento de Riscos de Plataformas de Petróleo
 */
service RiskManagementService @(path: '/api/risk') {

  // ─── Entidades expostas ───────────────────────────────────────────────────

  @readonly
  entity Platforms as projection on db.Platform;

  entity Incidents as projection on db.Incident;

  entity CorrectiveActions as projection on db.CorrectiveAction;

  entity AlertLogs as projection on db.AlertLog;

  // ─── Funções de agregação para o Dashboard ────────────────────────────────

  function getDashboardSummary(platformId: UUID) returns {
    totalOpen          : Integer;
    totalCritical      : Integer;
    totalResolved      : Integer;
    totalClosed        : Integer;
    overdueActions     : Integer;
  };

  function getIncidentTrend(platformId: UUID, days: Integer) returns array of {
    date  : Date;
    count : Integer;
  };

  function getDashboardStats() returns {
    totalPlatforms       : Integer;
    totalOpenIncidents   : Integer;
    totalCritical        : Integer;
    totalOverdueActions  : Integer;
  };
}
