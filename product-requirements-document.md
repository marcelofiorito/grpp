# Documento de Requisitos de Produto (PRD)

**Título:** Gerenciamento de Riscos de Plataformas de Petróleo
**Data:** 2026-09-30
**Responsável:** Equipe de Segurança Operacional
**Categoria da Solução:** Aplicação CAP com UI (Backend CAP Node.js + Frontend React com SAP UI5 Web Components)

---

## Propósito e Valor do Produto

**Resumo:**
Uma aplicação web centralizada que permite engenheiros e técnicos de segurança em plataformas de petróleo offshore registrar, monitorar e responder a incidentes operacionais de forma ágil, reduzindo o tempo de resposta a ocorrências críticas e apoiando a redução contínua de incidentes.

**Necessidade de Negócio:**
Atualmente, equipes de segurança em plataformas offshore operam sem uma ferramenta dedicada para gestão de incidentes. O processo fragmentado aumenta o tempo de resposta a ocorrências críticas, impede a identificação de padrões e dificulta ações preventivas eficazes. A ausência de visibilidade consolidada por plataforma representa um risco operacional e de conformidade significativo.

**Valor Esperado:**
- Redução de 10% no número de incidentes nas plataformas em 12 meses
- Tempo de resposta a ocorrências críticas reduzido para no máximo 4 horas
- Rastreabilidade completa de incidentes para análise de tendências e conformidade regulatória

**Objetivos do Produto (Priorizados):**
1. Registro e monitoramento de incidentes em tempo real com categorização por severidade e plataforma
2. Alertas automáticos para ocorrências críticas com tempo de resposta alvo de 4 horas
3. Dashboard consolidado por plataforma para tomada de decisão baseada em dados
4. Rastreabilidade de ações corretivas e histórico de incidentes para análise de tendências

---

## Métricas de Negócio

| Métrica | Baseline | Meta | Prazo | Processo / Capacidade | Fonte |
|---|---|---|---|---|---|
| Taxa de incidentes nas plataformas | — | Redução de 10% | 12 meses | Gestão de Riscos e Segurança de Ativos | usuário |
| Tempo de resposta a ocorrências críticas | — | ≤ 4 horas | — | Resposta e Gestão de Incidentes | usuário |

---

## Perfis de Usuário e Personas

### Persona Primária: Carlos — Engenheiro de Segurança

Carlos tem 38 anos e atua como engenheiro de segurança numa plataforma de petróleo offshore há 8 anos. Sua jornada inclui inspeções diárias de equipamentos, análise de riscos e coordenação de respostas a incidentes. Trabalha em turnos de 14 dias embarcado e precisa de informações rápidas e precisas para agir sob pressão. Está familiarizado com ferramentas digitais, mas usa principalmente planilhas e rádio para comunicar incidentes. Sua maior frustração é a falta de visibilidade centralizada: quando ocorre um incidente em outra área da plataforma, ele frequentemente descobre com atraso. Seu sucesso é medido pela ausência de incidentes graves e pelo cumprimento dos protocolos de segurança.

### Persona Secundária: Mariana — Técnica de Segurança Operacional

Mariana tem 29 anos e é técnica de segurança operacional, responsável por acompanhar e registrar ocorrências no turno. Ela está embarcada e acessa sistemas via tablet. Tem boa familiaridade com tecnologia mas prefere interfaces diretas e sem complexidade. Seu principal desafio é registrar incidentes rapidamente sem interromper a resposta à emergência. Precisa que o sistema seja rápido, claro e funcionalmente confiável mesmo com conectividade limitada.

### Outros Tipos de Usuário

- **Supervisor de Operações**: Acompanha o dashboard consolidado e valida ações corretivas.
- **Equipe de Compliance/HSE em terra**: Acessa relatórios e histórico de incidentes para fins regulatórios.

---

## Metas e Não-Metas

### Metas (Em Escopo)

