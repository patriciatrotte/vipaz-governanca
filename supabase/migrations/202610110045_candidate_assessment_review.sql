alter table public.assessment_drafts
 add column baseline_reference text,
 add column capability_code text,
 add column proposed_outcome text,
 add column human_review_justification text,
 add column human_reviewed_by uuid references auth.users(id),
 add column human_reviewed_at timestamptz;
alter table public.assessment_drafts add constraint candidate_draft_fields check (
 (baseline_reference is null and capability_code is null and proposed_outcome is null and human_review_justification is null and human_reviewed_by is null and human_reviewed_at is null)
 or (baseline_reference is not null and baseline_reference = 'BASELINE-D1-20261003-v1.0' and capability_code is not null and capability_code in ('D1.1','D1.2','D1.3','D1.4','D1.5','D1.6') and proposed_outcome is not null and proposed_outcome in ('SUFICIENTE','SUFICIENTE_COM_EVOLUCAO_POSSIVEL','SUFICIENTE_COM_COMPROVACAO_PENDENTE','INSUFICIENTE','NAO_CONCLUSIVO') and
 ((human_reviewed_by is null and human_reviewed_at is null and human_review_justification is null)
 or (human_reviewed_by is not null and human_reviewed_by=created_by and human_reviewed_at is not null and human_review_justification is not null and length(btrim(human_review_justification)) between 20 and 12000)))
);
create function public.save_candidate_assessment_draft(p_cycle_id uuid,p_source_unit_ids uuid[],p_analysis_text text,p_capability_code text,p_proposed_outcome text,p_human_reviewed boolean,p_review_justification text)
returns public.assessment_drafts language plpgsql security definer set search_path='' as $$
declare d public.assessment_drafts;
begin
 if p_capability_code is null or p_capability_code not in ('D1.1','D1.2','D1.3','D1.4','D1.5','D1.6')
 or p_proposed_outcome is null or p_proposed_outcome not in ('SUFICIENTE','SUFICIENTE_COM_EVOLUCAO_POSSIVEL','SUFICIENTE_COM_COMPROVACAO_PENDENTE','INSUFICIENTE','NAO_CONCLUSIVO')
 or p_human_reviewed is null then raise exception 'invalid_candidate_assessment' using errcode='22023'; end if;
 if p_human_reviewed and (p_review_justification is null or length(btrim(p_review_justification)) not between 20 and 12000)
 then raise exception 'human_review_justification_required' using errcode='22023'; end if;
 -- This function enforces identity, current authorization and cycle-bound sources.
 select * into d from public.save_assessment_draft(p_cycle_id,p_source_unit_ids,p_analysis_text);
 update public.assessment_drafts set baseline_reference='BASELINE-D1-20261003-v1.0',
 capability_code=p_capability_code,proposed_outcome=p_proposed_outcome,
 human_review_justification=case when p_human_reviewed then btrim(p_review_justification) end,
 human_reviewed_by=case when p_human_reviewed then auth.uid() end,
 human_reviewed_at=case when p_human_reviewed then now() end
 where id=d.id returning * into d;
 return d;
end $$;
revoke all on function public.save_candidate_assessment_draft(uuid,uuid[],text,text,text,boolean,text) from public,anon;
grant execute on function public.save_candidate_assessment_draft(uuid,uuid[],text,text,text,boolean,text) to authenticated;
