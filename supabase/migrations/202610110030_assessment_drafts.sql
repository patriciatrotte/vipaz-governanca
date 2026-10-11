-- Append-only analysis notes: never criterion/capability results or maturity.
create table public.assessment_drafts (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.governance_cycles(id),
  methodology_code text not null,
  methodology_version text not null,
  source_unit_ids uuid[] not null check (cardinality(source_unit_ids) between 1 and 100),
  analysis_text text not null check (length(btrim(analysis_text)) between 20 and 12000),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  status text not null default 'DRAFT' check (status = 'DRAFT')
);
alter table public.assessment_drafts enable row level security;
create policy assessment_drafts_read on public.assessment_drafts for select to authenticated
using (vipaz_private.can_access_cycle(cycle_id));
grant select on public.assessment_drafts to authenticated;
revoke insert, update, delete on public.assessment_drafts from anon, authenticated;
create function public.save_assessment_draft(p_cycle_id uuid, p_source_unit_ids uuid[], p_analysis_text text)
returns public.assessment_drafts language plpgsql security definer set search_path = '' as $$
declare c public.governance_cycles; d public.assessment_drafts; u uuid := auth.uid();
begin
  if u is null then raise exception 'authentication_required' using errcode='42501'; end if;
  select * into c from public.governance_cycles where id=p_cycle_id;
  if c.id is null then raise exception 'cycle_not_found' using errcode='42501'; end if;
  if not (
    exists(select 1 from public.global_user_roles r where r.user_id=u and r.role_code='ADMIN_VIPAZ' and r.status='ACTIVE' and r.revoked_at is null and r.valid_from<=now() and (r.valid_until is null or r.valid_until>now()))
    or exists(select 1 from public.organization_memberships m where m.user_id=u and m.organization_id=c.organization_id and m.role_code='FACILITADOR' and m.status='ACTIVE' and m.revoked_at is null and m.valid_from<=now() and (m.valid_until is null or m.valid_until>now()))
  ) then raise exception 'methodological_write_denied' using errcode='42501'; end if;
  if p_source_unit_ids is null or cardinality(p_source_unit_ids) not between 1 and 100
    or exists(select 1 from unnest(p_source_unit_ids) x where x is null)
    or (select count(distinct x) from unnest(p_source_unit_ids) x) <> cardinality(p_source_unit_ids)
    or (select count(*) from public.information_units i where i.id=any(p_source_unit_ids) and i.cycle_id=c.id) <> cardinality(p_source_unit_ids)
  then raise exception 'invalid_cycle_sources' using errcode='22023'; end if;
  if p_analysis_text is null or length(btrim(p_analysis_text)) not between 20 and 12000
  then raise exception 'invalid_analysis_text' using errcode='22023'; end if;
  insert into public.assessment_drafts(cycle_id,methodology_code,methodology_version,source_unit_ids,analysis_text,created_by)
  values(c.id,c.methodology_code,c.methodology_version,p_source_unit_ids,btrim(p_analysis_text),u) returning * into d;
  return d;
end $$;
revoke all on function public.save_assessment_draft(uuid,uuid[],text) from public, anon;
grant execute on function public.save_assessment_draft(uuid,uuid[],text) to authenticated;
