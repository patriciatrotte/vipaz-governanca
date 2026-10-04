import type { VercelRequest, VercelResponse } from '@vercel/node';

const dbHeaders = (key: string) => ({
  apikey: key,
  Authorization: `Bearer ${key}`
});

async function readJson(endpoint: string, key: string) {
  const response = await fetch(endpoint, { headers: dbHeaders(key) });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    return res.status(503).json({ error: 'database_not_configured' });
  }

  const cycleId = Array.isArray(req.query.cycleId)
    ? req.query.cycleId[0]
    : req.query.cycleId;

  if (!cycleId) {
    return res.status(400).json({
      error: 'missing_cycle_id',
      details: 'Informe cycleId.'
    });
  }

  try {
    const cycles = await readJson(
      `${url}/rest/v1/governance_cycles?id=eq.${encodeURIComponent(cycleId)}&select=id,legacy_id,name,status,methodology_code,methodology_version,started_at,completed_at,organizations(id,legacy_id,name,organization_type,vertical,municipality,state,is_demo)&limit=1`,
      key
    );

    const cycle = cycles[0];
    if (!cycle) {
      return res.status(404).json({ error: 'cycle_not_found' });
    }

    const sessions = await readJson(
      `${url}/rest/v1/investigation_sessions?cycle_id=eq.${encodeURIComponent(cycle.id)}&select=id,legacy_id,modality,facilitator_name,started_at,completed_at,created_at&order=created_at.asc`,
      key
    );

    const investigationSessions = [];

    for (const session of sessions) {
      const questions = await readJson(
        `${url}/rest/v1/question_instances?session_id=eq.${encodeURIComponent(session.id)}&select=id,legacy_id,question_code,question_text_snapshot,status,concluded_at,created_at&order=created_at.asc`,
        key
      );

      const questionModels = [];

      for (const question of questions) {
        const responses = await readJson(
          `${url}/rest/v1/responses?question_instance_id=eq.${encodeURIComponent(question.id)}&select=*&order=created_at.asc`,
          key
        );

        questionModels.push({
          id: question.id,
          legacyId: question.legacy_id,
          code: question.question_code,
          textSnapshot: question.question_text_snapshot,
          status: question.status,
          concludedAt: question.concluded_at,
          responses
        });
      }

      investigationSessions.push({
        id: session.id,
        legacyId: session.legacy_id,
        modality: session.modality,
        facilitatorName: session.facilitator_name,
        startedAt: session.started_at,
        completedAt: session.completed_at,
        questions: questionModels
      });
    }

    return res.status(200).json({
      reportModelVersion: 'T1-EXPERIMENTAL-01',
      organization: cycle.organizations,
      cycle: {
        id: cycle.id,
        legacyId: cycle.legacy_id,
        name: cycle.name,
        status: cycle.status,
        methodologyCode: cycle.methodology_code,
        methodologyVersion: cycle.methodology_version,
        startedAt: cycle.started_at,
        completedAt: cycle.completed_at
      },
      investigation: {
        sessions: investigationSessions,
        totals: {
          sessions: investigationSessions.length,
          questions: investigationSessions.reduce(
            (total, session) => total + session.questions.length,
            0
          ),
          responses: investigationSessions.reduce(
            (total, session) =>
              total +
              session.questions.reduce(
                (questionTotal: number, question: any) =>
                  questionTotal + question.responses.length,
                0
              ),
            0
          )
        }
      }
    });
  } catch (error) {
    return res.status(502).json({
      error: 'cycle_report_read_failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
