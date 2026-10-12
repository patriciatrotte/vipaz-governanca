import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../../api/data/confirm-participant';

const SESSION='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
function response() {
  let status=200; let body:any;
  return {
    res:{setHeader(){return this;},status(n:number){status=n;return this;},json(x:any){body=x;return this;}},
    getStatus:()=>status,getBody:()=>body
  };
}
const valid={
  sessionId:SESSION,participantLegacyId:'participant-stable',
  participantName:'Pessoa confirmada',participantRole:'Gestão',
  confirmationNote:'Identidade e participação confirmadas pelo administrador'
};
async function withEnvironment(enabled:string, callback:()=>Promise<void>) {
  const keys=['VIPAZ_PARTICIPANT_CONFIRMATION_ENABLED','SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY'];
  const previous=keys.map(k=>process.env[k]);
  const previousFetch=globalThis.fetch;
  process.env.VIPAZ_PARTICIPANT_CONFIRMATION_ENABLED=enabled;
  process.env.SUPABASE_URL='https://example.invalid';
  process.env.SUPABASE_PUBLISHABLE_KEY='public-key';
  try { await callback(); }
  finally {
    globalThis.fetch=previousFetch;
    keys.forEach((key,i)=>{if(previous[i]===undefined)delete process.env[key];else process.env[key]=previous[i];});
  }
}
test('participant confirmation is disabled by default and makes no network request',async()=>{
  await withEnvironment('false',async()=>{
    let calls=0;
    globalThis.fetch=(async()=>{calls++;throw Error('unexpected');}) as typeof fetch;
    const result=response();
    await handler({method:'POST',headers:{authorization:'Bearer test-token'},body:valid} as any,result.res as any);
    assert.equal(result.getStatus(),503);
    assert.equal(calls,0);
  });
});
test('participant confirmation requires explicit note and canonical session',async()=>{
  await withEnvironment('true',async()=>{
    let calls=0;
    globalThis.fetch=(async()=>{calls++;throw Error('unexpected');}) as typeof fetch;
    for(const body of [{...valid,confirmationNote:''},{...valid,sessionId:'legacy-session'}]){
      const result=response();
      await handler({method:'POST',headers:{authorization:'Bearer test-token'},body} as any,result.res as any);
      assert.equal(result.getStatus(),400);
    }
    assert.equal(calls,0);
  });
});
test('participant confirmation forwards JWT to exactly one RPC',async()=>{
  await withEnvironment('true',async()=>{
    const calls:string[]=[];
    globalThis.fetch=(async(url:string|URL|Request,init?:RequestInit)=>{
      calls.push(String(url));
      assert.equal((init?.headers as Record<string,string>).Authorization,'Bearer test-token');
      const payload=JSON.parse(String(init?.body));
      assert.equal(payload.p_confirmation_note,valid.confirmationNote);
      assert.equal(payload.p_session_id,SESSION);
      return new Response(JSON.stringify({participant:{
        id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        metadata:{confirmation_status:'CONFIRMED'}
      }}),{status:200});
    }) as typeof fetch;
    const result=response();
    await handler({method:'POST',headers:{authorization:'Bearer test-token'},body:valid} as any,result.res as any);
    assert.equal(result.getStatus(),200);
    assert.deepEqual(calls,['https://example.invalid/rest/v1/rpc/vipaz_confirm_investigation_participant']);
  });
});
test('participant confirmation requires authentication',async()=>{
  await withEnvironment('true',async()=>{
    let calls=0;
    globalThis.fetch=(async()=>{calls++;throw Error('unexpected');}) as typeof fetch;
    const result=response();
    await handler({method:'POST',headers:{},body:valid} as any,result.res as any);
    assert.equal(result.getStatus(),401);
    assert.equal(calls,0);
  });
});
