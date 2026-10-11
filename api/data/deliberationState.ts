import type { Request, Response } from 'express';

/**
 * VIPAZ — consulta do estado efetivo de uma deliberação.
 * A identidade é o JWT do Supabase Auth enviado pelo usuário real.
 * Nunca utilizar SUPABASE_SECRET_KEY, perfis simulados ou userId do corpo.
 */
export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !publishableKey) {
    return res.status(503).json({ error: 'institutional_auth_not_configured' });
  }

  const authorization = req.headers.authorization || '';
  const match = /^Bearer\s+([^\s]+)$/i.exec(authorization);
  if (!match) return res.status(401).json({ error: 'authentication_required' });

  const id = typeof req.query.deliberationId === 'string' ? req.query.deliberationId : '';
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({ error: 'invalid_deliberation_id' });
  }

  try {
    const response = await fetch(`${url}/rest/v1/rpc/vipaz_get_deliberation_effective_state`, {
      method: 'POST',
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${match[1]}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_deliberation: id }),
      signal: AbortSignal.timeout(10000)
    });

    if (response.status === 401 || response.status === 403) {
      return res.status(response.status).json({ error: 'institutional_access_denied' });
    }
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      if (error?.code === '42501') return res.status(403).json({ error: 'institutional_access_denied' });
      if (error?.message === 'Deliberation not found') return res.status(404).json({ error: 'deliberation_not_found' });
      // Do not leak internal PostgREST / database error details to the browser.
      return res.status(502).json({ error: 'institutional_state_unavailable' });
    }
    return res.status(200).json(await response.json());
  } catch {
    return res.status(503).json({ error: 'institutional_state_unavailable' });
  }
}
