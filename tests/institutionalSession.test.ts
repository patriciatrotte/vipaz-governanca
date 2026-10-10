import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import type { Request, Response } from 'express';
import sessionHandler from '../api/auth/session.js';

const originalFetch = globalThis.fetch;
const originalUrl = process.env.SUPABASE_URL;
const originalSecret = process.env.SUPABASE_SECRET_KEY;
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalUrl === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = originalUrl;
  if (originalSecret === undefined) delete process.env.SUPABASE_SECRET_KEY;
  else process.env.SUPABASE_SECRET_KEY = originalSecret;
});
const request = (token?: string) => ({method:'GET',headers:token ? {authorization:`Bearer ${token}`} : {}} as Request);
const run = async (req: Request) => {
  let status = 200;
  let payload: any;
  const headers: Record<string,string> = {};
  const res = {
    setHeader: (name:string,value:string) => {headers[name] = value; return res;},
    status: (value:number) => {status=value; return res;},
    json: (value:unknown) => {payload=value; return res;}
  } as unknown as Response;
  await sessionHandler(req,res);
  return {status,payload,headers};
};
const setup = (memberships: unknown[], identityStatus=200, globalRoles: unknown[] = []) => {
  process.env.SUPABASE_URL='https://example.test';
  process.env.SUPABASE_SECRET_KEY='server-secret';
  const calls:string[]=[];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url=String(input);
    calls.push(url);
    if(url.includes('/auth/v1/user')) return {ok:identityStatus===200,json:async()=>({id:'33333333-3333-4333-8333-333333333333'})} as globalThis.Response;
    if(url.includes('/organization_memberships')) return {ok:true,json:async()=>memberships} as globalThis.Response;
    if(url.includes('/global_user_roles')) return {ok:true,json:async()=>globalRoles} as globalThis.Response;
    throw new Error('Unexpected fetch');
  }) as unknown as typeof fetch;
  return calls;
};

test('sem token: sessão recusada sem acesso privilegiado', async () => {
  const calls=setup([]);
  const result=await run(request());
  assert.equal(result.status,401);
  assert.equal(calls.length,0);
  assert.equal(result.headers['Cache-Control'],'no-store');
});
test('token inválido: nenhuma consulta a vínculos', async () => {
  const calls=setup([],401);
  const result=await run(request('invalid'));
  assert.equal(result.status,401);
  assert.equal(calls.length,1);
});
test('sessão válida sem vínculos não concede acesso institucional', async () => {
  setup([]);
  const result=await run(request('valid'));
  assert.equal(result.status,200);
  assert.deepEqual(result.payload.memberships,[]);
});
test('somente vínculos vigentes são retornados', async () => {
  setup([
    {organization_id:'org-active',role_code:'MEMBER',valid_from:'2020-01-01T00:00:00Z',valid_until:null},
    {organization_id:'org-expired',role_code:'MEMBER',valid_from:'2020-01-01T00:00:00Z',valid_until:'2021-01-01T00:00:00Z'},
    {organization_id:'org-future',role_code:'MEMBER',valid_from:'2099-01-01T00:00:00Z',valid_until:null}
  ]);
  const result=await run(request('valid'));
  assert.equal(result.status,200);
  assert.deepEqual(result.payload.memberships,[{organizationId:'org-active',role:'MEMBER'}]);
});

test('administrador global vigente é reconhecido sem vínculo institucional', async () => {
  setup([],200,[{valid_from:'2020-01-01T00:00:00Z',valid_until:null}]);
  const result=await run(request('valid'));
  assert.equal(result.status,200);
  assert.equal(result.payload.isGlobalAdmin,true);
  assert.deepEqual(result.payload.memberships,[]);
});
test('papel administrativo expirado não autoriza', async () => {
  setup([],200,[{valid_from:'2020-01-01T00:00:00Z',valid_until:'2021-01-01T00:00:00Z'}]);
  const result=await run(request('valid'));
  assert.equal(result.payload.isGlobalAdmin,false);
});
