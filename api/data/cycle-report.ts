import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    const response = await fetch(
      `${url}/rest/v1/governance_cycles?id=eq.${encodeURIComponent(cycleId)}&select=id,legacy_id,name,status,methodology_code,methodology_version,started_at,completed_at,organizations(id,legacy_id,name,organization_type,vertical,municipality,state,is_demo)&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`
        }
      }
    );

    if (!response.ok) {
      return res.status(502).json({
        error: 'cycle_read_failed',
        details: await response.text()
      });
    }

    const cycles = await response.json();
    const cycle = cycles[0];

    if (!cycle) {
      return res.status(404).json({ error: 'cycle_not_found' });
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
      }
    });
  } catch (error) {
    return res.status(502).json({
      error: 'cycle_report_read_failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
