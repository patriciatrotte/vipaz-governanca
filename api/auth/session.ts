import type { Request, Response } from 'express';

/**
 * Pré-requisito para autorização institucional.
 * A identidade vem exclusivamente do Supabase Auth; perfis simulados no navegador
 * não conferem permissão de acesso nem de escrita.
 *
 * Este endpoint não concede permissões e não utiliza dados enviados pelo cliente
 * como prova de vínculo institucional.
 */
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return res.status(503).json({ error: 'auth_not_configured' });

  const authorization = req.headers.authorization || '';
  const match = /^Bearer\s+([^\s]+)$/i.exec(authorization);
  if (!match) return res.status(401).json({ error: 'authentication_required' });

  try {
    const identityResponse = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: secret, Authorization: `Bearer ${match[1]}` }
    });
    if (!identityResponse.ok) return res.status(401).json({ error: 'invalid_session' });
    const identity = await identityResponse.json();
    const userId = identity?.id;
    if (typeof userId !== 'string' || !/^[0-9a-f-]{36}$/i.test(userId)) {
      return res.status(401).json({ error: 'invalid_identity' });
    }

    const membershipResponse = await fetch(
      `${url}/rest/v1/organization_memberships?user_id=eq.${encodeURIComponent(userId)}&status=eq.ACTIVE&select=organization_id,role_code,valid_from,valid_until`,
      { headers: { apikey: secret, Authorization: `Bearer ${secret}` } }
    );
    if (!membershipResponse.ok) {
      return res.status(502).json({ error: 'membership_lookup_failed' });
    }
    const memberships = await membershipResponse.json();
    const now = Date.now();
    const active = Array.isArray(memberships) ? memberships.filter((item: any) => {
      const from = item.valid_from ? Date.parse(item.valid_from) : 0;
      const until = item.valid_until ? Date.parse(item.valid_until) : Infinity;
      return Number.isFinite(from) && from <= now && until > now;
    }).map((item: any) => ({
      organizationId: item.organization_id,
      role: item.role_code
    })) : [];

    // Administradores globais podem acessar o catálogo sob as políticas RLS,
    // independentemente de vínculo individual com uma Câmara.
    const adminResponse = await fetch(
      `${url}/rest/v1/global_user_roles?user_id=eq.${encodeURIComponent(userId)}&role_code=eq.ADMIN_VIPAZ&status=eq.ACTIVE&revoked_at=is.null&select=valid_from,valid_until`,
      { headers: { apikey: secret, Authorization: `Bearer ${secret}` } }
    );
    if (!adminResponse.ok) return res.status(502).json({ error: 'global_role_lookup_failed' });
    const globalRoles = await adminResponse.json();
    const isGlobalAdmin = Array.isArray(globalRoles) && globalRoles.some((item: any) => {
      const from = item.valid_from ? Date.parse(item.valid_from) : 0;
      const until = item.valid_until ? Date.parse(item.valid_until) : Infinity;
      return Number.isFinite(from) && from <= now && until > now;
    });

    return res.status(200).json({ authenticated: true, userId, memberships: active, isGlobalAdmin });
  } catch {
    return res.status(502).json({ error: 'authentication_service_unavailable' });
  }
}
