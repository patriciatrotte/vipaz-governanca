import type { Request, Response } from 'express';

/** Save a question and its original interview response using the caller's RLS scope. */
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const token = /^Bearer\s+([^\s]+)$/i.exec(req.headers.authorization || '')?.[1];
  if (!token) return res.status(401).json({ error: 'authentication_required' });
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(503).json({ error: 'database_not_configured' });
  const b = req.body || {};
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuid.test(b.cycleId) || !/^D1\.[1-6]$/.test(b.doorId || '') ||
    !b.questionLegacyId || !b.responseLegacyId ||
    typeof b.questionText !== 'string' || !b.questionText.trim() ||
    typeof b.responseText !== 'string' || !b.responseText.trim() ||
    b.questionText.length > 20000 || b.responseText.length > 100000) {
    return res.status(400).json({ error: 'invalid_interview_record' });
  }
  const headers = { apikey: key, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
  async function read(table: string, params: URLSearchParams) {
    const response = await fetch(url + '/rest/v1/' + table + '?' + params, { headers, signal: AbortSignal.timeout(12000), cache: 'no-store' });
    if (!response.ok) throw new Error(table + '_read_' + response.status);
    return await response.json() as any[];
  }
  async function insert(table: string, payload: Record<string, unknown>) {
    const response = await fetch(url + '/rest/v1/' + table + '?select=id', {
      method: 'POST', headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) throw new Error(table + '_write_' + response.status + ': ' + (await response.text()).slice(0,350));
    const rows = await response.json() as Array<{id: string}>;
    if (!rows[0]?.id) throw new Error(table + '_missing_id');
    return rows[0].id;
  }
  try {
    const sessions = await read('investigation_sessions', new URLSearchParams({
      select: 'id', cycle_id: 'eq.' + b.cycleId, order: 'created_at.asc', limit: '1'
    }));
    const sessionId = sessions[0]?.id || await insert('investigation_sessions', {
      cycle_id: b.cycleId, modality: 'FACILITATED',
      facilitator_name: b.respondentName || 'Facilitador VIPAZ',
      metadata: { source: 'VIPAZ_NATIVE' }
    });
    const existingQuestions = await read('question_instances', new URLSearchParams({
      select: 'id', session_id: 'eq.' + sessionId, legacy_id: 'eq.' + b.questionLegacyId, limit: '1'
    }));
    const questionId = existingQuestions[0]?.id || await insert('question_instances', {
      session_id: sessionId, legacy_id: b.questionLegacyId, question_code: b.doorId,
      question_text_snapshot: b.questionText, status: 'EXPLORED',
      metadata: { respondent_name: b.respondentName || null, respondent_role: b.respondentRole || null, source: 'VIPAZ_NATIVE' }
    });
    const existingResponses = await read('responses', new URLSearchParams({
      select: 'id', question_instance_id: 'eq.' + questionId, legacy_id: 'eq.' + b.responseLegacyId, limit: '1'
    }));
    const responseId = existingResponses[0]?.id || await insert('responses', {
      question_instance_id: questionId, legacy_id: b.responseLegacyId,
      response_type: 'ORIGINAL', response_text: b.responseText,
      source_name: b.respondentName || null, source_role: b.respondentRole || null,
      modality: 'SESSAO_CONDUZIDA', metadata: { source: 'VIPAZ_NATIVE' }
    });
    return res.status(201).json({ saved: true, sessionId, questionId, responseId });
  } catch (error) {
    console.error('[VIPAZ] Interview central write failed', error);
    return res.status(502).json({ error: 'interview_write_failed', detail: String(error instanceof Error ? error.message : error).slice(0,400) });
  }
}
