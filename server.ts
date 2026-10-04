import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return geminiClient;
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: 'D1 v1.0',
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Supabase server-side connectivity check.
// The privileged key stays on the server and is never sent to the browser.
app.get('/api/db/health', async (_req: Request, res: Response) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return res.status(503).json({ status: 'unavailable', database: 'not_configured', configured: false });
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/organizations?select=id&limit=1`, {
      headers: {
        apikey: supabaseSecretKey,
        Authorization: `Bearer ${supabaseSecretKey}`
      }
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('Supabase health check failed:', response.status, details);
      return res.status(502).json({ status: 'error', database: 'unreachable', configured: true });
    }

    return res.json({ status: 'ok', database: 'connected', configured: true });
  } catch (error) {
    console.error('Supabase health check error:', error);
    return res.status(502).json({ status: 'error', database: 'unreachable', configured: true });
  }
});

// One-time T2 administrator bootstrap. Server-only; privileged key never reaches the browser.
app.post('/api/auth/bootstrap-admins', async (req: Request, res: Response) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  const bootstrapKey = process.env.VIPAZ_BOOTSTRAP_KEY;
  if (!supabaseUrl || !supabaseSecretKey || !bootstrapKey) return res.status(503).json({ error: 'Bootstrap não configurado.' });
  if (req.headers['x-vipaz-bootstrap-key'] !== bootstrapKey) return res.status(403).json({ error: 'Não autorizado.' });

  const { email, password, displayName } = req.body || {};
  if (!email || !password || password.length < 12) return res.status(400).json({ error: 'E-mail e senha temporária forte são obrigatórios.' });

  const create = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: supabaseSecretKey, Authorization: `Bearer ${supabaseSecretKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { display_name: displayName || email, must_change_password: true } })
  });
  const user:any = await create.json();
  if (!create.ok) return res.status(create.status).json({ error: user?.msg || user?.message || 'Falha ao criar usuário.' });

  const headers = { apikey: supabaseSecretKey, Authorization: `Bearer ${supabaseSecretKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' };
  const profile = await fetch(`${supabaseUrl}/rest/v1/profiles`, { method:'POST', headers, body:JSON.stringify({ user_id:user.id, display_name:displayName || email }) });
  if (!profile.ok) return res.status(500).json({ error:'Usuário criado, mas o perfil não pôde ser associado.', userId:user.id });
  const role = await fetch(`${supabaseUrl}/rest/v1/global_user_roles`, { method:'POST', headers, body:JSON.stringify({ user_id:user.id, role_code:'ADMIN_VIPAZ', active:true }) });
  if (!role.ok) return res.status(500).json({ error:'Usuário e perfil criados, mas ADMIN_VIPAZ não pôde ser associado.', userId:user.id });

  return res.status(201).json({ ok:true, userId:user.id, email:user.email, mustChangePassword:true, role:'ADMIN_VIPAZ' });
});

// Endpoint: AI Probing Suggestion (Neutral, non-leading)
app.post('/api/ai/probe', async (req: Request, res: Response) => {
  try {
    const { doorId, doorTitle, responseText } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      const prompt = `Você é um assistente de metodologia de diagnóstico de privacidade (D1 v1.0) para Câmaras Municipais.
Princípio: IA RECOMENDA, HUMANO VALIDA. PERGUNTA DEVE SER TOTALMENTE NEUTRA, NUNCA INDUZIR RESPOSTA NEM SUGERIR RESPOSTA IDEAL.
Porta atual: ${doorId} - ${doorTitle}
Fala original do respondente: "${responseText}"

Gere 2 sugestões de perguntas de sondagem neutras e investigativas para aprofundar aspectos concretos (quem, como, quando, onde fica registrado), sem juízo de valor.
Retorne um JSON com a propriedade "suggestedProbes": [{"question": "...", "reason": "..."}]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    }

    // Fallback heurístico metodológico
    const fallbackProbes = [
      {
        question: `Na prática, quando essa situação ocorre, quem é acionado primeiro e qual é o meio utilizado para encaminhar o assunto?`,
        reason: 'Identificar canal e fluxo prático de acionamento sem induzir resposta formal.'
      },
      {
        question: `Existe algum registro escrito, ata, chamado ou documento que comprove como essa demanda foi concluída?`,
        reason: 'Verificar existência de evidência institucional associada à fala.'
      }
    ];
    return res.json({ suggestedProbes: fallbackProbes });
  } catch (error: any) {
    console.error('Error in /api/ai/probe:', error);
    return res.json({
      suggestedProbes: [
        {
          question: 'Poderia detalhar como essa rotina acontece no dia a dia da Câmara?',
          reason: 'Aprofundamento fático neutro.'
        }
      ]
    });
  }
});

