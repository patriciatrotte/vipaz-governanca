import type { Request } from 'express';

export class AccessError extends Error {
  constructor(public readonly status: number, public readonly code: string) {
    super(code);
  }
}

/** Identidade validada pelo Supabase Auth; vínculos são conferidos no servidor. */
export async function requireCycleReadAccess(
  req: Request,
  url: string,
  secret: string,
  cycleId: string
): Promise<void> {
  const token = /^Bearer\s+([^\s]+)$/i.exec(req.headers.authorization || '')?.[1];
  if (!token) throw new AccessError(401, 'authentication_required');

  const identityResponse = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: secret, Authorization: `Bearer ${token}` }
  });
  if (!identityResponse.ok) throw new AccessError(401, 'invalid_session');
  const identity = await identityResponse.json();
  if (!identity?.id || typeof identity.id !== 'string') {
    throw new AccessError(401, 'invalid_identity');
  }

  // A consulta privilegiada só resolve os vínculos após validar a identidade.
  const headers = { apikey: secret, Authorization: `Bearer ${secret}` };
  const cycleResponse = await fetch(
    `${url}/rest/v1/governance_cycles?id=eq.${encodeURIComponent(cycleId)}&select=organization_id&limit=1`,
    { headers }
  );
  if (!cycleResponse.ok) throw new AccessError(503, 'authorization_unavailable');
  const cycles = await cycleResponse.json();
  const organizationId = cycles?.[0]?.organization_id;
  if (!organizationId) throw new AccessError(404, 'cycle_not_found');

  const membershipResponse = await fetch(
    `${url}/rest/v1/organization_memberships?user_id=eq.${encodeURIComponent(identity.id)}&organization_id=eq.${encodeURIComponent(organizationId)}&status=eq.ACTIVE&select=valid_from,valid_until&limit=100`,
    { headers }
  );
  if (!membershipResponse.ok) throw new AccessError(503, 'authorization_unavailable');
  const memberships = await membershipResponse.json();
  const now = Date.now();
  const authorized = Array.isArray(memberships) && memberships.some((item: any) => {
    const from = item.valid_from ? Date.parse(item.valid_from) : 0;
    const until = item.valid_until ? Date.parse(item.valid_until) : Infinity;
    return Number.isFinite(from) && from <= now && until > now;
  });
  if (!authorized) throw new AccessError(403, 'institutional_access_denied');
}
