import type { Request, Response } from 'express';

/**
 * Escrita suspensa até que a identidade e a autorização institucional
 * sejam verificadas no servidor. Nenhum dado existente é alterado.
 */
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  return res.status(403).json({ error: 'institutional_write_not_enabled' });
}