// Endpoint: Pedagogical explanation (Teach concept briefly without evaluating or giving diagnostic answer)
app.post('/api/ai/explain', async (req: Request, res: Response) => {
  try {
    const { concept, doorId } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      const prompt = `Você apoia um facilitador no diagnóstico D1 v1.0 em Câmaras Municipais.
O participante teve dúvida ou incompreensão conceitual sobre: "${concept}".
Regra estrita: ENSINAR ENQUANTO PERGUNTA, MAS NUNCA ENSINAR A RESPOSTA QUE O CRITÉRIO AVALIA.
Explique brevemente em 2 frases simples, dê 1 exemplo prático do dia a dia de uma Câmara Municipal e formule 1 pergunta neutra para retomar a descoberta.
Retorne um JSON: {"shortExplanation": "...", "concreteExample": "...", "followUpQuestion": "..."}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    }

    return res.json({
      shortExplanation: `No contexto da governança pública, ${concept} refere-se a como a Câmara organiza suas responsabilidades e papéis institucionais.`,
      concreteExample: `Exemplo: Quando chega uma requisição de cidadão, identificar quem formalmente analisa, orienta e responde.`,
      followUpQuestion: `Pensando na rotina da Câmara de vocês, como essa situação costuma ser conduzida?`
    });
  } catch (error: any) {
    console.error('Error in /api/ai/explain:', error);
    return res.json({
      shortExplanation: 'Conceito essencial para compreensão da governança institucional.',
      concreteExample: 'Exemplo prático de tramitação em Câmara Municipal.',
      followUpQuestion: 'Como isso acontece na prática do dia a dia da Câmara?'
    });
  }
});

// Endpoint: Information Unit Extraction
app.post('/api/ai/analyze-units', async (req: Request, res: Response) => {
  try {
    const { responseText, doorId, respondentName } = req.body;
    if (!responseText || typeof responseText !== 'string' || !responseText.trim()) {
      return res.status(400).json({
        error: 'Texto da fala original é obrigatório para extração.',
        code: 'MISSING_RESPONSE_TEXT'
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Serviço de IA não configurado ou indisponível.',
        code: 'AI_UNAVAILABLE'
      });
    }

    const prompt = `Analise a fala original de entrevista de governança em privacidade em uma Câmara Municipal.
FALA ORIGINAL: "${responseText}"
Respondente: ${respondentName || 'Respondente'}
Porta: ${doorId || 'D1.1'}

Regras:
1. NÃO inventar atores, setores, portarias ou processos não mencionados.
2. Dividir em Unidades de Informação (afirmação + alcance sugerido).
3. Alcance permitido: ACAO_PROPRIA, CONHECIMENTO_DIRETO, PERCEPCAO_SOBRE_TERCEIRO, FORA_DA_VISIBILIDADE_DESCONHECIDO.
4. Identificar atores mencionados e evidências mencionadas.
5. Apontar sinais de capacidade e gaps potenciais.

Retorne JSON:
{
  "units": [
    {"statement": "...", "suggestedScope": "ACAO_PROPRIA|CONHECIMENTO_DIRETO|PERCEPCAO_SOBRE_TERCEIRO|FORA_DA_VISIBILIDADE_DESCONHECIDO", "mentionedActors": [], "mentionedEvidenceTitles": []}
  ],
  "signalsOfCapacity": [],
  "potentialGaps": []
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const rawText = response.text || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini output:', rawText, parseErr);
      return res.status(502).json({
        error: 'Não foi possível estruturar a resposta da IA em formato válido.',
        code: 'INVALID_AI_RESPONSE',
        details: 'JSON inválido'
      });
    }

    const rawUnits = Array.isArray(parsed?.units) ? parsed.units : [];
    const validScopes = ['ACAO_PROPRIA', 'CONHECIMENTO_DIRETO', 'PERCEPCAO_SOBRE_TERCEIRO', 'FORA_DA_VISIBILIDADE_DESCONHECIDO'];

    const units = rawUnits.map((u: any) => ({
      statement: String(u.statement || '').trim(),
      suggestedScope: validScopes.includes(u.suggestedScope) ? u.suggestedScope : 'CONHECIMENTO_DIRETO',
      mentionedActors: Array.isArray(u.mentionedActors) ? u.mentionedActors : [],
      mentionedEvidenceTitles: Array.isArray(u.mentionedEvidenceTitles) ? u.mentionedEvidenceTitles : []
    })).filter((u: any) => u.statement.length > 0);

    return res.json({
      units,
      signalsOfCapacity: Array.isArray(parsed?.signalsOfCapacity) ? parsed.signalsOfCapacity : [],
      potentialGaps: Array.isArray(parsed?.potentialGaps) ? parsed.potentialGaps : []
    });
  } catch (error: any) {
    console.error('Error in /api/ai/analyze-units:', error);
    const errMessage = String(error?.message || '');
    const isQuota = errMessage.includes('RESOURCE_EXHAUSTED') || error?.status === 429 || errMessage.includes('quota') || errMessage.includes('rate limit');
    const isTimeout = errMessage.includes('DEADLINE_EXCEEDED') || errMessage.includes('timeout');

    const status = isQuota ? 429 : isTimeout ? 504 : 500;
    const code = isQuota ? 'QUOTA_EXCEEDED' : isTimeout ? 'TIMEOUT' : 'AI_PROCESSING_ERROR';
    const friendlyMessage = isQuota 
      ? 'Limite de cota da IA atingido temporariamente. Aguarde alguns instantes antes de tentar novamente.'
      : isTimeout
      ? 'O tempo limite de processamento da IA foi excedido. Tente novamente.'
      : 'Não foi possível realizar a extração por IA no momento.';

    return res.status(status).json({
      error: friendlyMessage,
      code,
      details: errMessage
    });
  }
});

