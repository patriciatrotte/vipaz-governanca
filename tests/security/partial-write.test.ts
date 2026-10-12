import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../../api/data/investigation-session';

test('participant rejection must not be reported as completed investigation', async () => {
  const originalFetch = globalThis.fetch;
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  process.env.SUPABASE_URL = 'https://example.invalid';
  process.env.SUPABASE_PUBLISHABLE_KEY = 'public-key';
  let calls = 0;
  globalThis.fetch = (async () => {
    calls++;
    if (calls === 1) return new Response(JSON.stringify([{ id: 'cycle-1' }]), { status: 200 });
    if (calls === 2) return new Response(JSON.stringify([{ id: 'session-1' }]), { status: 201 });
    return new Response(JSON.stringify({ message: 'not permitted' }), { status: 403 });
  }) as typeof fetch;
  let status = 200;
  let body: any;
  const res = {
    setHeader() { return this; },
    status(code: number) { status = code; return this; },
    json(value: unknown) { body = value; return this; }
  };
  try {
    await handler({
      method: 'POST',
      headers: { authorization: 'Bearer test-token' },
      body: { cycleId: 'cycle-1', sessionLegacyId: 'session-legacy', interlocutorName: 'Example' }
    } as any, res as any);
    assert.equal(calls, 3);
    assert.equal(status, 502);
    assert.equal(body.error, 'interview_participant_write_failed');
    assert.equal(body.session.id, 'session-1');
  } finally {
    globalThis.fetch = originalFetch;
    if (previousUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY; else process.env.SUPABASE_PUBLISHABLE_KEY = previousKey;
  }
});
