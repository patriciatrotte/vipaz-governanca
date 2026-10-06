/**
 * VIPAZ — Minha Rota
 * Testes Unitários de Aceite do Bloco 2.2 — Triagem e Menor Intervenção Suficiente
 *
 * Executado via tsx test/block2_2.test.ts
 */

import { RoutingCandidate } from '../src/types/routing';
import {
  evaluateCandidateTriage,
  requestCandidateClarification,
  resolveCandidateClarification,
  validateRouteActionSeparation
} from '../src/services/routing/triageEngine';
import { deriveInterventionComposition } from '../src/services/routing/interventionRules';

function assert(condition: boolean, testName: string, detail?: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${testName}${detail ? ` - ${detail}` : ''}`);
    process.exit(1);
  } else {
    console.log(`✅ SUCESSO: ${testName}`);
  }
}

console.log('================================================================');
console.log('TESTES DE ACEITE DO BLOCO 2.2 — TRIAGEM E MENOR INTERVENÇÃO');
console.log('================================================================\n');

const baseCandidate: RoutingCandidate = {
  candidateId: 'cand-d1-reg-01',
  sourceType: 'DIAGNOSTICO_GAP',
  sourceRefId: 'gap-01',
  organizationId: 'org-camara-1',
  cycleId: 'cycle-1',
  dimensionId: 'D1',
  statementAsIs: 'A Câmara não possui regulamentação própria para a LGPD.',
  nextExpectedState: {
    targetKind: 'INSTRUMENTO',
    description: 'Resolução da Mesa Diretora instituindo a governança de privacidade.'
  },
  supportingEvidenceIds: ['evi-doc-1'],
  relations: [],
  triageStatus: 'PENDENTE_DE_TRIAGEM'
};

// -----------------------------------------------------------------------------
// Teste 1: Triagem com Falta de Informação Probatória
// -----------------------------------------------------------------------------
const candidateMissingEvidence: RoutingCandidate = {
  ...baseCandidate,
  supportingEvidenceIds: [],
  statementAsIs: ''
};

const triageIncomplete = evaluateCandidateTriage(candidateMissingEvidence, {
  hasKnownEvidentialGap: true,
  evidentialGapDescription: 'Falta confirmação da vigência do ato da Mesa de 2024.'
});

assert(triageIncomplete.status === 'NECESSITA_ESCLARECIMENTO', 'Candidato com déficit probatório recebe NECESSITA_ESCLARECIMENTO');
assert(!triageIncomplete.hasSufficientInformation, 'hasSufficientInformation é false');
assert(triageIncomplete.identifiedInterventionComposition === undefined, 'identifiedInterventionComposition permanece AUSENTE sob esclarecimento (sem inventar estratégia)');
assert(triageIncomplete.missingInformationReason?.includes('2024') === true, 'Razão da carência informada no resultado da triagem');

// -----------------------------------------------------------------------------
// Teste 2: ESCLARECER suspende conclusão sem descartar o candidato
// -----------------------------------------------------------------------------
const candidateUnderClarif = requestCandidateClarification(
  baseCandidate,
  'Solicitar cópia da Portaria nº 08/2023 citada na entrevista.',
  'facilitador-1'
);

assert(candidateUnderClarif.triageStatus === 'ESCLARECIMENTO_SOLICITADO', 'Transiciona para ESCLARECIMENTO_SOLICITADO');
assert(candidateUnderClarif.clarificationRequest !== undefined, 'Gera clarificationRequest estruturado');
assert(candidateUnderClarif.clarificationRequest?.isResolved === false, 'isResolved é false inicialmente');
assert(candidateUnderClarif.candidateId === baseCandidate.candidateId, 'Candidato preservado integralmente na base (não foi descartado)');

// Resolução do esclarecimento
const candidateResolved = resolveCandidateClarification(
  candidateUnderClarif,
  'Documento juntado aos autos digitais sob código evi-doc-2.',
  ['evi-doc-2']
);

assert(candidateResolved.triageStatus === 'PENDENTE_DE_TRIAGEM', 'Retorna para PENDENTE_DE_TRIAGEM para retriagem');
assert(candidateResolved.clarificationRequest?.isResolved === true, 'isResolved é atualizado para true');
assert(candidateResolved.supportingEvidenceIds.includes('evi-doc-2'), 'Novas evidências incorporadas à fonte única');

// -----------------------------------------------------------------------------
// Teste 3: Menor Intervenção Suficiente e Composição Não-Inferida (Correção v0.4.1)
// -----------------------------------------------------------------------------
// 3.1 MANTER puro quando capacidade plenamente atestada
const compManter = deriveInterventionComposition({
  isCapacityFullyDemonstrated: true
});
assert(compManter?.primaryModality === 'MANTER', 'Capacidade plenamente atestada resulta em MANTER');
assert(compManter?.secondaryModalities === undefined, 'MANTER puro não possui modalidades secundárias artificiais');

// 3.2 APROVEITAR puro: existência não implica automaticamente inadequação
const compAproveitarPuro = deriveInterventionComposition({
  hasExistingStructure: true,
  existingStructureDescription: 'Portaria nº 12/2021 sobre publicação de atos',
  isStructureSufficientAndAdequate: true
  // Sem necessidade de adaptação, integração ou construção demonstrada
});
assert(compAproveitarPuro?.primaryModality === 'APROVEITAR', 'Estrutura existente resulta em APROVEITAR');
assert(compAproveitarPuro?.secondaryModalities === undefined, 'APROVEITAR existe de forma pura: existência não implica automaticamente inadequação nem exige ADAPTAR/INTEGRAR');

// 3.3 APROVEITAR com ADAPTAR fundamentado especificamente
const compAproveitarComAdaptar = deriveInterventionComposition({
  hasExistingStructure: true,
  existingStructureDescription: 'Resolução da Mesa de 2018',
  demonstratedNeedForAdaptation: true,
  adaptationNeedReason: 'Ato anterior à LGPD necessita atualização terminológica'
  // Sem integração nem construção
});
assert(compAproveitarComAdaptar?.primaryModality === 'APROVEITAR', 'Modalidade primária é APROVEITAR');
assert(compAproveitarComAdaptar?.secondaryModalities?.length === 1, 'Apenas uma modalidade secundária');
assert(compAproveitarComAdaptar?.secondaryModalities?.[0] === 'ADAPTAR', 'ADAPTAR aparece apenas com fundamento específico');

// 3.4 INTEGRAR puro: pode existir sem CONSTRUIR
const compIntegrarPuro = deriveInterventionComposition({
  demonstratedNeedForIntegration: true,
  integrationNeedReason: 'Fluxo entre Ouvidoria e Protocolo carece de alinhamento operacional'
  // Sem construção demonstrada
});
assert(compIntegrarPuro?.primaryModality === 'INTEGRAR', 'Necessidade de integração resulta em INTEGRAR primário');
assert(compIntegrarPuro?.secondaryModalities === undefined, 'INTEGRAR pode existir sem CONSTRUIR: rotina ou ferramenta existente não implica necessidade de construção');

// 3.5 CONSTRUIR puro quando há necessidade demonstrada de construção ex-nihilo
const compConstruir = deriveInterventionComposition({
  hasExistingStructure: false,
  demonstratedMissingComponentNeedingConstruction: true,
  constructionNeedReason: 'Inexistência total de canal de atendimento ao cidadão'
});
assert(compConstruir?.primaryModality === 'CONSTRUIR', 'Inexistência de base resulta em CONSTRUIR');
assert(compConstruir?.secondaryModalities === undefined, 'CONSTRUIR puro não possui secundárias fabricadas');

// 3.6 Ausência de dados -> undefined (sem fabricação de intervenção)
const compVazio = deriveInterventionComposition({});
assert(compVazio === undefined, 'Contexto vazio não fabrica intervenção arbitrária');

// -----------------------------------------------------------------------------
// Teste 4: Desacoplamento entre Regime Decisório e Modalidade de Intervenção
// -----------------------------------------------------------------------------
const triageComplete = evaluateCandidateTriage(baseCandidate, {
  assetContext: {
    hasExistingNormOrInstrument: true,
    existingInstrumentDescription: 'Regimento Interno'
  }
});

assert(triageComplete.status === 'APTO_PARA_ROTEAMENTO', 'Candidato com dados probatórios está APTO_PARA_ROTEAMENTO');
assert(triageComplete.identifiedInterventionComposition?.primaryModality === 'APROVEITAR', 'Intervenção identificada como APROVEITAR');
// Garantir que a modalidade de intervenção não é confundida com regime
const validModalities = ['MANTER', 'APROVEITAR', 'ADAPTAR', 'INTEGRAR', 'CONSTRUIR'];
assert(
  validModalities.includes(triageComplete.identifiedInterventionComposition!.primaryModality),
  'A modalidade é puramente de intervenção, nunca ASSISTIDO ou HUMANO'
);
assert(
  triageComplete.recommendedDecisionRegime === 'ASSISTIDO' || triageComplete.recommendedDecisionRegime === 'DETERMINISTICO' || triageComplete.recommendedDecisionRegime === 'HUMANO',
  'Regime decisório é governado separadamente em seu próprio campo'
);

// -----------------------------------------------------------------------------
// Teste 5: Necessidade Futura não equivale a SEM_ACAO
// -----------------------------------------------------------------------------
const futureTriage = evaluateCandidateTriage(baseCandidate, {
  isFutureOrientedNeed: true
});

assert(futureTriage.status === 'APTO_PARA_ROTEAMENTO', 'Necessidade futura é APTA para roteamento formal (Quando Precisar ou No Horizonte)');
assert(futureTriage.triageNotes?.includes('sem conversão em tarefa imediata') === true, 'Nota formal registra que necessidade futura não é SEM_ACAO nem tarefa');

// -----------------------------------------------------------------------------
// Teste 6: Desacoplamento Rota !== EvolutionAction
// -----------------------------------------------------------------------------
const candidateJaConstruidoWithAction: RoutingCandidate = {
  ...baseCandidate,
  routing: {
    routingRuleVersion: 'RULES_D1_v0.3',
    methodologyVersion: 'D1 v1.0',
    applicableRegime: 'DETERMINISTICO',
    effectiveSpace: 'JA_CONSTRUIDO',
    routingReason: {
      factualBasis: 'Capacidade atestada',
      evidentialBasis: ['evi-doc-1'],
      contextualJustification: 'Norma vigente.'
    }
  },
  boundActionId: 'action-999' // ILEGAL: Já Construído não pode ser transformado em tarefa
};

const violationCheck = validateRouteActionSeparation(candidateJaConstruidoWithAction);
assert(!violationCheck.isCompliant, 'Detecta violação quando JÁ_CONSTRUÍDO possui EvolutionAction vinculada');

const candidateJaConstruidoCompliant: RoutingCandidate = {
  ...candidateJaConstruidoWithAction,
  boundActionId: undefined // CORRETO: sem ação associada
};
const compliantCheck = validateRouteActionSeparation(candidateJaConstruidoCompliant);
assert(compliantCheck.isCompliant, 'Aprova candidato em JÁ_CONSTRUÍDO desacoplado de ação operacional');

console.log('\n================================================================');
console.log('TODOS OS TESTES DO BLOCO 2.2 FORAM EXECUTADOS COM SUCESSO! 🎯');
console.log('================================================================\n');
