import type { Request, Response } from 'express';
import { buildSupabaseHeaders } from '../../src/services/persistence/supabaseAdapters.js';

export default async function handler(req: Request, res: Response) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    return res.status(503).json({ error: 'database_not_configured' });
  }

  // Bloqueio explícito de escrita até autorização institucional no servidor.
  // Não utilizar credenciais privilegiadas para criar registros por esta rota.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  return res.status(403).json({ error: 'institutional_write_not_enabled' });
}
