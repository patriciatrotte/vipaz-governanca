-- Isolated CI fixture. NEVER run against a VIPAZ or Supabase production database.
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE anon NOLOGIN;
CREATE SCHEMA auth;
CREATE SCHEMA vipaz_private;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
$$ SELECT nullif(current_setting('vipaz.test_uid', true), '')::uuid $$;
CREATE FUNCTION vipaz_private.is_global_admin() RETURNS boolean LANGUAGE sql STABLE AS
$$ SELECT current_setting('vipaz.test_admin', true) = 'yes' $$;
CREATE TABLE public.governance_cycles (id uuid PRIMARY KEY);
CREATE TABLE public.investigation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id text UNIQUE,
  cycle_id uuid NOT NULL REFERENCES public.governance_cycles(id),
  modality text NOT NULL DEFAULT 'FACILITATED',
  facilitator_name text,
  started_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.interview_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id text,
  session_id uuid NOT NULL REFERENCES public.investigation_sessions(id),
  name text NOT NULL,
  role text,
  department text,
  participant_type text NOT NULL DEFAULT 'RESPONDENT',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.governance_cycles(id) VALUES ('11111111-1111-4111-8111-111111111111');
