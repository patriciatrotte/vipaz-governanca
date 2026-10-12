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
    try {
      // Tenta com join de organizations para resgatar legacy_id se existir
      let r = await fetch(`${url}/rest/v1/governance_cycles?select=*,organizations(id,legacy_id,name)&order=created_at.asc`, { headers: authHeaders });
      if (!r.ok) {
        // Fallback para select simples se o join falhar
        r = await fetch(`${url}/rest/v1/governance_cycles?select=*&order=created_at.asc`, { headers: authHeaders });
      }
      if (!r.ok) {
        return res.status(502).json({ error: 'cycles_read_failed' });
      }
      return res.status(200).json(await r.json());
    } catch (err: any) {
      return res.status(502).json({ error: 'cycles_read_failed' });
    }
  }

  if (req.method === 'POST') {
    // A cycle must not be created when its required investigation RPC is disabled.
    // Otherwise the following session request fails and leaves an orphaned cycle.
    if (process.env.VIPAZ_ATOMIC_INVESTIGATION_ENABLED !== 'true') {
      return res.status(503).json({ error: 'atomic_investigation_not_enabled' });
    }
    try {
      const body = req.body || {};
      const orgFilter = body.organizationId
        ? `id=eq.${encodeURIComponent(body.organizationId)}`
        : `legacy_id=eq.${encodeURIComponent(body.organizationLegacyId || '')}`;
      const orgLookup = await fetch(`${url}/rest/v1/organizations?${orgFilter}&select=id&limit=1`, { headers: authHeaders });
      if (!orgLookup.ok) return res.status(502).json({ error: 'organization_lookup_failed' });
      const orgs = await orgLookup.json();
      if (!orgs[0]) return res.status(404).json({ error: 'organization_not_found' });

const payload = {
  legacy_id: body.legacyId,
  organization_id: orgs[0].id,
  name: body.name,
  methodology_code: 'VIPAZ-D1',
  methodology_version: body.methodologyVersion || '1.0',
  status: body.status === 'EM_ANDAMENTO' ? 'IN_PROGRESS' : 'NOT_STARTED',
  metadata: {
    dimension: body.dimension || 'D1',
    cycle_type: body.cycleType || 'INITIAL_ASSESSMENT'
  }
};
      const r = await fetch(`${url}/rest/v1/governance_cycles?select=*`, {
        method: 'POST',
        headers: { ...authHeaders, Prefer: 'return=representation,resolution=merge-duplicates' },
        body: JSON.stringify(payload)
      });
      if (!r.ok) return res.status(r.status === 401 ? 401 : r.status === 403 ? 403 : 502).json({ error: 'cycle_write_failed' });
      const rows = await r.json();
      return res.status(200).json(rows[0] || null);
    } catch (err: any) {
      return res.status(502).json({ error: 'cycle_write_failed' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'method_not_allowed' });
}
