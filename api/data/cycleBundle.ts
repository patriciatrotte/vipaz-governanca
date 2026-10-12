import type { Request, Response } from 'express';

const getSupabaseConfig = (authorization: string | undefined) => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  const token = /^Bearer\\s+([^\\s]+)$/i.exec(authorization || '')?.[1];
  if (!url || !key) throw new Error('Supabase public configuration is missing.');
  if (!token) throw new Error('authentication_required');
  return { url: url.replace(/\\/$/, ''), key, token };
};

const buildHeaders = (key: string, token: string) => ({
  apikey: key,
  Authorization: 'Bearer ' + token,
  'Content-Type': 'application/json',
});

const fetchRows = async (
  url: string,
  key: string,
  token: string,
  tableName: string,
  filter: string
): Promise<any[]> => {
  const endpoint =
    `${url}/rest/v1/${tableName}?${filter}` +
    `&order=created_at.asc`;

  const response = await fetch(endpoint, {
    headers: buildHeaders(key, token),
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Supabase query failed for ${tableName} ` +
      `(${response.status} ${response.statusText}): ${body}`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error(
      `Unexpected Supabase response for ${tableName}: expected an array.`
    );
  }

  return data;
};

const eqFilter = (column: string, value: string) =>
  `${column}=eq.${encodeURIComponent(value)}`;

const inFilter = (column: string, values: string[]) => {
  const cleanValues = Array.from(
    new Set(values.map(String).map(v => v.trim()).filter(Boolean))
  );

  if (cleanValues.length === 0) {
    return null;
  }

  return `${column}=in.(${cleanValues.map(encodeURIComponent).join(',')})`;
};

export default async function handler(
  req: Request,
  res: Response
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cycleIdParam = req.query.cycleId;
  const cycleId = Array.isArray(cycleIdParam)
    ? cycleIdParam[0]
    : cycleIdParam;

  const cleanCycleId = String(cycleId || '').trim();

  if (!cleanCycleId) {
    return res.status(400).json({ error: 'cycleId is required' });
  }

  try {
    const { url, key, token } = getSupabaseConfig(req.headers.authorization);

    // 1. O ciclo se relaciona diretamente com investigation_sessions.
    const investigationSessions = await fetchRows(
      url,
      key,
      token,
      'investigation_sessions',
      eqFilter('cycle_id', cleanCycleId)
    );

    const sessionIds = investigationSessions
      .map(row => String(row.id || ''))
      .filter(Boolean);

    // 2. question_instances NÃO possui cycle_id.
    //    A relação física é question_instances.session_id -> investigation_sessions.id.
    const sessionFilter = inFilter('session_id', sessionIds);

    const questionInstances = sessionFilter
      ? await fetchRows(
          url,
          key,
          token,
          'question_instances',
          sessionFilter
        )
      : [];

    const questionInstanceIds = questionInstances
      .map(row => String(row.id || ''))
      .filter(Boolean);

    // 3. responses e additional_questions NÃO são buscadas por cycle_id.
    //    Ambas dependem das question_instances do ciclo.
    const questionInstanceFilter = inFilter(
      'question_instance_id',
      questionInstanceIds
    );

    const [responses, additionalQuestions] = questionInstanceFilter
      ? await Promise.all([
          fetchRows(
            url,
            key,
            'responses',
            questionInstanceFilter
          ),
          fetchRows(
            url,
            key,
            'additional_questions',
            questionInstanceFilter
          ),
        ])
      : [[], []];

    // 4. Estas estruturas possuem cycle_id fisicamente no schema.
    const [informationUnits, evidences, pendingItems] = await Promise.all([
      fetchRows(
        url,
        key,
        'information_units',
        eqFilter('cycle_id', cleanCycleId)
      ),
      fetchRows(
        url,
        key,
        'evidences',
        eqFilter('cycle_id', cleanCycleId)
      ),
      fetchRows(
        url,
        key,
        'pending_items',
        eqFilter('cycle_id', cleanCycleId)
      ),
    ]);

    // 5. Reidrata question_code nas estruturas que não o armazenam
    //    fisicamente, para que os adapters consigam reconstruir doorId.
    const questionCodeByInstanceId = new Map<string, string>();

    for (const row of questionInstances) {
      const id = String(row.id || '');
      const questionCode = String(row.question_code || '');

      if (id && questionCode) {
        questionCodeByInstanceId.set(id, questionCode);
      }
    }

    const responsesWithQuestionCode = responses.map(row => ({
      ...row,
      question_code:
        row.question_code ||
        questionCodeByInstanceId.get(
          String(row.question_instance_id || '')
        ) ||
        null,
    }));

    const questionCodeByResponseId = new Map<string, string>();

    for (const row of responsesWithQuestionCode) {
      const responseId = String(row.id || '');
      const questionCode = String(row.question_code || '');

      if (responseId && questionCode) {
        questionCodeByResponseId.set(responseId, questionCode);
      }
    }

    const informationUnitsWithQuestionCode = informationUnits.map(row => ({
      ...row,
      question_code:
        row.question_code ||
        questionCodeByInstanceId.get(
          String(row.question_instance_id || '')
        ) ||
        questionCodeByResponseId.get(
          String(row.response_id || '')
        ) ||
        null,
    }));

    const additionalQuestionsWithQuestionCode = additionalQuestions.map(
      row => ({
        ...row,
        question_code:
          row.question_code ||
          questionCodeByInstanceId.get(
            String(row.question_instance_id || '')
          ) ||
          null,
      })
    );

    const pendingItemsWithQuestionCode = pendingItems.map(row => ({
      ...row,
      question_code:
        row.question_code ||
        questionCodeByInstanceId.get(
          String(row.question_instance_id || '')
        ) ||
        null,
    }));

    return res.status(200).json({
      cycleId: cleanCycleId,
      questionInstances,
      responses: responsesWithQuestionCode,
      informationUnits: informationUnitsWithQuestionCode,
      additionalQuestions: additionalQuestionsWithQuestionCode,
      evidences,
      pendingItems: pendingItemsWithQuestionCode,
    });
  } catch (error) {
    console.error('[cycle-bundle] Central read failed:', error);

    return res.status(error instanceof Error && error.message === 'authentication_required' ? 401 : 502).json({
      error: 'Failed to load central cycle bundle.',
      detail:
        error instanceof Error
          ? error.message
          : 'Unknown central persistence error.',
    });
  }
}