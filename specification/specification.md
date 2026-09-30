# Especificação — Gerenciamento de Riscos de Plataformas de Petróleo

> **Guidelines**: Read [guidelines.md](./guidelines.md) before executing ANY tasks below.

Check off items as completed.

## Setup da Solução

- [x] Criar estrutura de diretórios: `mkdir -p assets/oil-platform-risk-management-cap`
- [x] Invocar skill `setup-solution` para criar `solution.yaml` e `asset.yaml` para o asset `oil-platform-risk-management-cap`
- [x] Validar que `asset.yaml` e `solution.yaml` existem e estão bem formados

## Implementação do Asset

- [x] Executar specification/oil-platform-risk-management-cap/specification.md (todos os itens)

## Validação da Solução

- [x] Verificar que a aplicação CAP inicia corretamente com `cds watch`
- [x] Verificar que o frontend React está sendo servido corretamente
- [x] Validar fluxo completo: criação de incidente crítico → alerta → visualização no dashboard
- [x] Confirmar que todos os marcos M1, M2, M3 são registrados nos logs
