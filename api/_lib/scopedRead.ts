import type { Request } from 'express';
import { AccessError } from './cycleAccess.js';

/** Repassa a identidade verificada à RLS do Supabase, sem usar service role como usuário. */
export async function getScopedReadHeaders(req: Request, url: string, serverKey: string) {
  const token = /^Bearer\s+([^\s]+)$/i.exec(req.headers.authorization || '')?.[1];
  if (!token) throw new AccessError(401, 'authentication_required');
  const identity = await fetch(`${url.replace(/\/$/, '')}/auth/v1/user`, {
    headers: { apikey: serverKey, Authorization: `Bearer ${token}` }
  });
  if (!identity.ok) throw new AccessError(401, 'invalid_session');
  const user = await identity.json();
  if (!user?.id) throw new AccessError(401, 'invalid_identity');
  return { apikey: serverKey, Authorization: `Bearer ${token}` };
}
