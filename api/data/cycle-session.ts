import type { Request, Response } from 'express';

// Read-only canonical session lookup; RLS evaluates the caller's JWT.
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control','no-store');
  const token=/^Bearer\s+([^\s]+)$/i.exec(req.headers.authorization||'')?.[1];
  if(!token)return res.status(401).json({error:'authentication_required'});
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'method_not_allowed'});}
  const cycleId=typeof req.query?.cycleId==='string'?req.query.cycleId:'';
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cycleId)){
    return res.status(400).json({error:'invalid_cycle_id'});
  }
  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.VITE_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY;
  if(!url||!key)return res.status(503).json({error:'database_not_configured'});
  try{
    const upstream=await fetch(`${url}/rest/v1/investigation_sessions?cycle_id=eq.${encodeURIComponent(cycleId)}&select=id,cycle_id,legacy_id,created_at&order=created_at.asc&limit=2`,{
      headers:{apikey:key,Authorization:`Bearer ${token}`,Accept:'application/json'}
    });
    if(!upstream.ok)return res.status(upstream.status===401?401:upstream.status===403?403:502).json({error:'session_lookup_failed'});
    const rows=await upstream.json();
    if(!Array.isArray(rows)||rows.length!==1||rows[0]?.cycle_id!==cycleId){
      return res.status(rows.length===0?404:409).json({error:rows.length===0?'session_not_found':'session_ambiguous'});
    }
    return res.status(200).json({session:rows[0]});
  }catch{return res.status(502).json({error:'session_lookup_failed'});}
}
