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
  PERFORM public.vipaz_confirm_investigation_participant(
    sid,'confirmed-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Primeira Pessoa','Gestão','Presença verificada');
  a := public.vipaz_confirm_investigation_participant(
    sid,'confirmed-bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'Segunda Pessoa','Jurídico','Participação verificada');
  -- Simulate lost HTTP response: repeat the second write with identical fields.
  b := public.vipaz_confirm_investigation_participant(
    sid,'confirmed-bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'Segunda Pessoa','Jurídico','Participação verificada');
  IF a->'participant'->>'id' IS DISTINCT FROM b->'participant'->>'id' THEN
    RAISE EXCEPTION 'second participant retry created a duplicate';
  END IF;
  SELECT count(*) INTO n FROM public.interview_participants
    WHERE session_id=sid AND legacy_id IN (
      'confirmed-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'confirmed-bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
  IF n<>2 THEN RAISE EXCEPTION 'two participants not preserved'; END IF;
  BEGIN
    PERFORM public.vipaz_confirm_investigation_participant(
      sid,'confirmed-bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      'Pessoa Divergente','Jurídico','Participação verificada');
    RAISE EXCEPTION 'conflicting second participant accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  SELECT count(*) INTO n FROM public.interview_participants
    WHERE session_id=sid AND legacy_id IN (
      'confirmed-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'confirmed-bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
  IF n<>2 THEN RAISE EXCEPTION 'conflict altered participant count'; END IF;
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
