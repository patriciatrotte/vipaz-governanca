import type { Request, Response } from 'express';

// Read-only reconciliation of a pending participant operation.
// The caller's JWT and RLS govern visibility; never use service-role credentials.
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control','no-store');
  const token=/^Bearer\s+([^\s]+)$/i.exec(req.headers.authorization||'')?.[1];
  if(!token)return res.status(401).json({error:'authentication_required'});
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'method_not_allowed'});}
  const sessionId=typeof req.query?.sessionId==='string'?req.query.sessionId:'';
  const operationId=typeof req.query?.operationId==='string'?req.query.operationId:'';
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)||
     !/^confirmed-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(operationId)){
    return res.status(400).json({error:'invalid_confirmation_identity'});
  }
  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.VITE_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY;
  if(!url||!key)return res.status(503).json({error:'database_not_configured'});
  try{
    const upstream=await fetch(`${url}/rest/v1/interview_participants?legacy_id=eq.${encodeURIComponent(operationId)}&select=id,legacy_id,session_id,name,role,metadata&limit=2`,{
      headers:{apikey:key,Authorization:`Bearer ${token}`,Accept:'application/json'}
    });
    if(!upstream.ok)return res.status(upstream.status===401?401:upstream.status===403?403:502).json({error:'confirmation_reconciliation_failed'});
    const rows=await upstream.json();
    if(!Array.isArray(rows))return res.status(502).json({error:'confirmation_reconciliation_invalid_response'});
    if(rows.length===0)return res.status(200).json({state:'NOT_FOUND'});
    if(rows.length!==1||rows[0]?.session_id!==sessionId||
       rows[0]?.metadata?.confirmation_status!=='CONFIRMED'){
      return res.status(409).json({error:'confirmation_reconciliation_conflict'});
    }
    return res.status(200).json({state:'CONFIRMED',participant:{
      id:rows[0].id,sessionId:rows[0].session_id,
      name:rows[0].name,role:rows[0].role,
      confirmationNote:rows[0].metadata.confirmation_note,
      confirmedBy:rows[0].metadata.confirmed_by
    }});
  }catch{return res.status(502).json({error:'confirmation_reconciliation_failed'});}
}
