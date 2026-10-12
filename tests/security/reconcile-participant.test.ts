import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../../api/data/reconcile-participant';
const SESSION='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const OP='confirmed-bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
function response(){let status=200,body:any;return {res:{setHeader(){return this;},status(n:number){status=n;return this;},json(x:any){body=x;return this;}},status:()=>status,body:()=>body};}
async function environment(run:()=>Promise<void>){
 const fetchBefore=globalThis.fetch,url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
 process.env.SUPABASE_URL='https://example.invalid';process.env.SUPABASE_PUBLISHABLE_KEY='public-key';
 try{await run();}finally{
  globalThis.fetch=fetchBefore;
  if(url===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=url;
  if(key===undefined)delete process.env.SUPABASE_PUBLISHABLE_KEY;else process.env.SUPABASE_PUBLISHABLE_KEY=key;
 }
}
const req=(token=true)=>({method:'GET',headers:token?{authorization:'Bearer jwt'}:{},query:{sessionId:SESSION,operationId:OP}} as any);
test('reconciliation rejects anonymous before network',async()=>environment(async()=>{
 let calls=0;globalThis.fetch=(async()=>{calls++;throw Error('unexpected');}) as typeof fetch;
 const r=response();await handler(req(false),r.res as any);assert.equal(r.status(),401);assert.equal(calls,0);
}));
test('reconciliation uses JWT and returns only confirmed matching session',async()=>environment(async()=>{
 globalThis.fetch=(async(url:string|URL|Request,init?:RequestInit)=>{
  assert.equal((init?.headers as Record<string,string>).Authorization,'Bearer jwt');
  if(String(url).includes('/global_user_roles?'))return new Response('[{"role_code":"ADMIN_VIPAZ"}]',{status:200});
  return new Response(JSON.stringify([{id:SESSION,legacy_id:OP,session_id:SESSION,name:'Pessoa',role:null,
   metadata:{confirmation_status:'CONFIRMED',confirmation_note:'Verificado',confirmed_by:'user'}}]),{status:200});
 }) as typeof fetch;
 const r=response();await handler(req(),r.res as any);assert.equal(r.status(),200);assert.equal(r.body().state,'CONFIRMED');
}));
test('reconciliation refuses ambiguous or mismatched operation',async()=>environment(async()=>{
 for(const rows of [
  [{id:SESSION,session_id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',metadata:{confirmation_status:'CONFIRMED'}}],
  [{id:SESSION,session_id:SESSION,metadata:{confirmation_status:'UNVERIFIED'}}],
  [{id:SESSION,session_id:SESSION,metadata:{confirmation_status:'CONFIRMED'}},{id:SESSION,session_id:SESSION,metadata:{confirmation_status:'CONFIRMED'}}]
 ]){
  globalThis.fetch=(async(url:string|URL|Request)=>new Response(String(url).includes('/global_user_roles?')?'[{"role_code":"ADMIN_VIPAZ"}]':JSON.stringify(rows),{status:200})) as typeof fetch;
  const r=response();await handler(req(),r.res as any);assert.equal(r.status(),409);
 }
}));
test('reconciliation returns NOT_FOUND for empty result but never for denied access',async()=>environment(async()=>{
 globalThis.fetch=(async(url:string|URL|Request)=>new Response(String(url).includes('/global_user_roles?')?'[{"role_code":"ADMIN_VIPAZ"}]':'[]',{status:200})) as typeof fetch;
 const absent=response();await handler(req(),absent.res as any);assert.equal(absent.body().state,'NOT_FOUND');
 globalThis.fetch=(async()=>new Response('{"message":"private"}',{status:403})) as typeof fetch;
 const denied=response();await handler(req(),denied.res as any);assert.equal(denied.status(),403);
 assert.equal(denied.body().state,undefined);
}));

test('non-admin with session SELECT privilege cannot read confirmation details',async()=>environment(async()=>{
 let participantReads=0;
 globalThis.fetch=(async(url:string|URL|Request)=>{
  if(String(url).includes('/global_user_roles?'))return new Response('[]',{status:200});
  participantReads++;
  throw Error('participant details must not be fetched');
 }) as typeof fetch;
 const r=response();await handler(req(),r.res as any);
 assert.equal(r.status(),403);assert.equal(participantReads,0);
}));
test('role lookup failure blocks reconciliation before participant query',async()=>environment(async()=>{
 let participantReads=0;
 globalThis.fetch=(async(url:string|URL|Request)=>{
  if(String(url).includes('/global_user_roles?'))return new Response('{}',{status:502});
  participantReads++;throw Error('unexpected participant query');
 }) as typeof fetch;
 const r=response();await handler(req(),r.res as any);
 assert.equal(r.status(),502);assert.equal(participantReads,0);
}));
