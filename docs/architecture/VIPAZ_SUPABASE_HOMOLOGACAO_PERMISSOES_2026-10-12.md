# VIPAZ — Homologação de permissões no Supabase (leitura real)
Data: 2026-10-12. Projeto: vrnsgcwnjajglvhfocaj. Estado: **auditoria de metadados, sem alterações**.

## Evidência consultada
Consulta de leitura a `information_schema.role_table_grants` para `authenticated` e `anon` nas tabelas centrais; consulta de leitura a `pg_policies` para políticas RLS.

| Tabela | Grants observados para authenticated | Política relevante observada |
|---|---|---|
| organizations | SELECT | SELECT: is_global_admin() OR has_membership(id) |
| governance_cycles | SELECT | SELECT: can_access_cycle(id) |
| investigation_sessions | INSERT, SELECT | INSERT: can_access_cycle(cycle_id); SELECT: can_access_session(id) |
| organization_memberships | SELECT | SELECT: vínculo próprio ou admin global |
| vipaz_partner_memberships | SELECT | SELECT: somente admin global |
| vipaz_partner_organization_links | SELECT | SELECT: somente admin global |

Não foram retornados grants para `anon` nessas tabelas pela consulta realizada. A ausência de grants diretos de INSERT em `organizations` e `governance_cycles` impede que se conclua que seus endpoints POST atuais funcionam para usuários comuns; funções RPC com SECURITY DEFINER exigem análise própria.

## Achados e implicações
1. **Ponto de atenção P1 — sessões:** o grant INSERT de `investigation_sessions` já existe para `authenticated`; a política de inserção usa `can_access_cycle(cycle_id)`. A função ainda não foi inspecionada; portanto **não está demonstrado** se a condição autoriza somente administradores ou outros vínculos. A decisão metodológica de quem pode criar uma sessão não deve ser inferida de quem pode ler o ciclo.
2. **Ponto de atenção P1 — parceiro:** as políticas SELECT de memberships e links de carteira aceitam apenas administrador global. A existência de `PARTNER_ADMIN`, `PARTNER_OPERATOR` e `PARTNER_VIEWER` nas restrições não demonstra acesso delegado às organizações da carteira.
3. **Ponto de atenção P2 — organização/ciclo:** a ausência de grant direto INSERT para authenticated coincide com a proposta DRAFT de escrita somente para ADMIN_VIPAZ. Essa proposta não foi aplicada.
4. **Ponto de atenção P2 — taxonomia institucional:** `organization_memberships.role_code` possui apenas CHECK de valor não vazio; códigos institucionais não estão homologados.
5. **Limite da evidência:** leitura de metadados não substitui testes com JWTs reais nem revisão das funções `vipaz_private.*`. A inspeção de suas definições foi bloqueada nesta sessão; não inferir sua implementação.

## Cenários de homologação a preparar
- **A — ADMIN_VIPAZ ativo:** pode ver organizações e ciclos autorizados; criação somente quando houver regra de escrita aprovada.
- **B — gestor institucional A:** pode ver A, não B; não recebe permissão de criar sessão apenas por ver ciclo.
- **C — parceiro com carteira A+B:** deve poder ver somente A+B após políticas específicas aprovadas, nunca C; testar suspensão, expiração e revogação.
- **D — participante sem vínculo:** não acessa dados institucionais por autodeclaração.

## Portões de decisão
Antes de qualquer aplicação em produção: (1) aprovar os códigos institucionais e o processo de concessão; (2) revisar funções de escopo e grants EXECUTE; (3) aprovar políticas específicas para parceiro e facilitador; (4) testar em ambiente isolado; (5) definir backup e reversão; (6) obter autorização expressa para aplicar migrações e/ou criar registros de homologação.

**Não houve alteração de RLS, grants, dados de produção ou dos cinco pilotos.**
