import type { VercelRequest,VercelResponse } from '@vercel/node';
export default async function handler(req:VercelRequest,res:VercelResponse){
 const u=process.env.SUPABASE_URL,s=process.env.SUPABASE_SECRET_KEY,a=String(req.headers.authorization||''),t=a.startsWith('Bearer ')?a.slice(7):'';
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'}); if(!u||!s||!t)return res.status(401).json({error:'Sessão obrigatória'});
 const ur=await fetch(`${u}/auth/v1/user`,{headers:{apikey:s,Authorization:`Bearer ${t}`}}); if(!ur.ok)return res.status(401).json({error:'Sessão inválida'});
 const legacy=String(req.query.org||''); if(!legacy)return res.status(400).json({error:'Organização obrigatória'});
 const h={apikey:s,Authorization:`Bearer ${s}`};
 const or=await fetch(`${u}/rest/v1/organizations?select=id,legacy_id,name&legacy_id=eq.${encodeURIComponent(legacy)}&limit=1`,{headers:h}); const os:any=await or.json(); if(!or.ok||!os?.length)return res.status(404).json({error:'Organização não localizada'});
 const cr=await fetch(`${u}/rest/v1/governance_cycles?select=id,legacy_id,status,methodology_version,updated_at&organization_id=eq.${os[0].id}&limit=1`,{headers:h}); const cs:any=await cr.json(); if(!cr.ok||!cs?.length)return res.status(404).json({error:'Ciclo não localizado'});
 const sr=await fetch(`${u}/rest/v1/investigation_sessions?select=id,legacy_id,status&cycle_id=eq.${cs[0].id}`,{headers:h}); const ss:any=await sr.json(); if(!sr.ok)return res.status(502).json({error:'Falha ao ler sessão'});
 const ids=(ss||[]).map((x:any)=>x.id); let qs:any[]=[]; if(ids.length){const qr=await fetch(`${u}/rest/v1/question_instances?select=id,legacy_id,session_id,question_code,question_text_snapshot,status,created_at&session_id=in.(${ids.join(',')})&order=created_at.asc`,{headers:h});qs=await qr.json();if(!qr.ok)return res.status(502).json({error:'Falha ao ler perguntas'});}
 const qids=qs.map((x:any)=>x.id); let rs:any[]=[]; if(qids.length){const rr=await fetch(`${u}/rest/v1/responses?select=id,legacy_id,question_instance_id,response_type,parent_response_id,response_text,source_name,source_role,modality,metadata,created_at&question_instance_id=in.(${qids.join(',')})&order=created_at.asc`,{headers:h});rs=await rr.json();if(!rr.ok)return res.status(502).json({error:'Falha ao ler respostas'});}
 return res.status(200).json({organization:os[0],cycle:cs[0],sessions:ss,questionInstances:qs,responses:rs});
}