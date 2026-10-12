-- Disposable PostgreSQL only: exercise whole-operation rollback and retries.
SET vipaz.test_uid = '22222222-2222-4222-8222-222222222222';
SET vipaz.test_admin = 'yes';
DO $checks$
DECLARE a jsonb; b jsonb; n integer;
BEGIN
  a := public.vipaz_open_cycle_atomic('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'cycle-open-1','Ciclo Inicial','1.0','session-open-1','Facilitador',
    'participant-open-1','Interlocutor','Gestor');
  b := public.vipaz_open_cycle_atomic('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'cycle-open-1','Ciclo Inicial','1.0','session-open-1','Facilitador',
    'participant-open-1','Interlocutor','Gestor');
  IF a->'cycle'->>'id' IS DISTINCT FROM b->'cycle'->>'id'
    OR a->'session'->>'id' IS DISTINCT FROM b->'session'->>'id'
    OR a->'participant'->>'id' IS DISTINCT FROM b->'participant'->>'id'
    OR b->>'created' IS DISTINCT FROM 'false' THEN
    RAISE EXCEPTION 'whole-operation retry failed';
  END IF;
  UPDATE public.governance_cycles
    SET status='IN_PROGRESS',metadata=metadata || '{"progress_marker":"retained"}'::jsonb
    WHERE legacy_id='cycle-open-1';
  b := public.vipaz_open_cycle_atomic('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'cycle-open-1','Ciclo Inicial','1.0','session-open-1','Facilitador',
    'participant-open-1','Interlocutor','Gestor');
  IF b->'cycle'->>'status' IS DISTINCT FROM 'IN_PROGRESS'
    OR b->'cycle'->'metadata'->>'progress_marker' IS DISTINCT FROM 'retained' THEN
    RAISE EXCEPTION 'retry changed existing cycle progress';
  END IF;
  BEGIN
    PERFORM public.vipaz_open_cycle_atomic('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'cycle-open-1','Changed','1.0','session-open-1','Facilitador',
      'participant-open-1','Interlocutor','Gestor');
    RAISE EXCEPTION 'divergent retry accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  BEGIN
    PERFORM public.vipaz_open_cycle_atomic('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      'cycle-open-1','Ciclo Inicial','1.0','session-open-1','Facilitador',
      'participant-open-1','Interlocutor','Gestor');
    RAISE EXCEPTION 'cross-org reuse accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  BEGIN
    PERFORM public.vipaz_open_cycle_atomic('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'cycle-rollback','Ciclo Inicial','1.0','session-rollback','Facilitador',
      'participant-open-1','Interlocutor','Gestor');
    RAISE EXCEPTION 'participant collision accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  SELECT count(*) INTO n FROM public.governance_cycles WHERE legacy_id='cycle-rollback';
  IF n<>0 THEN RAISE EXCEPTION 'partial cycle persisted'; END IF;
  SELECT count(*) INTO n FROM public.investigation_sessions WHERE legacy_id='session-rollback';
  IF n<>0 THEN RAISE EXCEPTION 'partial session persisted'; END IF;
  a := public.vipaz_open_cycle_atomic('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'cycle-no-person','Ciclo Sem Interlocutor','1.0','session-no-person','Facilitador');
  IF a->'participant' <> 'null'::jsonb THEN RAISE EXCEPTION 'unexpected participant'; END IF;
  INSERT INTO public.interview_participants(legacy_id,session_id,name,participant_type)
  VALUES ('later-confirmed', (a->'session'->>'id')::uuid,'Confirmed later','RESPONDENT');
  b := public.vipaz_open_cycle_atomic('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'cycle-no-person','Ciclo Sem Interlocutor','1.0','session-no-person','Facilitador');
  IF b->'session'->>'id' IS DISTINCT FROM a->'session'->>'id'
     OR b->'participant' <> 'null'::jsonb THEN
    RAISE EXCEPTION 'participant-free retry changed confirmed session';
  END IF;
END $checks$;
SET vipaz.test_admin = 'no';
DO $checks$
BEGIN
  BEGIN
    PERFORM public.vipaz_open_cycle_atomic('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'cycle-denied','Denied','1.0','session-denied','Facilitador');
    RAISE EXCEPTION 'non-admin accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $checks$;
SET ROLE anon;
DO $checks$
BEGIN
  BEGIN
    PERFORM public.vipaz_open_cycle_atomic('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'cycle-anon','Denied','1.0','session-anon','Facilitador');
    RAISE EXCEPTION 'anon accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $checks$;
RESET ROLE;
SELECT 'Whole-cycle disposable integration checks passed' AS result;
