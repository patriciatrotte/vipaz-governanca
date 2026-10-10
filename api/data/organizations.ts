import type { Request, Response } from 'express';
import { buildSupabaseHeaders } from '../../src/services/persistence/supabaseAdapters.js';
import { getScopedReadHeaders } from '../_lib/scopedRead.js';
import { AccessError } from '../_lib/cycleAccess.js';

export default async function handler(req: Request, res: Response) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return res.status(503).json({ error: 'database_not_configured' });

  // Escritas administrativas aguardam autorização institucional no servidor.
  // Nunca permitir criação usando apenas um papel simulado na interface.
  if (req.method === 'POST') return res.status(403).json({ error: 'institutional_write_not_enabled' });

  if (req.method === 'GET') {
    let scopedHeaders: Record<string, string>;
    try { scopedHeaders = await getScopedReadHeaders(req, url, key); }
    catch (error) {
      if (error instanceof AccessError) return res.status(error.status).json({ error: error.code });
      return res.status(503).json({ error: 'authorization_unavailable' });
    }
    const r = await fetch(`${url}/rest/v1/organizations?select=*&order=created_at.asc`, { headers: scopedHeaders });
    if (!r.ok) return res.status(502).json({ error: 'organizations_read_failed', details: await r.text() });
    return res.status(200).json(await r.json());
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const payload = {
      legacy_id: body.legacyId,
      name: body.name,
      organization_type: body.type || 'CAMARA_MUNICIPAL',
      vertical: body.vertical,
      municipality: body.municipality,
      state: body.state,
      is_demo: Boolean(body.isDemo)
          };
    const r = await fetch(`${url}/rest/v1/organizations?select=*`, {
      method: 'POST',
      headers: { ...buildSupabaseHeaders(key), Prefer: 'return=representation,resolution=merge-duplicates' },
      body: JSON.stringify(payload)
    });
    if (!r.ok) {
      const details = await r.text();
      console.error('Supabase organization write failed:', r.status, details);
      return res.status(502).json({ error: 'organization_write_failed', details });
    }
    const rows = await r.json();
    return res.status(200).json(rows[0] || null);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'method_not_allowed' });
}
