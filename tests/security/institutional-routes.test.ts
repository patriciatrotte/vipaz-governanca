import test from 'node:test';
import assert from 'node:assert/strict';
import organizations from '../../api/data/organizations';
import cycles from '../../api/data/cycles';
import investigationSession from '../../api/data/investigation-session';

type Handler = (req: any, res: any) => Promise<unknown>;

function responseRecorder() {
  let status = 200;
  let body: any;
  const headers: Record<string, string> = {};
  const res = {
    setHeader(name: string, value: string) { headers[name] = value; return this; },
    status(code: number) { status = code; return this; },
    json(value: unknown) { body = value; return this; }
  };
  return { res, result: () => ({ status, body, headers }) };
}

const routes: Array<[string, Handler]> = [
  ['organizations', organizations], ['cycles', cycles], ['investigation-session', investigationSession]
];

for (const [name, handler] of routes) {
  for (const method of ['GET', 'POST']) {
    test(`${name} ${method}: rejects absent Bearer before contacting database`, async () => {
      const { res, result } = responseRecorder();
      const oldFetch = globalThis.fetch;
      let called = false;
      globalThis.fetch = (async () => { called = true; throw new Error('unexpected network call'); }) as typeof fetch;
      try {
        await handler({ method, headers: {}, body: {} }, res);
        assert.equal(result().status, 401);
        assert.equal(result().body.error, 'authentication_required');
        assert.equal(called, false);
        assert.equal(result().headers['Cache-Control'], 'no-store');
      } finally { globalThis.fetch = oldFetch; }
    });
  }
}

test('organizations GET: forwards Bearer to RLS API and returns only scoped rows', async () => {
  const prevUrl = process.env.SUPABASE_URL;
  const prevKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const oldFetch = globalThis.fetch;
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_PUBLISHABLE_KEY = 'public-test-key';
  let called = false;
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    called = true;
    assert.equal((init?.headers as Record<string,string>)?.Authorization, 'Bearer institutional-test-jwt');
    assert.equal((init?.headers as Record<string,string>)?.apikey, 'public-test-key');
    return new Response(JSON.stringify([{ id: 'visible-org' }]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;
  try {
    const { res, result } = responseRecorder();
    await organizations({ method: 'GET', headers: { authorization: 'Bearer institutional-test-jwt' } }, res);
    assert.equal(called, true);
    assert.equal(result().status, 200);
    assert.deepEqual(result().body, [{ id: 'visible-org' }]);
  } finally {
    globalThis.fetch = oldFetch;
    if (prevUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = prevUrl;
    if (prevKey === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY; else process.env.SUPABASE_PUBLISHABLE_KEY = prevKey;
  }
});

test('cycles POST: propagates forbidden response without claiming creation', async () => {
  const prevUrl = process.env.SUPABASE_URL;
  const prevKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const oldFetch = globalThis.fetch;
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_PUBLISHABLE_KEY = 'public-test-key';
  let calls = 0;
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    calls++;
    assert.equal((init?.headers as Record<string,string>).Authorization, 'Bearer unauthorized-test-jwt');
    if (calls === 1) return new Response(JSON.stringify([{ id: '00000000-0000-4000-8000-000000000001' }]), { status: 200 });
    return new Response(JSON.stringify({ message: 'permission denied' }), { status: 403 });
  }) as typeof fetch;
  try {
    const { res, result } = responseRecorder();
    await cycles({ method: 'POST', headers: { authorization: 'Bearer unauthorized-test-jwt' }, body: { organizationId: '00000000-0000-4000-8000-000000000001', legacyId: 'test-cycle', name: 'Test' } }, res);
    assert.equal(calls, 2);
    assert.equal(result().status, 403);
    assert.equal(result().body.error, 'cycle_write_failed');
  } finally {
    globalThis.fetch = oldFetch;
    if (prevUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = prevUrl;
    if (prevKey === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY; else process.env.SUPABASE_PUBLISHABLE_KEY = prevKey;
  }
});
