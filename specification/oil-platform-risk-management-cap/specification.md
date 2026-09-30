# Especificação — oil-platform-risk-management-cap

> **Guidelines**: Read [../guidelines.md](../guidelines.md) before executing ANY tasks below.

Asset name: `oil-platform-risk-management-cap`
Feature: `oil-platform-risk-management`
Solution Category: CAP Application with UI (Node.js backend + React + SAP UI5 Web Components)

---

## Setup do Projeto CAP

- [ ] No diretório `assets/oil-platform-risk-management-cap/`, inicializar projeto CAP com `cds init oil-platform-risk-management-cap` (ou criar a estrutura manualmente se o diretório já existir)
- [ ] Instalar dependências: `@sap/cds`, `@sap/cds-dk`, `express`, `sqlite3` (dev), `@cap-js/hana` (prod)
- [ ] Criar arquivo `.cdsrc.json` configurando perfis de desenvolvimento (`sqlite`) e produção (`hana`)
- [ ] Criar `package.json` com scripts: `start`, `dev` (cds watch), `build` (cds build --production)
- [ ] Criar `mta.yaml` para deployment no SAP BTP Cloud Foundry com módulos: `cap-srv` (Node.js) e `cap-db` (HDI Container)

---

## Modelo de Dados (CDS)

- [ ] Criar `db/schema.cds` com as seguintes entidades:

  **Plataforma** (Platform)
  - `ID`: UUID (chave)
  - `code`: String(20) — código único da plataforma (ex: P-001)
  - `name`: String(100) — nome da plataforma
  - `location`: String(200) — localização/coordenadas
  - `status`: enum — `Active` | `Inactive` | `Maintenance`
  - `createdAt`: Timestamp (gerenciado pelo CAP)
  - `createdBy`: String (gerenciado pelo CAP)

  **Incidente** (Incident)
  - `ID`: UUID (chave)
  - `title`: String(200) — título do incidente (obrigatório)
  - `description`: LargeString — descrição detalhada
  - `platform`: Association to Platform — plataforma onde ocorreu
  - `area`: String(100) — área da plataforma (ex: Deck, Sala de Máquinas, etc.)
  - `severity`: enum — `Low` | `Medium` | `High` | `Critical`
  - `type`: enum — `Operational` | `Safety` | `Environmental` | `Equipment` | `Process`
  - `status`: enum — `Open` | `InProgress` | `Resolved` | `Closed`
  - `reportedBy`: String(100) — nome do responsável que registrou
  - `assignedTo`: String(100) — responsável designado para resolução
  - `occurredAt`: DateTime — data/hora da ocorrência
  - `resolvedAt`: DateTime — data/hora de resolução (nullable)
  - `createdAt`, `createdBy`, `modifiedAt`, `modifiedBy`: gerenciados pelo CAP
  - Composição: `actions` (CorrectiveAction)

  **AçãoCorretiva** (CorrectiveAction)
  - `ID`: UUID (chave)
  - `incident`: Association to Incident
  - `description`: String(500) — descrição da ação
  - `responsiblePerson`: String(100) — responsável pela ação
  - `dueDate`: Date — prazo para conclusão
  - `status`: enum — `Pending` | `InProgress` | `Completed` | `Overdue`
  - `completedAt`: DateTime (nullable)
  - `notes`: LargeString — observações adicionais
  - `createdAt`, `createdBy`: gerenciados pelo CAP

  **AlertLog** (registro de alertas enviados)
  - `ID`: UUID (chave)
  - `incident`: Association to Incident
  - `sentAt`: Timestamp
  - `recipient`: String(200)
  - `channel`: String(50) — ex: `email`, `in-app`
  - `message`: String(500)

- [ ] Criar `db/data/` com arquivos CSV de dados de exemplo para desenvolvimento:
  - `Platform.csv` com 3-5 plataformas de exemplo
  - `Incident.csv` com 10-15 incidentes de exemplo com severidades variadas
  - `CorrectiveAction.csv` com ações corretivas de exemplo

---

## Serviços CDS (Backend)

- [ ] Criar `srv/risk-service.cds` expondo:

  ```cds
  service RiskManagementService @(path: '/api/risk') {
    entity Platforms       as projection on db.Platform;
    entity Incidents       as projection on db.Incident;
    entity CorrectiveActions as projection on db.CorrectiveAction;
    entity AlertLogs       as projection on db.AlertLog;

    // Funções de agregação para o dashboard
    function getDashboardSummary(platformId: UUID) returns {
      totalOpen: Integer;
      totalCritical: Integer;
      totalResolved: Integer;
      avgResolutionTimeHours: Decimal;
    };

    function getIncidentTrend(platformId: UUID, days: Integer) returns array of {
      date: Date;
      count: Integer;
    };
  }
  ```

