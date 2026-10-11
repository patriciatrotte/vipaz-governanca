/**
 * VIPAZ — Minha Rota
 * Camada de Persistência Central — Adaptadores Canônicos de Domínio (Bloco 1)
 *
 * Módulo de conversão puro e desacoplado:
 * Schema Físico Supabase (snake_case / normalizado) <-> Modelo Operacional de Domínio VIPAZ (camelCase)
 *
 * Tabelas físicas atendidas:
 * 1. organizations
 * 2. governance_cycles
 * 3. question_instances
 * 4. responses
 * 5. information_units
 * 6. additional_questions (reconstrução de probings, pedagogicalInterventions, distributedRequests)
 * 7. evidences
 * 8. pending_items
 */

import {
  Organization,
  EvaluationCycle,
  QuestionInstance,
  OriginalResponse,
  InformationUnit,
  ProbingRecord,
  PedagogicalIntervention,
  DistributedRequest,
  EvidenceRecord,
  PendingItem,
  DoorId,
  DoorStatus,
  InfoScope,
  CapacityId,
  PendingType,
  PendingImpact,
  PendingStatus,
  EvidenceStatus
} from '../../types';

// ==========================================
// Utilitários de Normalização e Sanitização
// ==========================================

export const normalizeDoorId = (val: any): DoorId => {
  const s = String(val || '').trim().toUpperCase();
  if (['D1.1', 'D1.2', 'D1.3', 'D1.4', 'D1.5', 'D1.6'].includes(s)) {
    return s as DoorId;
  }
  return 'D1.1';
};

export const normalizeValidationStatus = (val: any): 'VALIDADO' | 'EM_ANALISE' | 'AJUSTADO' | 'REJEITADO' => {
  const s = String(val || '').trim().toUpperCase();
  if (s === 'VALIDADO' || s === 'VALIDADA') return 'VALIDADO';
  if (s === 'AJUSTADO' || s === 'AJUSTADA') return 'AJUSTADO';
  if (s === 'REJEITADO' || s === 'REJEITADA') return 'REJEITADO';
  return 'EM_ANALISE';
};

export const normalizeInfoScope = (val: any): InfoScope => {
  const s = String(val || '').trim().toUpperCase();
  if (['ACAO_PROPRIA', 'CONHECIMENTO_DIRETO', 'PERCEPCAO_SOBRE_TERCEIRO', 'FORA_DA_VISIBILIDADE_DESCONHECIDO'].includes(s)) {
    return s as InfoScope;
  }
  return 'CONHECIMENTO_DIRETO';
};

export const normalizeDoorStatus = (val: any): DoorStatus => {
  const s = String(val || '').trim().toUpperCase();
  if (s === 'CONCLUIDA' || s === 'SUFICIENTE' || s === 'SUFICIENTEMENTE_EXPLORADA') {
    return 'SUFICIENTEMENTE_EXPLORADA';
  }
  if (s === 'COMPROVACAO_PENDENTE' || s === 'SUFICIENTEMENTE_EXPLORADA_COMPROVACAO_PENDENTE') {
    return 'SUFICIENTEMENTE_EXPLORADA_COMPROVACAO_PENDENTE';
  }
  if (s === 'REQUER_OUTRA_FONTE') return 'REQUER_OUTRA_FONTE';
  if (s === 'REQUER_APROFUNDAMENTO') return 'REQUER_APROFUNDAMENTO';
  if (s === 'NAO_APROFUNDADA_POR_PROPORCIONALIDADE') return 'NAO_APROFUNDADA_POR_PROPORCIONALIDADE';
  if (s === 'EM_ANDAMENTO' || s === 'EM_DESCOBERTA') return 'EM_DESCOBERTA';
  return 'NAO_INICIADA';
};

/**
 * Constrói os cabeçalhos de autenticação para a API REST do Supabase.
 * - apikey: recebe a credencial configurada (seja moderna sb_secret_ ou JWT legado).
 * - Authorization: Bearer: anexado ESTRITAMENTE quando a chave for um JWT legado (inicia com eyJ).
 * Chaves modernas (sb_secret_...) NUNCA recebem Authorization: Bearer.
 */