- Registro estruturado de incidentes com campos de severidade, tipo, localização na plataforma e responsável
- Dashboard em tempo real por plataforma com visão de incidentes ativos e histórico
- Sistema de alertas automáticos para incidentes classificados como críticos
- Gestão de ações corretivas com prazos, responsáveis e status de conclusão
- Histórico completo e exportável de incidentes para análise de tendências
- Interface responsiva acessível via tablet e desktop

### Não-Metas (Fora do Escopo)

- Integração com SAP S/4HANA, SAP Asset Performance Management ou outros sistemas ERP
- Gestão de recursos humanos, folha de pagamento ou escala de turnos
- Automação de ordens de manutenção em sistemas SAP
- Funcionalidade offline completa (modo desconectado)
- Módulo financeiro ou de custos de incidentes

---

## Requisitos

### Requisitos Essenciais (Must-Have)

**RF-01**: Registro de Incidentes

- **Problema a Resolver**: Engenheiros e técnicos precisam registrar incidentes rapidamente com informações estruturadas para garantir rastreabilidade e ação imediata.
- **História do Usuário**: Como técnica de segurança, preciso registrar um incidente com dados de severidade, tipo e localização para que a equipe responsável seja notificada e possa agir dentro do prazo.
- **Critérios de Aceite**:
  - Dado que estou logada na aplicação, quando preencho o formulário de novo incidente e confirmo, então o incidente é salvo com data/hora automática e status "Aberto".
  - O formulário deve conter: título, descrição, plataforma, área da plataforma, severidade (Baixa / Média / Alta / Crítica), tipo de incidente e responsável designado.
- **Mapeia ao Objetivo**: Objetivo 1
- **Prioridade**: 1

**RF-02**: Alertas Automáticos para Ocorrências Críticas

- **Problema a Resolver**: Incidentes críticos precisam ser comunicados imediatamente às partes responsáveis para que o tempo de resposta de 4 horas seja cumprido.
- **História do Usuário**: Como engenheiro de segurança, preciso ser notificado automaticamente quando um incidente crítico é registrado para que eu possa coordenar a resposta dentro do tempo alvo.
- **Critérios de Aceite**:
  - Dado que um incidente com severidade "Crítica" é registrado, então uma notificação é enviada imediatamente para o engenheiro responsável e supervisor da plataforma.
  - O alerta deve indicar: plataforma, área, severidade e link direto para o incidente.
- **Mapeia ao Objetivo**: Objetivo 2
- **Prioridade**: 2

**RF-03**: Dashboard Consolidado por Plataforma

- **Problema a Resolver**: Gestores e engenheiros precisam de visibilidade centralizada sobre o estado atual de riscos e incidentes em cada plataforma.
- **História do Usuário**: Como engenheiro de segurança, preciso de um dashboard com visão geral dos incidentes por plataforma para identificar rapidamente áreas críticas e tendências.
- **Critérios de Aceite**:
  - Dado que acesso o dashboard, então visualizo os incidentes agrupados por plataforma com indicadores de severidade e status.
  - O dashboard exibe: total de incidentes abertos, incidentes críticos, incidentes por tipo e gráfico de evolução nos últimos 30 dias.
- **Mapeia ao Objetivo**: Objetivo 3
- **Prioridade**: 3

**RF-04**: Gestão de Ações Corretivas

- **Problema a Resolver**: Após o registro de um incidente, é necessário acompanhar as ações de mitigação para garantir que sejam concluídas dentro do prazo.
- **História do Usuário**: Como engenheiro de segurança, preciso registrar ações corretivas associadas a incidentes com responsável e prazo para acompanhar a resolução até o fechamento.
- **Critérios de Aceite**:
  - Dado que estou visualizando um incidente aberto, quando adiciono uma ação corretiva com responsável e prazo, então a ação aparece associada ao incidente com status "Pendente".
  - Ações vencidas devem ser destacadas visualmente na interface.
- **Mapeia ao Objetivo**: Objetivo 1 e 4
- **Prioridade**: 4

**RF-05**: Histórico e Relatório de Incidentes

