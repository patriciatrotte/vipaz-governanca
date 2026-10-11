import type { Request, Response } from 'express';

/**
 * Read-only institutional snapshot retrieval.
 * Supabase RLS evaluates the caller's JWT. No service-role bypass.
 * Does not turn a locally generated snapshot into an institutional record.
 */
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const cycleId = typeof req.query.cycleId === 'string' ? req.query.cycleId.trim() : '';
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cycleId)) {
    return res.status(400).json({ error: 'invalid_cycle_id' });
  }

  const match = /^Bearer\s+([^\s]+)$/i.exec(req.headers.authorization || '');
  if (!match) return res.status(401).json({ error: 'authentication_required' });

  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(503).json({ error: 'institutional_auth_not_configured' });

  try {
    const query = new URLSearchParams({
      select: 'id,organization_id,cycle_id,snapshot_kind,captured_at,methodology_version,payload,created_by',
      cycle_id: `eq.${cycleId}`,
      order: 'captured_at.desc',
      limit: '1'
    });
    const response = await fetch(`${url}/rest/v1/cycle_snapshots?${query.toString()}`, {
      headers: { apikey: key, Authorization: `Bearer ${match[1]}` },
      signal: AbortSignal.timeout(10000),
      cache: 'no-store'
    });
    if (response.status === 401) return res.status(401).json({ error: 'authentication_required' });
    if (response.status === 403) return res.status(403).json({ error: 'access_denied' });
    if (!response.ok) return res.status(502).json({ error: 'snapshot_lookup_failed' });
    const rows = await response.json();
    if (!Array.isArray(rows)) return res.status(502).json({ error: 'invalid_snapshot_response' });
    return res.status(200).json({ cycleId, snapshot: rows[0] || null, source: 'supabase_rls' });
  } catch {
    return res.status(503).json({ error: 'snapshot_lookup_unavailable' });
  }
}