export const buildSupabaseHeaders = (key: string): Record<string, string> => {
  const headers: Record<string, string> = {
    apikey: key,
    'Content-Type': 'application/json'
  };

  if (key && (key.startsWith('eyJ') || key.startsWith('eyj'))) {
    headers.Authorization = `Bearer ${key}`;
  }

  return headers;
};

// ==========================================
// 1. Adaptador de InformationUnit
// ==========================================

export const mapInformationUnitRowToDomain = (row: any): InformationUnit => {
  const metadata = typeof row.metadata === 'object' && row.metadata !== null ? row.metadata : {};
  return {
    id: String(row.id || ''),
    responseId: String(row.response_id || row.responseId || ''),
    doorId: normalizeDoorId(row.door_id || row.question_code || row.doorId),
    statement: String(row.statement || '').trim(),
    sourceName: String(row.source_name || row.sourceName || row.respondent_name || 'Respondente Principal').trim(),
    sourceRole: String(row.source_role || row.sourceRole || row.respondent_role || 'Participante').trim(),
    scope: normalizeInfoScope(row.scope || row.suggested_scope || row.suggestedScope),
    extractedBy: (row.extracted_by === 'IA_SUGESTAO' || row.extractedBy === 'IA_SUGESTAO') ? 'IA_SUGESTAO' : 'FACILITADOR',
    validationStatus: normalizeValidationStatus(row.validation_status || row.validationStatus),
    relatedCapacity: (row.capacity_code || row.related_capacity || row.relatedCapacity || undefined) as CapacityId | undefined,
    mentionedActors: Array.isArray(row.mentioned_actors) 
      ? row.mentioned_actors 
      : (Array.isArray(metadata.mentionedActors) ? metadata.mentionedActors : []),
    mentionedEvidenceTitles: Array.isArray(row.mentioned_evidence_titles) 
      ? row.mentioned_evidence_titles 
      : (Array.isArray(metadata.mentionedEvidenceTitles) ? metadata.mentionedEvidenceTitles : []),
    timestamp: String(row.created_at || row.timestamp || new Date().toISOString()),
    cycleId: row.cycle_id ? String(row.cycle_id) : undefined,
    organizationId: row.organization_id ? String(row.organization_id) : undefined,
    registeredBy: row.registered_by ? String(row.registered_by) : undefined,
    humanEdited: Boolean(row.human_edited ?? metadata.humanEdited)
  };
};

// ==========================================
// 2. Adaptador de OriginalResponse (responses)
// ==========================================

export const mapResponseRowToDomain = (row: any): OriginalResponse => {
  const metadata = typeof row.metadata === 'object' && row.metadata !== null ? row.metadata : {};
  const isRetification = Boolean(row.is_retification || row.isRetificationOfResponseId || metadata.isRetification);
  const isComplement = Boolean(row.is_complement || row.isComplementOfResponseId || metadata.isComplement);
  const parentId = row.parent_response_id || row.parentResponseId || metadata.parentResponseId;

  return {
    id: String(row.id || ''),
    questionInstanceId: String(row.question_instance_id || row.questionInstanceId || row.door_id || row.question_code || ''),
    doorId: normalizeDoorId(row.door_id || row.question_code || row.doorId),
    respondentId: String(row.respondent_id || row.respondentId || row.participant_id || 'respondent-01'),
    respondentName: String(row.respondent_name || row.respondentName || 'Respondente Principal').trim(),
    respondentRole: String(row.respondent_role || row.respondentRole || 'Participante Designado').trim(),
    originalText: String(row.original_text || row.response_text || row.text || row.originalText || '').trim(),
    timestamp: String(row.created_at || row.timestamp || new Date().toISOString()),
    modality: (row.modality === 'ORAL_GRAVADA' || row.modality === 'TEXTO_DIRETO') 
      ? row.modality 
      : 'SESSAO_CONDUZIDA',
    isRetificationOfResponseId: isRetification ? String(parentId || '') : undefined,
    isComplementOfResponseId: isComplement ? String(parentId || '') : undefined
  };
};

// ==========================================
// 3. Adaptador de AdditionalQuestions
// (Reconstrói probings, pedagogicalInterventions e distributedRequests)
// ==========================================

