import type { Request, Response } from 'express';
import { getScopedReadHeaders } from '../_lib/scopedRead.js';
import { AccessError } from '../_lib/cycleAccess.js';
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET','POST'].includes(req.method || '')) return res.status(405).json({error:'method_not_allowed'});
  const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return res.status(503).json({error:'persistence_unavailable'});
  try {
    const headers = await getScopedReadHeaders(req,url,key);
    const cycleId = req.method === 'GET' ? req.query.cycleId : req.body?.cycleId;
    if (typeof cycleId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cycleId)) return res.status(400).json({error:'invalid_cycle'});
    if (req.method === 'POST') {
      const structured = req.body.capabilityCode !== undefined;
      const payload: Record<string, unknown> = {p_cycle_id:cycleId,p_source_unit_ids:req.body.sourceUnitIds,p_analysis_text:req.body.analysisText};
      if (structured) {
        if (typeof req.body.humanReviewed !== 'boolean') return res.status(400).json({error:'invalid_human_review'});
        Object.assign(payload,{p_capability_code:req.body.capabilityCode,p_proposed_outcome:req.body.proposedOutcome,p_human_reviewed:req.body.humanReviewed,p_review_justification:req.body.reviewJustification || null});
      }
      const response = await fetch(`${url}/rest/v1/rpc/${structured?'save_candidate_assessment_draft':'save_assessment_draft'}`, {
        method:'POST',headers:{...headers,'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      });
      if (!response.ok) return res.status(response.status===403?403:400).json({error:'draft_not_saved'});
      return res.status(201).json({draft:await response.json()});
    }
    const filter = `cycle_id=eq.${encodeURIComponent(cycleId)}`;
    const responses = await Promise.all([
      fetch(`${url}/rest/v1/assessment_drafts?${filter}&select=*&order=created_at.desc&limit=100`,{headers}),
      fetch(`${url}/rest/v1/information_units?${filter}&select=id,statement,capacity_code,validation_status&order=created_at.asc&limit=1000`,{headers})
    ]);
    if (responses.some(r=>!r.ok)) return res.status(502).json({error:'draft_read_unavailable'});
    return res.status(200).json({drafts:await responses[0].json(),sources:await responses[1].json()});
  } catch(error) {
    if(error instanceof AccessError) return res.status(error.status).json({error:error.code});
    return res.status(502).json({error:'draft_persistence_unavailable'});
  }
}
