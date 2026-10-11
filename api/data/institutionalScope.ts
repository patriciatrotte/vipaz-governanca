import type { Request, Response } from 'express';

/**
 * Authenticated organization scope, evaluated by Supabase RLS using the caller JWT.
 * Does not use the server secret key or simulated PilotContext user.
 */
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(503).json({ error: 'institutional_auth_not_configured' });
  const match = /^Bearer\s+([^\s]+)$/i.exec(req.headers.authorization || '');
  if (!match) return res.status(401).json({ error: 'authentication_required' });
  const headers = { apikey: key, Authorization: `Bearer ${match[1]}` };
  try {
    // Both requests execute as the actual signed-in user. RLS decides scope.
    const [orgResponse, rolesResponse, cyclesResponse] = await Promise.all([
      fetch(`${url}/rest/v1/organizations?select=id,name&order=name.asc`, { headers, signal: AbortSignal.timeout(10000) }),
      fetch(`${url}/rest/v1/global_user_roles?select=role_code&role_code=eq.ADMIN_VIPAZ&status=eq.ACTIVE`, { headers, signal: AbortSignal.timeout(10000) }),
      fetch(`${url}/rest/v1/governance_cycles?select=id,organization_id&order=created_at.asc`, { headers, signal: AbortSignal.timeout(10000) })
    ]);
    if ([orgResponse.status, rolesResponse.status, cyclesResponse.status].includes(401)) return res.status(401).json({ error: 'authentication_required' });
    if ([orgResponse.status, rolesResponse.status].includes(403)) return res.status(403).json({ error: 'access_denied' });
    if (!orgResponse.ok || !rolesResponse.ok || !cyclesResponse.ok) return res.status(502).json({ error: 'organization_scope_unavailable' });
    const organizations = await orgResponse.json();
    const roles = await rolesResponse.json();
    const cycles = await cyclesResponse.json();
    return res.status(200).json({
      isGlobalAdmin: Array.isArray(roles) && roles.some(role => role.role_code === 'ADMIN_VIPAZ'),
      organizations: Array.isArray(organizations) ? organizations : [],
      visibleCycleCount: Array.isArray(cycles) ? cycles.length : 0
    });
  } catch {
    return res.status(503).json({ error: 'organization_scope_unavailable' });
  }
}
