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

-- Confirm actual database privileges rather than only simulated admin flags.
DO $$
DECLARE fn regprocedure := 'public.vipaz_create_investigation_atomic(uuid,text,text,text,text,text)'::regprocedure;
BEGIN
 IF NOT has_function_privilege('authenticated', fn, 'EXECUTE') THEN
   RAISE EXCEPTION 'authenticated execute grant missing';
 END IF;
 IF has_function_privilege('anon', fn, 'EXECUTE') THEN
   RAISE EXCEPTION 'anon execute privilege unexpected';
 END IF;
END $$;
SET ROLE anon;
DO $$
BEGIN
 BEGIN
   PERFORM public.vipaz_create_investigation_atomic(
     '11111111-1111-4111-8111-111111111111','anon-attempt','Facilitador');
   RAISE EXCEPTION 'anon unexpectedly succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $$;
RESET ROLE;
SET vipaz.test_admin = 'yes';
SET ROLE authenticated;
DO $$
DECLARE response jsonb;
BEGIN
 response := public.vipaz_create_investigation_atomic(
   '11111111-1111-4111-8111-111111111111','role-success','Facilitador');
 IF response->'session'->>'legacy_id' IS DISTINCT FROM 'role-success' THEN
   RAISE EXCEPTION 'authenticated role result unexpected';
 END IF;
END $$;
RESET ROLE;
SET vipaz.test_admin = 'no';
SET ROLE authenticated;
DO $$
BEGIN
 BEGIN
   PERFORM public.vipaz_create_investigation_atomic(
     '11111111-1111-4111-8111-111111111111','role-denied','Facilitador');
   RAISE EXCEPTION 'non-admin unexpectedly succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $$;
RESET ROLE;
