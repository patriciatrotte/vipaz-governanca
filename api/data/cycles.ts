import type { Request, Response } from 'express';
import { buildSupabaseHeaders } from '../../src/services/persistence/supabaseAdapters';

export default async function handler(req: Request, res: Response) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return res.status(503).json({ error: 'database_not_configured' });

  if (req.method === 'GET') {
    try {
      // Tenta com join de organizations para resgatar legacy_id se existir
      let r = await fetch(`${url}/rest/v1/governance_cycles?select=*,organizations(id,legacy_id,name)&order=created_at.asc`, { headers: buildSupabaseHeaders(key) });
      if (!r.ok) {
        // Fallback para select simples se o join falhar
        r = await fetch(`${url}/rest/v1/governance_cycles?select=*&order=created_at.asc`, { headers: buildSupabaseHeaders(key) });
      }
      if (!r.ok) {
        return res.status(502).json({ error: 'cycles_read_failed', details: await r.text() });
      }
      return res.status(200).json(await r.json());
    } catch (err: any) {
      return res.status(502).json({ error: 'cycles_read_failed', details: String(err?.message || '') });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const orgLookup = await fetch(`${url}/rest/v1/organizations?legacy_id=eq.${encodeURIComponent(body.organizationLegacyId)}&select=id&limit=1`, { headers: buildSupabaseHeaders(key) });
      if (!orgLookup.ok) return res.status(502).json({ error: 'organization_lookup_failed', details: await orgLookup.text() });
      const orgs = await orgLookup.json();
      if (!orgs[0]) return res.status(404).json({ error: 'organization_not_found' });

      const payload = {
        legacy_id: body.legacyId,
        organization_id: orgs[0].id,
        dimension: body.dimension || 'D1',
        methodology_version: body.methodologyVersion,
        name: body.name,
        cycle_type: body.cycleType || 'INITIAL_ASSESSMENT',
        status: body.status || 'NAO_INICIADO'
      };
      const r = await fetch(`${url}/rest/v1/governance_cycles?select=*`, {
        method: 'POST',
        headers: { ...buildSupabaseHeaders(key), Prefer: 'return=representation,resolution=merge-duplicates' },
        body: JSON.stringify(payload)
      });
      if (!r.ok) return res.status(502).json({ error: 'cycle_write_failed', details: await r.text() });
      const rows = await r.json();
      return res.status(200).json(rows[0] || null);
    } catch (err: any) {
      return res.status(502).json({ error: 'cycle_write_failed', details: String(err?.message || '') });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'method_not_allowed' });
}
