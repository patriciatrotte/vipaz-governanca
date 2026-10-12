-- VIPAZ | Proposta de autorização de escrita v0.1 (NÃO APLICAR SEM REVISÃO)
-- Base da auditoria: Supabase vrnsgcwnjajglvhfocaj, 2026-10-12.
-- Esta migração é deliberadamente conservadora: libera INSERT somente para
-- ADMIN_VIPAZ ativo/válido. Papéis institucionais de escrita ainda não foram
-- formalizados; não conceder escrita a todo membership.
-- A execução deve ser precedida por backup e teste em ambiente isolado.
BEGIN;

-- O esquema atual já define vipaz_private.is_global_admin(), que valida
-- auth.uid(), status ACTIVE, intervalo de validade e ausência de revogação.
-- Nunca conceder uso de service-role a um endpoint acessível ao navegador.

GRANT INSERT ON TABLE public.organizations TO authenticated;
DROP POLICY IF EXISTS organizations_insert_admin_vipaz ON public.organizations;
CREATE POLICY organizations_insert_admin_vipaz
  ON public.organizations FOR INSERT TO authenticated
  WITH CHECK ((SELECT vipaz_private.is_global_admin()));

GRANT INSERT ON TABLE public.governance_cycles TO authenticated;
DROP POLICY IF EXISTS cycles_insert_admin_vipaz ON public.governance_cycles;
CREATE POLICY cycles_insert_admin_vipaz
  ON public.governance_cycles FOR INSERT TO authenticated
  WITH CHECK ((SELECT vipaz_private.is_global_admin()));

-- A política atual sessions_insert_scope permite qualquer membro ativo
-- criar sessões em ciclos visíveis. Não a ampliar silenciosamente.
-- Redução temporária de escrita: admin global; papéis institucionais
-- autorizados exigem decisão explícita e migração posterior.
DROP POLICY IF EXISTS sessions_insert_scope ON public.investigation_sessions;
DROP POLICY IF EXISTS sessions_insert_admin_vipaz ON public.investigation_sessions;
CREATE POLICY sessions_insert_admin_vipaz
  ON public.investigation_sessions FOR INSERT TO authenticated
  WITH CHECK ((SELECT vipaz_private.is_global_admin()));

GRANT INSERT ON TABLE public.interview_participants TO authenticated;
DROP POLICY IF EXISTS participants_insert_admin_vipaz ON public.interview_participants;
CREATE POLICY participants_insert_admin_vipaz
  ON public.interview_participants FOR INSERT TO authenticated
  WITH CHECK ((SELECT vipaz_private.is_global_admin()));

-- A política SELECT dos participantes exige acesso à sessão; continua intacta.
-- A criação via PostgREST com Prefer:return=representation exige SELECT
-- visível ao usuário após a inserção.

COMMIT;

-- Checklist de homologação ANTES de aplicar em produção:
-- [ ] Confirmar funções SECURITY DEFINER e respectivos grants EXECUTE.
-- [ ] Confirmar defaults e constraints de todas as tabelas.
-- [ ] Validar usuário admin ativo e usuário sem privilégios, sem expor dados.
-- [ ] Testar INSERT e SELECT de retorno com JWT real e 401/403.
-- [ ] Validar transação lógica sessão + participante (falha parcial).
-- [ ] Decidir códigos institucionais (gestor, facilitador) e autorização granular.
-- [ ] Verificar RLS efetiva para cada operação e ausência de bypass.
-- [ ] Reavaliar organização/ciclo UUID, idempotência e seleção na interface.