- **Problema a Resolver**: A equipe de HSE precisa de histórico completo de incidentes para análise de tendências e atendimento a requisitos regulatórios.
- **História do Usuário**: Como responsável de HSE, preciso exportar o histórico de incidentes por plataforma e período para análise e relatórios de conformidade.
- **Critérios de Aceite**:
  - Dado que acesso a seção de histórico, então posso filtrar incidentes por plataforma, período, severidade e tipo.
  - O histórico pode ser exportado em formato CSV ou PDF.
- **Mapeia ao Objetivo**: Objetivo 4
- **Prioridade**: 5

**RF-06**: Interface Responsiva para Uso em Campo

- **Problema a Resolver**: Técnicos utilizam tablets nas plataformas e precisam de uma interface utilizável em telas menores com toque.
- **História do Usuário**: Como técnica de segurança, preciso acessar e registrar incidentes pelo tablet na plataforma para que eu não precise ir a um desktop para fazer os registros.
- **Critérios de Aceite**:
  - Dado que acesso a aplicação via tablet (resolução 768px+), então todas as funcionalidades principais são acessíveis e utilizáveis sem scroll horizontal.
- **Mapeia ao Objetivo**: Objetivo 1 e 2
- **Prioridade**: 6

---

## Requisitos Não-Funcionais

### Desempenho

- **Latência**: Carregamento do dashboard em menos de 3 segundos para conexões offshore típicas.
- **Volume**: Suporte a pelo menos 50 usuários simultâneos por plataforma.

### Confiabilidade

- **Disponibilidade**: 99% de uptime durante horários de operação das plataformas.
- **Fallback**: Mensagem clara ao usuário em caso de indisponibilidade, sem perda de dados em formulários preenchidos.

### Explicabilidade

- **Rastreabilidade**: Todos os registros mantêm log de criação, última atualização e usuário responsável.
- **Log de Decisão**: Alertas enviados ficam registrados com data/hora e destinatário para auditoria.

---

## Arquitetura da Solução

**Visão Geral:**
Aplicação web de camada única implantada no SAP Business Technology Platform (BTP), composta por backend CAP e frontend React. A comunicação entre frontend e backend ocorre via APIs OData/REST geradas automaticamente pelo CAP.

**Componentes Principais:**

- **Backend CAP (Node.js)**: Modelos de dados (Incidentes, Plataformas, Ações Corretivas, Usuários), serviços OData, lógica de negócio de alertas e notificações.
- **Frontend React + SAP UI5 Web Components**: Interface responsiva com formulários de registro, dashboard, histórico e configurações.
- **SAP HANA Cloud (ou SQLite em desenvolvimento)**: Persistência de dados de incidentes e ações corretivas.
- **SAP BTP Cloud Foundry**: Ambiente de implantação e hospedagem da aplicação.

**Pontos de Integração:**

- Nenhuma integração com sistemas externos na fase inicial. A aplicação é independente.

**Ambientes de Implantação:**

- **Desenvolvimento**: SQLite local, sem dados reais.
- **Produção**: SAP HANA Cloud no BTP, com isolamento de dados por plataforma/tenant.

---

## Marcos

### M1: Registro de Incidentes Operacional

- **Descrição**: O sistema permite o registro estruturado de incidentes com categorização por severidade e plataforma.
- **Alcançado quando**: Um incidente pode ser criado com todos os campos obrigatórios, salvo corretamente e visualizado na lista de incidentes abertos.
- **Log ao alcançar**: `M1.achieved: incident registration operational — structured incident creation and listing confirmed`
- **Log ao falhar**: `M1.missed: incident registration not completed — form submission or persistence issue detected`

### M2: Alertas Ativos para Ocorrências Críticas

- **Descrição**: Notificações automáticas são disparadas quando incidentes críticos são registrados.
- **Alcançado quando**: Um incidente com severidade "Crítica" dispara alerta para o responsável em menos de 1 minuto após o registro.
- **Log ao alcançar**: `M2.achieved: critical incident alerts operational — notification delivery confirmed within target time`
- **Log ao falhar**: `M2.missed: alert system not operational — critical incident notification not delivered within 1 minute`