export type ReconstructedAdditionalQuestions = {
  probings: ProbingRecord[];
  pedagogicalInterventions: PedagogicalIntervention[];
  distributedRequests: DistributedRequest[];
};

export const mapAdditionalQuestionsToDomain = (rows: any[]): ReconstructedAdditionalQuestions => {
  const probings: ProbingRecord[] = [];
  const pedagogicalInterventions: PedagogicalIntervention[] = [];
  const distributedRequests: DistributedRequest[] = [];

  for (const row of rows) {
    const metadata = typeof row.metadata === 'object' && row.metadata !== null ? row.metadata : {};
    const category = String(row.category || row.type || row.question_type || metadata.category || '').toUpperCase();
    const doorId = normalizeDoorId(row.door_id || row.question_code || row.doorId);

    // Identificação de Intervenção Pedagógica
    if (category === 'PEDAGOGICAL' || category === 'PEDAGOGICA' || row.concept || metadata.concept) {
      pedagogicalInterventions.push({
        id: String(row.id || ''),
        doorId,
        concept: String(row.concept || metadata.concept || 'Conceito Metodológico'),
        reason: String(row.reason || metadata.reason || 'Nivelamento conceitual neutro'),
        contentPresented: String(row.content_presented || metadata.contentPresented || row.question_text || ''),
        concreteExample: String(row.concrete_example || metadata.concreteExample || ''),
        followUpQuestion: String(row.follow_up_question || metadata.followUpQuestion || ''),
        previousResponseText: row.previous_response_text || metadata.previousResponseText,
        subsequentResponseText: row.subsequent_response_text || metadata.subsequentResponseText || row.response_text,
        timestamp: String(row.created_at || row.timestamp || new Date().toISOString())
      });
      continue;
    }

    // Identificação de Investigação Distribuída
    if (category === 'DISTRIBUTED' || category === 'DISTRIBUIDA' || row.target_person_name || metadata.targetPersonName) {
      distributedRequests.push({
        id: String(row.id || ''),
        doorId,
        targetPersonName: String(row.target_person_name || metadata.targetPersonName || 'Colaborador da Câmara'),
        targetDepartment: String(row.target_department || metadata.targetDepartment || 'Setor Interno'),
        reasonType: (row.reason_type || metadata.reasonType || 'COMPLEMENTACAO') as 'VALIDACAO' | 'COMPLEMENTACAO' | 'DIVERGENCIA',
        minimalNeutralQuestion: String(row.minimal_neutral_question || row.question_text || metadata.minimalNeutralQuestion || ''),
        contextGiven: String(row.context_given || metadata.contextGiven || ''),
        status: (row.status || 'SOLICITADA') as 'SOLICITADA' | 'RESPONDIDA' | 'CANCELADA',
        submittedResponse: row.submitted_response || metadata.submittedResponse,
        createdAt: String(row.created_at || row.timestamp || new Date().toISOString())
      });
      continue;
    }

    // Padrão: Sondagem Adaptativa (Probing)
    probings.push({
      id: String(row.id || ''),
      doorId,
      origin: (row.origin || metadata.origin || 'FACILITADOR_ADAPTADA') as 'IA_SUGERIDA' | 'FACILITADOR_ADAPTADA' | 'FACILITADOR_CRIADA',
      reason: String(row.reason || metadata.reason || 'Aprofundamento fático neutro'),
      suggestedQuestionText: row.suggested_question_text || metadata.suggestedQuestionText,
      questionEffectivelyAsked: String(row.question_effectively_asked || row.question_text || metadata.questionEffectivelyAsked || ''),
      responseText: row.response_text || metadata.responseText,
      relatedCriterionOrCapacity: row.related_criterion_or_capacity || metadata.relatedCriterionOrCapacity,
      timestamp: String(row.created_at || row.timestamp || new Date().toISOString())
    });
  }

  return { probings, pedagogicalInterventions, distributedRequests };
};

// ==========================================
// 4. Adaptador de QuestionInstances e DoorStatuses
// ==========================================

