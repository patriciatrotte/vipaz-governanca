import type { Request, Response } from 'express';
import { buildSupabaseHeaders } from '../../src/services/persistence/supabaseAdapters.js';

export default async function handler(req: Request, res: Response) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    return res.status(503).json({ error: 'database_not_configured' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const cycleId = req.query.cycleId as string;
  if (!cycleId || !cycleId.trim()) {
    return res.status(400).json({ error: 'missing_cycle_id' });
  }

  const cleanCycleId = cycleId.trim();

  const fetchTable = async (tableName: string) => {
    try {
      const endpoint = `${url}/rest/v1/${tableName}?cycle_id=eq.${encodeURIComponent(cleanCycleId)}&order=created_at.asc`;
      const r = await fetch(endpoint, { headers: buildSupabaseHeaders(key) });
      if (!r.ok) {
        console.warn(`[VIPAZ Backend] Consulta a ${tableName} retornou status ${r.status}`);
        return [];
      }
      const data = await r.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn(`[VIPAZ Backend] Falha na consulta à tabela ${tableName}:`, err);
      return [];
    }
  };

  try {
    const [
      questionInstances,
      responses,
      informationUnits,
      additionalQuestions,
      evidences,
      pendingItems
    ] = await Promise.all([
      fetchTable('question_instances'),
      fetchTable('responses'),
      fetchTable('information_units'),
      fetchTable('additional_questions'),
      fetchTable('evidences'),
      fetchTable('pending_items')
    ]);

    return res.status(200).json({
      cycleId: cleanCycleId,
      questionInstances,
      responses,
      informationUnits,
      additionalQuestions,
      evidences,
      pendingItems
    });
  } catch (error: any) {
    console.error('[VIPAZ Backend] Erro fatal ao montar cycle-bundle:', error);
    return res.status(502).json({
      error: 'cycle_bundle_fetch_failed',
      details: String(error?.message || '')
    });
  }
}
