/**
 * VIPAZ — Minha Rota
 * Testes Unitários de Aceite do Bloco 2.5 — Eventos, Análise de Impacto, Reavaliação Localizada e Snapshots
 *
 * Executado via tsx test/block2_5.test.ts
 */

import { InstitutionalAsIsRecord } from '../src/types';
import { RoutingCandidate } from '../src/types/routing';
import { analyzeFactOrEventImpact } from '../src/services/evolution/impactAnalyzer';
import { propagateLocalizedImpact } from '../src/services/evolution/propagationEngine';
import {
  executeLocalizedReevaluation,
  createNextAsIsSnapshot
} from '../src/services/evolution/reevaluationEngine';
import { initializeScheduledReview } from '../src/services/evolution/scheduledReview';
import { attachSubsequentEvidence } from '../src/services/routing/routeEngine';

function assert(condition: boolean, testName: string, detail?: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${testName}${detail ? ` - ${detail}` : ''}`);
    process.exit(1);
  } else {
    console.log(`✅ SUCESSO: ${testName}`);
  }
}

console.log('================================================================');
console.log('TESTES DE ACEITE DO BLOCO 2.5 — EVENTOS, IMPACTO E SNAPSHOTS');
console.log('================================================================\n');

const candidateBase: RoutingCandidate = {
  candidateId: 'cand-d1-comissao',
  sourceType: 'DIAGNOSTICO_GAP',
  sourceRefId: 'gap-01',
  organizationId: 'org-camara-1',
  cycleId: 'cycle-1',
  dimensionId: 'D1',
  statementAsIs: 'Comissão de Governança designada por ato da Mesa.',
  nextExpectedState: {
    targetKind: 'INSTRUMENTO',
    description: 'Portaria anual de recondução.'
  },
  supportingEvidenceIds: ['evi-portaria-2024'],
  relations: [],
  triageStatus: 'TRIADO',
  routing: {
    routingRuleVersion: 'RULES_D1_v0.3',
    methodologyVersion: 'D1 v1.0',
    applicableRegime: 'DETERMINISTICO',
    effectiveSpace: 'JA_CONSTRUIDO',
    routingReason: {
      ruleCode: 'REG_D1_01_JA_CONSTRUIDO',
      factualBasis: 'Comissão ativa',
      evidentialBasis: ['evi-portaria-2024'],
      contextualJustification: 'Norma vigente.'
    }
  }
};

// -----------------------------------------------------------------------------
// Teste 1: Análise de Impacto — Evidência Corroborante não dispara retriagem
// -----------------------------------------------------------------------------
const impactCorroborante = analyzeFactOrEventImpact(
  {
    eventId: 'evt-ata-reuniao',
    description: 'Juntada de ata de reunião da comissão comprovando funcionamento.',
    impactNature: 'CORROBORA_FATO'
  },
  candidateBase
);

assert(impactCorroborante.impactType === 'CORROBORANTE', 'Classificado estritamente como CORROBORANTE');
assert(!impactCorroborante.isPotentiallyRelevant, 'isPotentiallyRelevant é false para corroborante');
assert(!impactCorroborante.requiresLocalReevaluation, 'Não exige reavaliação localizada');
assert(!impactCorroborante.requiresClarification, 'Não exige esclarecimento');

// -----------------------------------------------------------------------------
// Teste 2: Análise de Impacto — Evidência Contraditória dispara reavaliação localizada
// -----------------------------------------------------------------------------
const impactContraditorio = analyzeFactOrEventImpact(
  {
    eventId: 'evt-ato-extintivo',
    description: 'Ato da Mesa nº 04/2026 revogou a comissão de governança.',
    isContradictory: true
  },
  candidateBase
);

assert(impactContraditorio.impactType === 'CONTRADITORIO_OU_MODIFICADOR', 'Classificado como CONTRADITORIO_OU_MODIFICADOR');
assert(impactContraditorio.isPotentiallyRelevant, 'Fato contraditório é potencialmente relevante');
assert(impactContraditorio.requiresLocalReevaluation, 'Fato contraditório exige reavaliação localizada');
assert(
  impactContraditorio.directlyAffectedEntities[0].entityId === 'cand-d1-comissao',
  'Atinge estritamente o menor objeto afetado'
);

// -----------------------------------------------------------------------------
// Teste 3: Análise de Impacto — Fato Complementar não invalida decisão existente
// -----------------------------------------------------------------------------
const impactComplementar = analyzeFactOrEventImpact(
  {
    eventId: 'evt-novo-membro',
    description: 'Servidor adicional indicado para apoiar a comissão como suplente.',
    isComplementary: true
  },
  candidateBase
);

assert(impactComplementar.impactType === 'COMPLEMENTAR', 'Classificado como COMPLEMENTAR');
assert(!impactComplementar.requiresLocalReevaluation, 'Fato complementar não invalida decisão de rota');

// -----------------------------------------------------------------------------
// Teste 4: Análise de Impacto — Impacto Indeterminado gera esclarecimento sem reiniciar diagnóstico
// -----------------------------------------------------------------------------
const impactIndeterminado = analyzeFactOrEventImpact(
  {
    eventId: 'evt-boato-reforma',
    description: 'Notícia de possível reestruturação administrativa em andamento na Câmara.',
    isUnclearOrIndeterminate: true
  },
  candidateBase
);

assert(impactIndeterminado.impactType === 'IMPACTO_INDETERMINADO', 'Classificado como IMPACTO_INDETERMINADO');
assert(impactIndeterminado.requiresClarification, 'Impacto indeterminado requer esclarecimento');
assert(!impactIndeterminado.requiresLocalReevaluation, 'Não dispara reavaliação precipitada antes de esclarecer');

// -----------------------------------------------------------------------------
// Teste 5: Propagação Relacional — Atinge apenas dependentes formais; independente permanece intacto
// -----------------------------------------------------------------------------
const candidateDependente: RoutingCandidate = {
  candidateId: 'cand-d1-plano-trabalho',
  sourceType: 'DIAGNOSTICO_GAP',
  sourceRefId: 'gap-02',
  organizationId: 'org-camara-1',
  cycleId: 'cycle-1',
  dimensionId: 'D1',
  statementAsIs: 'Plano de ação semestral da comissão.',
  nextExpectedState: { targetKind: 'PROCESSO', description: 'Entregas do plano.' },
  supportingEvidenceIds: [],
  relations: [
    {
      targetCandidateId: 'cand-d1-comissao',
      relationType: 'DEPENDE_DE',
      origin: 'METODOLOGIA_CATALOGO'
    }
  ],
  triageStatus: 'TRIADO'
};

const candidateIndependente: RoutingCandidate = {
  candidateId: 'cand-d1-portal-transp',
  sourceType: 'DIAGNOSTICO_GAP',
  sourceRefId: 'gap-03',
  organizationId: 'org-camara-1',
  cycleId: 'cycle-1',
  dimensionId: 'D1',
  statementAsIs: 'Portal da transparência com dados abertos.',
  nextExpectedState: { targetKind: 'PRATICA', description: 'Manutenção do portal.' },
  supportingEvidenceIds: ['evi-portal'],
  relations: [], // Sem dependência da comissão!
  triageStatus: 'TRIADO'
};

const propagation = propagateLocalizedImpact('cand-d1-comissao', [
  candidateBase,
  candidateDependente,
  candidateIndependente
]);

assert(
  propagation.dependentCandidateIds.includes('cand-d1-plano-trabalho'),
  'Dependente formalmente relacionado é identificado na propagação'
);
assert(
  !propagation.dependentCandidateIds.includes('cand-d1-portal-transp'),
  'Candidato independente permanece 100% intacto (zero propagação indevida)'
);
assert(
  propagation.propagationTrace[0].origin === 'METODOLOGIA_CATALOGO',
  'Rastreabilidade da relação preservada na propagação'
);

// -----------------------------------------------------------------------------
// Teste 6: Reavaliação Localizada — ESTABILIDADE não produz novo marco de AS IS
// -----------------------------------------------------------------------------
const reevalEstabilidade = executeLocalizedReevaluation({
  candidate: candidateBase,
  triggerOrigin: 'EVENTO_OPERACIONAL',
  impactAnalysis: impactCorroborante,
  observedOutcome: 'ESTABILIDADE',
  updatedStatement: 'Comissão de Governança confirmada em plena atividade.'
});

assert(reevalEstabilidade.outcome === 'ESTABILIDADE', 'Desfecho é ESTABILIDADE');
assert(!reevalEstabilidade.producesNewAsIsMilestone, 'ESTABILIDADE não produz novo marco de AS IS');
assert(reevalEstabilidade.reusedEvidenceIds.includes('evi-portaria-2024'), 'Reaproveitamento estrito de evidências prévias');

// -----------------------------------------------------------------------------
// Teste 7: Reavaliação Localizada — EVOLUÇÃO produz novo marco sequencial mantendo anterior imutável
// -----------------------------------------------------------------------------
const reevalEvolucao = executeLocalizedReevaluation({
  candidate: candidateBase,
  triggerOrigin: 'EVENTO_OPERACIONAL',
  impactAnalysis: impactContraditorio,
  observedOutcome: 'EVOLUCAO',
  updatedStatement: 'Nova estrutura colegiada comitê formalmente empossada.',
  newEvidenceIds: ['evi-portaria-2026-nova']
});

assert(reevalEvolucao.outcome === 'EVOLUCAO', 'Desfecho é EVOLUCAO');
assert(reevalEvolucao.producesNewAsIsMilestone, 'EVOLUÇÃO gera novo marco de AS IS');

// Snapshot Anterior (AS IS 0)
const initialSnapshot: InstitutionalAsIsRecord = {
  asIsId: 'as-is-0-initial',
  organizationId: 'org-camara-1',
  cycleId: 'cycle-1',
  sequenceNumber: 0,
  versionLabel: 'AS IS 0',
  triggerOrigin: 'DIAGNOSTICO_INICIAL_VALIDADO',
  establishedAt: '2026-09-01T10:00:00Z',
  validatedByUserId: 'user-validador-1',
  validatedByRole: 'GESTOR_INSTITUCIONAL',
  methodologyVersion: 'D1 v1.0',
  demonstratedCapacities: ['C1'],
  structuringCapacities: [],
  synthesisSummary: 'Diagnóstico preliminar inicial.',
  evidentialBasisIds: ['evi-portaria-2024'],
  isLockedImmutable: true
};

// Geração do Próximo Snapshot (AS IS 1)
const nextSnapshot = createNextAsIsSnapshot({
  previousSnapshot: initialSnapshot,
  reevaluationResult: reevalEvolucao,
  updatedDemonstratedCapacities: ['C1', 'C2'],
  synthesisSummary: 'Reconhecimento formal da evolução da governança colegiada.',
  validatedByUserId: 'user-validador-1',
  validatedByRole: 'GESTOR_INSTITUCIONAL'
});

assert(nextSnapshot.sequenceNumber === 1, 'Sequencial estrito incrementado: AS IS 1');
assert(nextSnapshot.versionLabel === 'AS IS 1', 'Label de versão correto: AS IS 1');
assert(nextSnapshot.isLockedImmutable, 'Próximo snapshot possui garantia de imutabilidade');
assert(initialSnapshot.sequenceNumber === 0, 'Snapshot anterior permanece 100% inalterado (AS IS 0 preservado imutável)');
assert(initialSnapshot.versionLabel === 'AS IS 0', 'Versão anterior não foi sobrescrita');

// -----------------------------------------------------------------------------
// Teste 8: Rastreabilidade da Cadeia Causal Completa
// -----------------------------------------------------------------------------
assert(
  impactContraditorio.eventId === 'evt-ato-extintivo' &&
  reevalEvolucao.targetScope.entityId === 'cand-d1-comissao' &&
  nextSnapshot.evidentialBasisIds.includes('evi-portaria-2026-nova'),
  'Cadeia causal rastreável: Estado Anterior → Evento → Análise de Impacto → Reavaliação → Novo Estado'
);

// -----------------------------------------------------------------------------
// Teste 9: Revisão Programada utiliza estado anterior e não reinicia investigação integral
// -----------------------------------------------------------------------------
const scheduledPlan = initializeScheduledReview(
  nextSnapshot,
  [candidateBase, candidateDependente, candidateIndependente],
  new Set(['cand-d1-comissao']) // Apenas o item da comissão precisa ser atualizado focalmente
);

assert(
  scheduledPlan.scopeOfInvestigation.confirmedWithoutReinterview.length === 2,
  'Itens estáveis confirmados sem repetição de entrevista'
);
assert(
  scheduledPlan.scopeOfInvestigation.candidatesTargetedForUpdate[0].entityId === 'cand-d1-comissao',
  'Apenas o item selecionado é submetido a atualização focal'
);
assert(
  scheduledPlan.baselineSequenceNumber === 1,
  'Revisão programada ancorada formalmente no AS IS 1 anterior'
);

// -----------------------------------------------------------------------------
// Teste 10: Resolução de pendência probatória não altera artificialmente o RouteSpace
// -----------------------------------------------------------------------------
const candidateWithPendingProof: RoutingCandidate = {
  ...candidateBase,
  candidateId: 'cand-pend-resolv',
  supportingEvidenceIds: [], // Comprovação pendente
  routing: {
    routingRuleVersion: 'RULES_D1_v0.3',
    methodologyVersion: 'D1 v1.0',
    applicableRegime: 'DETERMINISTICO',
    effectiveSpace: 'JA_CONSTRUIDO',
    routingReason: {
      factualBasis: 'Rotina existente',
      evidentialBasis: [],
      pendingEvidenceItemRefId: 'pend-doc-portaria',
      contextualJustification: 'Reconhecido com comprovação documental pendente.'
    }
  }
};

const resolvePending = attachSubsequentEvidence(
  candidateWithPendingProof,
  'evi-portaria-juntada-tardia'
);

assert(resolvePending.isPendingResolved, 'Pendência documental resolvida com sucesso');
assert(!resolvePending.requiresReevaluation, 'Não requer reavaliação de rota');
assert(
  resolvePending.updatedCandidate.routing?.effectiveSpace === 'JA_CONSTRUIDO',
  'RouteSpace permanece intacto em JA_CONSTRUIDO sem alteração artificial'
);

console.log('\n================================================================');
console.log('TODOS OS TESTES DO BLOCO 2.5 FORAM EXECUTADOS COM SUCESSO! 🎯');
console.log('================================================================\n');
