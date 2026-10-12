import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../../api/data/interview-record';

const CYCLE='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const SESSION='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
function request(sessionId: unknown=SESSION) {
  return {method:'POST',headers:{authorization:'Bearer test-jwt'},body:{
    cycleId:CYCLE,sessionId,doorId:'D1.2',questionLegacyId:'question-1',
    responseLegacyId:'response-1',questionText:'Pergunta',responseText:'Resposta'
  }} as any;
}
function response(){
  let status=200;let body:any;
  return {res:{setHeader(){return this;},status(n:number){status=n;return this;},json(v:any){body=v;return this;}},status:()=>status,body:()=>body};
}
async function environment(run:()=>Promise<void>){
  const previousFetch=globalThis.fetch;
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
  process.env.SUPABASE_URL='https://example.invalid';
  process.env.SUPABASE_PUBLISHABLE_KEY='public-key';
  try{await run();}finally{
    globalThis.fetch=previousFetch;
    if(url===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=url;
    if(key===undefined)delete process.env.SUPABASE_PUBLISHABLE_KEY;else process.env.SUPABASE_PUBLISHABLE_KEY=key;
  }
}
test('interview rejects absent or invalid session identity without network',async()=>environment(async()=>{
  let calls=0;
  globalThis.fetch=(async()=>{calls++;throw Error('unexpected');}) as typeof fetch;
  for(const id of [undefined,'legacy-session','']){
    const r=response();await handler(request(id),r.res as any);
    assert.equal(r.status(),400);
  }
  assert.equal(calls,0);
}));
test('interview rejects missing or mismatched session without creating a session',async()=>environment(async()=>{
  for(const rows of [[],[{id:SESSION,cycle_id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc'}],
    [{id:SESSION,cycle_id:CYCLE},{id:SESSION,cycle_id:CYCLE}]]){
    const calls:string[]=[];
    globalThis.fetch=(async(url:string|URL|Request,init?:RequestInit)=>{
      calls.push((init?.method||'GET')+' '+String(url));
      return new Response(JSON.stringify(rows),{status:200});
    }) as typeof fetch;
    const r=response();await handler(request(),r.res as any);
    assert.equal(r.status(),409);
    assert.equal(calls.length,1);
    assert.match(calls[0],/investigation_sessions/);
    assert.match(calls[0],/id=eq/);
    assert.match(calls[0],/cycle_id=eq/);
  }
}));
test('interview writes only after explicit session match',async()=>environment(async()=>{
  const calls:string[]=[];
  globalThis.fetch=(async(url:string|URL|Request,init?:RequestInit)=>{
    const u=String(url),method=init?.method||'GET';calls.push(method+' '+u);
    if(u.includes('/investigation_sessions?'))return new Response(JSON.stringify([{id:SESSION,cycle_id:CYCLE}]),{status:200});
    if(u.includes('/question_instances?')&&method==='GET')return new Response('[]',{status:200});
    if(u.includes('/responses?')&&method==='GET')return new Response('[]',{status:200});
    if(method==='POST')return new Response(JSON.stringify([{id:u.includes('question_instances')?CYCLE:SESSION}]),{status:201});
    throw Error('unexpected fetch');
  }) as typeof fetch;
  const r=response();await handler(request(),r.res as any);
  assert.equal(r.status(),201);
  assert.equal(r.body().sessionId,SESSION);
  assert.equal(calls.filter(x=>x.startsWith('POST')).length,2);
  assert.ok(calls.every(x=>!x.includes('POST https://example.invalid/rest/v1/investigation_sessions')));
}));
