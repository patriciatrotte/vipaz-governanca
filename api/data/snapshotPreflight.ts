import type { Request, Response } from 'express';

/**
 * SNAP-01: read-only preflight. A successful read is NOT authorization to issue.
 * Uses the caller JWT and RLS; never uses the service-role secret.
 */
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const cycleId = typeof req.query.cycleId === 'string' ? req.query.cycleId.trim() : '';
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuid.test(cycleId)) return res.status(400).json({ error: 'invalid_cycle_id' });

  const bearer = /^Bearer\s+([^\s]+)$/i.exec(req.headers.authorization || '');
  if (!bearer) return res.status(401).json({ error: 'authentication_required' });

  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(503).json({ error: 'institutional_auth_not_configured' });

  const headers = { apikey: key, Authorization: 'Bearer ' + bearer[1] };
  try {
    const userResponse = await fetch(url + '/auth/v1/user', { headers, signal: AbortSignal.timeout(10000) });
    if (!userResponse.ok) return res.status(401).json({ error: 'authentication_required' });
    const user = await userResponse.json();
    if (!user?.id) return res.status(401).json({ error: 'authentication_required' });

    const query = new URLSearchParams({
      select: 'id,organization_id,methodology_version',
      id: 'eq.' + cycleId,
      limit: '1'
    });
    const cycleResponse = await fetch(url + '/rest/v1/governance_cycles?' + query, {
      headers, signal: AbortSignal.timeout(10000), cache: 'no-store'
    });
    if (cycleResponse.status === 403) return res.status(403).json({ error: 'access_denied' });
    if (!cycleResponse.ok) return res.status(503).json({ error: 'cycle_scope_unavailable' });
    const cycles = await cycleResponse.json();
    const cycle = Array.isArray(cycles) ? cycles[0] : null;
    if (!cycle) return res.status(404).json({ error: 'cycle_not_visible' });

    return res.status(200).json({
      cycleId,
      organizationId: cycle.organization_id,
      methodologyVersion: cycle.methodology_version,
      checks: {
        authenticatedIdentity: true,
        visibleCycle: true,
        authorizedToIssue: false,
        validatedMethodology: false,
        centralSnapshotPersisted: null
      },
      eligibleToIssue: false,
      checksMeaning: 'null means not checked; false means not authorized or not verified',
      reason: 'Emissão não habilitada: autorização de escrita e validação metodológica ainda não verificadas.'
    });
  } catch {
    return res.status(503).json({ error: 'preflight_unavailable' });
  }
}