export const mapQuestionInstancesToDomain = (rows: any[]): {
  questionInstances: QuestionInstance[];
  doorStatuses: Record<DoorId, DoorStatus>;
} => {
  const questionInstances: QuestionInstance[] = [];
  const doorStatuses: Record<DoorId, DoorStatus> = {
    'D1.1': 'NAO_INICIADA',
    'D1.2': 'NAO_INICIADA',
    'D1.3': 'NAO_INICIADA',
    'D1.4': 'NAO_INICIADA',
    'D1.5': 'NAO_INICIADA',
    'D1.6': 'NAO_INICIADA'
  };

  for (const row of rows) {
    const doorId = normalizeDoorId(row.door_id || row.question_code || row.doorId);
    questionInstances.push({
      id: String(row.id || ''),
      doorId,
      text: String(row.text || row.question_text || ''),
      respondentName: String(row.respondent_name || 'Respondente Principal'),
      respondentRole: String(row.respondent_role || 'Participante'),
      sessionId: String(row.session_id || row.sessionId || ''),
      timestamp: String(row.created_at || row.timestamp || new Date().toISOString()),
      modality: (row.modality || 'ENTREVISTA') as 'ENTREVISTA' | 'FORMULARIO_DIRIGIDO' | 'COMPLEMENTACAO',
      contextNote: row.context_note || row.notes
    });

    if (row.status) {
      doorStatuses[doorId] = normalizeDoorStatus(row.status);
    }
  }

  return { questionInstances, doorStatuses };
};

// ==========================================
// 5. Adaptador de Evidences
// ==========================================

export const mapEvidenceRowToDomain = (row: any): EvidenceRecord => {
  const metadata = typeof row.metadata === 'object' && row.metadata !== null ? row.metadata : {};
  return {
    id: String(row.id || ''),
    title: String(row.title || 'Evidência Institucional').trim(),
    type: (row.type || 'OUTRO') as any,
    origin: String(row.origin || 'Câmara Municipal').trim(),
    indicatedBy: String(row.indicated_by || row.indicatedBy || 'Respondente').trim(),
    date: String(row.date || row.created_at || new Date().toISOString()),
    status: (row.status || 'INDICADA') as EvidenceStatus,
    verifierName: row.verifier_name || row.verifierName,
    verifiedAt: row.verified_at || row.verifiedAt,
    sufficiencyNotes: String(row.sufficiency_notes || row.sufficiencyNotes || ''),
    limitations: String(row.limitations || ''),
    relatedCapacities: Array.isArray(row.related_capacities) 
      ? row.related_capacities 
      : (Array.isArray(metadata.relatedCapacities) ? metadata.relatedCapacities : []),
    sensitivity: (row.sensitivity || 'INTERNA_RESTRITA') as any,
    aiUsageRule: (row.ai_usage_rule || row.aiUsageRule || 'AUTORIZADO_RESUMO') as any,
    fileAttachmentName: row.file_attachment_name || row.fileAttachmentName
  };
};

// ==========================================
// 6. Adaptador de PendingItems
// ==========================================

export const mapPendingItemRowToDomain = (row: any): PendingItem => {
  return {
    id: String(row.id || ''),
    doorId: normalizeDoorId(row.door_id || row.question_code || row.doorId),
    title: String(row.title || 'Pendência').trim(),
    description: String(row.description || '').trim(),
    type: (row.type || 'INFORMACAO') as PendingType,
    impact: (row.impact || 'RELEVANTE_NAO_BLOQUEANTE') as PendingImpact,
    status: (row.status || 'ABERTA') as PendingStatus,
    responsible: String(row.responsible || 'Equipe Metodológica').trim(),
    createdAt: String(row.created_at || row.createdAt || new Date().toISOString()),
    resolvedAt: row.resolved_at || row.resolvedAt,
    resolutionNotes: row.resolution_notes || row.resolutionNotes
  };
};

// ==========================================
// 7. Adaptadores de Organizations e Cycles
// ==========================================

