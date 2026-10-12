-- Disposable PostgreSQL only. Synthetic authorization contract tests, NOT production RLS verification.
-- Run with psql -v ON_ERROR_STOP=1 against GitHub Actions isolated database.
CREATE TABLE public.vipaz_test_organizations(id text PRIMARY KEY);
CREATE TABLE public.vipaz_test_memberships(
 user_id uuid NOT NULL, organization_id text NOT NULL REFERENCES public.vipaz_test_organizations(id),
 role_code text NOT NULL, status text NOT NULL,
 valid_from timestamptz NOT NULL, valid_until timestamptz, revoked_at timestamptz
);
CREATE TABLE public.vipaz_test_partner_memberships(
 user_id uuid NOT NULL, partner_id text NOT NULL, role_code text NOT NULL,
 status text NOT NULL, valid_from timestamptz NOT NULL, valid_until timestamptz, revoked_at timestamptz
);
CREATE TABLE public.vipaz_test_partner_links(
 partner_id text NOT NULL, organization_id text NOT NULL REFERENCES public.vipaz_test_organizations(id),
 status text NOT NULL, valid_from timestamptz NOT NULL, valid_until timestamptz
);
INSERT INTO public.vipaz_test_organizations VALUES ('A'),('B'),('C');
INSERT INTO public.vipaz_test_memberships VALUES
('22222222-2222-4222-8222-222222222222','A','GESTOR_TEST','ACTIVE',now()-interval '1 day',NULL,NULL),
('22222222-2222-4222-8222-222222222222','C','GESTOR_TEST','INACTIVE',now()-interval '1 day',NULL,now());
INSERT INTO public.vipaz_test_partner_memberships VALUES
('33333333-3333-4333-8333-333333333333','P','PARTNER_OPERATOR','ACTIVE',now()-interval '1 day',NULL,NULL);
INSERT INTO public.vipaz_test_partner_links VALUES
('P','A','ACTIVE',now()-interval '1 day',NULL),
('P','B','ACTIVE',now()-interval '1 day',NULL),
('P','C','SUSPENDED',now()-interval '1 day',NULL);
CREATE FUNCTION public.vipaz_test_visible(p_org text) RETURNS boolean
LANGUAGE sql STABLE AS $$
 SELECT COALESCE(current_setting('vipaz.test_admin',true),'no')='yes'
 OR EXISTS (
 SELECT 1 FROM public.vipaz_test_memberships m
 WHERE m.organization_id=p_org AND m.user_id=auth.uid()
 AND m.status='ACTIVE' AND m.revoked_at IS NULL
 AND m.valid_from<=now() AND (m.valid_until IS NULL OR m.valid_until>now())
 )
 OR EXISTS (
 SELECT 1 FROM public.vipaz_test_partner_memberships m
 JOIN public.vipaz_test_partner_links l ON l.partner_id=m.partner_id
 WHERE l.organization_id=p_org AND m.user_id=auth.uid()
 AND m.role_code IN ('PARTNER_ADMIN','PARTNER_OPERATOR','PARTNER_VIEWER')
 AND m.status='ACTIVE' AND m.revoked_at IS NULL
 AND m.valid_from<=now() AND (m.valid_until IS NULL OR m.valid_until>now())
 AND l.status='ACTIVE' AND l.valid_from<=now() AND (l.valid_until IS NULL OR l.valid_until>now())
 );
$$;
ALTER TABLE public.vipaz_test_organizations ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.vipaz_test_organizations TO authenticated;
CREATE POLICY vipaz_test_read ON public.vipaz_test_organizations FOR SELECT TO authenticated
USING (public.vipaz_test_visible(id));
-- Ownership bypass must be prevented in the test harness.
ALTER TABLE public.vipaz_test_organizations FORCE ROW LEVEL SECURITY;
SET ROLE authenticated;
SET vipaz.test_admin='no';
SET vipaz.test_uid='22222222-2222-4222-8222-222222222222';
DO $$ DECLARE found text; BEGIN
 SELECT string_agg(id,',' ORDER BY id) INTO found FROM public.vipaz_test_organizations;
 IF found IS DISTINCT FROM 'A' THEN RAISE EXCEPTION 'institutional manager isolation failed: %',found; END IF;
END $$;
SET vipaz.test_uid='33333333-3333-4333-8333-333333333333';
DO $$ DECLARE found text; BEGIN
 SELECT string_agg(id,',' ORDER BY id) INTO found FROM public.vipaz_test_organizations;
 IF found IS DISTINCT FROM 'A,B' THEN RAISE EXCEPTION 'partner portfolio isolation failed: %',found; END IF;
END $$;
SET vipaz.test_uid='44444444-4444-4444-8444-444444444444';
DO $$ DECLARE n integer; BEGIN
 SELECT count(*) INTO n FROM public.vipaz_test_organizations;
 IF n<>0 THEN RAISE EXCEPTION 'unassigned user saw organizations'; END IF;
END $$;
SET vipaz.test_admin='yes';
DO $$ DECLARE n integer; BEGIN
 SELECT count(*) INTO n FROM public.vipaz_test_organizations;
 IF n<>3 THEN RAISE EXCEPTION 'admin scope failed'; END IF;
END $$;
RESET ROLE;
SELECT 'Synthetic organization/partner RLS scenarios passed' AS result;
