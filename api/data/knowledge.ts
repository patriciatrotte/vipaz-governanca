import type { Request, Response } from 'express';
import { buildSupabaseHeaders } from '../../src/services/persistence/supabaseAdapters.js';

/** Public, read-only projection of PUBLISHED foundational knowledge.
 * Server credentials never reach the browser; no institutional records are queried.
 */
export default async function handler(req: Request, res: Response) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const url = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return res.status(503).json({ error: 'Knowledge service not configured' });
  const headers = buildSupabaseHeaders(secret);
  try {
    const response = await fetch(
      `${url}/rest/v1/knowledge_entries?select=id,entry_code,version,question,foundational_answer,explanation&status=eq.PUBLISHED&order=question.asc&limit=100`,
      { headers }
    );
    if (!response.ok) throw new Error('Knowledge entries query failed: ' + response.status);
    const entries = await response.json();
    if (!Array.isArray(entries)) throw new Error('Invalid knowledge payload');
    if (!entries.length) return res.status(200).json({ entries: [] });
    const ids = entries.map((entry: {id:string}) => entry.id).filter((id: string) => /^[0-9a-f-]{36}$/i.test(id));
    if (!ids.length) return res.status(200).json({ entries: [] });
    const linksResponse = await fetch(
      `${url}/rest/v1/knowledge_entry_sources?select=entry_id,grounding_note,methodology_references(title,authority,reference_code,provision,version_or_date,source_url)&entry_id=in.(${ids.join(',')})`,
      { headers }
    );
    if (!linksResponse.ok) throw new Error('Knowledge sources query failed: ' + linksResponse.status);
    const links = await linksResponse.json();
    if (!Array.isArray(links)) throw new Error('Invalid sources payload');
    const sourcesByEntry = new Map<string, unknown[]>();
    for (const link of links) {
      if (!link?.methodology_references?.source_url) continue;
      const current = sourcesByEntry.get(link.entry_id) || [];
      current.push({ ...link.methodology_references, grounding_note: link.grounding_note });
      sourcesByEntry.set(link.entry_id, current);
    }
    // Never publish an orphaned answer without at least one traceable source.
    const safe = entries.filter((entry: {id:string}) => (sourcesByEntry.get(entry.id) || []).length > 0)
      .map((entry: {id:string}) => ({ ...entry, sources: sourcesByEntry.get(entry.id) }));
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ entries: safe });
  } catch (error) {
    console.error('Knowledge API unavailable', error);
    return res.status(502).json({ error: 'Knowledge service unavailable' });
  }
}
