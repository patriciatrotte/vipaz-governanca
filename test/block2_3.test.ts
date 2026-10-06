/**
 * VIPAZ — Minha Rota
 * Testes Unitários de Aceite do Bloco 2.3 — Motor de Rota, Precedência e Foco Atual
 *
 * Executado via tsx test/block2_3.test.ts
 */

import {
  RoutingCandidate,
  TriageEvaluation,
  CandidateRelation
} from '../src/types/routing';
import { executeCandidateRouting, attachSubsequentEvidence } from '../src/services/routing/routeEngine';
import { evaluateRoutingIntegrityGuard } from '../src/services/routing/integrityGuard';
import { deriveCurrentFocus } from '../src/services/routing/focusEngine';

function assert(condition: boolean, testName: string, detail?: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${testName}${detail ? ` - ${detail}` : ''}`);
    process.exit(1);
  } else {
    console.log(`✅ SUCESSO: ${testName}`);
  }
}

console.log('================================================================');
console.log('TESTES DE ACEITE DO BLOCO 2.3 — MOTOR DE ROTA E FOCO ATUAL');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Teste 1: Candidato em ESCLARECER não recebe effectiveSpace
// -----------------------------------------------------------------------------
const candidateUnderClarification: RoutingCandidate = {
  candidateId: 'cand-clarif-01',
  sourceType: 'DIAGNOSTICO_GAP',
  sourceRefId: 'gap-01',
  organizationId: 'org-1',
  cycleId: 'cycle-1',
  dimensionId: 'D1',
  statementAsIs: 'Documentação parcial da ouvidoria.',
  nextExpectedState: {
    targetKind: 'PROCESSO',
    description: 'Fluxo integrado de respostas ao cidadão.'
  },
  supportingEvidenceIds: [],
  relations: [],
  triageStatus: 'ESCLARECIMENTO_SOLICITADO'
};

const triageClarification: TriageEvaluation = {
  candidateId: 'cand-clarif-01',
  status: 'NECESSITA_ESCLARECIMENTO',
  hasSufficientInformation: false,
  missingInformationReason: 'Falta portaria de designação da equipe da ouvidoria.',
  recommendedDecisionRegime: 'ASSISTIDO',
  triageEvaluatedAt: new Date().toISOString()
};

const resultClarif = executeCandidateRouting(candidateUnderClarification, triageClarification);
assert(
  resultClarif.updatedCandidate.routing?.effectiveSpace === undefined,
  'Candidato em ESCLARECER não recebe effectiveSpace fabricado'
);
assert(
  resultClarif.updatedCandidate.routing?.suggestedSpace === null,
  'Candidato em ESCLARECER não recebe suggestedSpace prematuro'
);

// -----------------------------------------------------------------------------
// Teste 2: Decisão DETERMINÍSTICA produz conclusão sem suggestedSpace
// -----------------------------------------------------------------------------
const candidateDemonstrated: RoutingCandidate = {
  candidateId: 'cand-det-01',
  sourceType: 'DIAGNOSTICO_GAP',
  sourceRefId: 'gap-02',
  organizationId: 'org-1',
  cycleId: 'cycle-1',
  dimensionId: 'D1',
  statementAsIs: 'Regimento Interno atualizado e em vigor com comissões ativas.',
  nextExpectedState: {
    targetKind: 'CAPACIDADE',
    description: 'Manutenção da rotina regimental consolidada.'
  },
  supportingEvidenceIds: ['evi-reg-01'],
  relations: [],
  triageStatus: 'TRIADO'
};

const triageDeterministic: TriageEvaluation = {
  candidateId: 'cand-det-01',
  status: 'APTO_PARA_ROTEAMENTO',
  hasSufficientInformation: true,
  identifiedInterventionComposition: {
    primaryModality: 'MANTER',
    justification: 'Capacidade já consolidada por norma e prática.'
  },
  recommendedDecisionRegime: 'DETERMINISTICO',
  triageEvaluatedAt: new Date().toISOString()
};

const resultDet = executeCandidateRouting(candidateDemonstrated, triageDeterministic);
assert(resultDet.targetSpace === 'JA_CONSTRUIDO', 'Regra direciona para JA_CONSTRUIDO');
assert(resultDet.updatedCandidate.routing?.effectiveSpace === 'JA_CONSTRUIDO', 'effectiveSpace consolidado diretamente');
assert(
  resultDet.updatedCandidate.routing?.suggestedSpace === null,
  'No regime DETERMINÍSTICO, suggestedSpace é estritamente null (sem sugestão pendente)'
);
assert(
  resultDet.reason.ruleCode === 'REG_D1_01_JA_CONSTRUIDO',
  'Fundamentação estruturada contém o código da regra antes da justificativa'
);

// -----------------------------------------------------------------------------
// Teste 3: Regime ASSISTIDO preserva sugestão sem convertê-la automaticamente em decisão
// -----------------------------------------------------------------------------
const candidateAssistido: RoutingCandidate = {
  candidateId: 'cand-ast-01',
  sourceType: 'DIAGNOSTICO_GAP',
  sourceRefId: 'gap-03',
  organizationId: 'org-1',
  cycleId: 'cycle-1',
  dimensionId: 'D1',
  statementAsIs: 'Inexistência de regulamentação formal para gestão de documentos.',
  nextExpectedState: {
    targetKind: 'INSTRUMENTO',
    description: 'Tabela de temporalidade documental homologada.'
  },
  supportingEvidenceIds: ['evi-arq-01'],
  relations: [],
  triageStatus: 'TRIADO'
};

const triageAssistido: TriageEvaluation = {
  candidateId: 'cand-ast-01',
  status: 'APTO_PARA_ROTEAMENTO',
  hasSufficientInformation: true,
  identifiedInterventionComposition: {
    primaryModality: 'CONSTRUIR',
    justification: 'Elaboração de minuta da tabela de temporalidade.'
  },
  recommendedDecisionRegime: 'ASSISTIDO',
  triageEvaluatedAt: new Date().toISOString()
};

const resultAst = executeCandidateRouting(candidateAssistido, triageAssistido);
assert(resultAst.targetSpace === 'AGORA', 'Proposta direciona para AGORA');
assert(resultAst.updatedCandidate.routing?.suggestedSpace === 'AGORA', 'suggestedSpace preserva a proposta assistida');
assert(
  resultAst.updatedCandidate.routing?.effectiveSpace === undefined,
  'Regime ASSISTIDO NÃO converte sugestão automaticamente em decisão (effectiveSpace permanece undefined até homologação humana)'
);

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Teste 4: Guarda de Integridade Transversal e Distinção Probatória
// -----------------------------------------------------------------------------
// 4.1.A Rejeição de JÁ_CONSTRUÍDO quando inexiste evidência E inexiste suficiência da investigação
const candidateWithoutEvidence: RoutingCandidate = {
  ...candidateDemonstrated,
  supportingEvidenceIds: [] // Sem evidência
};
const guardNoEvidenceNoSufficiency = evaluateRoutingIntegrityGuard(
  candidateWithoutEvidence,
  'JA_CONSTRUIDO',
  'DETERMINISTICO',
  { hasInvestigativeSufficiency: false }
);
assert(!guardNoEvidenceNoSufficiency.isAdmissible, 'Guarda rejeita destinação a JA_CONSTRUIDO sem evidência e sem suficiência da investigação');

// 4.1.B Admissibilidade de JÁ_CONSTRUÍDO com comprovação pendente (Homologação v0.4.1)
const guardWithSufficiencyPendingDoc = evaluateRoutingIntegrityGuard(
  candidateWithoutEvidence,
  'JA_CONSTRUIDO',
  'DETERMINISTICO',
  {
    hasInvestigativeSufficiency: true,
    pendingEvidenceItemRefId: 'pend-doc-regimento'
  }
);
assert(guardWithSufficiencyPendingDoc.isAdmissible, 'Suficiência informativa da investigação permite destinação a JA_CONSTRUIDO com comprovação pendente');
assert(
  guardWithSufficiencyPendingDoc.warnings?.some(w => w.includes('pendente de conferência')) === true,
  'Guarda emite advertência explícita: não comunica a conclusão como comprovada/verificada'
);

// 4.1.C Anti-heurística: suficiência NÃO é inferida por comprimento de texto
const candidateLongTextNoSufficiency: RoutingCandidate = {
  ...candidateWithoutEvidence,
  statementAsIs: 'Texto extremamente longo descritivo sobre rotinas regimentais da Câmara Municipal que possui muitos caracteres.'
};
const guardTextLengthNotSufficient = evaluateRoutingIntegrityGuard(
  candidateLongTextNoSufficiency,
  'JA_CONSTRUIDO',
  'DETERMINISTICO',
  { hasInvestigativeSufficiency: false }
);
assert(!guardTextLengthNotSufficient.isAdmissible, 'Nenhuma suficiência é inferida por comprimento de texto (statementAsIs.length > 0)');

// 4.2 Rejeição de espaço efetivo sob esclarecimento
const guardUnderClarif = evaluateRoutingIntegrityGuard(
  candidateUnderClarification,
  'AGORA',
  'ASSISTIDO'
);
assert(!guardUnderClarif.isAdmissible, 'Guarda rejeita atribuição de espaço para candidato sob esclarecimento');

// -----------------------------------------------------------------------------
// Teste 5: Dependência conhecida impede foco prematuro sem remover de AGORA
// -----------------------------------------------------------------------------
const candidatePrereq: RoutingCandidate = {
  candidateId: 'cand-prereq-01',
  sourceType: 'DIAGNOSTICO_GAP',
  sourceRefId: 'gap-prereq',
  organizationId: 'org-1',
  cycleId: 'cycle-1',
  dimensionId: 'D1',
  statementAsIs: 'Necessidade de instituir a comissão de governança.',
  nextExpectedState: {
    targetKind: 'INSTRUMENTO',
    description: 'Portaria de nomeação da comissão de governança.'
  },
  supportingEvidenceIds: ['evi-01'],
  relations: [],
  triageStatus: 'TRIADO',
  routing: {
    routingRuleVersion: 'RULES_D1_v0.3',
    methodologyVersion: 'D1 v1.0',
    applicableRegime: 'DETERMINISTICO',
    effectiveSpace: 'AGORA',
    routingReason: {
      factualBasis: 'Comissão necessária',
      evidentialBasis: ['evi-01'],
      contextualJustification: 'Pré-requisito estrutural.'
    }
  }
};

const candidateDependent: RoutingCandidate = {
  candidateId: 'cand-dependent-02',
  sourceType: 'DIAGNOSTICO_GAP',
  sourceRefId: 'gap-dep',
  organizationId: 'org-1',
  cycleId: 'cycle-1',
  dimensionId: 'D1',
  statementAsIs: 'Plano de trabalho da comissão de governança.',
  nextExpectedState: {
    targetKind: 'PROCESSO',
    description: 'Cronograma semestral de reuniões e entregas aprovado.'
  },
  supportingEvidenceIds: ['evi-02'],
  relations: [
    {
      targetCandidateId: 'cand-prereq-01',
      relationType: 'DEPENDE_DE',
      origin: 'METODOLOGIA_CATALOGO',
      rationale: 'O plano de trabalho pressupõe a prévia nomeação da comissão.'
    }
  ],
  triageStatus: 'TRIADO',
  routing: {
    routingRuleVersion: 'RULES_D1_v0.3',
    methodologyVersion: 'D1 v1.0',
    applicableRegime: 'DETERMINISTICO',
    effectiveSpace: 'AGORA', // Pertence a AGORA!
    routingReason: {
      factualBasis: 'Plano a ser elaborado',
      evidentialBasis: ['evi-02'],
      contextualJustification: 'Avanço imediato com dependência.'
    }
  }
};

// Caso 5.1: Pré-requisito NÃO concluído
const focusEvaluationBlocked = deriveCurrentFocus(
  [candidatePrereq, candidateDependent],
  {
    cycleId: 'cycle-1',
    organizationId: 'org-1',
    completedCandidateIds: new Set<string>() // Vazio: pré-requisito não concluído
  }
);

assert(
  focusEvaluationBlocked.focusCandidates.some(c => c.candidateId === 'cand-prereq-01'),
  'Pré-requisito entra no Foco Atual'
);
assert(
  !focusEvaluationBlocked.focusCandidates.some(c => c.candidateId === 'cand-dependent-02'),
  'Dependente é bloqueado do Foco Atual prematuro'
);
assert(
  candidateDependent.routing?.effectiveSpace === 'AGORA',
  'Dependente NÃO foi removido de AGORA; seu effectiveSpace continua sendo AGORA'
);
assert(
  focusEvaluationBlocked.excludedCandidatesSummary.some(
    e => e.candidateId === 'cand-dependent-02' && e.exclusionReason === 'BLOQUEADO_POR_DEPENDENCIA'
  ),
  'Exclusão do dependente devidamente fundamentada por BLOQUEADO_POR_DEPENDENCIA'
);

// Caso 5.2: Pré-requisito concluído -> dependente é desbloqueado
const focusEvaluationUnblocked = deriveCurrentFocus(
  [candidatePrereq, candidateDependent],
  {
    cycleId: 'cycle-1',
    organizationId: 'org-1',
    completedCandidateIds: new Set<string>(['cand-prereq-01']) // Pré-requisito concluído
  }
);
assert(
  focusEvaluationUnblocked.focusCandidates.some(c => c.candidateId === 'cand-dependent-02'),
  'Dependente entra no Foco Atual após conclusão do pré-requisito'
);

// -----------------------------------------------------------------------------
// Teste 6: Candidatos independentes coexistem no Foco Atual (Pluralidade Plena)
// -----------------------------------------------------------------------------
const candidateIndependentA: RoutingCandidate = {
  candidateId: 'cand-indep-A',
  sourceType: 'DIAGNOSTICO_GAP',
  sourceRefId: 'gap-A',
  organizationId: 'org-1',
  cycleId: 'cycle-1',
  dimensionId: 'D1',
  statementAsIs: 'Treinamento de atendimento ao público.',
  nextExpectedState: {
    targetKind: 'CAPACIDADE',
    description: 'Oficina realizada.'
  },
  supportingEvidenceIds: ['evi-A'],
  relations: [],
  triageStatus: 'TRIADO',
  routing: {
    routingRuleVersion: 'RULES_D1_v0.3',
    methodologyVersion: 'D1 v1.0',
    applicableRegime: 'DETERMINISTICO',
    effectiveSpace: 'AGORA',
    routingReason: {
      factualBasis: 'Treinamento',
      evidentialBasis: ['evi-A'],
      contextualJustification: 'Avanço independente A.'
    }
  }
};

const candidateIndependentB: RoutingCandidate = {
  candidateId: 'cand-indep-B',
  sourceType: 'DIAGNOSTICO_GAP',
  sourceRefId: 'gap-B',
  organizationId: 'org-1',
  cycleId: 'cycle-1',
  dimensionId: 'D1',
  statementAsIs: 'Atualização do portal de transparência.',
  nextExpectedState: {
    targetKind: 'PRATICA',
    description: 'Publicação tempestiva das diárias.'
  },
  supportingEvidenceIds: ['evi-B'],
  relations: [],
  triageStatus: 'TRIADO',
  routing: {
    routingRuleVersion: 'RULES_D1_v0.3',
    methodologyVersion: 'D1 v1.0',
    applicableRegime: 'DETERMINISTICO',
    effectiveSpace: 'AGORA',
    routingReason: {
      factualBasis: 'Portal',
      evidentialBasis: ['evi-B'],
      contextualJustification: 'Avanço independente B.'
    }
  }
};

const focusPlural = deriveCurrentFocus(
  [candidateIndependentA, candidateIndependentB],
  {
    cycleId: 'cycle-1',
    organizationId: 'org-1'
  }
);
assert(focusPlural.focusCandidates.length === 2, 'Foco Atual contém múltiplos candidatos independentes (pluralidade)');
assert(
  focusPlural.focusCandidates.some(c => c.candidateId === 'cand-indep-A') &&
  focusPlural.focusCandidates.some(c => c.candidateId === 'cand-indep-B'),
  'Ambos os candidatos independentes coexistem no Foco Atual'
);

// -----------------------------------------------------------------------------
// Teste 7: Obrigação Temporal confirmada considerada sem score
// -----------------------------------------------------------------------------
const candidateWithDeadline: RoutingCandidate = {
  ...candidateIndependentA,
  candidateId: 'cand-temporal-01',
  confirmedDeadline: {
    deadlineDate: '2026-12-31',
    legalBasis: 'Lei Orgânica Municipal Art. 88',
    isMandatoryExternal: true,
    verifiedAt: '2026-10-01',
    verifiedBy: 'analista-juridico'
  }
};

const focusTemporal = deriveCurrentFocus(
  [candidateWithDeadline],
  {
    cycleId: 'cycle-1',
    organizationId: 'org-1'
  }
);
assert(focusTemporal.focusCandidates.length === 1, 'Candidato com prazo confirmado entra no foco normalmente');
assert(
  focusTemporal.focusCandidates[0].confirmedDeadline?.deadlineDate === '2026-12-31',
  'Prazo regulatório preservado transparente sem ser convertido em score numérico'
);

// -----------------------------------------------------------------------------
// Teste 8: Invariância: Ordem do array e IDs não alteram o Foco Atual (Zero desempate arbitrário)
// -----------------------------------------------------------------------------
const listOrder1 = [candidateIndependentA, candidateIndependentB];
const listOrder2 = [candidateIndependentB, candidateIndependentA]; // Invertido

const focusOrder1 = deriveCurrentFocus(listOrder1, { cycleId: 'c1', organizationId: 'o1' });
const focusOrder2 = deriveCurrentFocus(listOrder2, { cycleId: 'c1', organizationId: 'o1' });

const ids1 = new Set(focusOrder1.focusCandidates.map(c => c.candidateId));
const ids2 = new Set(focusOrder2.focusCandidates.map(c => c.candidateId));

assert(ids1.size === ids2.size, 'Mesma quantidade de itens independentemente da ordem');
assert(
  ids1.has('cand-indep-A') && ids1.has('cand-indep-B') &&
  ids2.has('cand-indep-A') && ids2.has('cand-indep-B'),
  'A permutação da ordem da lista de entrada produz exatamente o mesmo conjunto conceitual de Foco Atual'
);

// -----------------------------------------------------------------------------
// Teste 9: Candidato roteado NÃO precisa possuir EvolutionAction
// -----------------------------------------------------------------------------
assert(candidateIndependentA.boundActionId === undefined, 'Candidato roteado não possui EvolutionAction vinculada obrigatoriamente');
assert(focusPlural.focusCandidates[0].boundActionId === undefined, 'Foco Atual opera com candidatos sem ação ativa');

// -----------------------------------------------------------------------------
// Teste 10: Ciclo Posterior de Comprovação e Tratamento de Contradição
// -----------------------------------------------------------------------------
// 10.1 Candidato roteado para JA_CONSTRUIDO com comprovação pendente
const triageJaConstruidoPendingDoc: TriageEvaluation = {
  candidateId: 'cand-ja-const-pend',
  status: 'APTO_PARA_ROTEAMENTO',
  hasSufficientInformation: true,
  identifiedInterventionComposition: {
    primaryModality: 'MANTER',
    justification: 'Prática institucional rotineiramente executada pela Câmara.'
  },
  recommendedDecisionRegime: 'DETERMINISTICO',
  triageEvaluatedAt: new Date().toISOString()
};

const candidatePendingDoc: RoutingCandidate = {
  candidateId: 'cand-ja-const-pend',
  sourceType: 'DIAGNOSTICO_GAP',
  sourceRefId: 'gap-manter',
  organizationId: 'org-1',
  cycleId: 'cycle-1',
  dimensionId: 'D1',
  statementAsIs: 'Rotina de prestação de contas bimestral consolidada no setor financeiro.',
  nextExpectedState: {
    targetKind: 'PRATICA',
    description: 'Manutenção do fluxo bimestral de contas.'
  },
  supportingEvidenceIds: [], // Sem evidência documental imediata
  relations: [],
  triageStatus: 'TRIADO'
};

const routeResultPending = executeCandidateRouting(candidatePendingDoc, triageJaConstruidoPendingDoc, {
  guardContext: {
    hasInvestigativeSufficiency: true,
    pendingEvidenceItemRefId: 'pend-doc-contas-bimestrais'
  }
});

assert(routeResultPending.targetSpace === 'JA_CONSTRUIDO', 'Destinado legitimamente a JA_CONSTRUIDO por suficiência da investigação');
assert(routeResultPending.updatedCandidate.routing?.effectiveSpace === 'JA_CONSTRUIDO', 'effectiveSpace consolidado em JA_CONSTRUIDO');
assert(
  routeResultPending.reason.pendingEvidenceItemRefId === 'pend-doc-contas-bimestrais',
  'Comprovação pendente permanece explicitamente rastreável via pendingEvidenceItemRefId canônico'
);
assert(
  routeResultPending.reason.contextualJustification.includes('não comunicado como verificado'),
  'A conclusão não é apresentada/comunicada como plenamente comprovada/verificada'
);

// 10.2 Juntada posterior de evidência corroborante: resolve a pendência sem alterar o RouteSpace
const attachCorroborating = attachSubsequentEvidence(
  routeResultPending.updatedCandidate,
  'evi-balancete-2025'
);
assert(attachCorroborating.isPendingResolved, 'Evidência corroborante posterior resolve a pendência');
assert(!attachCorroborating.requiresReevaluation, 'Evidência corroborante não exige reavaliação de rota');
assert(
  attachCorroborating.updatedCandidate.routing?.effectiveSpace === 'JA_CONSTRUIDO',
  'RouteSpace permanece intacto em JA_CONSTRUIDO sem reiniciar o diagnóstico'
);
assert(
  attachCorroborating.updatedCandidate.routing?.routingReason.pendingEvidenceItemRefId === undefined,
  'Referência de pendência documental é devidamente removida após juntada'
);

// 10.3 Juntada posterior de evidência contraditória: não resolve e sinaliza necessidade de reavaliação
const attachContradictory = attachSubsequentEvidence(
  routeResultPending.updatedCandidate,
  'evi-relatorio-tce-irregularidade',
  {
    isContradictory: true,
    contradictionDetail: 'Relatório do Tribunal de Contas aponta ausência de prestação de contas no exercício anterior.'
  }
);
assert(!attachContradictory.isPendingResolved, 'Evidência contraditória NÃO é tratada como simples fechamento da pendência');
assert(attachContradictory.requiresReevaluation, 'Evidência contraditória sinaliza expressamente necessidade de reavaliação metodológica');
assert(
  attachContradictory.reevaluationReason?.includes('Tribunal de Contas') === true,
  'Fundamento da contradição devidamente preservado para governança do Bloco 2.5'
);

console.log('\n================================================================');
console.log('TODOS OS TESTES DO BLOCO 2.3 FORAM EXECUTADOS COM SUCESSO! 🎯');
console.log('================================================================\n');