- [ ] Criar `srv/risk-service.js` com handlers de lógica de negócio:
  - **Antes do CREATE de Incident**: validar campos obrigatórios (`title`, `platform`, `severity`, `type`); definir `status = 'Open'`; registrar `occurredAt = now()` se não fornecido
  - **Após o CREATE de Incident com severity = 'Critical'**: disparar função `triggerCriticalAlert(incident)` que:
    - Cria registro em `AlertLog` com detalhes do alerta
    - Emite log estruturado: `console.log('[ALERT] Critical incident registered:', { id, title, platform, area, time })`
    - Emite log de marco: `console.log('M2.achieved: critical incident alerts operational — notification delivery confirmed within target time')`
  - **Antes do UPDATE de CorrectiveAction**: se `status = 'Completed'` e `completedAt` não definido, definir `completedAt = now()`
  - **Implementar `getDashboardSummary`**: retornar contagens agrupadas de incidentes por status e severidade para a plataforma informada
  - **Implementar `getIncidentTrend`**: retornar contagem de incidentes por dia para os últimos N dias

- [ ] Criar lógica de verificação de ações vencidas (CorrectiveActions com `dueDate < today` e `status != 'Completed'`): atualizar `status = 'Overdue'` via job ou ao consultar

- [ ] Adicionar anotações CDS em `srv/risk-service.cds` para controle de acesso (roles: `RiskManager`, `SafetyTechnician`, `Viewer`)

- [ ] Emitir log de marco de registro quando o serviço inicializar e o primeiro incidente for criado com sucesso:
  ```
  M1.achieved: incident registration operational — structured incident creation and listing confirmed
  ```

---

## Configuração de Autenticação e Autorização

- [ ] Configurar `xs-security.json` com scopes e role-templates:
  - Scope `RiskManager`: leitura e escrita completa
  - Scope `SafetyTechnician`: criação e atualização de incidentes e ações corretivas
  - Scope `Viewer`: somente leitura
- [ ] Em desenvolvimento (profile `development`): usar `mock-users` no `.cdsrc.json` para simular autenticação
- [ ] Em produção: integrar com SAP BTP XSUAA via binding de serviço

---

## Testes do Backend

- [ ] Criar `test/risk-service.test.js` com testes unitários usando `@cap-js/sqlite` (in-memory):
  - Teste: criar incidente com severidade Critical → deve criar registro em AlertLog
  - Teste: criar incidente com campos obrigatórios faltando → deve retornar erro 400
  - Teste: atualizar CorrectiveAction para Completed → deve definir `completedAt`
  - Teste: `getDashboardSummary` deve retornar contagens corretas
- [ ] Executar testes com `npm test` e corrigir falhas

---

## Frontend — Estrutura React

- [ ] Criar diretório `app/risk-ui/` dentro do projeto CAP
- [ ] Inicializar projeto React com Vite: `npm create vite@latest risk-ui -- --template react`
- [ ] Instalar dependências de UI: `@ui5/webcomponents`, `@ui5/webcomponents-react`, `@ui5/webcomponents-fiori`
- [ ] Instalar dependências de roteamento e dados: `react-router-dom`, `@tanstack/react-query` (ou SWR)
- [ ] Configurar proxy do Vite para o backend CAP em desenvolvimento (apontar `/api` para `localhost:4004`)
- [ ] Criar `app/risk-ui/vite.config.js` com configuração de proxy e build output para `app/risk-ui/dist`
- [ ] Configurar CAP para servir o frontend compilado via `cds.serve` (configurar `ui5` no `package.json` do CAP)

---

## Frontend — Componentes e Páginas

### Layout e Navegação

- [ ] Criar componente `App.jsx` com roteamento principal usando `react-router-dom`:
  - `/` → Dashboard
  - `/incidents` → Lista de Incidentes
  - `/incidents/new` → Criar Incidente
  - `/incidents/:id` → Detalhe do Incidente
  - `/platforms` → Lista de Plataformas
- [ ] Criar componente `AppShell.jsx` com `ui5-shell-bar` (cabeçalho) e `ui5-side-navigation` (menu lateral) para navegação entre seções
- [ ] Menu lateral com itens: Dashboard, Incidentes, Plataformas

### Página: Dashboard

- [ ] Criar `pages/Dashboard.jsx` com:
  - Seletor de plataforma (`ui5-select`) para filtrar dados
  - 4 cards de KPI usando `ui5-card` exibindo: Total de Incidentes Abertos, Incidentes Críticos, Resolvidos no Período, Tempo Médio de Resposta
  - Gráfico de tendência de incidentes dos últimos 30 dias (usar `recharts` ou similar)
  - Tabela resumo de incidentes críticos abertos com link para detalhes
- [ ] Os cards de KPI devem ter cor de destaque para incidentes críticos (vermelho/ui5 status negative)
- [ ] Emitir log de marco quando o dashboard carregar dados com sucesso: `M3.achieved: platform dashboard operational — incident summary and trend chart rendering correctly`

### Página: Lista de Incidentes

- [ ] Criar `pages/IncidentList.jsx` com:
  - `ui5-table` listando todos os incidentes com colunas: Título, Plataforma, Área, Severidade, Tipo, Status, Data da Ocorrência, Responsável
  - Filtros por: Plataforma, Severidade, Status, Tipo (usando `ui5-select` e `ui5-input`)
  - Badge colorido para severidade (Critical=vermelho, High=laranja, Medium=amarelo, Low=verde)
  - Badge de status com cores correspondentes
  - Botão "Novo Incidente" no topo
  - Paginação ou scroll infinito para grandes volumes
  - Linha com ações vencidas de CorrectiveAction destacadas em vermelho

