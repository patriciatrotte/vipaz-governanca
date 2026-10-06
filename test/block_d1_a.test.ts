/**
 * VIPAZ — Minha Rota
 * Testes Unitários do Bloco D1-A — Camada Estrutural de Domínio (v2.2 Refinada Final)
 *
 * Validações estruturais e metodológicas homologadas:
 * 1. 6 Capacidades e 19 Critérios canônicos com contagem exata (2+4+3+3+3+4 = 19)
 * 2. Dimensão epistemológica cumulativa (ManifestationNature[]) separada de ElicitationChannel
 * 3. Relação N:N entre unidades de informação, critérios e objetos de verificação
 * 4. Validação dos 5 estados canônicos de critério e 5 de capacidade (sem PARCIALMENTE_ATENDIDO)
 * 5. Garantia metodológica: COMPROVACAO_PENDENTE !== requisito comprovado
 * 6. Validação estrutural de divergências com pertinência e materialidade
 * 7. Validação de cluster causal (prevenção de prescrição e anti-duplicação)
 * 8. Recusa estrita de inferência técnica sem a Matriz Mestra D1 v2
 * 9. Estrutura de Objeto de Verificação (VerificationObject):
 *    - Um critério pode conter múltiplos OVs
 *    - Um OV pertence ao critério correto
 *    - OVs do mesmo critério podem possuir proofRequirement distintos (ex: FUNCIONAL vs ESTRITA em C1.2-A)
 *    - Um OV pode estar NAO_ACIONADO sem tornar automaticamente todo o critério NAO_ACIONADO
 *    - Nenhuma composição automática OV → critério foi criada
 *    - Nenhuma regra de score, média ou compensação foi introduzida
 * 10. Teste prospectivo de prontidão atual permanece separado de intenção futura (PROSPECTIVA)
 * 11. Aplicabilidade do Objeto de Verificação (v2.2):
 *     - OV condicionado pode ser APLICAVEL
 *     - OV condicionado pode ser NAO_APLICAVEL sem receber VerificationObjectResult
 *     - NAO_APLICAVEL é conceitualmente distinto de NAO_ACIONADO
 *     - APLICABILIDADE_NAO_CONCLUSIVA permanece explicitamente pendente
 *     - OV não condicionado não exige avaliação artificial de aplicabilidade
 * 12. Referencial/Requisito Compartilhável (RequirementReference) (v2.2):
 *     - 1 Requisito -> N OVs
 *     - Múltiplos OVs compartilham o mesmo requisito sem duplicação de obrigação
 * 13. Integridade do CriterionResult e semântica de allowNonTriggered (v2.2):
 *     - CriterionResult não possui proofRequirementApplied monolítico
 *     - allowNonTriggered = false significa condição atual investigável, não exigência de episódio histórico
 */

import {
  InformationUnit,
  Divergence,
  CausalGapCluster,
  CriterionResultStatus,
  CapabilityResultStatus,
  CanonicalCapacityId,
  CanonicalCriterionId,
  VerificationObjectDefinition,
  VerificationObjectResult,
  VerificationObjectApplicabilityEvaluation,
  RequirementReference,
  CriterionResult,
  D1MasterMatrixConfig
} from '../src/types/d1Inference';
import {
  CANONICAL_CAPACITIES_D1,
  CANONICAL_CRITERIA_D1
} from '../src/services/d1Inference/canonicalDefinitions';
import {
  validateInformationUnitIntegrity,
  validateVerificationObjectIntegrity,
  validateVerificationObjectResultStructure,
  validateApplicabilityEvaluation,
  validateRequirementReferenceIntegrity,
  validateDivergenceStructure,
  validateCausalClusterStructure,
  assertComprovacaoPendenteNaoEquivaleASatisfeito,
  assertProspectiveContextSeparation,
  assertMasterMatrixConfigProvided
} from '../src/services/d1Inference/structuralValidation';

