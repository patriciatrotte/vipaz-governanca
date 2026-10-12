import type { Request, Response } from 'express';

// Whole-cycle RPC is opt-in and must never be enabled before reviewed migration.
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  const token = /^Bearer\s+([^\s]+)$/i.exec(req.headers.authorization || '')?.[1];
  if (!token) return res.status(401).json({ error: 'authentication_required' });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (process.env.VIPAZ_ATOMIC_CYCLE_OPEN_ENABLED !== 'true') {
    return res.status(503).json({ error: 'atomic_cycle_open_not_enabled' });
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(503).json({ error: 'database_not_configured' });
  const body = req.body || {};
  const isUuid = (value: unknown) => typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  const nonBlank = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
  const hasParticipant = nonBlank(body.interlocutorName);
  if (!isUuid(body.organizationId) || !nonBlank(body.cycleLegacyId) ||
      !nonBlank(body.cycleName) || !nonBlank(body.methodologyVersion) ||
      !nonBlank(body.sessionLegacyId) ||
      hasParticipant !== nonBlank(body.participantLegacyId) ||
      (body.interlocutorName != null && !hasParticipant) ||
      (body.participantLegacyId != null && !nonBlank(body.participantLegacyId)) ||
      (body.interlocutorRole != null && !nonBlank(body.interlocutorRole))) {
    return res.status(400).json({ error: 'invalid_cycle_open_identity' });
  }
  try {
    const upstream = await fetch(`${url}/rest/v1/rpc/vipaz_open_cycle_atomic`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_organization_id: body.organizationId,
        p_cycle_legacy_id: body.cycleLegacyId,
        p_cycle_name: body.cycleName,
        p_methodology_version: body.methodologyVersion,
        p_session_legacy_id: body.sessionLegacyId,
        p_facilitator_name: body.facilitatorName || 'Facilitador VIPAZ',
        p_participant_legacy_id: body.participantLegacyId || null,
        p_participant_name: body.interlocutorName || null,
        p_participant_role: body.interlocutorRole || null
      })
    });
    if (!upstream.ok) {
      const status = upstream.status === 401 ? 401 : upstream.status === 403 ? 403 :
        upstream.status === 409 ? 409 : upstream.status === 404 ? 503 : 502;
      return res.status(status).json({ error: 'atomic_cycle_open_write_failed' });
    }
    const result = await upstream.json();
    if (!result?.cycle?.id || !result?.session?.id) {
      return res.status(502).json({ error: 'atomic_cycle_open_invalid_response' });
    }
    return res.status(200).json(result);
  } catch {
    return res.status(502).json({ error: 'atomic_cycle_open_write_failed' });
  }
}
