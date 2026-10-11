import {test,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/data/assessment-drafts.ts';
const oldFetch=globalThis.fetch;
const oldUrl=process.env.SUPABASE_URL;
const oldKey=process.env.SUPABASE_SECRET_KEY;
afterEach(()=>{globalThis.fetch=oldFetch;if(oldUrl===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=oldUrl;if(oldKey===undefined)delete process.env.SUPABASE_SECRET_KEY;else process.env.SUPABASE_SECRET_KEY=oldKey;});
const cycle='00000000-0000-0000-0000-000000000001';
async function invoke(token:string|undefined,rpcStatus=200,extra:Record<string,unknown>={}){
 process.env.SUPABASE_URL='https://database.test';process.env.SUPABASE_SECRET_KEY='server-key';
 const calls:{url:string;init:any}[]=[];
 globalThis.fetch=(async(input:any,init:any)=>{calls.push({url:String(input),init});return new Response(JSON.stringify(String(input).includes('/auth/')?{id:'user-a'}:{id:'draft-a',status:'DRAFT'}),{status:String(input).includes('/rpc/')?rpcStatus:200});}) as any;
 const result:any={};const res:any={setHeader(){},status(code:number){result.status=code;return this;},json(body:any){result.body=body;return this;}};
 await handler({method:'POST',headers:token?{authorization:`Bearer ${token}`}:{},body:{cycleId:cycle,sourceUnitIds:['source-a'],analysisText:'Interpretação preliminar das fontes',created_by:'forged-user',status:'CONFIRMED',...extra}} as any,res);
 return {calls,result};
}
test('draft write rejects anonymous before persistence',async()=>{const {calls,result}=await invoke(undefined);assert.equal(result.status,401);assert.equal(calls.length,0);});
test('draft write forwards user token and never accepts forged author or status',async()=>{const {calls,result}=await invoke('user-token');assert.equal(result.status,201);const rpc=calls.find(c=>c.url.includes('/rpc/'))!;assert.equal(rpc.init.headers.Authorization,'Bearer user-token');assert.deepEqual(Object.keys(JSON.parse(rpc.init.body)).sort(),['p_analysis_text','p_cycle_id','p_source_unit_ids']);});
test('database authorization denial is preserved',async()=>{const {result}=await invoke('user-token',403);assert.equal(result.status,403);assert.equal(result.body.error,'draft_not_saved');});
test('source rejection cannot report success',async()=>{const {result}=await invoke('user-token',400);assert.equal(result.status,400);assert.ok(!result.body.draft);});

test('structured draft uses candidate RPC with explicit human review',async()=>{const {calls,result}=await invoke('user-token',200,{capabilityCode:'D1.4',proposedOutcome:'NAO_CONCLUSIVO',humanReviewed:true,reviewJustification:'Conferência das fontes e dos limites'});assert.equal(result.status,201);const rpc=calls.find(c=>c.url.includes('/rpc/'))!;assert.ok(rpc.url.endsWith('save_candidate_assessment_draft'));const body=JSON.parse(rpc.init.body);assert.equal(body.p_human_reviewed,true);assert.equal(body.p_capability_code,'D1.4');assert.ok(!('baseline_reference' in body));});
test('string confirmation cannot impersonate explicit human review',async()=>{const {calls,result}=await invoke('user-token',200,{capabilityCode:'D1.4',humanReviewed:'true'});assert.equal(result.status,400);assert.ok(!calls.some(c=>c.url.includes('/rpc/')));});
