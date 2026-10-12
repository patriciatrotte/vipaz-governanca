-- This runs only on the disposable GitHub Actions PostgreSQL service.
SET vipaz.test_uid = '22222222-2222-4222-8222-222222222222';
SET vipaz.test_admin = 'yes';
DO $$
DECLARE
 a jsonb;
 b jsonb;
 c int;
BEGIN
 a := public.vipaz_create_investigation_atomic(
 '11111111-1111-4111-8111-111111111111','s-1','Facilitador','p-1','Pessoa','Responsavel');
 b := public.vipaz_create_investigation_atomic(
 '11111111-1111-4111-8111-111111111111','s-1','Facilitador','p-1','Pessoa','Responsavel');
 IF (a->'session'->>'id') IS DISTINCT FROM (b->'session'->>'id')
    OR (a->'participant'->>'id') IS DISTINCT FROM (b->'participant'->>'id')
    OR b->>'created' IS DISTINCT FROM 'false' THEN
   RAISE EXCEPTION 'retry is not idempotent';
 END IF;
 SELECT count(*) INTO c FROM public.investigation_sessions WHERE legacy_id='s-1';
 IF c <> 1 THEN RAISE EXCEPTION 'duplicate session'; END IF;
 SELECT count(*) INTO c FROM public.interview_participants WHERE legacy_id='p-1';
 IF c <> 1 THEN RAISE EXCEPTION 'duplicate participant'; END IF;
 BEGIN
   PERFORM public.vipaz_create_investigation_atomic(
    '11111111-1111-4111-8111-111111111111','s-rollback','Facilitador','p-1','Pessoa','Responsavel');
   RAISE EXCEPTION 'expected participant conflict';
 EXCEPTION WHEN unique_violation THEN NULL;
 END;
 SELECT count(*) INTO c FROM public.investigation_sessions WHERE legacy_id='s-rollback';
 IF c <> 0 THEN RAISE EXCEPTION 'partial session persisted after conflict'; END IF;
 BEGIN
   PERFORM public.vipaz_create_investigation_atomic(
    '11111111-1111-4111-8111-111111111111','s-1','Outro','p-1','Pessoa','Responsavel');
   RAISE EXCEPTION 'expected session conflict';
 EXCEPTION WHEN unique_violation THEN NULL;
 END;
END $$;
SET vipaz.test_admin = 'no';
DO $$
BEGIN
 BEGIN
   PERFORM public.vipaz_create_investigation_atomic(
    '11111111-1111-4111-8111-111111111111','s-denied','Facilitador');
   RAISE EXCEPTION 'expected authorization failure';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $$;
SELECT 'VIPAZ disposable DB integration checks passed' AS result;
