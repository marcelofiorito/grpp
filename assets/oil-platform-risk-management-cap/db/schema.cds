namespace oil.risk;
using { managed, cuid } from '@sap/cds/common';

/**
 * Plataforma de petróleo offshore
 */
entity Platform : cuid, managed {
  code     : String(20) @mandatory;
  name     : String(100) @mandatory;
  location : String(200);
  status   : String(20) default 'Active';
}

/**
 * Incidente operacional ou de segurança na plataforma
 */
entity Incident : cuid, managed {
  title       : String(200) @mandatory;
  description : String(2000);
  platform_ID : UUID @mandatory;
  area        : String(100) @mandatory;
  severity    : String(20) @mandatory default 'Medium';
  type        : String(30) @mandatory default 'Operational';
  status      : String(20) default 'Open';
  reportedBy  : String(100);
  assignedTo  : String(100);
  occurredAt  : String(30);
  resolvedAt  : String(30);
}

/**
 * Ação corretiva associada a um incidente
 */
entity CorrectiveAction : cuid, managed {
  incident_ID       : UUID @mandatory;
  description       : String(500) @mandatory;
  responsiblePerson : String(100) @mandatory;
  dueDate           : String(20) @mandatory;
  status            : String(20) default 'Pending';
  completedAt       : String(30);
  notes             : String(2000);
}

/**
 * Log de alertas enviados para incidentes críticos
 */
entity AlertLog : cuid {
  incident_ID : UUID;
  sentAt      : String(30);
  recipient   : String(200);
  channel     : String(50) default 'in-app';
  message     : String(500);
}
