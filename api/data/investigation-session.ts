import type { Request, Response } from 'express';
import { buildSupabaseHeaders } from '../../src/services/persistence/supabaseAdapters.js';

export default async function handler(req: Request, res: Response) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    return res.status(503).json({ error: 'database_not_configured' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const body = req.body || {};

    if (!body.cycleLegacyId) {
      return res.status(400).json({ error: 'cycle_legacy_id_required' });
    }

    const cycleLookup = await fetch(
      `${url}/rest/v1/governance_cycles?legacy_id=eq.${encodeURIComponent(body.cycleLegacyId)}&select=id&limit=1`,
      { headers: buildSupabaseHeaders(key) }
    );

    if (!cycleLookup.ok) {
      return res.status(502).json({
        error: 'cycle_lookup_failed',
        details: await cycleLookup.text()
      });
    }

    const cycles = await cycleLookup.json();

    if (!cycles[0]) {
      return res.status(404).json({ error: 'cycle_not_found' });
    }

    const sessionPayload = {
      legacy_id: body.sessionLegacyId,
      cycle_id: cycles[0].id,
      modality: 'FACILITATED',
      facilitator_name: body.facilitatorName || 'Facilitador VIPAZ',
      started_at: new Date().toISOString(),
      metadata: {
        source: 'VIPAZ_NATIVE',
        dimension: 'D1'
      }
    };

    const sessionResponse = await fetch(
      `${url}/rest/v1/investigation_sessions?select=*`,
      {
        method: 'POST',
        headers: {
          ...buildSupabaseHeaders(key),
          Prefer: 'return=representation'
        },
        body: JSON.stringify(sessionPayload)
      }
    );

    if (!sessionResponse.ok) {
      return res.status(502).json({
        error: 'investigation_session_write_failed',
        details: await sessionResponse.text()
      });
    }

    const sessions = await sessionResponse.json();
    const session = sessions[0];

    if (!session) {
      return res.status(502).json({
        error: 'investigation_session_not_returned'
      });
    }

    let participant = null;

    if (body.interlocutorName) {
      const participantPayload = {
        legacy_id: body.participantLegacyId,
        session_id: session.id,
        name: body.interlocutorName,
        role: body.interlocutorRole || null,
        department: body.interlocutorRole || null,
        participant_type: 'RESPONDENT',
        metadata: {
          source: 'VIPAZ_NATIVE',
          source_role: 'INTERLOCUTOR_PRINCIPAL',
          source_type: 'INSTITUTIONAL_INTERLOCUTOR',
          institutional_function: body.interlocutorRole || null
        }
      };

      const participantResponse = await fetch(
        `${url}/rest/v1/interview_participants?select=*`,
        {
          method: 'POST',
          headers: {
            ...buildSupabaseHeaders(key),
            Prefer: 'return=representation'
          },
          body: JSON.stringify(participantPayload)
        }
      );

      if (!participantResponse.ok) {
        return res.status(502).json({
          error: 'interview_participant_write_failed',
          details: await participantResponse.text(),
          session
        });
      }

      const participants = await participantResponse.json();
      participant = participants[0] || null;
    }

    return res.status(200).json({
      session,
      participant
    });
  } catch (err: any) {
    return res.status(502).json({
      error: 'investigation_session_write_failed',
      details: String(err?.message || err)
    });
  }
}