/**
 * VIPAZ — Minha Rota
 * Bloco 2.4 — Serviço de Contestabilidade e Consequências Metodológicas
 *
 * Responsável por processar contestações formais conforme as diretrizes:
 * 1. FATO → saneamento/validação da informação fática e reavaliação localizada da conclusão;
 * 2. INTERPRETAÇÃO → subsidia decisão humana divergente quando o regime permitir;
 * 3. REGRA → encaminhamento formal para a governança metodológica (Diário Metodológico),
 *    sem alteração local da regra da VIPAZ para uma única instituição.
 */

import {
  RoutingCandidate,
  ContestRecord,
  SubmitContestInput,
  ContestResolutionResult
} from '../../types/routing';

export interface ContestEvaluationContext {
  organizationName?: string;
  cycleId?: string;
}

/**
 * Submete e processa uma contestação formal sobre a rota ou conclusão de um candidato.
 * Garante que a contestabilidade não seja convertida em poder de sobrescrever arbitrariamente as regras da VIPAZ.
 */
export function submitContest(
  candidate: RoutingCandidate,
  input: SubmitContestInput,
  context?: ContestEvaluationContext
): ContestResolutionResult {
  if (!input.claim || input.claim.trim().length === 0) {
    throw new Error('A contestação exige exposição clara da alegação (claim).');
  }

  const contestId = `cont-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const submittedAt = new Date().toISOString();
  const regime = candidate.routing?.applicableRegime || 'ASSISTIDO';

  // 1. Contestação de FATO
  // Consequência: Saneamento probatório e abertura para retriagem/reavaliação da conclusão afetada.
  if (input.contestType === 'FATO') {
    const updatedEvidences = Array.from(new Set([
      ...candidate.supportingEvidenceIds,
      ...(input.submittedEvidenceIds || [])
    ]));

    const contestRecord: ContestRecord = {
      contestId,
      candidateId: candidate.candidateId,
      contestType: 'FATO',
      claim: input.claim,
      submittedEvidenceIds: input.submittedEvidenceIds,
      submittedByUserId: input.submittedByUserId,
      submittedByRole: input.submittedByRole,
      submittedAt,
      status: 'RECEBIDA',
      consequenceSummary: 'Contestação de fato acolhida para saneamento probatório. Evidências complementares anexadas e candidato retornado para retriagem.'
    };

    const updatedCandidate: RoutingCandidate = {
      ...candidate,
      supportingEvidenceIds: updatedEvidences,
      triageStatus: 'PENDENTE_DE_TRIAGEM', // Retorna à triagem para considerar os fatos saneados
      routing: candidate.routing
        ? {
            ...candidate.routing,
            effectiveSpace: undefined // Suspende conclusão anterior enquanto os fatos são saneados
          }
        : undefined
    };

    return {
      contestRecord,
      consequenceType: 'SANEAMENTO_PROBATORIO',
      consequenceDetail: 'Fatos questionados submetidos a saneamento probatório. A metodologia não foi alterada; os dados da instituição serão retriados.',
      updatedCandidate
    };
  }

  // 2. Contestação de INTERPRETAÇÃO
  // Consequência: Pode sustentar decisão humana divergente quando o regime permitir (ASSISTIDO ou HUMANO).
  // Em regime DETERMINÍSTICO, a interpretação não pode afastar a regra categórica.
  if (input.contestType === 'INTERPRETAÇÃO') {
    if (regime === 'DETERMINISTICO') {
      const contestRecord: ContestRecord = {
        contestId,
        candidateId: candidate.candidateId,
        contestType: 'INTERPRETAÇÃO',
        claim: input.claim,
        submittedByUserId: input.submittedByUserId,
        submittedByRole: input.submittedByRole,
        submittedAt,
        status: 'INDEFERIDA',
        consequenceSummary: 'No regime DETERMINÍSTICO, a interpretação não afasta a regra matemática/normativa vigente. Questionamento remetido ao Diário Metodológico.'
      };

      return {
        contestRecord,
        consequenceType: 'ENCAMINHAMENTO_GOVERNANCA_METODOLOGICA',
        consequenceDetail: 'Em regime determinístico estrito, divergência interpretativa não autoriza decisão divergente local. Registrado no Diário Metodológico.',
        updatedCandidate: candidate,
        methodologicalDiaryRef: `diary-entry-interp-${contestId}`
      };
    }

    // Em regime ASSISTIDO ou HUMANO: a contestação de interpretação é legitimamente acolhida
    const contestRecord: ContestRecord = {
      contestId,
      candidateId: candidate.candidateId,
      contestType: 'INTERPRETAÇÃO',
      claim: input.claim,
      submittedByUserId: input.submittedByUserId,
      submittedByRole: input.submittedByRole,
      submittedAt,
      status: 'DEFERIDA',
      consequenceSummary: 'Divergência de interpretação admitida para fundamentar deliberação humana soberana conforme o regime aplicável.'
    };

    return {
      contestRecord,
      consequenceType: 'DECISAO_DIVERGENTE_ADMITIDA',
      consequenceDetail: 'Interpretação acolhida como subsídio legítimo para decisão formal divergente da recomendação assistida.',
      updatedCandidate: candidate
    };
  }

  // 3. Contestação de REGRA
  // Consequência: Encaminhamento formal para a governança metodológica.
  // NÃO altera localmente a metodologia nem o RouteSpace da organização.
  const contestRecord: ContestRecord = {
    contestId,
    candidateId: candidate.candidateId,
    contestType: 'REGRA',
    claim: input.claim,
    submittedByUserId: input.submittedByUserId,
    submittedByRole: input.submittedByRole,
    submittedAt,
    status: 'EM_ANALISE',
    consequenceSummary: 'Contestação de regra registrada para apreciação do Comitê Metodológico da VIPAZ. A regra local permanece integralmente vigente no ciclo.'
  };

  return {
    contestRecord,
    consequenceType: 'ENCAMINHAMENTO_GOVERNANCA_METODOLOGICA',
    consequenceDetail: 'Contestação sobre a regra da metodologia VIPAZ direcionada ao Diário de Desenvolvimento Metodológico. A regra vigente não foi alterada localmente.',
    updatedCandidate: candidate, // A rota local permanece inalterada!
    methodologicalDiaryRef: `diary-rule-review-${contestId}`
  };
}