### M3: Dashboard Funcional por Plataforma

- **Descrição**: Visão consolidada de todos os riscos e incidentes por plataforma disponível para engenheiros e técnicos.
- **Alcançado quando**: O dashboard exibe corretamente incidentes agrupados por plataforma com indicadores de severidade, status e gráfico de tendência.
- **Log ao alcançar**: `M3.achieved: platform dashboard operational — incident summary and trend chart rendering correctly`
- **Log ao falhar**: `M3.missed: dashboard not operational — data aggregation or rendering issue detected`

### M4: Meta de Redução de Incidentes Atingida

- **Descrição**: Queda de 10% no número de incidentes registrados após 12 meses de uso contínuo da aplicação.
- **Alcançado quando**: Relatório de 12 meses confirma redução igual ou superior a 10% em comparação ao período anterior.
- **Log ao alcançar**: `M4.achieved: 10% incident reduction target met — 12-month comparison report confirms target`
- **Log ao falhar**: `M4.missed: incident reduction target not met at 12-month review`

---

## Riscos, Premissas e Dependências

### Riscos

- **Adoção pela equipe de campo**: Engenheiros e técnicos em plataformas offshore podem ter resistência à adoção de novas ferramentas digitais. Mitigação: interface simples, treinamento presencial e suporte nas primeiras semanas de uso.
- **Conectividade offshore limitada**: Plataformas podem ter largura de banda reduzida, impactando a performance. Mitigação: design leve, paginação de dados e carregamento otimizado.
- **Qualidade dos dados registrados**: Se os registros forem incompletos ou inconsistentes, a análise de tendências perde valor. Mitigação: campos obrigatórios e validação no formulário.

### Premissas

- Os usuários possuem acesso à internet nas plataformas, mesmo que com largura de banda limitada.
- A aplicação será utilizada por usuários autenticados via SAP BTP Identity Authentication Service.
- Não há requisito de integração com sistemas legados na fase inicial.

### Dependências

- Acesso ao ambiente SAP BTP para implantação.
- Definição dos papéis e usuários por plataforma para configuração inicial.

---

## Governança, Risco e Conformidade

**Tratamento de Dados:**

- Dados de incidentes não contêm informações pessoais identificáveis (PII) além do nome do responsável designado.
- Dados devem ser retidos por no mínimo 5 anos para fins de auditoria regulatória (alinhamento com NR-37 e normas de segurança offshore no Brasil).

**Frameworks de Conformidade:**

- NR-37 (Norma Regulamentadora de Segurança e Saúde no Trabalho em Instalações e Embarcações de Perfuração e Produção de Petróleo e Gás Natural).
- Requisitos de rastreabilidade e auditoria de incidentes conforme regulamentação da ANP (Agência Nacional do Petróleo, Gás Natural e Biocombustíveis).

---

## Apêndice

### Glossário

- **Incidente**: Qualquer ocorrência operacional não planejada que represente risco ou tenha causado impacto à segurança, equipamento ou operação.
- **Ocorrência Crítica**: Incidente classificado com severidade "Crítica" que exige resposta imediata (tempo alvo ≤ 4 horas).
- **Ação Corretiva**: Medida tomada para eliminar a causa de um incidente e prevenir recorrência.
- **Plataforma**: Instalação offshore de petróleo e gás identificada por código único na aplicação.
- **HSE**: Health, Safety and Environment — Saúde, Segurança e Meio Ambiente.
- **NR-37**: Norma Regulamentadora Brasileira aplicável a plataformas offshore de petróleo e gás.

### Referências

- SAP Cloud Application Programming Model (CAP): https://cap.cloud.sap
- SAP UI5 Web Components: https://sap.github.io/ui5-webcomponents
- SAP BTP Cloud Foundry: https://help.sap.com/docs/btp
- NR-37 — Ministério do Trabalho e Emprego: https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/ctpp-nrs/portaria-mtps-nr-37
