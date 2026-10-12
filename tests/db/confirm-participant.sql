-- Disposable PostgreSQL only.
SET vipaz.test_uid = '22222222-2222-4222-8222-222222222222';
SET vipaz.test_admin = 'yes';
DO $checks$
DECLARE
  a jsonb;
  b jsonb;
  sid uuid;
  n integer;
BEGIN
  SELECT id INTO sid FROM public.investigation_sessions WHERE legacy_id='session-no-person';
  IF sid IS NULL THEN RAISE EXCEPTION 'missing session fixture'; END IF;
  BEGIN
    PERFORM public.vipaz_confirm_investigation_participant(sid,'confirmed-1','Pessoa','Gestão',NULL);
    RAISE EXCEPTION 'missing confirmation accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL;
  END;
  a := public.vipaz_confirm_investigation_participant(sid,'confirmed-1','Pessoa','Gestão','Confirmado em atendimento');
  b := public.vipaz_confirm_investigation_participant(sid,'confirmed-1','Pessoa','Gestão','Confirmado em atendimento');
  IF a->'participant'->>'id' IS DISTINCT FROM b->'participant'->>'id'
    OR a->'participant'->'metadata'->>'confirmed_by' IS DISTINCT FROM
       '22222222-2222-4222-8222-222222222222' THEN
    RAISE EXCEPTION 'confirmation audit or retry failed';
  END IF;
  SELECT count(*) INTO n FROM public.interview_participants WHERE legacy_id='confirmed-1';
  IF n<>1 THEN RAISE EXCEPTION 'confirmation duplicate'; END IF;
  BEGIN
    PERFORM public.vipaz_confirm_investigation_participant(sid,'confirmed-1','Outra Pessoa','Gestão','Confirmado em atendimento');
    RAISE EXCEPTION 'conflicting confirmation accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
END $checks$;
SET vipaz.test_admin = 'no';
DO $checks$
DECLARE sid uuid;
BEGIN
  SELECT id INTO sid FROM public.investigation_sessions WHERE legacy_id='session-no-person';
  BEGIN
    PERFORM public.vipaz_confirm_investigation_participant(sid,'denied','Pessoa','Gestão','Confirmado');
    RAISE EXCEPTION 'non-admin confirmation accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $checks$;
SET vipaz.test_admin = 'yes';
SET vipaz.test_uid = '';
DO $checks$
DECLARE sid uuid;
BEGIN
  SELECT id INTO sid FROM public.investigation_sessions WHERE legacy_id='session-no-person';
  BEGIN
    PERFORM public.vipaz_confirm_investigation_participant(sid,'anonymous','Pessoa','Gestão','Confirmado');
    RAISE EXCEPTION 'anonymous confirmation accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $checks$;
