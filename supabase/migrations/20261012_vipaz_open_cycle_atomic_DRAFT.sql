-- DRAFT ONLY: never apply to production without authorization and schema preflight.
-- One transaction for cycle + session + optional participant.
-- The cycle legacy ID is the stable operation identity; caller must reuse it on retries.
CREATE OR REPLACE FUNCTION public.vipaz_open_cycle_atomic(
  p_organization_id uuid,
  p_cycle_legacy_id text,
  p_cycle_name text,
  p_methodology_version text,
  p_session_legacy_id text,
  p_facilitator_name text,
  p_participant_legacy_id text DEFAULT NULL,
  p_participant_name text DEFAULT NULL,
  p_participant_role text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $vipaz_open$
DECLARE
  v_cycle public.governance_cycles%ROWTYPE;
  v_session public.investigation_sessions%ROWTYPE;
  v_participant public.interview_participants%ROWTYPE;
  v_existing public.interview_participants%ROWTYPE;
  v_created boolean := false;
  v_facilitator text := coalesce(nullif(btrim(p_facilitator_name),''),'Facilitador VIPAZ');
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required' USING ERRCODE='42501';
  END IF;
  IF NOT vipaz_private.is_global_admin() THEN
    RAISE EXCEPTION 'institutional_write_forbidden' USING ERRCODE='42501';
  END IF;
  IF p_organization_id IS NULL OR nullif(btrim(p_cycle_legacy_id),'') IS NULL
     OR nullif(btrim(p_cycle_name),'') IS NULL
     OR nullif(btrim(p_methodology_version),'') IS NULL
     OR nullif(btrim(p_session_legacy_id),'') IS NULL THEN
    RAISE EXCEPTION 'invalid_cycle_identity' USING ERRCODE='22023';
  END IF;
  IF (p_participant_name IS NULL) <> (p_participant_legacy_id IS NULL) THEN
    RAISE EXCEPTION 'participant_identity_incomplete' USING ERRCODE='22023';
  END IF;
  IF p_participant_name IS NOT NULL AND
     (nullif(btrim(p_participant_name),'') IS NULL OR nullif(btrim(p_participant_legacy_id),'') IS NULL) THEN
    RAISE EXCEPTION 'invalid_participant_identity' USING ERRCODE='22023';
  END IF;
  PERFORM 1 FROM public.organizations WHERE id=p_organization_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'organization_not_found' USING ERRCODE='22023'; END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('cycle:' || p_cycle_legacy_id,0));
  SELECT * INTO v_cycle FROM public.governance_cycles WHERE legacy_id=p_cycle_legacy_id;
  IF FOUND THEN
    IF v_cycle.organization_id IS DISTINCT FROM p_organization_id
      OR v_cycle.name IS DISTINCT FROM p_cycle_name
      OR v_cycle.methodology_code IS DISTINCT FROM 'VIPAZ-D1'
      OR v_cycle.methodology_version IS DISTINCT FROM p_methodology_version
      OR v_cycle.status IS DISTINCT FROM 'NOT_STARTED'
      OR v_cycle.metadata IS DISTINCT FROM '{"dimension":"D1","cycle_type":"INITIAL_ASSESSMENT"}'::jsonb THEN
      RAISE EXCEPTION 'cycle_identity_conflict' USING ERRCODE='23505';
    END IF;
  ELSE
    INSERT INTO public.governance_cycles
      (legacy_id,organization_id,name,methodology_code,methodology_version,status,metadata)
    VALUES (p_cycle_legacy_id,p_organization_id,p_cycle_name,'VIPAZ-D1',
      p_methodology_version,'NOT_STARTED','{"dimension":"D1","cycle_type":"INITIAL_ASSESSMENT"}'::jsonb)
    RETURNING * INTO v_cycle;
    v_created := true;
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('session:' || p_session_legacy_id,0));
  SELECT * INTO v_session FROM public.investigation_sessions WHERE legacy_id=p_session_legacy_id;
  IF FOUND THEN
    IF v_session.cycle_id IS DISTINCT FROM v_cycle.id OR
       v_session.facilitator_name IS DISTINCT FROM v_facilitator THEN
      RAISE EXCEPTION 'session_identity_conflict' USING ERRCODE='23505';
    END IF;
  ELSE
    INSERT INTO public.investigation_sessions
      (legacy_id,cycle_id,modality,facilitator_name,metadata)
    VALUES (p_session_legacy_id,v_cycle.id,'FACILITATED',v_facilitator,
      '{"source":"VIPAZ_NATIVE","dimension":"D1"}'::jsonb)
    RETURNING * INTO v_session;
  END IF;

  IF p_participant_name IS NOT NULL THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('participant:' || p_participant_legacy_id,0));
    SELECT * INTO v_existing FROM public.interview_participants
      WHERE legacy_id=p_participant_legacy_id ORDER BY created_at,id LIMIT 1;
    IF FOUND THEN
      IF v_existing.session_id IS DISTINCT FROM v_session.id
        OR v_existing.name IS DISTINCT FROM p_participant_name
        OR v_existing.role IS DISTINCT FROM p_participant_role THEN
        RAISE EXCEPTION 'participant_identity_conflict' USING ERRCODE='23505';
      END IF;
      v_participant := v_existing;
    ELSE
      INSERT INTO public.interview_participants
        (legacy_id,session_id,name,role,department,participant_type,metadata)
      VALUES (p_participant_legacy_id,v_session.id,p_participant_name,p_participant_role,
        p_participant_role,'RESPONDENT',
        jsonb_build_object('source','VIPAZ_NATIVE','source_role','INTERLOCUTOR_PRINCIPAL',
          'source_type','INSTITUTIONAL_INTERLOCUTOR','institutional_function',p_participant_role))
      RETURNING * INTO v_participant;
    END IF;
  ELSE
    IF EXISTS (SELECT 1 FROM public.interview_participants WHERE session_id=v_session.id) THEN
      RAISE EXCEPTION 'participant_identity_conflict' USING ERRCODE='23505';
    END IF;
  END IF;
  RETURN jsonb_build_object('cycle',to_jsonb(v_cycle),'session',to_jsonb(v_session),
    'participant',CASE WHEN p_participant_name IS NULL THEN NULL ELSE to_jsonb(v_participant) END,
    'created',v_created);
END;
$vipaz_open$;
REVOKE ALL ON FUNCTION public.vipaz_open_cycle_atomic(uuid,text,text,text,text,text,text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.vipaz_open_cycle_atomic(uuid,text,text,text,text,text,text,text,text) TO authenticated;
-- DRAFT risk: no UNIQUE interview_participants.legacy_id in production.
-- Advisory locks only protect callers of this RPC, not external writers.
