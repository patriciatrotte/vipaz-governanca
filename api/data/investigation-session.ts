import type { Request, Response } from 'express';

// RPC is deliberately gated until the reviewed database migration is applied.
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  const token = /^Bearer\s+([^\s]+)$/i.exec(req.headers.authorization || '')?.[1];
  if (!token) return res.status(401).json({ error: 'authentication_required' });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(503).json({ error: 'database_not_configured' });

  // Prevent non-atomic legacy writes. A false/missing flag always fails closed.
  if (process.env.VIPAZ_ATOMIC_INVESTIGATION_ENABLED !== 'true') {
    return res.status(503).json({ error: 'atomic_investigation_not_enabled' });
  }

  const body = req.body || {};
  if (!body.cycleId || !body.sessionLegacyId ||
      (body.interlocutorName && !body.participantLegacyId) ||
      (!body.interlocutorName && body.participantLegacyId)) {
    return res.status(400).json({ error: 'invalid_investigation_identity' });
  }
  try {
    const upstream = await fetch(`${url}/rest/v1/rpc/vipaz_create_investigation_atomic`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_cycle_id: body.cycleId,
        p_session_legacy_id: body.sessionLegacyId,
        p_facilitator_name: body.facilitatorName || 'Facilitador VIPAZ',
        p_participant_legacy_id: body.participantLegacyId || null,
        p_participant_name: body.interlocutorName || null,
        p_participant_role: body.interlocutorRole || null
      })
    });
    if (!upstream.ok) {
      const details = await upstream.text();
      const status = upstream.status === 401 ? 401 : upstream.status === 403 ? 403 :
        upstream.status === 404 ? 503 : upstream.status === 409 ? 409 : 502;
      return res.status(status).json({ error: 'atomic_investigation_write_failed', details });
    }
    const result = await upstream.json();
    if (!result || !result.session?.id) {
      return res.status(502).json({ error: 'atomic_investigation_invalid_response' });
    }
    return res.status(200).json(result);
  } catch (error: unknown) {
    return res.status(502).json({
      error: 'atomic_investigation_write_failed',
      details: error instanceof Error ? error.message : 'unknown_error'
    });
  }
}
