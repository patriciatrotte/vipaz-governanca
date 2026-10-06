/**
 * VIPAZ — Minha Rota
 * Testes Unitários de Aceite do Bloco 2.1 — Modelagem Canônica de Domínio
 *
 * Executado via tsx test/block2_1.test.ts
 */

import { ValidatedGap } from '../src/types';
import {
  RoutingCandidate,
  createCandidateFromGap,
  validateCandidateIntegrity,
  createDeterministicDecisionRecord,
  createAssistedDecisionRecord
} from '../src/services/routing/candidateModel';

function assert(condition: boolean, testName: string, detail?: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${testName}${detail ? ` - ${detail}` : ''}`);
    process.exit(1);
  } else {
    console.log(`✅ SUCESSO: ${testName}`);
  }
}

console.log('================================================================');
console.log('TESTES DE ACEITE DO BLOCO 2.1 — MODELAGEM CANÔNICA DE DOMÍNIO');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Teste 1: Criação e serialização de RoutingCandidate a partir de ValidatedGap
// -----------------------------------------------------------------------------
const mockGap: ValidatedGap = {
  id: 'gap-d1-1',
  doorId: 'D1.1',
  capacityId: 'C1',
  title: 'Normatização da Governança Digital e LGPD',
  description: 'Inexistência de regulamentação formal sobre governança de dados.',
  markers: ['ESTRUTURANTE', 'OBRIGATORIO'],
  rootCauseType: 'FLUXO_INSTITUCIONAL',
  requiresTraining: false,
  isValidatedByHuman: true,
  validatedAt: '2026-10-01T10:00:00Z'
};

const candidate = createCandidateFromGap({
  gap: mockGap,
  organizationId: 'org-camara-1',
  cycleId: 'cycle-2026-1',
  supportingEvidenceIds: ['evi-101', 'evi-102']
});

assert(candidate.candidateId === 'cand-gap-d1-1', 'Candidato possui ID canônico rastreável');
assert(candidate.sourceType === 'DIAGNOSTICO_GAP', 'Origem do candidato é estritamente tipada');
assert(candidate.sourceRefId === mockGap.id, 'Preserva vínculo inequívoco com o gap original');
assert(candidate.triageStatus === 'PENDENTE_DE_TRIAGEM', 'Inicia em PENDENTE_DE_TRIAGEM');
assert(candidate.nextExpectedState.targetKind === 'CAPACIDADE', 'Alvo estruturado possui targetKind válido');
assert(candidate.nextExpectedState.targetRefId === mockGap.capacityId, 'Alvo estruturado preserva capacityId');
assert(candidate.supportingEvidenceIds.length === 2, 'Fonte única de evidência: referências probatórias preservadas');
assert(candidate.relations.length === 0, 'Inicia sem relações inferidas por técnica');

// -----------------------------------------------------------------------------
// Teste 2: Integridade Probatória (detecção de evidências inexistentes)
// -----------------------------------------------------------------------------
const validEvidenceContext = new Set(['evi-101', 'evi-102', 'evi-103']);
const resultValid = validateCandidateIntegrity(candidate, validEvidenceContext);
assert(resultValid.isValid, 'Validação de integridade aprova candidato com evidências legítimas');

const invalidEvidenceContext = new Set(['evi-999']);
const resultInvalidEvi = validateCandidateIntegrity(candidate, invalidEvidenceContext);
assert(!resultInvalidEvi.isValid, 'Validação detecta e rejeita referência a evidência probatória inexistente');
assert(resultInvalidEvi.issues.some(i => i.field === 'supportingEvidenceIds'), 'Issue de evidência apontada no campo correto');

// -----------------------------------------------------------------------------
// Teste 3: Relações com Rastreabilidade de Origem e Proteção contra Autorreferência
// -----------------------------------------------------------------------------
const candidateWithSelfRef: RoutingCandidate = {
  ...candidate,
  relations: [
    {
      targetCandidateId: candidate.candidateId,
      relationType: 'DEPENDE_DE',
      origin: 'METODOLOGIA_CATALOGO'
    }
  ]
};
const resultSelfRef = validateCandidateIntegrity(candidateWithSelfRef);
assert(!resultSelfRef.isValid, 'Validação rejeita autorreferência em relações');

const candidateWithUnspecifiedOrigin: RoutingCandidate = {
  ...candidate,
  relations: [
    {
      targetCandidateId: 'cand-gap-d1-2',
      relationType: 'DEPENDE_DE',
      origin: '' as any
    }
  ]
};
const resultNoOrigin = validateCandidateIntegrity(candidateWithUnspecifiedOrigin);
assert(!resultNoOrigin.isValid, 'Validação exige rastreabilidade legítima de origem na relação');

// -----------------------------------------------------------------------------
// Teste 4: Correção Semântica Definitiva — Regime DETERMINÍSTICO
// -----------------------------------------------------------------------------
// 4.1: Candidato determinístico NÃO pode ter suggestedSpace preenchido
const candidateWithIllegalDeterministicSuggestion: RoutingCandidate = {
  ...candidate,
  routing: {
    routingRuleVersion: 'RULES_D1_v0.3',
    methodologyVersion: 'D1 v1.0',
    applicableRegime: 'DETERMINISTICO',
    suggestedSpace: 'JA_CONSTRUIDO', // ILEGAL no regime DETERMINÍSTICO
    effectiveSpace: 'JA_CONSTRUIDO',
    routingReason: {
      ruleCode: 'REG_D1_01',
      factualBasis: 'Capacidade comprovada por portaria homologada.',
      evidentialBasis: ['evi-101'],
      contextualJustification: 'Norma formalizada com plena vigência institucional.'
    }
  }
};
const resultIllegalSuggestion = validateCandidateIntegrity(candidateWithIllegalDeterministicSuggestion);
assert(
  !resultIllegalSuggestion.isValid &&
  resultIllegalSuggestion.issues.some(i => i.field === 'routing.suggestedSpace'),
  'Regime DETERMINÍSTICO rejeita suggestedSpace preenchido (não existe sugestão sob regra)'
);

// 4.2: Criação de registro auditável determinístico canônico
const deterministicRecord = createDeterministicDecisionRecord({
  decisionId: 'dec-det-001',
  organizationId: 'org-camara-1',
  confirmedRoute: 'JA_CONSTRUIDO',
  ruleCode: 'REG_D1_01',
  routingRuleVersion: 'RULES_D1_v0.3',
  rationale: 'Conclusão por aplicação direta da regra de capacidade atestada'
});
assert(deterministicRecord.suggestedRoute === null, 'suggestedRoute é estritamente null em decisão DETERMINÍSTICA');
assert(deterministicRecord.confirmedRoute === 'JA_CONSTRUIDO', 'confirmedRoute consolida a rota determinada');
assert(deterministicRecord.decidedByUserId === undefined, 'decidedByUserId não é forçado para decisão de regra');
assert(deterministicRecord.regime === 'DETERMINISTICO', 'Regime auditado como DETERMINISTICO');
assert(deterministicRecord.ruleCode === 'REG_D1_01', 'Código da regra auditado com precisão');

// -----------------------------------------------------------------------------
// Teste 5: Decisão em Regime ASSISTIDO (sugestão prévia + validação humana)
// -----------------------------------------------------------------------------
const assistedRecord = createAssistedDecisionRecord({
  decisionId: 'dec-ast-001',
  organizationId: 'org-camara-1',
  suggestedRoute: 'AGORA',
  confirmedRoute: 'NO_HORIZONTE',
  decidedByUserId: 'user-facilitador-1',
  decidedByRole: 'FACILITADOR',
  overrideReason: 'Gestão da Câmara pactuou aguardar a posse da nova comissão no próximo biênio.',
  routingRuleVersion: 'RULES_D1_v0.3'
});
assert(assistedRecord.suggestedRoute === 'AGORA', 'Preserva suggestedRoute no regime ASSISTIDO');
assert(assistedRecord.confirmedRoute === 'NO_HORIZONTE', 'Preserva confirmedRoute divergente');
assert(assistedRecord.decidedByUserId === 'user-facilitador-1', 'Audita identidade do decisor humano');
assert(assistedRecord.overrideReason !== undefined, 'Justificativa de divergência registrada com sucesso');

// -----------------------------------------------------------------------------
// Teste 6: Proteção contra fabricação de effectiveSpace sob ESCLARECIMENTO
// -----------------------------------------------------------------------------
const candidateUnderClarification: RoutingCandidate = {
  ...candidate,
  triageStatus: 'ESCLARECIMENTO_SOLICITADO',
  routing: {
    routingRuleVersion: 'RULES_D1_v0.3',
    methodologyVersion: 'D1 v1.0',
    applicableRegime: 'ASSISTIDO',
    effectiveSpace: 'AGORA', // ILEGAL: não pode existir espaço efetivo sob esclarecimento
    routingReason: {
      factualBasis: 'Informação incompleta',
      evidentialBasis: [],
      contextualJustification: 'Aguardando envio do regimento consolidado.'
    }
  }
};
const resultClarificationGuard = validateCandidateIntegrity(candidateUnderClarification);
assert(!resultClarificationGuard.isValid, 'Impede fabricação de effectiveSpace sob ESCLARECIMENTO_SOLICITADO');
assert(resultClarificationGuard.issues.some(i => i.field === 'routing.effectiveSpace'), 'Issue de effectiveSpace apontada sob esclarecimento');

console.log('\n================================================================');
console.log('TODOS OS TESTES DO BLOCO 2.1 FORAM EXECUTADOS COM SUCESSO! 🎯');
console.log('================================================================\n');
