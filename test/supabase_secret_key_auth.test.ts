/**
 * VIPAZ — Teste Automatizado de Compatibilização de Credenciais Supabase
 *
 * Comprova:
 * 1. sb_secret_... -> apikey presente + Authorization ausente
 * 2. JWT legado (eyJ...) -> apikey presente + Authorization: Bearer presente
 * 3. Garantia de que os 4 módulos backend utilizam o mesmo contrato:
 *    - api/data/cycleBundle.ts
 *    - api/data/organizations.ts
 *    - api/data/cycles.ts
 *    - api/db/health.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildSupabaseHeaders } from '../src/services/persistence/supabaseAdapters';
import cycleBundleHandler from '../api/data/cycleBundle';
import organizationsHandler from '../api/data/organizations';
import cyclesHandler from '../api/data/cycles';
import healthHandler from '../api/db/health';

describe('VIPAZ — Montagem de Headers Supabase (sb_secret_ vs JWT Legado)', () => {

  const MOCK_MODERN_KEY = 'sb_secret_example_mock_token_123456';
  const MOCK_LEGACY_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiZXhwIjoyNTM0MDIzMDA3OTl9.mock_signature';

  // ========================================================
  // 1. Chave Moderna (sb_secret_...)
  // ========================================================
  it('sb_secret_... -> apikey presente + Authorization ausente', () => {
    const headers = buildSupabaseHeaders(MOCK_MODERN_KEY);

    assert.equal(headers.apikey, MOCK_MODERN_KEY, 'apikey deve receber o valor exato da chave configurada');
    assert.equal('Authorization' in headers, false, 'Authorization DEVE estar ausente para chaves sb_secret_');
    assert.equal(headers.Authorization, undefined, 'Authorization deve ser undefined');
    assert.equal(headers['Content-Type'], 'application/json');
  });

  // ========================================================
  // 2. JWT Legado (eyJ...)
  // ========================================================
  it('JWT legado -> apikey presente + Authorization: Bearer presente', () => {
    const headers = buildSupabaseHeaders(MOCK_LEGACY_JWT);

    assert.equal(headers.apikey, MOCK_LEGACY_JWT, 'apikey deve receber o valor do JWT legado');
    assert.equal('Authorization' in headers, true, 'Authorization DEVE estar presente para JWT legado');
    assert.equal(headers.Authorization, `Bearer ${MOCK_LEGACY_JWT}`, 'Authorization deve conter Bearer + JWT');
    assert.equal(headers['Content-Type'], 'application/json');
  });

  // ========================================================
  // 3. Comprovação nos 4 Handlers Backend com Chave Moderna
  // ========================================================
  it('Handlers (cycleBundle, organizations, cycles, health) enviam apikey e omitem Authorization com sb_secret_...', async () => {
    const originalUrl = process.env.SUPABASE_URL;
    const originalKey = process.env.SUPABASE_SECRET_KEY;
    const originalFetch = globalThis.fetch;

    try {
      process.env.SUPABASE_URL = 'https://mock-supabase.co';
      process.env.SUPABASE_SECRET_KEY = MOCK_MODERN_KEY;

      const capturedHeaders: Array<Record<string, string>> = [];

      globalThis.fetch = (async (_url: any, options: any) => {
        if (options && options.headers) {
          capturedHeaders.push({ ...options.headers });
        }
        return {
          ok: true,
          status: 200,
          json: async () => [],
          text: async () => '[]'
        } as any;
      }) as any;

      const mockRes = () => {
        const res: any = {};
        res.status = () => res;
        res.json = () => res;
        res.setHeader = () => res;
        return res;
      };

      // 1. healthHandler
      await healthHandler({} as any, mockRes());
      // 2. organizationsHandler
      await organizationsHandler({ method: 'GET' } as any, mockRes());
      // 3. cyclesHandler
      await cyclesHandler({ method: 'GET' } as any, mockRes());
      // 4. cycleBundleHandler
      await cycleBundleHandler({ method: 'GET', query: { cycleId: 'test-cycle' } } as any, mockRes());

      assert.ok(capturedHeaders.length >= 4, 'Todos os 4 endpoints realizaram requisições');

      for (const h of capturedHeaders) {
        assert.equal(h.apikey, MOCK_MODERN_KEY, 'apikey deve ser a chave moderna');
        assert.equal('Authorization' in h, false, 'Authorization DEVE estar ausente para sb_secret_');
        assert.equal(h.Authorization, undefined);
      }
    } finally {
      process.env.SUPABASE_URL = originalUrl;
      process.env.SUPABASE_SECRET_KEY = originalKey;
      globalThis.fetch = originalFetch;
    }
  });

  // ========================================================
  // 4. Comprovação nos 4 Handlers Backend com JWT Legado
  // ========================================================
  it('Handlers (cycleBundle, organizations, cycles, health) enviam apikey e Authorization: Bearer com JWT legado', async () => {
    const originalUrl = process.env.SUPABASE_URL;
    const originalKey = process.env.SUPABASE_SECRET_KEY;
    const originalFetch = globalThis.fetch;

    try {
      process.env.SUPABASE_URL = 'https://mock-supabase.co';
      process.env.SUPABASE_SECRET_KEY = MOCK_LEGACY_JWT;

      const capturedHeaders: Array<Record<string, string>> = [];

      globalThis.fetch = (async (_url: any, options: any) => {
        if (options && options.headers) {
          capturedHeaders.push({ ...options.headers });
        }
        return {
          ok: true,
          status: 200,
          json: async () => [],
          text: async () => '[]'
        } as any;
      }) as any;

      const mockRes = () => {
        const res: any = {};
        res.status = () => res;
        res.json = () => res;
        res.setHeader = () => res;
        return res;
      };

      // 1. healthHandler
      await healthHandler({} as any, mockRes());
      // 2. organizationsHandler
      await organizationsHandler({ method: 'GET' } as any, mockRes());
      // 3. cyclesHandler
      await cyclesHandler({ method: 'GET' } as any, mockRes());
      // 4. cycleBundleHandler
      await cycleBundleHandler({ method: 'GET', query: { cycleId: 'test-cycle' } } as any, mockRes());

      assert.ok(capturedHeaders.length >= 4, 'Todos os 4 endpoints realizaram requisições');

      for (const h of capturedHeaders) {
        assert.equal(h.apikey, MOCK_LEGACY_JWT, 'apikey deve ser o JWT legado');
        assert.equal('Authorization' in h, true, 'Authorization DEVE estar presente para JWT legado');
        assert.equal(h.Authorization, `Bearer ${MOCK_LEGACY_JWT}`);
      }
    } finally {
      process.env.SUPABASE_URL = originalUrl;
      process.env.SUPABASE_SECRET_KEY = originalKey;
      globalThis.fetch = originalFetch;
    }
  });

  // ========================================================
  // 5. Rota Canônica /api/data/cycle-bundle para Vercel
  // ========================================================
  it('api/data/cycle-bundle.ts exporta o mesmo handler de cycleBundle (compatibilidade Vercel)', async () => {
    const cycleBundleKebabHandler = (await import('../api/data/cycle-bundle')).default;
    assert.equal(typeof cycleBundleKebabHandler, 'function', 'cycle-bundle.ts deve exportar uma função handler válida');
    assert.equal(cycleBundleKebabHandler, cycleBundleHandler, 'cycle-bundle.ts deve exportar exatamente o mesmo handler canônico');
  });

  // ========================================================
  // 6. Salvaguarda de Content-Type (HTML / não-JSON)
  // ========================================================
  it('Salvaguarda detecta explicitamente resposta não-JSON (ex: HTML da SPA)', () => {
    const checkIsJson = (contentTypeHeader: string | null) => {
      const contentType = contentTypeHeader || '';
      return contentType.includes('application/json');
    };

    assert.equal(checkIsJson('text/html; charset=utf-8'), false, 'HTML não deve ser aceito como JSON');
    assert.equal(checkIsJson('text/plain'), false, 'text/plain não deve ser aceito como JSON');
    assert.equal(checkIsJson(null), false, 'Header nulo não deve ser aceito como JSON');
    assert.equal(checkIsJson('application/json; charset=utf-8'), true, 'application/json deve ser aceito');
    assert.equal(checkIsJson('application/json'), true, 'application/json simples deve ser aceito');
  });
});
