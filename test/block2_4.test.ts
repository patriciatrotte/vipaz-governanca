/**
 * VIPAZ — Minha Rota
 * Testes Unitários de Aceite do Bloco 2.4 — Decisão, Contestabilidade e Integridade
 *
 * Executado via tsx test/block2_4.test.ts
 */

import {
  RoutingCandidate,
  TriageEvaluation
} from '../src/types/routing';
import { recordFormalDecision } from '../src/services/routing/decisionService';
import { submitContest } from '../src/services/routing/contestService';
import { requestCandidateClarification } from '../src/services/routing/triageEngine';

function assert(condition: boolean, testName: string, detail?: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${testName}${detail ? ` - ${detail}` : ''}`);
    process.exit(1);
  } else {
    console.log(`✅ SUCESSO: ${testName}`);
  }
}

console.log('================================================================');
console.log('TESTES DE ACEITE DO BLOCO 2.4 — DECISÃO, CONTESTABILIDADE E INTEGRIDADE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Teste 1: Regime DETERMINÍSTICO produz decisão sem sugestão humana pendente
// -----------------------------------------------------------------------------
const candidateDeterministic: RoutingCandidate = {
  candidateId: 'cand-det-01',
  sourceType: 'DIAGNOSTICO_GAP',
  sourceRefId: 'gap-01',
  organizationId: 'org-camara-1',
  cycleId: 'cycle-1',
  dimensionId: 'D1',
  statementAsIs: 'Regimento Interno atualizado em vigor.',
  nextExpectedState: {
    targetKind: 'CAPACIDADE',
    description: 'Manutenção de rotinas regimentais.'
  },
  supportingEvidenceIds: ['evi-doc-1'],
  relations: [],
  triageStatus: 'TRIADO',
  routing: {
    routingRuleVersion: 'RULES_D1_v0.3',
    methodologyVersion: 'D1 v1.0',
    applicableRegime: 'DETERMINISTICO',
    suggestedSpace: null,
    effectiveSpace: 'JA_CONSTRUIDO',
    routingReason: {
      ruleCode: 'REG_D1_01_JA_CONSTRUIDO',
      factualBasis: 'Regimento em vigor',
      evidentialBasis: ['evi-doc-1'],
      contextualJustification: 'Norma vigente.'
    }
  }
};

const resultDet = recordFormalDecision(candidateDeterministic, {
  candidateId: 'cand-det-01',
  chosenSpace: 'JA_CONSTRUIDO',
  rationale: 'Conclusão direta por regra metodológica'
});

assert(resultDet.isSuccess, 'Decisão determinística registrada com sucesso');
assert(resultDet.decisionRecord?.suggestedRoute === null, 'DETERMINÍSTICO produz decisão com suggestedRoute === null (sem sugestão pendente)');
assert(resultDet.decisionRecord?.decidedByUserId === undefined, 'Decisão determinística não força ID de usuário humano');
assert(resultDet.decisionRecord?.confirmedRoute === 'JA_CONSTRUIDO', 'Rota confirmada reflete a regra');

// -----------------------------------------------------------------------------
// Teste 2: Regime ASSISTIDO — Confirmação e Preservação de Sugestão Original
// -----------------------------------------------------------------------------
const candidateAssistido: RoutingCandidate = {
  candidateId: 'cand-ast-01',
  sourceType: 'DIAGNOSTICO_GAP',
  sourceRefId: 'gap-02',
  organizationId: 'org-camara-1',
  cycleId: 'cycle-1',
  dimensionId: 'D1',
  statementAsIs: 'Inexistência de regulamentação da LGPD.',
  nextExpectedState: {
    targetKind: 'INSTRUMENTO',
    description: 'Resolução da Mesa sobre privacidade.'
  },
  supportingEvidenceIds: ['evi-doc-2'],
  relations: [],
  triageStatus: 'TRIADO',
  routing: {
    routingRuleVersion: 'RULES_D1_v0.3',
    methodologyVersion: 'D1 v1.0',
    applicableRegime: 'ASSISTIDO',
    suggestedSpace: 'AGORA',
    effectiveSpace: undefined, // Aguardando decisão humana
    routingReason: {
      ruleCode: 'REG_D1_03_AGORA',
      factualBasis: 'Sem regulamentação',
      evidentialBasis: ['evi-doc-2'],
      contextualJustification: 'Necessidade imediata de normatização.'
    }
  }
};

// 2.1 Confirmação da sugestão
const resultConfirm = recordFormalDecision(candidateAssistido, {
  candidateId: 'cand-ast-01',
  chosenSpace: 'AGORA', // Igual à sugestão
  decidedByUserId: 'user-gestor-1',
  decidedByRole: 'GESTOR_INSTITUCIONAL',
  rationale: 'Gestão concorda com o início imediato.'
});

assert(resultConfirm.isSuccess, 'Confirmação humana registrada com sucesso');
assert(resultConfirm.decisionRecord?.suggestedRoute === 'AGORA', 'Preserva sugestão original mesmo após confirmação');
assert(resultConfirm.decisionRecord?.confirmedRoute === 'AGORA', 'Decisão efetiva gravada em confirmedRoute');
assert(resultConfirm.decisionRecord?.decidedByUserId === 'user-gestor-1', 'Audita identidade do decisor');
assert(resultConfirm.updatedCandidate?.routing?.suggestedSpace === 'AGORA', 'Sugestão original mantida no candidato');
assert(resultConfirm.updatedCandidate?.routing?.effectiveSpace === 'AGORA', 'effectiveSpace consolidado após decisão humana');

// 2.2 Decisão DIVERGENTE em regime ASSISTIDO (Sugestão vs Decisão Distintas)
const resultDivergent = recordFormalDecision(candidateAssistido, {
  candidateId: 'cand-ast-01',
  chosenSpace: 'NO_HORIZONTE', // Divergente de AGORA
  decidedByUserId: 'user-facilitador-1',
  decidedByRole: 'FACILITADOR',
  divergenceReason: 'A Câmara pactuou aguardar a posse da nova Mesa Diretora no próximo biênio.'
});

assert(resultDivergent.isSuccess, 'Decisão divergente registrada com sucesso quando fundamentada');
assert(resultDivergent.decisionRecord?.suggestedRoute === 'AGORA', 'Preserva sugestão original da IA (AGORA)');
assert(resultDivergent.decisionRecord?.confirmedRoute === 'NO_HORIZONTE', 'Preserva decisão efetiva divergente (NO_HORIZONTE)');
assert(
  resultDivergent.decisionRecord?.divergenceReason?.includes('Mesa Diretora') === true,
  'Justificativa de divergência registrada com precisão'
);
assert(resultDivergent.updatedCandidate?.routing?.suggestedSpace === 'AGORA', 'Sugestão original intacta no histórico do candidato');
assert(resultDivergent.updatedCandidate?.routing?.effectiveSpace === 'NO_HORIZONTE', 'Decisão humana divergente efetivada');

// 2.3 Rejeição de decisão divergente sem fundamentação
const resultDivergentSemJustif = recordFormalDecision(candidateAssistido, {
  candidateId: 'cand-ast-01',
  chosenSpace: 'NO_HORIZONTE',
  decidedByUserId: 'user-facilitador-1',
  decidedByRole: 'FACILITADOR'
  // divergenceReason ausente!
});
assert(!resultDivergentSemJustif.isSuccess, 'Rejeita decisão divergente desprovida de fundamentação');

// -----------------------------------------------------------------------------
// Teste 3: Regime HUMANO admite decisão sem sugestão prévia
// -----------------------------------------------------------------------------
const candidateHumano: RoutingCandidate = {
  ...candidateAssistido,
  candidateId: 'cand-humano-01',
  routing: {
    routingRuleVersion: 'RULES_D1_v0.3',
    methodologyVersion: 'D1 v1.0',
    applicableRegime: 'HUMANO',
    suggestedSpace: null, // Sem sugestão prévia
    effectiveSpace: undefined,
    routingReason: {
      factualBasis: 'Deliberação de oportunidade',
      evidentialBasis: [],
      contextualJustification: 'Definição discricionária dos interlocutores.'
    }
  }
};

const resultHumano = recordFormalDecision(candidateHumano, {
  candidateId: 'cand-humano-01',
  chosenSpace: 'QUANDO_PRECISAR',
  decidedByUserId: 'user-interlocutor-1',
  decidedByRole: 'INTERLOCUTOR_PRINCIPAL',
  rationale: 'Pactuação interna da Câmara.'
});

assert(resultHumano.isSuccess, 'Decisão em regime HUMANO formalizada com sucesso');
assert(resultHumano.decisionRecord?.suggestedRoute === null, 'Regime HUMANO admite decisão com suggestedRoute === null');
assert(resultHumano.decisionRecord?.confirmedRoute === 'QUANDO_PRECISAR', 'Grava rota confirmada diretamente');

// -----------------------------------------------------------------------------
// Teste 4: Integridade supera Permissão Administrativa
// -----------------------------------------------------------------------------
// Candidato sob esclarecimento (inadmissível pela guarda)
const candidateUnderClarification: RoutingCandidate = {
  ...candidateAssistido,
  candidateId: 'cand-clarif-02',
  triageStatus: 'ESCLARECIMENTO_SOLICITADO',
  routing: undefined
};

// Usuário ADMINISTRADOR tenta forçar aprovação de rota sob esclarecimento
const resultAdminForcing = recordFormalDecision(candidateUnderClarification, {
  candidateId: 'cand-clarif-02',
  chosenSpace: 'AGORA',
  decidedByUserId: 'user-super-admin',
  decidedByRole: 'ADMINISTRADOR',
  rationale: 'Administrador tentando forçar aprovação sem dados'
});

assert(!resultAdminForcing.isSuccess, 'Autorização administrativa NUNCA supera a Guarda de Integridade (Administrador bloqueado)');
assert(
  resultAdminForcing.violations?.some(v => v.includes('esclarecimento probatório')) === true,
  'Violação metodológica formalmente apontada'
);

// -----------------------------------------------------------------------------
// Teste 5: Decisão válida NÃO transforma comprovação pendente em verificada
// -----------------------------------------------------------------------------
const candidatePendingProof: RoutingCandidate = {
  candidateId: 'cand-pend-proof-01',
  sourceType: 'DIAGNOSTICO_GAP',
  sourceRefId: 'gap-03',
  organizationId: 'org-camara-1',
  cycleId: 'cycle-1',
  dimensionId: 'D1',
  statementAsIs: 'Rotina de prestação de contas mensal existente sem ato formal anexado.',
  nextExpectedState: {
    targetKind: 'PRATICA',
    description: 'Manutenção do fluxo mensal de contas.'
  },
  supportingEvidenceIds: [], // Sem evidência documental imediata
  relations: [],
  triageStatus: 'TRIADO',
  routing: {
    routingRuleVersion: 'RULES_D1_v0.3',
    methodologyVersion: 'D1 v1.0',
    applicableRegime: 'ASSISTIDO',
    suggestedSpace: 'JA_CONSTRUIDO',
    effectiveSpace: undefined,
    routingReason: {
      factualBasis: 'Rotina existente informada',
      evidentialBasis: [],
      pendingEvidenceItemRefId: 'pend-doc-balancete',
      contextualJustification: 'Reconhecido com comprovação pendente.'
    }
  }
};

const resultPendingConfirmation = recordFormalDecision(candidatePendingProof, {
  candidateId: 'cand-pend-proof-01',
  chosenSpace: 'JA_CONSTRUIDO',
  decidedByUserId: 'user-facilitador-1',
  decidedByRole: 'FACILITADOR',
  rationale: 'Homologação do estado factual reconhecido na entrevista.'
});

assert(resultPendingConfirmation.isSuccess, 'Destinação a JÁ_CONSTRUÍDO confirmada pelo facilitador');
assert(
  resultPendingConfirmation.updatedCandidate?.routing?.routingReason.pendingEvidenceItemRefId === 'pend-doc-balancete',
  'Decisão humana NÃO elimina a pendência probatória: comprovação pendente continua canonicamente rastreável'
);
assert(
  resultPendingConfirmation.updatedCandidate?.supportingEvidenceIds.length === 0,
  'Decisão humana NÃO fabrica evidências documentais inexistentes'
);

// -----------------------------------------------------------------------------
// Teste 6: Esclarecimento funciona SEM decisionId (Precede a Decisão)
// -----------------------------------------------------------------------------
const candidateBeforeDecision: RoutingCandidate = {
  ...candidateAssistido,
  candidateId: 'cand-before-dec-01',
  triageStatus: 'PENDENTE_DE_TRIAGEM',
  routing: undefined // Nenhuma decisão existe ainda!
};

const candidateClarified = requestCandidateClarification(
  candidateBeforeDecision,
  'Solicitar a relação de membros da comissão nomeada em 2024.',
  'facilitador-1'
);

assert(candidateClarified.triageStatus === 'ESCLARECIMENTO_SOLICITADO', 'requestClarification acionado com sucesso sem decisionId');
assert(candidateClarified.clarificationRequest?.isResolved === false, 'Clarification estruturado gerado sem depender de decisão');

// -----------------------------------------------------------------------------
// Teste 7: Contestabilidade Tipada e Consequências
// -----------------------------------------------------------------------------
// 7.1 Contestação de FATO: saneamento probatório sem alterar metodologia
const contestFato = submitContest(candidateDeterministic, {
  candidateId: 'cand-det-01',
  contestType: 'FATO',
  claim: 'A portaria referenciada foi revogada pela Resolução nº 05/2025.',
  submittedEvidenceIds: ['evi-resolucao-05-2025'],
  submittedByUserId: 'user-interlocutor-1',
  submittedByRole: 'INTERLOCUTOR_PRINCIPAL'
});

assert(contestFato.consequenceType === 'SANEAMENTO_PROBATORIO', 'Contestação de FATO acolhida para saneamento');
assert(contestFato.updatedCandidate.triageStatus === 'PENDENTE_DE_TRIAGEM', 'Candidato retornado à triagem para reavaliação fática');
assert(contestFato.updatedCandidate.supportingEvidenceIds.includes('evi-resolucao-05-2025'), 'Novas evidências incorporadas');
assert(contestFato.updatedCandidate.routing?.effectiveSpace === undefined, 'Conclusão anterior suspensa para retriagem fática');

// 7.2 Contestação de INTERPRETAÇÃO:
// 7.2.A Em regime DETERMINÍSTICO: não autoriza alteração local da regra
const contestInterpDet = submitContest(candidateDeterministic, {
  candidateId: 'cand-det-01',
  contestType: 'INTERPRETAÇÃO',
  claim: 'Entendemos que mesmo tendo a norma, gostaríamos de colocar em AGORA para revisar.',
  submittedByUserId: 'user-interlocutor-1',
  submittedByRole: 'INTERLOCUTOR_PRINCIPAL'
});
assert(contestInterpDet.consequenceType === 'ENCAMINHAMENTO_GOVERNANCA_METODOLOGICA', 'Em regime determinístico, contestação de interpretação não altera regra localmente');
assert(contestInterpDet.contestRecord.status === 'INDEFERIDA', 'Status registrado como indeferido para alteração local');
assert(contestInterpDet.methodologicalDiaryRef !== undefined, 'Registrado no Diário Metodológico');

// 7.2.B Em regime ASSISTIDO: deferida como subsídio a decisão divergente
const contestInterpAst = submitContest(candidateAssistido, {
  candidateId: 'cand-ast-01',
  contestType: 'INTERPRETAÇÃO',
  claim: 'Acreditamos que a menor intervenção deveria ser ADAPTAR em vez de CONSTRUIR.',
  submittedByUserId: 'user-facilitador-1',
  submittedByRole: 'FACILITADOR'
});
assert(contestInterpAst.consequenceType === 'DECISAO_DIVERGENTE_ADMITIDA', 'Em regime ASSISTIDO, contestação de interpretação é admitida');
assert(contestInterpAst.contestRecord.status === 'DEFERIDA', 'Status deferido para fundamentar divergência');

// 7.3 Contestação de REGRA: direcionada para o Diário Metodológico sem alterar regra local
const contestRegra = submitContest(candidateDeterministic, {
  candidateId: 'cand-det-01',
  contestType: 'REGRA',
  claim: 'Discordamos da metodologia VIPAZ exigir aprovação em plenário para este tipo de comissão.',
  submittedByUserId: 'user-gestor-1',
  submittedByRole: 'GESTOR_INSTITUCIONAL'
});

assert(contestRegra.consequenceType === 'ENCAMINHAMENTO_GOVERNANCA_METODOLOGICA', 'Contestação de REGRA direcionada à governança metodológica');
assert(contestRegra.updatedCandidate.routing?.effectiveSpace === 'JA_CONSTRUIDO', 'A regra local e a rota permanecem vigentes na organização');
assert(contestRegra.methodologicalDiaryRef?.includes('diary-rule-review') === true, 'Referência ao Diário Metodológico registrada');

console.log('\n================================================================');
console.log('TODOS OS TESTES DO BLOCO 2.4 FORAM EXECUTADOS COM SUCESSO! 🎯');
console.log('================================================================\n');
