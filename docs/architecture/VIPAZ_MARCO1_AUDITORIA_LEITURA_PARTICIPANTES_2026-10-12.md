# VIPAZ — Portão de autorização da reconciliação (leitura do banco real)
Data: 2026-10-12. **Auditoria exclusivamente read-only; nenhuma migração aplicada.**

## Constatações verificadas no Supabase
- `public.interview_participants`: RLS habilitada; `authenticated` tem `SELECT`, mas não há concessão de `INSERT/UPDATE/DELETE` para esse papel na tabela.
- Política `participants_select_scope`: `USING (vipaz_private.can_access_session(session_id))`.
- `vipaz_private.can_access_session(uuid)` permite administrador global **ou** quem possua acesso ao ciclo associado à sessão (`can_access_cycle`).
- Portanto, **a leitura não é exclusiva de ADMIN_VIPAZ**. O endpoint `/api/data/reconcile-participant` encaminha JWT e herda esse escopo. Não se deve descrevê-lo como endpoint de leitura restrito a administradores.
- O endpoint retorna `name`, `role`, `confirmation_note` e `confirmed_by` para um identificador opaco válido que o usuário consiga consultar. O mesmo papel `authenticated` com acesso à sessão pode ler as colunas correspondentes pela API REST, segundo os grants/RLS observados.

## Decisão provisória / bloqueio
- A reconciliação **não deve ser ativada para uso institucional** sem decisão explícita sobre a visibilidade das notas de confirmação e o perfil autorizado a consultar esses dados.
- Separar **autorização de leitura** (acesso à sessão) de **autorização para confirmar** (RPC de escrita restrita a administrador). São capacidades distintas.
- Considerar, para uma versão posterior, uma RPC de reconciliação com verificação explícita de ator autorizado e resposta mínima de comparação, sem exposição desnecessária de justificativas; avaliar o impacto sobre RLS e necessidade de auditoria.
- Testes com JWT real de administrador e de usuário com acesso ao ciclo, mas sem permissão de confirmação, permanecem **pendentes de ambiente isolado aprovado**.
- As flags `VIPAZ_ATOMIC_CYCLE_OPEN_ENABLED` e `VIPAZ_PARTICIPANT_CONFIRMATION_ENABLED` permanecem previstas como desabilitadas por padrão.

## Evidência e limites
Consultas somente de catálogo PostgreSQL: `information_schema.role_table_grants`, `pg_policies`, `pg_proc/pg_get_functiondef`, `pg_class`. A análise de privilégios não substitui testes de JWT, claims, papel institucional ou revisão de todas as funções encadeadas.

## Próximo portão
1. Definir quem pode consultar justificativas de confirmação.
2. Aprovar ambiente de homologação independente, contas sintéticas e plano de reversão.
3. Aplicar migrações **somente no ambiente isolado** após revisão e aprovação.
4. Executar roteiro H01–H11, incluindo isolamento de leitura e negativa de escrita.
