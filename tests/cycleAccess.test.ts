import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import type { Request } from 'express';
import { AccessError, requireCycleReadAccess } from '../api/_lib/cycleAccess.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

const cycle = '11111111-1111-4111-8111-111111111111';
const org = '22222222-2222-4222-8222-222222222222';
const user = '33333333-3333-4333-8333-333333333333';
const req = (token?: string) => ({
  headers: token ? { authorization: `Bearer ${token}` } : {}
} as unknown as Request);
const response = (data: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data
} as Response);
const allowFetch = (membership: unknown[], userStatus = 200) => {
  const calls: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    if (url.includes('/auth/v1/user')) return response({ id: user }, userStatus);
    if (url.includes('/governance_cycles')) return response([{ organization_id: org }]);
    if (url.includes('/organization_memberships')) return response(membership);
    throw new Error('Unexpected fetch: ' + url);
  }) as typeof fetch;
  return calls;
};

test('sem token: 401 e nenhuma consulta privilegiada', async () => {
  let calls = 0;
  globalThis.fetch = (async () => { calls++; throw new Error('unexpected'); }) as typeof fetch;
  await assert.rejects(requireCycleReadAccess(req(), 'https://example.test', 'server-key', cycle),
    (err: unknown) => err instanceof AccessError && err.status === 401);
  assert.equal(calls, 0);
});

test('token inválido: 401, sem consulta a ciclos ou vínculos', async () => {
  const calls = allowFetch([], 401);
  await assert.rejects(requireCycleReadAccess(req('invalid'), 'https://example.test', 'server-key', cycle),
    (err: unknown) => err instanceof AccessError && err.status === 401);
  assert.equal(calls.length, 1);
});

test('vínculo ativo da organização: acesso permitido', async () => {
  const calls = allowFetch([{ valid_from: '2020-01-01T00:00:00Z', valid_until: null }]);
  await requireCycleReadAccess(req('valid'), 'https://example.test', 'server-key', cycle);
  assert.equal(calls.length, 3);
  assert.ok(calls[2].includes('organization_id=eq.' + org));
  assert.ok(calls[2].includes('user_id=eq.' + user));
});

test('usuário sem vínculo com a Câmara: 403', async () => {
  allowFetch([]);
  await assert.rejects(requireCycleReadAccess(req('valid'), 'https://example.test', 'server-key', cycle),
    (err: unknown) => err instanceof AccessError && err.status === 403);
});

test('vínculo expirado: 403', async () => {
  allowFetch([{ valid_from: '2020-01-01T00:00:00Z', valid_until: '2021-01-01T00:00:00Z' }]);
  await assert.rejects(requireCycleReadAccess(req('valid'), 'https://example.test', 'server-key', cycle),
    (err: unknown) => err instanceof AccessError && err.status === 403);
});

test('vínculo futuro: 403', async () => {
  allowFetch([{ valid_from: '2099-01-01T00:00:00Z', valid_until: null }]);
  await assert.rejects(requireCycleReadAccess(req('valid'), 'https://example.test', 'server-key', cycle),
    (err: unknown) => err instanceof AccessError && err.status === 403);
});
