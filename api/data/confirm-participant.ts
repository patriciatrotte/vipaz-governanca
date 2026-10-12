import type { Request, Response } from 'express';

// Explicit confirmation only. A pilot contact is never silently promoted to participant.
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  const token = /^Bearer\s+([^\s]+)$/i.exec(req.headers.authorization || '')?.[1];
  if (!token) return res.status(401).json({ error: 'authentication_required' });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (process.env.VIPAZ_PARTICIPANT_CONFIRMATION_ENABLED !== 'true') {
    return res.status(503).json({ error: 'participant_confirmation_not_enabled' });
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(503).json({ error: 'database_not_configured' });

  const body = req.body || {};
  const isUuid = (value: unknown) => typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  const nonBlank = (value: unknown) => typeof value === 'string' && value.trim().length > 0;
  if (!isUuid(body.sessionId) || !nonBlank(body.participantLegacyId) ||
      !nonBlank(body.participantName) || !nonBlank(body.confirmationNote) ||
      (body.participantRole != null && !nonBlank(body.participantRole))) {
    return res.status(400).json({ error: 'invalid_participant_confirmation' });
  }

  try {
    const upstream = await fetch(`${url}/rest/v1/rpc/vipaz_confirm_investigation_participant`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_session_id: body.sessionId,
        p_participant_legacy_id: body.participantLegacyId,
        p_participant_name: body.participantName,
        p_participant_role: body.participantRole || null,
        p_confirmation_note: body.confirmationNote
      })
    });
    if (!upstream.ok) {
      const status = upstream.status === 401 ? 401 : upstream.status === 403 ? 403 :
        upstream.status === 409 ? 409 : upstream.status === 404 ? 503 : 502;
      return res.status(status).json({ error: 'participant_confirmation_failed' });
    }
    const result = await upstream.json();
    if (!isUuid(result?.participant?.id) || result?.participant?.metadata?.confirmation_status !== 'CONFIRMED') {
      return res.status(502).json({ error: 'participant_confirmation_invalid_response' });
    }
    return res.status(200).json(result);
  } catch {
    return res.status(502).json({ error: 'participant_confirmation_failed' });
  }
}