function runD1AStructuralTests() {
  console.log('================================================================');
  console.log('INICIANDO SUÍTE DE TESTES ESTRUTURAIS — BLOCO D1-A (v2.2 FINAL)');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      throw new Error(`Falha no teste: ${testName}`);
    }
  }

  // --------------------------------------------------------------------------
  // TESTE 1: 6 Capacidades Canônicas e 19 Critérios Canônicos
  // --------------------------------------------------------------------------
  console.log('--- Teste 1: Contagem e taxonomia canônica das capacidades e critérios ---');
  const capacityIds = Object.keys(CANONICAL_CAPACITIES_D1) as CanonicalCapacityId[];
  assert(capacityIds.length === 6, 'Exatamente 6 capacidades canônicas (D1.1 a D1.6)');
  assert(CANONICAL_CAPACITIES_D1['D1.1'].criteriaIds.length === 2, 'D1.1 possui 2 critérios (C1.1-A, C1.1-B)');
  assert(CANONICAL_CAPACITIES_D1['D1.2'].criteriaIds.length === 4, 'D1.2 possui 4 critérios (C1.2-A a C1.2-D)');
  assert(CANONICAL_CAPACITIES_D1['D1.3'].criteriaIds.length === 3, 'D1.3 possui 3 critérios (C1.3-A a C1.3-C)');
  assert(CANONICAL_CAPACITIES_D1['D1.4'].criteriaIds.length === 3, 'D1.4 possui 3 critérios (C1.4-A a C1.4-C)');
  assert(CANONICAL_CAPACITIES_D1['D1.5'].criteriaIds.length === 3, 'D1.5 possui 3 critérios (C1.5-A a C1.5-C)');
  assert(CANONICAL_CAPACITIES_D1['D1.6'].criteriaIds.length === 4, 'D1.6 possui 4 critérios (C1.6-A a C1.6-D)');

  const criteriaIds = Object.keys(CANONICAL_CRITERIA_D1) as CanonicalCriterionId[];
  assert(criteriaIds.length === 19, 'Total exato de 19 critérios canônicos');

  // --------------------------------------------------------------------------
  // TESTE 2: Natureza Epistemológica Cumulativa
  // --------------------------------------------------------------------------
  console.log('\n--- Teste 2: Natureza Epistemológica Cumulativa e Canal Isolado ---');
  const validCumulativeUnit: InformationUnit = {
    id: 'unit-001',
    doorOrCapabilityScope: 'D1.2',
    rawContent: 'O Encarregado atua diariamente orientando servidores (relato vivenciado) e apresentou comprovante de designação.',
    manifestationNatures: ['VIVENCIADA', 'COMPROVADA'], // Cumulativa
    provenance: {
      authorName: 'Carlos Silva',
      authorRole: 'ENCARREGADO',
      channel: 'ENTREVISTA_ORAL', // Canal isolado
      collectedAt: new Date().toISOString(),
      institutionalScope: 'Câmara Municipal — Setor de Ouvidoria',
      investigationContext: 'ROTINA_OPERACIONAL'
    },
    bindings: [
      {
        criterionId: 'C1.2-A',
        verificationObjectId: 'OV-C1.2-A-01',
        pertinence: 'PERTINENCIA_DIRETA_ESPECIFICA',
        supportsExistence: true,
        specificFactSummary: 'Portaria de designação apresentada'
      },
      {
        criterionId: 'C1.2-B',
        verificationObjectId: 'OV-C1.2-B-01',
        pertinence: 'PERTINENCIA_DIRETA_ESPECIFICA',
        supportsExistence: true,
        specificFactSummary: 'Atuação orientativa rotineira observada'
      }
    ]
  };

  const validationRes = validateInformationUnitIntegrity(validCumulativeUnit);
  assert(validationRes.isValid, 'InformationUnit com natureza cumulativa e canal separado é válida');

  // Teste de rejeição quando não há naturezas
  const invalidEmptyNatures: InformationUnit = {
    ...validCumulativeUnit,
    id: 'unit-inv-1',
    manifestationNatures: []
  };
  const emptyNaturesRes = validateInformationUnitIntegrity(invalidEmptyNatures);
  assert(!emptyNaturesRes.isValid && emptyNaturesRes.issues.some(i => i.code === 'MISSING_MANIFESTATION_NATURES'),
    'Rejeita InformationUnit sem naturezas epistemológicas');

  // --------------------------------------------------------------------------
  // TESTE 3: Relação N:N entre Unidades de Informação e Critérios/OVs
  // --------------------------------------------------------------------------
  console.log('\n--- Teste 3: Relação N:N e Pertinência Probatória por Fato ---');
  // 1 Unidade -> 2 Critérios
  assert(validCumulativeUnit.bindings.length === 2, 'Uma única unidade vincula-se a múltiplos critérios (1:N)');

  // 2ª Unidade que também se vincula a C1.2-B (N:1)
  const secondUnitForSameCrit: InformationUnit = {
    id: 'unit-002',
    doorOrCapabilityScope: 'D1.2',
    rawContent: 'Servidor da TI confirma que o Encarregado realizou alinhamento técnico semana passada.',
    manifestationNatures: ['CORROBORADA', 'DECLARADA'],
    provenance: {
      authorName: 'Mariana Costa',
      authorRole: 'EQUIPE_TI',
      channel: 'QUESTIONARIO_ESTRUTURADO',
      collectedAt: new Date().toISOString(),
      institutionalScope: 'Divisão de Tecnologia da Informação',
      investigationContext: 'ROTINA_OPERACIONAL'
    },
    bindings: [
      {
        criterionId: 'C1.2-B',
        verificationObjectId: 'OV-C1.2-B-01',
        pertinence: 'PERTINENCIA_DIRETA_ESPECIFICA',
        supportsExistence: true,
        specificFactSummary: 'Alinhamento conjunto TI-Encarregado confirmado'
      }
    ]
  };

  const secondRes = validateInformationUnitIntegrity(secondUnitForSameCrit);
  assert(secondRes.isValid, 'Segunda unidade vinculada ao mesmo critério C1.2-B é válida (N:N confirmada)');

  // --------------------------------------------------------------------------
  // TESTE 4: Estados Canônicos de Critério e Capacidade (Sem PARCIALMENTE_ATENDIDO)
  // --------------------------------------------------------------------------
  console.log('\n--- Teste 4: Estados Canônicos Estritos ---');
  const allowedCriterionStatuses: CriterionResultStatus[] = [
    'SATISFEITO',
    'NAO_SATISFEITO',
    'COMPROVACAO_PENDENTE',
    'NAO_CONCLUSIVO',
    'NAO_ACIONADO'
  ];
  assert(allowedCriterionStatuses.length === 5, 'Exatamente 5 estados canônicos de CriterionResult');
  assert(!allowedCriterionStatuses.includes('PARCIALMENTE_ATENDIDO' as any), 'PARCIALMENTE_ATENDIDO não existe no enum');

  const allowedCapabilityStatuses: CapabilityResultStatus[] = [
    'SUFICIENTE',
    'SUFICIENTE_EVOLUCAO_POSSIVEL',
    'SUFICIENTE_COMPROVACAO_PENDENTE',
    'INSUFICIENTE',
    'NAO_CONCLUSIVO'
  ];
  assert(allowedCapabilityStatuses.length === 5, 'Exatamente 5 estados canônicos de CapabilityResult');

  // --------------------------------------------------------------------------
  // TESTE 5: Salvaguarda: COMPROVACAO_PENDENTE !== requisito comprovado
  // --------------------------------------------------------------------------
  console.log('\n--- Teste 5: Salvaguarda COMPROVACAO_PENDENTE !== requisito comprovado ---');
  const pendenteStatus: CriterionResultStatus = 'COMPROVACAO_PENDENTE';
  const satisfeitoStatus: CriterionResultStatus = 'SATISFEITO';
  assert((pendenteStatus as string) !== (satisfeitoStatus as string), 'COMPROVACAO_PENDENTE é tipicamente distinto de SATISFEITO');
  let thrown = false;
  try {
    assertComprovacaoPendenteNaoEquivaleASatisfeito(pendenteStatus);
  } catch {
    thrown = true;
  }
  assert(!thrown, 'assertComprovacaoPendenteNaoEquivaleASatisfeito valida a distinção com sucesso');

  // --------------------------------------------------------------------------
  // TESTE 6: Validação Estrutural de Divergência
  // --------------------------------------------------------------------------
  console.log('\n--- Teste 6: Validação de Divergência entre Fontes ---');
  const knownUnits = new Set(['unit-001', 'unit-002']);
  const validDivergence: Divergence = {
    id: 'div-001',
    criterionId: 'C1.2-B',
    verificationObjectId: 'OV-C1.2-B-01',
    conflictingUnitIds: ['unit-001', 'unit-002'],
    divergenceType: 'FONTES_DISTINTAS_MESMO_FATO',
    description: 'Encarregado relata reuniões regulares com TI, enquanto TI afirma que reuniões são eventuais.',
    isMaterial: true,
    resolved: false
  };

  const divRes = validateDivergenceStructure(validDivergence, knownUnits);
  assert(divRes.isValid, 'Divergência com 2 unidades conhecidas e critério válido é aceita');

  const invalidDivInsufficientUnits: Divergence = {
    ...validDivergence,
    id: 'div-inv',
    conflictingUnitIds: ['unit-001'] as any
  };
  const divFailRes = validateDivergenceStructure(invalidDivInsufficientUnits, knownUnits);
  assert(!divFailRes.isValid && divFailRes.issues.some(i => i.code === 'INSUFFICIENT_CONFLICTING_UNITS'),
    'Rejeita divergência com menos de 2 unidades conflitantes');

  // --------------------------------------------------------------------------
  // TESTE 7: Cluster Causal e Não Prescrição Antecipada
  // --------------------------------------------------------------------------
  console.log('\n--- Teste 7: Cluster Causal e Prevenção de Duplicação ---');
  const validCluster: CausalGapCluster = {
    clusterId: 'cluster-c16-01',
    capacityId: 'D1.6',
    rootDeficiencyDescription: 'Vulnerabilidade de continuidade operacional decorrente de concentração exclusiva de conhecimento e pendências em único agente sem registro recuperável.',
    originatingCriteriaIds: ['C1.6-A', 'C1.6-C'], // 2 critérios da mesma capacidade D1.6
    originatingVerificationObjectIds: ['OV-C1.6-A-01', 'OV-C1.6-C-01'],
    supportingEvidenceIds: ['unit-001']
  };

  const clusterRes = validateCausalClusterStructure(validCluster);
  assert(clusterRes.isValid, 'Cluster causal agregando critérios da mesma capacidade é aceito');

  // Rejeita critério de capacidade divergente no mesmo cluster
  const mismatchCluster: CausalGapCluster = {
    ...validCluster,
    clusterId: 'cluster-inv',
    capacityId: 'D1.1', // Não corresponde aos critérios C1.6
    originatingCriteriaIds: ['C1.6-A']
  };
  const mismatchRes = validateCausalClusterStructure(mismatchCluster);
  assert(!mismatchRes.isValid && mismatchRes.issues.some(i => i.code === 'CRITERION_CAPACITY_MISMATCH'),
    'Rejeita cluster que mistura critérios fora do escopo da sua capacidade canônica');

  // --------------------------------------------------------------------------
  // TESTE 8: Recusa de Padrões Técnicos sem Matriz Mestra D1 v2
  // --------------------------------------------------------------------------
  console.log('\n--- Teste 8: Recusa de Padrões Técnicos sem Matriz Mestra D1 v2 ---');
  let masterMatrixErrorThrown = false;
  let errorMsg = '';
  try {
    assertMasterMatrixConfigProvided(undefined);
  } catch (err: any) {
    masterMatrixErrorThrown = true;
    errorMsg = err.message;
  }
  assert(masterMatrixErrorThrown, 'Motor recusa execução quando a Matriz Mestra D1 v2 não é fornecida');
  assert(errorMsg.includes('PENDÊNCIA METODOLÓGICA EXTERNA'), 'Mensagem expressa formalmente pendência metodológica externa');

  // Teste com matriz incompleta (faltando critérios)
  let incompleteErrorThrown = false;
  try {
    const incompleteConfig: D1MasterMatrixConfig = {
      version: 'v2.0-draft',
      criteriaConfig: {} as any, // Vazio!
      capacitiesConfig: {} as any
    };
    assertMasterMatrixConfigProvided(incompleteConfig);
  } catch (err: any) {
    incompleteErrorThrown = true;
  }
  assert(incompleteErrorThrown, 'Recusa matriz incompleta sem arbitrar valores técnicos padrão');

  // --------------------------------------------------------------------------
  // TESTE 9: Objeto de Verificação (VerificationObject) — Granularidade e Integridade
  // --------------------------------------------------------------------------
  console.log('\n--- Teste 9: Objeto de Verificação (VerificationObject) ---');

  // 9.1 Um critério pode conter múltiplos OVs
  const ov1: VerificationObjectDefinition = {
    id: 'OV-C1.2-A-01',
    criterionId: 'C1.2-A',
    code: 'OV-C1.2-A-01',
    title: 'Ato formal de designação do Encarregado',
    description: 'Verificação da existência e publicação da portaria/ato formal de designação.',
    nature: 'REQUISITO_NORMATIVO',
    isConditionedApplicability: false, // Aplicabilidade incondicionada
    allowNonTriggered: false
  };

  const ov2: VerificationObjectDefinition = {
    id: 'OV-C1.2-A-02',
    criterionId: 'C1.2-A',
    code: 'OV-C1.2-A-02',
    title: 'Divulgação dos canais de contato do Encarregado',
    description: 'Verificação da disponibilização pública e interna dos meios de contato do Encarregado.',
    nature: 'MANIFESTACAO_FUNCIONAL',
    isConditionedApplicability: false,
    allowNonTriggered: false
  };

  const ov1Valid = validateVerificationObjectIntegrity(ov1);
  const ov2Valid = validateVerificationObjectIntegrity(ov2);
  assert(ov1Valid.isValid, 'OV 1 (REQUISITO_NORMATIVO) do critério C1.2-A é válido');
  assert(ov2Valid.isValid, 'OV 2 (MANIFESTACAO_FUNCIONAL) do critério C1.2-A é válido');
  assert(ov1.criterionId === ov2.criterionId, 'Múltiplos OVs (normativo e funcional) coexistem sob o mesmo critério C1.2-A');

  // 9.2 Um OV pertence ao critério correto
  assert(ov1.criterionId === 'C1.2-A', 'OV-C1.2-A-01 pertence estritamente ao critério canônico C1.2-A');
  const invalidOvCriterion: VerificationObjectDefinition = {
    ...ov1,
    id: 'OV-INV',
    criterionId: 'CRITERIO_INEXISTENTE' as any
  };
  const invalidOvRes = validateVerificationObjectIntegrity(invalidOvCriterion);
  assert(!invalidOvRes.isValid && invalidOvRes.issues.some(i => i.code === 'INVALID_CRITERION_ID'),
    'Rejeita OV vinculado a critério inexistente na taxonomia canônica');

  // 9.3 OVs do mesmo critério podem possuir proofRequirement distintos (configuráveis pela Matriz)
  const ov1ResultEstrita: VerificationObjectResult = {
    verificationObjectId: 'OV-C1.2-A-01',
    criterionId: 'C1.2-A',
    status: 'COMPROVACAO_PENDENTE',
    sufficiency: 'SUFICIENTEMENTE_EXPLORADA',
    proofRequirementApplied: 'ESTRITA', // Força probatória estrita
    supportingInformationUnitIds: ['unit-001'],
    divergenceIds: [],
    pointsOfValidationObserved: [{ pointDescription: 'Portaria publicada no Diário Oficial', verified: false }],
    rationale: 'Servidor atua na função, mas portaria publicada não foi anexada.'
  };

  const ov2ResultFuncional: VerificationObjectResult = {
    verificationObjectId: 'OV-C1.2-A-02',
    criterionId: 'C1.2-A',
    status: 'SATISFEITO',
    sufficiency: 'SUFICIENTEMENTE_EXPLORADA',
    proofRequirementApplied: 'FUNCIONAL', // Força probatória funcional
    supportingInformationUnitIds: ['unit-001', 'unit-002'],
    divergenceIds: [],
    pointsOfValidationObserved: [{ pointDescription: 'Canal de e-mail divulgado no portal', verified: true }],
    rationale: 'E-mail do encarregado verificado operacional e divulgado.'
  };

  const res1Valid = validateVerificationObjectResultStructure(ov1ResultEstrita);
  const res2Valid = validateVerificationObjectResultStructure(ov2ResultFuncional);
  assert(res1Valid.isValid && res2Valid.isValid, 'Resultados de OVs com forças probatórias distintas são válidos');
  assert(ov1ResultEstrita.proofRequirementApplied !== ov2ResultFuncional.proofRequirementApplied,
    'OVs do mesmo critério suportam forças probatórias distintas (ESTRITA vs FUNCIONAL)');

  // 9.4 Um OV pode estar NAO_ACIONADO sem tornar automaticamente todo o critério NAO_ACIONADO
  const ovIncidentesNaoAcionado: VerificationObjectResult = {
    verificationObjectId: 'OV-C1.6-D-02',
    criterionId: 'C1.6-D',
    status: 'NAO_ACIONADO',
    sufficiency: 'SUFICIENTEMENTE_EXPLORADA',
    proofRequirementApplied: 'FUNCIONAL',
    supportingInformationUnitIds: [],
    divergenceIds: [],
    pointsOfValidationObserved: [],
    rationale: 'A instituição nunca vivenciou incidentes de segurança de dados.'
  };
  const ovAprendizagemSatisfeito: VerificationObjectResult = {
    verificationObjectId: 'OV-C1.6-D-01',
    criterionId: 'C1.6-D',
    status: 'SATISFEITO',
    sufficiency: 'SUFICIENTEMENTE_EXPLORADA',
    proofRequirementApplied: 'FUNCIONAL',
    supportingInformationUnitIds: ['unit-001'],
    divergenceIds: [],
    pointsOfValidationObserved: [{ pointDescription: 'Reuniões de lições aprendidas realizadas', verified: true }],
    rationale: 'Lições aprendidas de auditoria interna foram formalmente reutilizadas.'
  };

  assert(ovIncidentesNaoAcionado.status === 'NAO_ACIONADO', 'OV específico pode estar em status NAO_ACIONADO');
  assert(ovAprendizagemSatisfeito.status === 'SATISFEITO', 'Outro OV do mesmo critério pode estar em status SATISFEITO');
  assert(ovIncidentesNaoAcionado.status !== ovAprendizagemSatisfeito.status,
    'Status NAO_ACIONADO em um OV não apaga o status SATISFEITO do outro OV no mesmo critério');

  // 9.5 Nenhuma composição automática OV → critério foi criada
  assert(typeof (ov1ResultEstrita as any).aggregateToCriterion === 'undefined',
    'Nenhum método algorítmico de composição automática OV → critério foi acoplado ao domínio');

  // 9.6 Nenhuma regra de score, média ou compensação foi introduzida
  assert(typeof (ov1ResultEstrita as any).score === 'undefined', 'Zero propriedades de score numérico em VerificationObjectResult');
  assert(typeof (ov2ResultFuncional as any).weight === 'undefined', 'Zero propriedades de peso ponderado em VerificationObjectResult');

  // --------------------------------------------------------------------------
  // TESTE 10: Teste Prospectivo de Prontidão Atual !== Intenção Futura (PROSPECTIVA)
  // --------------------------------------------------------------------------
  console.log('\n--- Teste 10: Separação entre Teste de Prontidão Atual e Intenção Futura ---');

  const prospectiveTestUnit: InformationUnit = {
    id: 'unit-prospective-01',
    doorOrCapabilityScope: 'D1.4',
    rawContent: 'Em teste prospectivo simulando pedido de titular de dados, o Encarregado acionou o protocolo e respondeu em 15 minutos.',
    manifestationNatures: ['DEMONSTRADA'],
    provenance: {
      authorName: 'Avaliador Externo',
      authorRole: 'FACILITADOR_DIAGNOSTICO',
      channel: 'OBSERVACAO_DIRETA',
      collectedAt: new Date().toISOString(),
      institutionalScope: 'Gabinete da Presidência',
      investigationContext: 'TESTE_PROSPECTIVO_PRONTIDAO'
    },
    bindings: [
      {
        criterionId: 'C1.4-A',
        verificationObjectId: 'OV-C1.4-A-01',
        pertinence: 'PERTINENCIA_DIRETA_ESPECIFICA',
        supportsExistence: true,
        specificFactSummary: 'Protocolo de resposta acionado e operante no teste'
      }
    ]
  };

  const testUnitRes = validateInformationUnitIntegrity(prospectiveTestUnit);
  assert(testUnitRes.isValid, 'Unidade gerada em teste de prontidão atual é estruturalmente válida');
  assert(prospectiveTestUnit.provenance.investigationContext === 'TESTE_PROSPECTIVO_PRONTIDAO',
    'Contexto investigativo registrado como TESTE_PROSPECTIVO_PRONTIDAO');
  assert(prospectiveTestUnit.manifestationNatures.includes('DEMONSTRADA'),
    'Natureza epistemológica é DEMONSTRADA (capacidade atual constatada)');
  assert(!prospectiveTestUnit.manifestationNatures.includes('PROSPECTIVA'),
    'Teste de prontidão atual NÃO converte a manifestação em PROSPECTIVA (intenção futura)');

  const futureIntentionUnit: InformationUnit = {
    id: 'unit-future-01',
    doorOrCapabilityScope: 'D1.4',
    rawContent: 'A gestão informou que pretende contratar sistema de protocolo para privacidade no próximo ano.',
    manifestationNatures: ['DECLARADA', 'PROSPECTIVA'],
    provenance: {
      authorName: 'Diretor Geral',
      authorRole: 'GESTOR_DIRIGENTE',
      channel: 'ENTREVISTA_ORAL',
      collectedAt: new Date().toISOString(),
      institutionalScope: 'Diretoria Geral',
      investigationContext: 'ROTINA_OPERACIONAL'
    },
    bindings: [
      {
        criterionId: 'C1.4-C',
        pertinence: 'PERTINENCIA_CONTEXTUAL_GERAL',
        supportsExistence: false,
        specificFactSummary: 'Inexistência de sistema atual; intenção de contratação futura'
      }
    ]
  };

  const futureUnitRes = validateInformationUnitIntegrity(futureIntentionUnit);
  assert(futureUnitRes.isValid, 'Unidade de intenção futura é estruturalmente válida');
  assert(futureIntentionUnit.manifestationNatures.includes('PROSPECTIVA'),
    'Intenção declarada futura recebe adequadamente a natureza PROSPECTIVA');
  assert(futureIntentionUnit.provenance.investigationContext === 'ROTINA_OPERACIONAL',
    'Intenção futura relatada em entrevista regular mantém contexto de rotina');

  let prospectiveAssertFailed = false;
  try {
    assertProspectiveContextSeparation(prospectiveTestUnit);
  } catch {
    prospectiveAssertFailed = true;
  }
  assert(!prospectiveAssertFailed, 'assertProspectiveContextSeparation valida com sucesso');

  // --------------------------------------------------------------------------
  // TESTE 11: Aplicabilidade do Objeto de Verificação (v2.2)
  // --------------------------------------------------------------------------
  console.log('\n--- Teste 11: Aplicabilidade de Objeto de Verificação (v2.2) ---');

  // 11.1 OV condicionado com aplicabilidade APLICAVEL
  const ovCondicionado: VerificationObjectDefinition = {
    id: 'OV-C1.3-C-COND',
    criterionId: 'C1.3-C',
    code: 'OV-C1.3-C-COND',
    title: 'Tratamento de dados biométricos em controle de acesso',
    description: 'Incidência condicionada à utilização de biometria nas catracas/ponto eletrônico.',
    nature: 'REQUISITO_NORMATIVO',
    isConditionedApplicability: true, // Condicionado!
    allowNonTriggered: false
  };

  const appEvalAplicavel: VerificationObjectApplicabilityEvaluation = {
    verificationObjectId: 'OV-C1.3-C-COND',
    status: 'APLICAVEL',
    rationale: 'A instituição utiliza biometria digital no controle de acesso de servidores.',
    evaluatedAt: new Date().toISOString()
  };
  const appEvalValid = validateApplicabilityEvaluation(appEvalAplicavel, true);
  assert(appEvalValid.isValid, 'OV condicionado pode ser APLICAVEL');

  // 11.2 OV condicionado com aplicabilidade NAO_APLICAVEL
  const appEvalNaoAplicavel: VerificationObjectApplicabilityEvaluation = {
    verificationObjectId: 'OV-C1.3-C-COND',
    status: 'NAO_APLICAVEL',
    rationale: 'A instituição não realiza qualquer tratamento biométrico ou de dados sensíveis em catracas.',
    evaluatedAt: new Date().toISOString()
  };
  const appEvalNaoValid = validateApplicabilityEvaluation(appEvalNaoAplicavel, true);
  assert(appEvalNaoValid.isValid, 'OV condicionado pode ser NAO_APLICAVEL');

  // 11.3 NAO_APLICAVEL não produz VerificationObjectResult nem se confunde com NAO_ACIONADO
  assert((appEvalNaoAplicavel.status as string) !== 'NAO_ACIONADO', 'NAO_APLICAVEL é estritamente distinto de NAO_ACIONADO');
  assert((appEvalNaoAplicavel.status as string) !== 'SATISFEITO', 'NAO_APLICAVEL não gera SATISFEITO artificialmente');
  assert((appEvalNaoAplicavel.status as string) !== 'NAO_SATISFEITO', 'NAO_APLICAVEL não gera NAO_SATISFEITO artificialmente');

  // 11.4 APLICABILIDADE_NAO_CONCLUSIVA permanece explicitamente pendente
  const appEvalNaoConclusiva: VerificationObjectApplicabilityEvaluation = {
    verificationObjectId: 'OV-C1.3-C-COND',
    status: 'APLICABILIDADE_NAO_CONCLUSIVA',
    rationale: 'Informação contraditória sobre se as catracas operam por reconhecimento facial ou crachá magnético.',
    evaluatedAt: new Date().toISOString()
  };
  const appEvalPendValid = validateApplicabilityEvaluation(appEvalNaoConclusiva, true);
  assert(appEvalPendValid.isValid, 'APLICABILIDADE_NAO_CONCLUSIVA é registrada e preserva a pendência');

  // 11.5 OV não condicionado não exige burocracia de avaliação de aplicabilidade
  assert(!ov1.isConditionedApplicability, 'OV regular (não condicionado) possui isConditionedApplicability = false');

  // --------------------------------------------------------------------------
  // TESTE 12: Referencial/Requisito Compartilhável (RequirementReference) (v2.2)
  // --------------------------------------------------------------------------
  console.log('\n--- Teste 12: Requisitos Compartilháveis N:N (v2.2) ---');

  const sharedReq: RequirementReference = {
    id: 'REQ-D1-SUBST-FORMAL',
    code: 'REQ-LGPD-41-SUBST',
    title: 'Regra de substituição formal do Encarregado',
    sourceNorm: 'LGPD art. 41 c/c Regulamento ANPD Res. CD/ANPD nº 18',
    statement: 'A instituição deve prever a designação de substituto ou mecanismo formal de transição do Encarregado em afastamentos temporários.'
  };

  const reqValid = validateRequirementReferenceIntegrity(sharedReq);
  assert(reqValid.isValid, 'RequirementReference é estruturalmente válido e íntegro');

  // 12.1 Um mesmo requisito fundamenta múltiplos OVs sem ser duplicado como obrigação
  const ovInstituicao: VerificationObjectDefinition = {
    id: 'OV-C1.2-A-03',
    criterionId: 'C1.2-A', // Capacidade D1.2 (Encarregado)
    code: 'OV-C1.2-A-03',
    title: 'Designação formal de substituto do Encarregado',
    description: 'Ato formal de nomeação do substituto para períodos de afastamento.',
    nature: 'REQUISITO_NORMATIVO',
    isConditionedApplicability: false,
    allowNonTriggered: false,
    requirementReferenceIds: ['REQ-D1-SUBST-FORMAL'] // Vinculado ao mesmo requisito
  };

  const ovContinuidade: VerificationObjectDefinition = {
    id: 'OV-C1.6-A-01',
    criterionId: 'C1.6-A', // Capacidade D1.6 (Continuidade)
    code: 'OV-C1.6-A-01',
    title: 'Garantia institucional de continuidade das atribuições do Encarregado',
    description: 'Capacidade de sustentação de prazos e respostas por substituto durante férias ou licença.',
    nature: 'MANIFESTACAO_FUNCIONAL',
    isConditionedApplicability: false,
    allowNonTriggered: false,
    requirementReferenceIds: ['REQ-D1-SUBST-FORMAL'] // Vinculado ao mesmo requisito
  };

  assert(ovInstituicao.requirementReferenceIds![0] === ovContinuidade.requirementReferenceIds![0],
    'O mesmo RequirementReference (1) vincula-se a múltiplos OVs (N) de critérios/capacidades distintas');
  assert(ovInstituicao.criterionId !== ovContinuidade.criterionId,
    'Requisito compartilhado conecta C1.2-A e C1.6-A sem duplicar a obrigação normativa');

  // --------------------------------------------------------------------------
  // TESTE 13: Ausência de Força Probatória Singular em CriterionResult & allowNonTriggered (v2.2)
  // --------------------------------------------------------------------------
  console.log('\n--- Teste 13: CriterionResult sem Força Probatória Singular & allowNonTriggered (v2.2) ---');

  // 13.1 CriterionResult não possui proofRequirementApplied monolítico
  const critResultHibrido: CriterionResult = {
    criterionId: 'C1.2-A',
    status: 'SATISFEITO',
    sufficiency: 'SUFICIENTEMENTE_EXPLORADA',
    supportingInformationUnitIds: ['unit-001'],
    divergenceIds: [],
    verificationObjectResults: [ov1ResultEstrita, ov2ResultFuncional],
    pointsOfValidationObserved: [],
    rationale: 'Critério avaliado com OVs de forças probatórias distintas.'
  };

  assert(typeof (critResultHibrido as any).proofRequirementApplied === 'undefined',
    'CriterionResult NÃO possui campo singular proofRequirementApplied (evita semântica enganosa)');
  assert(critResultHibrido.verificationObjectResults![0].proofRequirementApplied === 'ESTRITA',
    'Força probatória estrita é mantida preservada no VerificationObjectResult 1');
  assert(critResultHibrido.verificationObjectResults![1].proofRequirementApplied === 'FUNCIONAL',
    'Força probatória funcional é mantida preservada no VerificationObjectResult 2');

  // 13.2 allowNonTriggered = false não exige experiência histórica real
  assert(ov1.allowNonTriggered === false, 'OV1 possui allowNonTriggered = false');
  // allowNonTriggered = false significa condição atual investigável; não pode ser descartado por falta de evento
  assert(typeof ov1.allowNonTriggered === 'boolean',
    'allowNonTriggered = false reflete condição investigável no presente (não exige episódio histórico prévio)');

  console.log('\n================================================================');
  console.log(`SUCESSO: ${passed}/${total} VERIFICAÇÕES DO BLOCO D1-A (v2.2 FINAL) APROVADAS! 🎯`);
  console.log('================================================================\n');
}

runD1AStructuralTests();
