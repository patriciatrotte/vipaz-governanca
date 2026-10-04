import type { VercelRequest, VercelResponse } from '@vercel/node';

const dbHeaders = (key: string) => ({
  apikey: key,
  Authorization: `Bearer ${key}`
});

async function readJson(endpoint: string, key: string) {
  const response = await fetch(endpoint, { headers: dbHeaders(key) });
  if (!response.ok) throw new Error(await response.text());
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

  const cycleId = Array.isArray(req.query.cycleId) ? req.query.cycleId[0] : req.query.cycleId;
  if (!cycleId) {
    return res.status(400).json({ error: 'missing_cycle_id', details: 'Informe cycleId.' });
  }

  try {
    const cycles = await readJson(
      `${url}/rest/v1/governance_cycles?id=eq.${encodeURIComponent(cycleId)}&select=id,legacy_id,name,status,methodology_code,methodology_version,started_at,completed_at,organizations(id,legacy_id,name,organization_type,vertical,municipality,state,is_demo)&limit=1`,
      key
    );

    const cycle = cycles[0];
    if (!cycle) return res.status(404).json({ error: 'cycle_not_found' });

    const [sessions, cycleInformationUnits] = await Promise.all([
      readJson(
        `${url}/rest/v1/investigation_sessions?cycle_id=eq.${encodeURIComponent(cycle.id)}&select=id,legacy_id,modality,facilitator_name,started_at,completed_at,created_at&order=created_at.asc`,
        key
      ),
      readJson(
        `${url}/rest/v1/information_units?cycle_id=eq.${encodeURIComponent(cycle.id)}&select=id,legacy_id,question_instance_id,response_id,dimension_code,capacity_code,statement,value,scope,validation_status,source_name,extracted_by,created_at&order=created_at.asc`,
        key
      )
    ]);

    const unitsByQuestion = new Map<string, any[]>();
    for (const unit of cycleInformationUnits) {
      if (!unit.question_instance_id) continue;
      const current = unitsByQuestion.get(unit.question_instance_id) || [];
      current.push(unit);
      unitsByQuestion.set(unit.question_instance_id, current);
    }

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

        const informationUnits = unitsByQuestion.get(question.id) || [];
        const interpretationState =
          informationUnits.length > 0
            ? 'STRUCTURED_INFORMATION_AVAILABLE'
            : responses.length > 0
              ? 'RESPONSE_WITHOUT_STRUCTURED_INFORMATION'
              : 'INSUFFICIENT_INFORMATION';

        questionModels.push({
          id: question.id,
          legacyId: question.legacy_id,
          code: question.question_code,
          textSnapshot: question.question_text_snapshot,
          status: question.status,
          concludedAt: question.concluded_at,
          responses,
          informationUnits,
          interpretationState
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

    const allQuestions = investigationSessions.flatMap((session: any) => session.questions);
    const coverage = {
      structuredInformationAvailable: allQuestions.filter(
        (question: any) => question.interpretationState === 'STRUCTURED_INFORMATION_AVAILABLE'
      ).length,
      responseWithoutStructuredInformation: allQuestions.filter(
        (question: any) => question.interpretationState === 'RESPONSE_WITHOUT_STRUCTURED_INFORMATION'
      ).length,
      insufficientInformation: allQuestions.filter(
        (question: any) => question.interpretationState === 'INSUFFICIENT_INFORMATION'
      ).length
    };

    const validatedUnits = cycleInformationUnits.filter(
      (unit: any) => unit.validation_status === 'VALIDADO'
    );

    const interpretationInputs = allQuestions.map((question: any) => {
      const validatedQuestionUnits = question.informationUnits.filter(
        (unit: any) => unit.validation_status === 'VALIDADO'
      );

      return {
        questionInstanceId: question.id,
        questionCode: question.code,
        questionTextSnapshot: question.textSnapshot,
        sourceState: question.interpretationState,
        responses: question.responses.map((response: any) => ({
          id: response.id,
          responseText: response.response_text,
          sourceName: response.source_name,
          sourceRole: response.source_role,
          modality: response.modality
        })),
        validatedInformationUnits: validatedQuestionUnits.map((unit: any) => ({
          id: unit.id,
          responseId: unit.response_id,
          dimensionCode: unit.dimension_code,
          legacyCapacityCode: unit.capacity_code,
          statement: unit.statement,
          value: unit.value,
          scope: unit.scope,
          sourceName: unit.source_name,
          extractedBy: unit.extracted_by
        })),
        interpretation: {
          status: 'NOT_PERFORMED',
          category: null,
          summary: null,
          signalsOfCapability: [],
          potentialGaps: [],
          suggestedProbes: [],
          humanValidation: {
            status: 'PENDING',
            notes: null
          }
        }
      };
    });

    const executivePortrait = {
      status: 'EXPERIMENTAL',
      basis: {
        methodologyCode: cycle.methodology_code,
        methodologyVersion: cycle.methodology_version,
        cycleStatus: cycle.status
      },
      investigationCoverage: {
        questionsInvestigated: allQuestions.length,
        questionsWithStructuredInformation: coverage.structuredInformationAvailable,
        questionsAwaitingStructuring: coverage.responseWithoutStructuredInformation,
        questionsWithoutInformation: coverage.insufficientInformation,
        structuredInformationUnits: cycleInformationUnits.length,
        validatedInformationUnits: validatedUnits.length
      },
      interpretation: {
        status: 'NOT_PERFORMED',
        inputs: interpretationInputs,
        note: 'Respostas e unidades validadas são insumos da interpretação. Não constituem, isoladamente, achados, gaps, capacidades demonstradas ou nível de maturidade.'
      },
      conclusions: {
        maturity: {
          status: 'NOT_CONCLUDED',
          reason: 'Maturidade não é calculada automaticamente a partir de respostas ou unidades de informação.'
        },
        gaps: {
          status: 'NOT_CONCLUDED',
          reason: 'Gap requer interpretação validada e regra de avaliação aplicável; não é inferido de resposta negativa, ausência de experiência ou ausência de unidade estruturada.'
        },
        nextState: {
          status: 'NOT_CONCLUDED',
          reason: 'O próximo estado depende de conclusão metodológica validada sobre o estado demonstrado.'
        }
      },
      limitations: [
        ...(coverage.responseWithoutStructuredInformation > 0
          ? [`${coverage.responseWithoutStructuredInformation} porta(s) possuem resposta, mas ainda não possuem informação estruturada persistida.`]
          : []),
        ...(coverage.insufficientInformation > 0
          ? [`${coverage.insufficientInformation} porta(s) não possuem informação suficiente registrada.`]
          : []),
        'A interpretação assistida ainda não foi executada neste modelo T1.',
        'Informação validada significa informação confirmada, não capacidade institucional demonstrada.',
        'Códigos históricos de capacidade são preservados apenas como proveniência do ciclo e não são aplicados como taxonomia metodológica atual.',
        'Este retrato experimental preserva a versão metodológica histórica do ciclo e não aplica retroativamente a metodologia de trabalho atual.'
      ]
    };

    return res.status(200).json({
      reportModelVersion: 'T1-EXPERIMENTAL-02',
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
          questions: allQuestions.length,
          responses: allQuestions.reduce(
            (total: number, question: any) => total + question.responses.length,
            0
          ),
          informationUnits: cycleInformationUnits.length
        },
        coverage
      },
      executivePortrait,
      safeguards: {
        maturityAutomaticallyCalculated: false,
        validatedInformationDoesNotMeanDemonstratedCapability: true,
        incompleteInterpretationBlocksAutomaticMaturityConclusion: true,
        historicalCapacityCodesAreProvenanceOnly: true
      }
    });
  } catch (error) {
    return res.status(502).json({
      error: 'cycle_report_read_failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