export const mapOrganizationRowToDomain = (row: any): Organization => {
  return {
    id: String(row.id || row.legacy_id || ''),
    legacyId: row.legacy_id ? String(row.legacy_id) : undefined,
    name: String(row.name || 'Câmara Municipal'),
    type: row.organization_type || 'CAMARA_MUNICIPAL',
    vertical: row.vertical || 'Poder Público Municipal — Câmara Municipal',
    municipality: row.municipality || 'Município não informado',
    state: row.state || 'UF',
    cycleId: '',
    activeCycleName: '',
    methodologyVersion: 'D1 v1.0',
    createdAt: String(row.created_at || new Date().toISOString()),
    isDemo: Boolean(row.is_demo),
    cycleIds: [],
    mainInterlocutorName: row.main_interlocutor_name || undefined,
    mainInterlocutorRole: row.main_interlocutor_role || undefined,
    mainInterlocutorEmail: row.main_interlocutor_email || undefined
  };
};

export const mapCycleRowToDomain = (row: any): EvaluationCycle => {
  // CANONICAL: row.id é o UUID autoritativo (ex: Maraú 75f19c1a-5133-4beb-a3c5-d4b94ad090c9)
  const canonicalId = String(row.id || row.legacy_id || '');
  return {
    id: canonicalId,
    legacyId: row.legacy_id ? String(row.legacy_id) : undefined,
    organizationId: String(row.organization_id || row.organizations?.id || row.organizations?.legacy_id || ''),
    dimension: (row.dimension || 'D1') as 'D1',
    methodologyVersion: row.methodology_version || 'D1 v1.0',
    name: String(row.name || 'Ciclo D1 Inicial'),
    cycleType: (row.cycle_type || 'INITIAL_ASSESSMENT') as any,
    status: (row.status || 'NAO_INICIADO') as any,
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || row.created_at || new Date().toISOString()),
    interviewCompletedAt: row.interview_completed_at ? String(row.interview_completed_at) : undefined,
    isDemo: Boolean(row.is_demo)
  };
};

// ==========================================
// 8. Adaptador Composto de Pacote do Ciclo (Cycle Bundle)
// ==========================================

export interface RawCycleBundle {
  cycleId: string;
  questionInstances?: any[];
  responses?: any[];
  informationUnits?: any[];
  additionalQuestions?: any[];
  evidences?: any[];
  pendingItems?: any[];
}

export interface RehydratedInvestigationState {
  doorStatuses: Record<DoorId, DoorStatus>;
  questionInstances: QuestionInstance[];
  originalResponses: OriginalResponse[];
  informationUnits: InformationUnit[];
  probings: ProbingRecord[];
  pedagogicalInterventions: PedagogicalIntervention[];
  distributedRequests: DistributedRequest[];
  evidences: EvidenceRecord[];
  pendingItems: PendingItem[];
}

export const adaptCycleBundleToDomain = (raw: RawCycleBundle): RehydratedInvestigationState => {
  const { questionInstances, doorStatuses } = mapQuestionInstancesToDomain(raw.questionInstances || []);
  const originalResponses = (raw.responses || []).map(mapResponseRowToDomain);
  const informationUnits = (raw.informationUnits || []).map(mapInformationUnitRowToDomain);
  const { probings, pedagogicalInterventions, distributedRequests } = mapAdditionalQuestionsToDomain(raw.additionalQuestions || []);
  const evidences = (raw.evidences || []).map(mapEvidenceRowToDomain);
  const pendingItems = (raw.pendingItems || []).map(mapPendingItemRowToDomain);

  // Derivação de status das portas se question_instances não forneceu status explícito:
  // Se houver responses ou informationUnits para uma porta, garante ao menos 'EM_ANDAMENTO'
  for (const door of ['D1.1', 'D1.2', 'D1.3', 'D1.4', 'D1.5', 'D1.6'] as DoorId[]) {
    if (doorStatuses[door] === 'NAO_INICIADA') {
      const hasResponses = originalResponses.some(r => r.doorId === door);
      const hasUnits = informationUnits.some(u => u.doorId === door);
      if (hasResponses || hasUnits) {
        doorStatuses[door] = 'EM_DESCOBERTA';
      }
    }
  }

  return {
    doorStatuses,
    questionInstances,
    originalResponses,
    informationUnits,
    probings,
    pedagogicalInterventions,
    distributedRequests,
    evidences,
    pendingItems
  };
};
