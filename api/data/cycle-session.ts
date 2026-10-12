import type { Request, Response } from 'express';

// Read-only canonical session lookup; RLS evaluates the caller's JWT.
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control','no-store');
  const token=/^Bearer\s+([^\s]+)$/i.exec(req.headers.authorization||'')?.[1];
  if(!token)return res.status(401).json({error:'authentication_required'});
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'method_not_allowed'});}
  const cycleId=typeof req.query?.cycleId==='string'?req.query.cycleId:'';
  const sessionLegacyId=typeof req.query?.sessionLegacyId==='string'?req.query.sessionLegacyId:'';
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cycleId)){
    return res.status(400).json({error:'invalid_cycle_id'});
  }
  if(sessionLegacyId && (!/^session-d1-[0-9a-f-]{36}$/i.test(sessionLegacyId)||sessionLegacyId.length>64)){
    return res.status(400).json({error:'invalid_session_identity'});
  }
  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.VITE_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY;
  if(!url||!key)return res.status(503).json({error:'database_not_configured'});
  try{
    const filters=`cycle_id=eq.${encodeURIComponent(cycleId)}`+(sessionLegacyId?`&legacy_id=eq.${encodeURIComponent(sessionLegacyId)}`:'');
    const upstream=await fetch(`${url}/rest/v1/investigation_sessions?${filters}&select=id,cycle_id,legacy_id,created_at&order=created_at.asc&limit=2`,{
      headers:{apikey:key,Authorization:`Bearer ${token}`,Accept:'application/json'}
    });
    if(!upstream.ok)return res.status(upstream.status===401?401:upstream.status===403?403:502).json({error:'session_lookup_failed'});
    const rows=await upstream.json();
    if(!Array.isArray(rows))return res.status(502).json({error:'session_lookup_invalid_response'});
    if(rows.length===0)return res.status(404).json({error:'session_not_found'});
    if(rows.length!==1||rows[0]?.cycle_id!==cycleId||(sessionLegacyId&&rows[0]?.legacy_id!==sessionLegacyId)||
       typeof rows[0]?.id!=='string'||
       !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rows[0].id)){
      return res.status(409).json({error:'session_ambiguous'});
    }
    return res.status(200).json({session:rows[0]});
  }catch{return res.status(502).json({error:'session_lookup_failed'});}
}
