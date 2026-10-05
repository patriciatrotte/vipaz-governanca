import type { VercelRequest, VercelResponse } from '@vercel/node';
export default async function handler(req: VercelRequest, res: VercelResponse) {
 const u=process.env.SUPABASE_URL,s=process.env.SUPABASE_SECRET_KEY,a=String(req.headers.authorization||''),t=a.startsWith('Bearer ')?a.slice(7):'';
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!u||!s)return res.status(503).json({error:'Autenticação do servidor não configurada.'}); if(!t)return res.status(401).json({error:'Sessão autenticada obrigatória.'});
 try{
  const ur=await fetch(`${u}/auth/v1/user`,{headers:{apikey:s,Authorization:`Bearer ${t}`}}),user:any=await ur.json(); if(!ur.ok||!user?.id)return res.status(401).json({error:'Sessão inválida ou expirada.'});
  const h={apikey:s};
  const rr=await fetch(`${u}/rest/v1/global_user_roles?select=id&user_id=eq.${encodeURIComponent(user.id)}&role_code=eq.ADMIN_VIPAZ&status=eq.ACTIVE&limit=1`,{headers:h}),roles:any=await rr.json(); if(!rr.ok||!Array.isArray(roles)||!roles.length)return res.status(403).json({error:'Autorização ADMIN_VIPAZ ativa não localizada.'});
  const pr=await fetch(`${u}/rest/v1/profiles?select=metadata,status&user_id=eq.${encodeURIComponent(user.id)}&limit=1`,{headers:h}),profiles:any=await pr.json(); if(!pr.ok||!Array.isArray(profiles)||!profiles.length||profiles[0].status!=='ACTIVE')return res.status(403).json({error:'Perfil VIPAZ ativo não localizado.'});
  const metadata={...(profiles[0].metadata||{}),must_change_password:false};
  const up=await fetch(`${u}/rest/v1/profiles?user_id=eq.${encodeURIComponent(user.id)}`,{method:'PATCH',headers:{...h,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({metadata})}); if(!up.ok)return res.status(502).json({error:'Não foi possível atualizar o perfil VIPAZ.'});
  return res.status(200).json({ok:true});
 }catch(e){console.error('complete-password-change',e);return res.status(500).json({error:'Não foi possível concluir a liberação do perfil.'});}
}