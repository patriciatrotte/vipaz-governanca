import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  const token = /^Bearer\s+([^\s]+)$/i.exec(req.headers.authorization || '')?.[1];
  res.setHeader('Cache-Control', 'no-store');
  if (!token) return res.status(401).json({ error: 'authentication_required' });
  const authHeaders = { apikey: key || '', Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  if (!url || !key) return res.status(503).json({ error: 'database_not_configured' });

  if (req.method === 'GET') {
    const r = await fetch(`${url}/rest/v1/organizations?select=*&order=created_at.asc`, { headers: authHeaders });
    if (!r.ok) return res.status(r.status === 401 ? 401 : r.status === 403 ? 403 : 502).json({ error: 'organizations_read_failed', details: await r.text() });
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
      headers: { ...authHeaders, Prefer: 'return=representation,resolution=merge-duplicates' },
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
