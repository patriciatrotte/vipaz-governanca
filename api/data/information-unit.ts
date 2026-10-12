import type { Request, Response } from 'express';

/** Authenticated write-through for a single investigation information unit. */
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const token = /^Bearer\s+([^\s]+)$/i.exec(req.headers.authorization || '')?.[1];
  if (!token) return res.status(401).json({ error: 'authentication_required' });
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(503).json({ error: 'database_not_configured' });
  const b = req.body || {};
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuid.test(b.cycleId) || typeof b.legacyId !== 'string' || !b.legacyId.trim() ||
      typeof b.statement !== 'string' || !b.statement.trim() || b.statement.length > 50000 ||
      !/^D1\.[1-6]$/.test(b.doorId || '')) {
    return res.status(400).json({ error: 'invalid_information_unit' });
  }
  const headers = { apikey: key, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
  try {
    const payload = {
      legacy_id: b.legacyId,
      cycle_id: b.cycleId,
      dimension_code: 'D1',
      capacity_code: typeof b.relatedCapacity === 'string' ? b.relatedCapacity : null,
      statement: b.statement,
      scope: typeof b.scope === 'string' ? b.scope : null,
      validation_status: typeof b.validationStatus === 'string' ? b.validationStatus : 'EM_ANALISE',
      source_name: typeof b.sourceName === 'string' ? b.sourceName : null,
      extracted_by: typeof b.extractedBy === 'string' ? b.extractedBy : null,
      metadata: { door_id: b.doorId, source_role: b.sourceRole || null, response_legacy_id: b.responseId || null, source: 'VIPAZ_NATIVE' }
    };
    const response = await fetch(url + '/rest/v1/information_units?select=id,legacy_id', {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) return res.status(response.status === 403 ? 403 : 502).json({
      error: 'information_unit_write_failed', details: (await response.text()).slice(0,1000)
    });
    const rows = await response.json();
    return res.status(201).json({ saved: true, id: rows[0]?.id, legacyId: b.legacyId });
  } catch (error) {
    return res.status(502).json({ error: 'information_unit_write_failed' });
  }
}
