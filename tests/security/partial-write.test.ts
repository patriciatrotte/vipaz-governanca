import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../../api/data/investigation-session';

test('investigation write fails closed before atomic RPC is enabled', async () => {
  const oldFlag = process.env.VIPAZ_ATOMIC_INVESTIGATION_ENABLED;
  const oldUrl = process.env.SUPABASE_URL;
  const oldKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const oldFetch = globalThis.fetch;
  process.env.VIPAZ_ATOMIC_INVESTIGATION_ENABLED = 'false';
  process.env.SUPABASE_URL = 'https://example.invalid';
  process.env.SUPABASE_PUBLISHABLE_KEY = 'public-key';
  let calls = 0;
  globalThis.fetch = (async () => { calls++; throw new Error('unexpected database call'); }) as typeof fetch;
  let status = 200;
  let body: any;
  const res = {
    setHeader() { return this; },
    status(code: number) { status = code; return this; },
    json(value: unknown) { body = value; return this; }
  };
  try {
    await handler({ method: 'POST', headers: { authorization: 'Bearer test-token' },
      body: { cycleId: 'cycle-1', sessionLegacyId: 'session-legacy',
        interlocutorName: 'Example', participantLegacyId: 'person-1' }
    } as any, res as any);
    assert.equal(calls, 0);
    assert.equal(status, 503);
    assert.equal(body.error, 'atomic_investigation_not_enabled');
  } finally {
    globalThis.fetch = oldFetch;
    if (oldFlag === undefined) delete process.env.VIPAZ_ATOMIC_INVESTIGATION_ENABLED; else process.env.VIPAZ_ATOMIC_INVESTIGATION_ENABLED = oldFlag;
    if (oldUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY; else process.env.SUPABASE_PUBLISHABLE_KEY = oldKey;
  }
});

test('enabled investigation calls one RPC and never performs direct table writes', async () => {
  const oldFlag = process.env.VIPAZ_ATOMIC_INVESTIGATION_ENABLED;
  const oldUrl = process.env.SUPABASE_URL;
  const oldKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const oldFetch = globalThis.fetch;
  process.env.VIPAZ_ATOMIC_INVESTIGATION_ENABLED = 'true';
  process.env.SUPABASE_URL = 'https://example.invalid';
  process.env.SUPABASE_PUBLISHABLE_KEY = 'public-key';
  const calls: string[] = [];
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push(String(url));
    assert.equal(init?.method, 'POST');
    assert.equal((init?.headers as Record<string,string>).Authorization, 'Bearer test-token');
    const payload = JSON.parse(String(init?.body));
    assert.equal(payload.p_session_legacy_id, 'session-legacy');
    return new Response(JSON.stringify({ session: { id: 'session-1' }, participant: { id: 'person-1' }, created: true }), { status: 200 });
  }) as typeof fetch;
  let status = 200;
  let body: any;
  const res = {
    setHeader() { return this; },
    status(code: number) { status = code; return this; },
    json(value: unknown) { body = value; return this; }
  };
  try {
    await handler({ method: 'POST', headers: { authorization: 'Bearer test-token' },
      body: { cycleId: 'cycle-1', sessionLegacyId: 'session-legacy',
        interlocutorName: 'Example', participantLegacyId: 'person-1' }
    } as any, res as any);
    assert.equal(status, 200);
    assert.equal(body.session.id, 'session-1');
    assert.deepEqual(calls, ['https://example.invalid/rest/v1/rpc/vipaz_create_investigation_atomic']);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldFlag === undefined) delete process.env.VIPAZ_ATOMIC_INVESTIGATION_ENABLED; else process.env.VIPAZ_ATOMIC_INVESTIGATION_ENABLED = oldFlag;
    if (oldUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY; else process.env.SUPABASE_PUBLISHABLE_KEY = oldKey;
  }
});

test('disabled atomic mode blocks cycle creation without database calls', async () => {
  const { default: cycleHandler } = await import('../../api/data/cycles');
  const prior = [process.env.VIPAZ_ATOMIC_INVESTIGATION_ENABLED,process.env.SUPABASE_URL,process.env.SUPABASE_PUBLISHABLE_KEY];
  const originalFetch = globalThis.fetch;
  process.env.VIPAZ_ATOMIC_INVESTIGATION_ENABLED = 'false';
  process.env.SUPABASE_URL = 'https://example.invalid';
  process.env.SUPABASE_PUBLISHABLE_KEY = 'public-key';
  let calls = 0;
  globalThis.fetch = (async () => { calls++; throw new Error('unexpected fetch'); }) as typeof fetch;
  let status = 200;
  let response: any;
  const res = { setHeader() { return this; }, status(n: number) { status=n; return this; }, json(x: unknown) { response=x; return this; } };
  try {
    await cycleHandler({method:'POST',headers:{authorization:'Bearer test-token'},body:{organizationId:'org-1',legacyId:'cycle-1'}} as any,res as any);
    assert.equal(status,503);
    assert.equal(response.error,'atomic_investigation_not_enabled');
    assert.equal(calls,0);
  } finally {
    globalThis.fetch=originalFetch;
    for (const [i,k] of ['VIPAZ_ATOMIC_INVESTIGATION_ENABLED','SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY'].entries()) {
      if (prior[i] === undefined) delete process.env[k]; else process.env[k]=prior[i];
    }
  }
});
