-- VIPAZ — DRAFT ONLY. DO NOT APPLY without review and data preflight.
-- Atomic, idempotent session/participant creation, initially restricted to active global admins.
-- Security-definer is required because participant INSERT has no RLS grant.
-- Explicit grants and search_path; all authorization is checked inside the function.

CREATE OR REPLACE FUNCTION public.vipaz_create_investigation_atomic(
  p_cycle_id uuid,
  p_session_legacy_id text,
  p_facilitator_name text,
  p_participant_legacy_id text DEFAULT NULL,
  p_participant_name text DEFAULT NULL,
  p_participant_role text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_session public.investigation_sessions%ROWTYPE;
  v_participant public.interview_participants%ROWTYPE;
  v_existing public.interview_participants%ROWTYPE;
  v_created boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required' USING ERRCODE = '42501';
  END IF;
  IF NOT vipaz_private.is_global_admin() THEN
    RAISE EXCEPTION 'institutional_write_forbidden' USING ERRCODE = '42501';
  END IF;
  IF p_cycle_id IS NULL OR nullif(btrim(p_session_legacy_id), '') IS NULL THEN
    RAISE EXCEPTION 'invalid_session_identity' USING ERRCODE = '22023';
  END IF;
  IF (p_participant_name IS NULL) <> (p_participant_legacy_id IS NULL) THEN
    RAISE EXCEPTION 'participant_identity_incomplete' USING ERRCODE = '22023';
  END IF;
  IF p_participant_name IS NOT NULL AND
     (nullif(btrim(p_participant_name), '') IS NULL OR nullif(btrim(p_participant_legacy_id), '') IS NULL) THEN
    RAISE EXCEPTION 'invalid_participant_identity' USING ERRCODE = '22023';
  END IF;
  PERFORM 1 FROM public.governance_cycles WHERE id = p_cycle_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'cycle_not_found' USING ERRCODE = '22023';
  END IF;

  -- Serialize retries with the same stable legacy identifier.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_session_legacy_id, 0));
  SELECT * INTO v_session FROM public.investigation_sessions WHERE legacy_id = p_session_legacy_id;
  IF FOUND THEN
    IF v_session.cycle_id IS DISTINCT FROM p_cycle_id OR
       v_session.facilitator_name IS DISTINCT FROM coalesce(nullif(btrim(p_facilitator_name), ''), 'Facilitador VIPAZ') THEN
      RAISE EXCEPTION 'session_identity_conflict' USING ERRCODE = '23505';
    END IF;
  ELSE
    INSERT INTO public.investigation_sessions
      (legacy_id, cycle_id, modality, facilitator_name, metadata)
    VALUES
      (p_session_legacy_id, p_cycle_id, 'FACILITATED',
       coalesce(nullif(btrim(p_facilitator_name), ''), 'Facilitador VIPAZ'),
       '{"source":"VIPAZ_NATIVE","dimension":"D1"}'::jsonb)
    RETURNING * INTO v_session;
    v_created := true;
  END IF;

  IF p_participant_name IS NOT NULL THEN
    -- Lock on the participant identity too; no unique legacy_id exists yet.
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('participant:' || p_participant_legacy_id, 0));
    SELECT * INTO v_existing FROM public.interview_participants
      WHERE legacy_id = p_participant_legacy_id ORDER BY created_at, id LIMIT 1;
    IF FOUND THEN
      IF v_existing.session_id IS DISTINCT FROM v_session.id OR
         v_existing.name IS DISTINCT FROM p_participant_name OR
         v_existing.role IS DISTINCT FROM p_participant_role THEN
        RAISE EXCEPTION 'participant_identity_conflict' USING ERRCODE = '23505';
      END IF;
      v_participant := v_existing;
    ELSE
      INSERT INTO public.interview_participants
        (legacy_id, session_id, name, role, department, participant_type, metadata)
      VALUES
        (p_participant_legacy_id, v_session.id, p_participant_name, p_participant_role,
         p_participant_role, 'RESPONDENT',
         jsonb_build_object('source','VIPAZ_NATIVE','source_role','INTERLOCUTOR_PRINCIPAL',
           'source_type','INSTITUTIONAL_INTERLOCUTOR','institutional_function',p_participant_role))
      RETURNING * INTO v_participant;
    END IF;
  END IF;
  RETURN jsonb_build_object('session', to_jsonb(v_session),
    'participant', CASE WHEN p_participant_name IS NULL THEN NULL ELSE to_jsonb(v_participant) END,
    'created', v_created);
END;
$function$;

REVOKE ALL ON FUNCTION public.vipaz_create_investigation_atomic(uuid,text,text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vipaz_create_investigation_atomic(uuid,text,text,text,text,text) TO authenticated;

-- BEFORE APPLYING: verify vipaz_private.is_global_admin signature, role membership rules,
-- function owner, existing duplicate participant legacy IDs, and GRANTs.
-- SECURITY DEFINER bypasses table RLS: never broaden its permission without a role audit.
-- Advisory locking protects cooperative RPC calls; external direct INSERTs still need a
-- unique constraint after data cleanup to guarantee global idempotency.