// Endpoint: Maturity Suggestion with 4 mandatory questions
app.post('/api/ai/suggest-integration', async (req: Request, res: Response) => {
  return res.status(410).json({ error: 'Função legada indisponível no marco T2.', code: 'LEGACY_DISABLED' });
  try {
    const { capacitiesSummary, blockingPendingCount } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      const prompt = `Você é o módulo de apoio da metodologia D1 v1.0 para Câmaras Municipais.
Regra de ouro: IA RECOMENDA, EVIDÊNCIA COMPROVA, HUMANO VALIDA.
NÃO existe média de maturidade, NÃO há pesos. Elementos avançados NÃO compensam capacidades estruturais ausentes.
Se houver pendência bloqueante ou insuficiência demonstrativa, justifique com precisão.

Resumo das 6 capacidades: ${JSON.stringify(capacitiesSummary)}
Pendências bloqueantes ativas: ${blockingPendingCount}

Responda OBRIGATORIAMENTE às quatro perguntas metodológicas:
1. Por que o nível proposto está sustentado?
2. Por que o nível seguinte ainda não está sustentado?
3. Que elementos mais avançados já existem?
4. Que pendências bloqueiam conclusão mais forte?

Retorne JSON:
{
  "suggestedLevel": "N1_INICIAL" | "N2_EM_ESTRUTURACAO" | "N3_IMPLEMENTADO" | "N4_GERENCIADO" | "N5_OTIMIZADO" | "NAO_APURADA",
  "rationaleWhyProposedLevelSustained": "...",
  "rationaleWhyNextLevelNotSustained": "...",
  "advancedElementsAlreadyPresent": ["..."],
  "blockingPendenciesIdentified": ["..."]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    }

    // Heurística metodológica precisa
    return res.json({
      suggestedLevel: 'N2_EM_ESTRUTURACAO',
      rationaleWhyProposedLevelSustained: 'Existe configuração inicial reconhecível e envolvimento da gestão, sustentando patamar N2.',
      rationaleWhyNextLevelNotSustained: 'N3 requer definição institucional demonstrada e ausência de dependência individual exclusiva, o que ainda demanda consolidação de C4 e C6.',
      advancedElementsAlreadyPresent: ['Acolhimento de demandas orçamentárias pela Direção Geral.'],
      blockingPendenciesIdentified: blockingPendingCount > 0 ? ['Existem pendências bloqueantes de comprovação documental.'] : []
    });
  } catch (error: any) {
    console.error('Error in /api/ai/suggest-integration:', error);
    return res.status(500).json({ error: 'Erro ao gerar integração' });
  }
});

// Vite middleware in dev, static files in production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Piloto Dimensional D1 rodando na porta ${PORT}`);
  });
}

start();
