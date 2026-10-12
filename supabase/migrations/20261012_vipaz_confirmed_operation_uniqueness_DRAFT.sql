-- DRAFT ONLY: inspect production duplicates and index names before applying.
-- Guarantees uniqueness for NEW native confirmation operation IDs, without
-- imposing uniqueness on historical legacy IDs of unrelated sources.
-- Must be reviewed and approved separately from the RPC migrations.
DO $vipaz_preflight$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.interview_participants
    WHERE legacy_id ~ '^confirmed-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    GROUP BY legacy_id HAVING count(*)>1
  ) THEN
    RAISE EXCEPTION 'duplicate_confirmed_operation_ids_prevent_unique_index';
  END IF;
END;
$vipaz_preflight$;

CREATE UNIQUE INDEX IF NOT EXISTS vipaz_confirmed_participant_operation_unique
ON public.interview_participants (legacy_id)
WHERE legacy_id ~ '^confirmed-[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

-- No index or table change is authorized in production by this draft.
