-- Disposable PostgreSQL only: partial unique index must prevent duplicate
-- native confirmation IDs while preserving historical non-native identifiers.
DO $checks$
DECLARE sid uuid;
BEGIN
  SELECT id INTO sid FROM public.investigation_sessions WHERE legacy_id='session-no-person';
  IF sid IS NULL THEN RAISE EXCEPTION 'missing session fixture'; END IF;
  BEGIN
    INSERT INTO public.interview_participants(legacy_id,session_id,name)
    VALUES ('confirmed-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',sid,'Duplicated');
    RAISE EXCEPTION 'unique native confirmation operation not enforced';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  INSERT INTO public.interview_participants(legacy_id,session_id,name)
  VALUES ('historical-unconstrained-id',sid,'Historical A'),
         ('historical-unconstrained-id',sid,'Historical B');
  IF (SELECT count(*) FROM public.interview_participants
      WHERE legacy_id='historical-unconstrained-id') <> 2 THEN
    RAISE EXCEPTION 'historical identifiers were unexpectedly constrained';
  END IF;
END $checks$;
