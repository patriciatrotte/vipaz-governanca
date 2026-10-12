# VIPAZ — Preflight da RPC atômica no Supabase real
Data: 2026-10-12. Projeto: vrnsgcwnjajglvhfocaj. **Somente consultas de leitura; não aplicar SQL de alteração.**

## Confronto do DRAFT com a estrutura real
Fonte de proposta: `supabase/migrations/20261012_vipaz_atomic_investigation_DRAFT.sql`.
- As colunas utilizadas pela função proposta existem em `investigation_sessions` e `interview_participants`.
- `investigation_sessions.legacy_id` tem restrição `UNIQUE`.
- `interview_participants.legacy_id` não tem restrição `UNIQUE`; há chave primária em `id` e FK de `session_id` com `ON DELETE CASCADE`.
- Consulta agregada de preflight: 6 participantes com `legacy_id` não nulo, **0 grupos duplicados** entre esses IDs, e 6 sessões com `legacy_id` não nulo. São contagens observadas na consulta, não garantia de ausência futura de duplicação.
- A função `public.vipaz_create_investigation_atomic` não apareceu na consulta de catálogo de funções, coerente com o estado DRAFT.

## Riscos e decisões ainda pendentes
1. **Idempotência de participantes:** a RPC usa advisory lock para suas próprias chamadas, mas inserções por outros caminhos não obedecem necessariamente ao mesmo lock. Antes de criar UNIQUE, confirmar se `legacy_id` é globalmente único ou apenas por sessão/instituição e revisar o impacto sobre dados históricos.
2. **Autorização:** a RPC proposta é SECURITY DEFINER e só aceita administrador global. Manter essa restrição até que matriz de papéis e funções `vipaz_private` sejam homologadas. A existência de `can_access_cycle` não equivale a permissão de criar investigação.
3. **RLS e escrita direta:** política atual `sessions_insert_scope` autoriza inserção quando `can_access_cycle(cycle_id)` é verdadeiro; avaliar a redução dessa superfície de escrita e o efeito nos fluxos atuais antes de aplicar o DRAFT de autorização.
4. **Testes reais:** execução sintética no GitHub Actions #63 passou; não substitui JWT real nem validação das definições de funções Supabase.

## Próximo portão
Formalizar identidade dos registros, autorização de criação e estratégia de compatibilidade/rollback. Preparar teste de migração em banco isolado com esquema fiel antes de solicitar aprovação expressa para qualquer aplicação em produção.

**Nenhuma tabela, política, migração, usuário ou dado dos cinco pilotos foi alterado.**
