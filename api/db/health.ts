import type { Request, Response } from 'express';
import { buildSupabaseHeaders } from '../../src/services/persistence/supabaseAdapters';

export default async function handler(_req: Request, res: Response) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return res.status(503).json({
      status: 'unavailable',
      database: 'not_configured',
      configured: false
    });
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/organizations?select=id&limit=1`,
      {
        headers: buildSupabaseHeaders(supabaseSecretKey)
      }
    );

    if (!response.ok) {
      console.error('Supabase health check failed:', response.status, await response.text());
      return res.status(502).json({
        status: 'error',
        database: 'unreachable',
        configured: true
      });
    }

    return res.status(200).json({
      status: 'ok',
      database: 'connected',
      configured: true
    });
  } catch (error) {
    console.error('Supabase health check error:', error);
    return res.status(502).json({
      status: 'error',
      database: 'unreachable',
      configured: true
    });
  }
}