### Página: Criar / Editar Incidente

- [ ] Criar `pages/IncidentForm.jsx` com formulário usando componentes UI5:
  - `ui5-input` para Título (obrigatório, validação em tempo real)
  - `ui5-select` para Plataforma (obrigatório, carregado da API)
  - `ui5-input` para Área da Plataforma (obrigatório)
  - `ui5-select` para Severidade (obrigatório) — opcões: Baixa / Média / Alta / Crítica
  - `ui5-select` para Tipo (obrigatório) — opções: Operacional / Segurança / Ambiental / Equipamento / Processo
  - `ui5-date-picker` para Data/Hora da Ocorrência
  - `ui5-input` para Responsável Designado
  - `ui5-textarea` para Descrição
  - Botões: "Salvar" e "Cancelar"
  - Validação client-side antes do submit
  - Mensagem de feedback `ui5-message-toast` ao salvar com sucesso
  - Se severity = Critical: exibir `ui5-dialog` de confirmação informando que um alerta será enviado

### Página: Detalhe do Incidente

- [ ] Criar `pages/IncidentDetail.jsx` com:
  - Cabeçalho com título, badges de severidade e status
  - Seção de informações gerais (plataforma, área, tipo, datas, responsável, descrição)
  - Seção "Ações Corretivas" com `ui5-table` listando ações associadas, colunas: Descrição, Responsável, Prazo, Status
  - Botão "Adicionar Ação Corretiva" que abre `ui5-dialog` com formulário inline
  - Botão "Fechar Incidente" (disponível somente quando status = InProgress ou Open)
  - Histórico de alertas enviados (AlertLog)
  - Botão "Editar" para atualizar dados do incidente

### Componente: Alerta de Ocorrência Crítica

- [ ] Criar componente `components/CriticalAlert.jsx` que:
  - Exibe `ui5-notification-list-item` ou banner no topo quando há incidentes críticos abertos
  - Atualiza a cada 60 segundos (polling via React Query)
  - Mostra contagem de críticos abertos com link para lista filtrada

### Página: Lista de Plataformas

- [ ] Criar `pages/PlatformList.jsx` com:
  - `ui5-table` de plataformas com colunas: Código, Nome, Localização, Status, Total de Incidentes Abertos
  - Botão de detalhe que navega para dashboard filtrado pela plataforma

---

## Frontend — Integração com Backend

- [ ] Criar `src/api/client.js` com funções para consumir a API CAP OData/REST:
  - `fetchPlatforms()` — GET `/api/risk/Platforms`
  - `fetchIncidents(filters)` — GET `/api/risk/Incidents` com filtros OData
  - `createIncident(data)` — POST `/api/risk/Incidents`
  - `updateIncident(id, data)` — PATCH `/api/risk/Incidents(id)`
  - `fetchIncidentById(id)` — GET `/api/risk/Incidents(id)?$expand=actions,platform`
  - `createCorrectiveAction(data)` — POST `/api/risk/CorrectiveActions`
  - `updateCorrectiveAction(id, data)` — PATCH `/api/risk/CorrectiveActions(id)`
  - `fetchDashboardSummary(platformId)` — GET `/api/risk/getDashboardSummary(platformId=...)`
  - `fetchIncidentTrend(platformId, days)` — GET `/api/risk/getIncidentTrend(...)`
- [ ] Configurar tratamento global de erros com `ui5-message-box` para erros de API
- [ ] Configurar `@tanstack/react-query` com cache de 30 segundos e refetch automático

---

## Internacionalização (i18n)

- [ ] Criar arquivo `_i18n/messages_pt_BR.properties` no projeto CAP com rótulos em português:
  - Labels das entidades, campos, severidades, tipos, status
  - Mensagens de erro e validação
- [ ] Configurar React com suporte a strings em português nos componentes UI

---

## Build e Empacotamento

- [ ] Criar script `build.sh` (ou npm script) para:
  1. Compilar frontend React: `cd app/risk-ui && npm run build`
  2. Copiar dist para pasta servida pelo CAP: `cp -r app/risk-ui/dist/* app/risk-ui/webapp/`
  3. Executar `cds build --production`
- [ ] Verificar que o CAP serve o frontend corretamente em modo produção

---

## Validação Final

- [ ] Executar `cds watch` e verificar que o servidor inicia sem erros
- [ ] Abrir `http://localhost:4004` e verificar que a UI está acessível
- [ ] Registrar um incidente com severidade Crítica e confirmar que AlertLog é criado
- [ ] Verificar que o dashboard exibe KPIs corretamente
- [ ] Verificar que filtros na lista de incidentes funcionam
- [ ] Verificar responsividade em viewport de tablet (768px)
- [ ] Executar `npm test` no backend e confirmar que todos os testes passam
- [ ] Confirmar logs de marco M1, M2, M3 nos logs do servidor durante os testes
