-- DRAFT ONLY. Add a confirmed participant to an existing investigation session.
-- Caller must be an authenticated VIPAZ global administrator.
-- Confirmation is an explicit user action, never inferred from pilot contact data.
CREATE OR REPLACE FUNCTION public.vipaz_confirm_investigation_participant(
  p_session_id uuid,
  p_participant_legacy_id text,
  p_participant_name text,
  p_participant_role text,
  p_confirmation_note text
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $vipaz_confirm$
DECLARE
  v_session public.investigation_sessions%ROWTYPE;
  v_existing public.interview_participants%ROWTYPE;
  v_participant public.interview_participants%ROWTYPE;
  v_actor uuid := auth.uid();
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'authentication_required' USING ERRCODE='42501';
  END IF;
  IF NOT vipaz_private.is_global_admin() THEN
    RAISE EXCEPTION 'institutional_write_forbidden' USING ERRCODE='42501';
  END IF;
  IF p_session_id IS NULL
    OR nullif(btrim(p_participant_legacy_id),'') IS NULL
    OR nullif(btrim(p_participant_name),'') IS NULL
    OR nullif(btrim(p_confirmation_note),'') IS NULL THEN
    RAISE EXCEPTION 'explicit_confirmation_required' USING ERRCODE='22023';
  END IF;
  SELECT * INTO v_session FROM public.investigation_sessions WHERE id=p_session_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'session_not_found' USING ERRCODE='22023';
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('participant:' || p_participant_legacy_id,0));
  SELECT * INTO v_existing FROM public.interview_participants
    WHERE legacy_id=p_participant_legacy_id ORDER BY created_at,id LIMIT 1;
  IF FOUND THEN
    IF v_existing.session_id IS DISTINCT FROM p_session_id
      OR v_existing.name IS DISTINCT FROM p_participant_name
      OR v_existing.role IS DISTINCT FROM p_participant_role
      OR v_existing.metadata->>'confirmation_note' IS DISTINCT FROM p_confirmation_note
      OR v_existing.metadata->>'confirmed_by' IS DISTINCT FROM v_actor::text
      OR v_existing.metadata->>'confirmation_status' IS DISTINCT FROM 'CONFIRMED' THEN
      RAISE EXCEPTION 'participant_identity_conflict' USING ERRCODE='23505';
    END IF;
    v_participant := v_existing;
  ELSE
    INSERT INTO public.interview_participants
      (legacy_id,session_id,name,role,participant_type,metadata)
    VALUES (p_participant_legacy_id,p_session_id,p_participant_name,p_participant_role,
      'RESPONDENT',pg_catalog.jsonb_build_object(
        'source','VIPAZ_NATIVE','confirmation_status','CONFIRMED',
        'confirmed_by',v_actor::text,'confirmed_at',pg_catalog.now(),
        'confirmation_note',p_confirmation_note))
    RETURNING * INTO v_participant;
  END IF;
  RETURN pg_catalog.jsonb_build_object('participant',pg_catalog.to_jsonb(v_participant));
END;
$vipaz_confirm$;
REVOKE ALL ON FUNCTION public.vipaz_confirm_investigation_participant(uuid,text,text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.vipaz_confirm_investigation_participant(uuid,text,text,text,text) TO authenticated;
-- DRAFT: legacy_id is not UNIQUE in the live interview_participants table.
-- Advisory lock serializes only cooperating RPC callers.
