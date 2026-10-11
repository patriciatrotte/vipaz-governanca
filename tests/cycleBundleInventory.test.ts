import {test, afterEach} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/data/cycleBundle.js';

const originalFetch = globalThis.fetch;
const originalUrl = process.env.SUPABASE_URL;
const originalKey = process.env.SUPABASE_SECRET_KEY;
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = originalUrl;
  if (originalKey === undefined) delete process.env.SUPABASE_SECRET_KEY; else process.env.SUPABASE_SECRET_KEY = originalKey;
});
async function invoke({token = 'valid', membership = true, failInventory = false, record = false} = {}) {
  process.env.SUPABASE_URL = 'https://database.test';
  process.env.SUPABASE_SECRET_KEY = 'test-key';
  const calls: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input); calls.push(url);
    let data: any = [];
    if (url.includes('/auth/v1/user')) data = {id:'user-a'};
    else if (url.includes('/governance_cycles')) data = [{id:'cycle-a', organization_id:'org-a'}];
    else if (url.includes('/global_user_roles')) data = [];
    else if (url.includes('/organization_memberships')) data = membership ? [{valid_from:'2020-01-01',valid_until:null}] : [];
    else if (url.includes('/criterion_results')) {
      if(failInventory) return new Response('test failure', {status:503});
      data = record ? [{id:'criterion-a',cycle_id:'cycle-a'}] : [];
    } else if (url.includes('/investigation_sessions')) data = [{id:'session-a'}];
    else if (url.includes('/question_instances')) data = [{id:'question-a',question_code:'D1.2'}];
    else if (url.includes('/responses')) data = [{id:'response-a',question_instance_id:'question-a',response_text:'Preserved interview'}];
    else if (url.includes('/cycle_snapshots')) assert.ok(url.includes('order=captured_at.asc'));
    return new Response(JSON.stringify(data), {status:200,headers:{'content-type':'application/json'}});
  }) as typeof fetch;
  const result: {status:number;body:any} = {status:0,body:null};
  const res = {status(code: number){result.status=code;return this;},json(body: any){result.body=body;return this;}};
  await handler({method:'GET',query:{cycleId:'cycle-a'},headers:token?{authorization:'Bearer '+token}:{}} as any,res as any);
  return {result,calls};
}
test('endpoint refuses anonymous access before privileged inventory queries',async()=>{
  const {result,calls}=await invoke({token:''});assert.equal(result.status,401);assert.equal(calls.length,0);
});
test('endpoint refuses user without institutional membership',async()=>{
  const {result,calls}=await invoke({membership:false});assert.equal(result.status,403);assert.ok(!calls.some(x=>x.includes('/criterion_results')));
});
test('authorized interview remains readable when no evaluation exists',async()=>{
  const {result}=await invoke();assert.equal(result.status,200);assert.equal(result.body.assessmentInventory.state,'NOT_RECORDED');
  assert.equal(result.body.responses[0].response_text,'Preserved interview');assert.equal(result.body.assessmentInventory.canPublish,false);
});
test('inventory failure preserves investigation and never claims evaluation is absent',async()=>{
  const {result}=await invoke({failInventory:true});assert.equal(result.status,200);assert.equal(result.body.assessmentInventory.state,'UNAVAILABLE');
  assert.equal(result.body.responses.length,1);
});
test('existing evaluation stays pending review without publishing a result',async()=>{
  const {result}=await invoke({record:true});assert.equal(result.body.assessmentInventory.state,'REQUIRES_REVIEW');assert.equal(result.body.assessmentInventory.canPublish,false);
});

