import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../../api/data/cycle-session';

const CYCLE='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const SESSION='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
function response(){
  let status=200;let body:any;
  return {res:{setHeader(){return this;},status(n:number){status=n;return this;},json(x:any){body=x;return this;}},
    status:()=>status,body:()=>body};
}
function request(token=true,cycleId=CYCLE){return {method:'GET',query:{cycleId},headers:token?{authorization:'Bearer test-token'}:{}} as any;}
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
test('canonical session lookup rejects unauthenticated and malformed IDs before network',async()=>{
  await environment(async()=>{
    let calls=0;globalThis.fetch=(async()=>{calls++;throw Error('unexpected');}) as typeof fetch;
    const noAuth=response();await handler(request(false),noAuth.res as any);
    assert.equal(noAuth.status(),401);
    const malformed=response();await handler(request(true,'legacy-cycle'),malformed.res as any);
    assert.equal(malformed.status(),400);
    assert.equal(calls,0);
  });
});
test('canonical session lookup sends caller JWT and accepts exactly one matching UUID',async()=>{
  await environment(async()=>{
    const calls:string[]=[];
    globalThis.fetch=(async(url:string|URL|Request,init?:RequestInit)=>{
      calls.push(String(url));
      assert.equal((init?.headers as Record<string,string>).Authorization,'Bearer test-token');
      return new Response(JSON.stringify([{id:SESSION,cycle_id:CYCLE,legacy_id:'session-1'}]),{status:200});
    }) as typeof fetch;
    const result=response();await handler(request(),result.res as any);
    assert.equal(result.status(),200);assert.equal(result.body().session.id,SESSION);
    assert.equal(calls.length,1);
    assert.ok(calls[0].includes('investigation_sessions?cycle_id=eq.'));
  });
});
test('canonical session lookup fails closed on zero, multiple and inconsistent rows',async()=>{
  await environment(async()=>{
    for(const [rows,expected] of [
      [[],404],
      [[{id:SESSION,cycle_id:CYCLE},{id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',cycle_id:CYCLE}],409],
      [[{id:SESSION,cycle_id:'dddddddd-dddd-4ddd-8ddd-dddddddddddd'}],409],
      [[{id:'legacy-session',cycle_id:CYCLE}],409],
      [{unexpected:true},502]
    ] as const){
      globalThis.fetch=(async()=>new Response(JSON.stringify(rows),{status:200})) as typeof fetch;
      const result=response();await handler(request(),result.res as any);
      assert.equal(result.status(),expected);
      assert.equal(result.body().session,undefined);
    }
  });
});
test('canonical session lookup never returns records on upstream denial',async()=>{
  await environment(async()=>{
    for(const status of [401,403,500]){
      globalThis.fetch=(async()=>new Response(JSON.stringify({message:'sensitive detail'}),{status})) as typeof fetch;
      const result=response();await handler(request(),result.res as any);
      assert.equal(result.status(),status===500?502:status);
      assert.equal(result.body().session,undefined);
      assert.equal(JSON.stringify(result.body()).includes('sensitive detail'),false);
    }
  });
});

test('native session lookup can disambiguate using stable legacy ID',async()=>{
  await environment(async()=>{
    const legacy='session-cycle-d1-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    globalThis.fetch=(async(url:string|URL|Request)=>{
      assert.ok(String(url).includes('legacy_id=eq.'+legacy));
      return new Response(JSON.stringify([{id:SESSION,cycle_id:CYCLE,legacy_id:legacy}]),{status:200});
    }) as typeof fetch;
    const r=response();
    await handler({...request(),query:{cycleId:CYCLE,sessionLegacyId:legacy}},r.res as any);
    assert.equal(r.status(),200);
  });
});
