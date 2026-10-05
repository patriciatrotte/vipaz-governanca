import { loadHistoricalPilot } from '../utils/historicalHydration';
import React, { useEffect, useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { DOORS_DEFINITIONS, PEDAGOGICAL_CONCEPTS } from '../data/methodologyConstants';
import { 
  DoorId, 
  DoorStatus, 
  DontKnowReason, 
  InfoScope 
} from '../types';
import { 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  Send, 
  UserCheck, 
  Clock, 
  FileText, 
  AlertTriangle, 
  GitPullRequest, 
  CheckCircle, 
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Plus,
  Lightbulb,
  Volume2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DoorStatusBadge } from './MethodologyBadges';
import { LocalSaveIndicator } from './LocalSaveIndicator';

type HistoricalStructuredUnit = { id:string; doorId:DoorId; statement:string; responseId?:string; validationStatus?:string };
const HistoricalStructuredReadOnly: React.FC<{doorId:DoorId; units:HistoricalStructuredUnit[]}> = ({doorId, units}) => {
  if (!units.length || !['D1.1','D1.2','D1.5'].includes(doorId)) return null;
  const clean=(s:string)=>String(s||'').replace('[VALIDACAO_ESTRUTURADA] ','');
  return <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
    <div><h3 className="text-sm font-bold text-slate-900">Marcações registradas no piloto</h3><p className="text-xs text-slate-500 mt-1">Registro histórico preservado. Estas marcações não podem ser alteradas neste bloco.</p></div>
    <div className="space-y-2">{units.map(u=><div key={u.id} className="flex items-start gap-2 text-xs text-slate-700"><Lock size={13} className="mt-0.5 shrink-0"/><span>{clean(u.statement)}</span></div>)}</div>
  </div>;
};

export const DoorInvestigationView: React.FC = () => {
  const {
    activeDoorId,
    setActiveDoorId,
    doorStatuses,
    updateDoorStatus,
    originalResponses,
    informationUnits,
    addInformationUnit,
    addOriginalResponse,
    addRetificationResponse,
    addComplementResponse,
    recordDontKnow,
    dontKnowRecords,
    probings,
    addProbingRecord,
    pedagogicalInterventions,
    addPedagogicalIntervention,
    createDistributedRequest,
    evidences,
    addEvidence,
    currentUser,
    currentOrg,
    setCurrentView,
    setActiveResponseId,
    completeInterview,
    currentCycle
  } = usePilot();

  const isFacilitator = currentUser.role === 'FACILITADOR';

  const activeDoor = DOORS_DEFINITIONS.find(d => d.id === activeDoorId) || DOORS_DEFINITIONS[0];
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);

  const handleSpeakQuestion = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeakingQuestion) {
      setIsSpeakingQuestion(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(activeDoor.essentialQuestion);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);
    setIsSpeakingQuestion(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
    }
  }, [activeDoorId]);

  const currentDoorStatus = doorStatuses[activeDoorId];

  // Ordem sequencial das 6 perguntas de entrada D1
  const doorOrder: DoorId[] = ['D1.1', 'D1.2', 'D1.3', 'D1.4', 'D1.5', 'D1.6'];
  const currentDoorIndex = doorOrder.indexOf(activeDoorId);
  const isLastDoor = currentDoorIndex === doorOrder.length - 1;
  const nextDoorId = !isLastDoor ? doorOrder[currentDoorIndex + 1] : null;

  // Estados locais para inputs
  const [inputText, setInputText] = useState('');
  const [retifyingResponseId, setRetifyingResponseId] = useState<string | null>(null);
  const [complementingResponseId, setComplementingResponseId] = useState<string | null>(null);

  // Apoio contextual e visualização metodológica (Ajustes 2 e 8)
  const [showContextualHelp, setShowContextualHelp] = useState(false);
  const [showMethodologyLenses, setShowMethodologyLenses] = useState(false);
  const [showAdvancedStatuses, setShowAdvancedStatuses] = useState(false);

  // Modal de fechamento operacional pós D1.6 (Ajuste 6)
  const [showReviewAndFinishModal, setShowReviewAndFinishModal] = useState(false);

  // Feedback estruturado essencial (Ajuste 9)
  const [actionFeedback, setActionFeedback] = useState<{
    message: string;
    location: string;
    nextStep: string;
  } | null>(null);

  // Modais de ferramentas da entrevista
  const [showDontKnowModal, setShowDontKnowModal] = useState(false);
  const [dontKnowReason, setDontKnowReason] = useState<DontKnowReason>('FORA_DA_VISIBILIDADE');
  const [dontKnowJustification, setDontKnowJustification] = useState('');
  const [dontKnowAction, setDontKnowAction] = useState<'EXPLICACAO_PEDAGOGICA' | 'BUSCA_INTERNA' | 'CONVITE_OUTRA_FONTE' | 'REGISTRO_PENDENCIA'>('CONVITE_OUTRA_FONTE');

  const [showPedagogicalModal, setShowPedagogicalModal] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState(PEDAGOGICAL_CONCEPTS[0]);

  const [showProbingModal, setShowProbingModal] = useState(false);
  const [probingQuestion, setProbingQuestion] = useState('');
  const [probingResponse, setProbingResponse] = useState('');

  const [showDistributedModal, setShowDistributedModal] = useState(false);
  const [distTargetName, setDistTargetName] = useState('');
  const [distDepartment, setDistDepartment] = useState('');
  const [distNeutralQuestion, setDistNeutralQuestion] = useState('');
  const [distContext, setDistContext] = useState('Mapeamento diagnóstico de processos no âmbito do Piloto de Governança de Privacidade.');

  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceType, setEvidenceType] = useState<'PORTARIA' | 'CONTRATO' | 'FLUXOGRAMA' | 'RELATORIO' | 'EMAIL' | 'SISTEMA_TICKET' | 'ATA_REUNIAO' | 'OUTRO'>('PORTARIA');
  const [evidenceOrigin, setEvidenceOrigin] = useState('');

  type ActorParticipation =
    | 'PARTICIPA_QUANDO_NECESSARIO'
    | 'IDENTIFICADO_AINDA_NAO_NECESSARIO'
    | 'NECESSARIO_MAS_NAO_ESTAVA_CLARO'
    | 'ATENDIDA_DE_OUTRA_FORMA'
    | 'NAO_SE_APLICA'
    | 'NAO_SEI';

  type ResponsibilityBasis =
    | 'DOCUMENTO_OU_ATO'
    | 'ATRIBUICAO_FUNCAO_AREA'
    | 'PRATICA_INSTITUCIONAL_CONHECIDA'
    | 'SEM_DEFINICAO_CLARA'
    | 'NAO_SEI';

  interface GovernanceActorDraft {
    id: string;
    actor: string;
    exercisedBy: string;
    whenParticipates: string;
    whatDoes: string;
    participation: ActorParticipation | '';
    responsibilityBasis: ResponsibilityBasis | '';
  }

  const [governanceActors, setGovernanceActors] = useState<GovernanceActorDraft[]>([]);
  const [newActorName, setNewActorName] = useState('');

  const addGovernanceActor = (actor: string) => {
    const normalized = actor.trim();
    if (!normalized || governanceActors.some(item => item.actor.toLowerCase() === normalized.toLowerCase())) return;
    setGovernanceActors(prev => [...prev, {
      id: `actor-${Date.now()}-${prev.length}`,
      actor: normalized,
      exercisedBy: '',
      whenParticipates: '',
      whatDoes: '',
      participation: '',
      responsibilityBasis: ''
    }]);
    setNewActorName('');
  };

  const updateGovernanceActor = (id: string, patch: Partial<GovernanceActorDraft>) => {
    setGovernanceActors(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
  };

  const removeGovernanceActor = (id: string) => {
    setGovernanceActors(prev => prev.filter(item => item.id !== id));
  };


  type StructuredItem = { id: string; label: string };
  const C1_ITEMS: StructuredItem[] = [
    { id: 'identificar', label: 'Identifica o que precisa ser feito diante de uma questão de proteção de dados' },
    { id: 'orientar', label: 'Presta esclarecimentos e orienta pessoas ou áreas' },
    { id: 'articular', label: 'Identifica e aciona quem precisa participar' },
    { id: 'titulares', label: 'Conduz demandas relacionadas aos direitos dos titulares e demais assuntos recebidos como Encarregado' },
    { id: 'anpd', label: 'Sabe como proceder diante de comunicação ou demanda da ANPD' },
    { id: 'incidente', label: 'Orienta a organização diante de incidente envolvendo dados pessoais' },
    { id: 'riscos', label: 'Contribui para análise de riscos e orienta medidas de proteção' },
    { id: 'novos_tratamentos', label: 'Orienta questões relacionadas a processos, projetos, sistemas, contratos ou novos tratamentos' },
    { id: 'propor', label: 'Propõe providências ou melhorias quando identifica necessidade' },
    { id: 'escalonar', label: 'Reconhece quando algo ultrapassa sua governabilidade e encaminha à instância competente' }
  ];
  const C2_ITEMS: StructuredItem[] = [
    { id: 'fluido', label: 'O encaminhamento é compreendido e tratado sem necessidade de insistência' },
    { id: 'orientacao', label: 'É necessário explicar ou orientar para que a providência avance' },
    { id: 'cobranca', label: 'É necessário acompanhar ou cobrar para que avance' },
    { id: 'demora', label: 'Há demora ou situações que ficam paradas até nova provocação' },
    { id: 'urgencia', label: 'Algumas providências acontecem principalmente quando a situação se torna urgente' },
    { id: 'variacao', label: 'O funcionamento varia conforme a pessoa, área ou situação' },
    { id: 'caminho_conhecido', label: 'Os caminhos necessários são conhecidos' },
    { id: 'caminho_parcial', label: 'Algumas situações têm caminho conhecido e outras precisam ser descobertas' },
    { id: 'caminho_descobrir', label: 'Frequentemente é necessário descobrir como ou por quem a questão deve ser tratada' },
    { id: 'sem_experiencia', label: 'Ainda não houve experiência suficiente para avaliar' }
  ];
  const C5_ITEMS: StructuredItem[] = [
    { id: 'normas', label: 'Mudanças na legislação, normas ou orientações aplicáveis' },
    { id: 'anpd', label: 'Orientações ou manifestações da ANPD' },
    { id: 'sistemas', label: 'Mudanças em sistemas, processos, serviços ou fornecedores' },
    { id: 'tratamentos', label: 'Novos tratamentos ou novas formas de utilização de dados' },
    { id: 'incidentes', label: 'Incidentes, reclamações ou demandas recebidas' },
    { id: 'rotina', label: 'Dificuldades percebidas na rotina' },
    { id: 'controles', label: 'Resultados de controles, verificações ou avaliações anteriores' },
    { id: 'outros', label: 'Outros fatores relevantes' },
    { id: 'sem_rotina', label: 'Atualmente não existe acompanhamento dessa natureza' }
  ];
  const [c1Validation, setC1Validation] = useState<Record<string, string>>({});
  const [multiValidation, setMultiValidation] = useState<string[]>([]);

  useEffect(() => {
    setC1Validation({});
    setMultiValidation([]);
  }, [activeDoorId]);

  const structuredAlreadySaved = informationUnits.some(
    u => u.doorId === activeDoorId && u.statement.startsWith('[VALIDACAO_ESTRUTURADA]')
  );

  const handleSaveStructuredValidation = () => {
    const lastResponse = doorResponses.slice(-1)[0];
    if (!lastResponse || structuredAlreadySaved) return;
    const capacityByDoor: Record<DoorId, 'C1' | 'C2' | 'C3' | 'C4' | 'C5'> = {
      'D1.1': 'C1', 'D1.2': 'C2', 'D1.3': 'C3', 'D1.4': 'C4', 'D1.5': 'C5', 'D1.6': 'C5'
    };
    const items = activeDoorId === 'D1.1'
      ? C1_ITEMS.filter(i => c1Validation[i.id]).map(i => `${i.label}: ${c1Validation[i.id]}`)
      : (activeDoorId === 'D1.2' ? C2_ITEMS : C5_ITEMS)
          .filter(i => multiValidation.includes(i.id)).map(i => i.label);
    if (!items.length) return;
    items.forEach(statement => addInformationUnit({
      responseId: lastResponse.id,
      doorId: activeDoorId,
      statement: `[VALIDACAO_ESTRUTURADA] ${statement}`,
      sourceName: lastResponse.respondentName,
      sourceRole: lastResponse.respondentRole,
      scope: 'CONHECIMENTO_DIRETO',
      extractedBy: 'FACILITADOR',
      validationStatus: 'VALIDADO',
      relatedCapacity: capacityByDoor[activeDoorId],
      registeredBy: currentUser.name
    }));
    setActionFeedback({
      message: 'Fatos da escuta validados e registrados.',
      location: `${activeDoor.code} · estruturação metodológica da resposta.`,
      nextStep: 'Continue a conversa ou conclua esta pergunta quando considerar suficiente.'
    });
  };

  // Rascunho local da fala: evita perda acidental antes do registro definitivo.
  const draftKey = `interviewDraft:${currentOrg?.id || 'no-org'}:${currentCycle?.id || 'no-cycle'}:${activeDoorId}`;

  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(draftKey);
      setInputText(savedDraft || '');
    } catch {
      setInputText('');
    }
  }, [draftKey]);

  useEffect(() => {
    try {
      if (inputText.trim()) localStorage.setItem(draftKey, inputText);
      else localStorage.removeItem(draftKey);
    } catch {
      // noop: o registro definitivo continua disponível mesmo sem persistência local do rascunho
    }
  }, [draftKey, inputText]);

  // Respostas da pergunta ativa
  const [historicalResponses, setHistoricalResponses] = React.useState<OriginalResponse[]>([]);
  const [historyLoadState, setHistoryLoadState] = React.useState('aguardando');
  const [historicalStructured, setHistoricalStructured] = React.useState<HistoricalStructuredUnit[]>([]);
  React.useEffect(() => {
    if (!currentOrg?.id || currentOrg.id === 'org-camara-vila-esperanca-01') { setHistoricalResponses([]); setHistoricalStructured([]); return; }
    setHistoryLoadState('carregando'); loadHistoricalPilot(currentOrg.id).then(h => { setHistoricalResponses(h?.responses || []); setHistoricalStructured(h?.structuredInformationUnits || []); setHistoryLoadState(h ? `ok:${h.responses.length}` : 'sem-retorno'); }).catch(e => { setHistoricalResponses([]); setHistoricalStructured([]); setHistoryLoadState('erro:'+String(e)); });
  }, [currentOrg?.id]);
  const effectiveResponses = historicalResponses.length ? historicalResponses : originalResponses;
  console.info('[VIPAZ historical]', currentOrg?.id, historyLoadState, historicalResponses.length);
  const doorResponses = effectiveResponses.filter(r => r.doorId === activeDoorId);
  const doorProbings = probings.filter(p => p.doorId === activeDoorId);
  const doorPedagogical = pedagogicalInterventions.filter(p => p.doorId === activeDoorId);
  const doorDontKnows = dontKnowRecords.filter(d => d.doorId === activeDoorId);

  const persistCurrentResponse = (): boolean => {
    if (!inputText.trim()) return false;

    if (retifyingResponseId) {
      addRetificationResponse(retifyingResponseId, inputText);
      setRetifyingResponseId(null);
      setActionFeedback({
        message: 'Retificação formal registrada e vinculada à fala anterior.',
        location: `Histórico imutável da Pergunta ${activeDoor.code.replace('Pergunta ', '')}.`,
        nextStep: 'Continue a investigação ou avalie a conclusão da pergunta.'
      });
    } else if (complementingResponseId) {
      addComplementResponse(complementingResponseId, inputText);
      setComplementingResponseId(null);
      setActionFeedback({
        message: 'Complemento registrado sem alterar a resposta anterior.',
        location: `Histórico da Pergunta ${activeDoor.code.replace('Pergunta ', '')}.`,
        nextStep: 'A pergunta pode permanecer concluída; complemente novamente apenas se surgir informação nova.'
      });
    } else {
      const interviewRespondent = isFacilitator && currentOrg
        ? {
            id: `interview-respondent-${currentOrg.id}`,
            name: currentOrg.mainInterlocutorName || 'Interlocutor da entrevista',
            role: 'INTERLOCUTOR_PRINCIPAL' as const,
            email: '',
            department: currentOrg.mainInterlocutorRole || 'Papel não informado',
            organizationId: currentOrg.id
          }
        : currentUser;
      addOriginalResponse(activeDoorId, inputText, interviewRespondent);
      // Se a porta estava não iniciada, move para em descoberta
      if (currentDoorStatus === 'NAO_INICIADA') {
        updateDoorStatus(activeDoorId, 'EM_DESCOBERTA');
      }
      setActionFeedback({
        message: 'Resposta original registrada com sucesso.',
        location: `Histórico imutável da Pergunta ${activeDoor.code.replace('Pergunta ', '')}.`,
        nextStep: 'Você pode aprofundar com uma sondagem ou avaliar a conclusão da pergunta.'
      });
    }
    setInputText('');
    try { localStorage.removeItem(draftKey); } catch { /* noop */ }
    return true;
  };

  // Handler explícito de registro; os passos seguintes também registram automaticamente uma fala pendente.
  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    persistCurrentResponse();
  };

  // Confirmação explícita humana de suficiência (Ajuste 4)
  const handleConfirmSufficiency = () => {
    persistCurrentResponse();
    updateDoorStatus(activeDoorId, 'SUFICIENTEMENTE_EXPLORADA');
    setActionFeedback({
      message: `Pergunta ${activeDoor.code.replace('Pergunta ', '')} confirmada como suficientemente explorada.`,
      location: `Registro da Pergunta ${activeDoor.code.replace('Pergunta ', '')} atualizado na entrevista.`,
      nextStep: isLastDoor 
        ? 'Você pode agora revisar e concluir a entrevista.' 
        : `Você já pode concluir e avançar para a próxima pergunta.`
    });
  };

  // Concluir e avançar para a próxima porta (Ajuste 5)
  const handleAdvanceToNextDoor = () => {
    persistCurrentResponse();

    if (nextDoorId) {
      setActiveDoorId(nextDoorId);
      setShowContextualHelp(false);
      setShowMethodologyLenses(false);
      setShowAdvancedStatuses(false);
      setActionFeedback({
        message: `Avanço para a próxima pergunta realizado com sucesso.`,
        location: `Iniciando investigação da próxima pergunta.`,
        nextStep: `Apresente a pergunta essencial da próxima pergunta ao interlocutor.`
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Salvar registro de "Não sei"
  const handleSaveDontKnow = () => {
    recordDontKnow(
      activeDoorId,
      dontKnowReason,
      dontKnowJustification || 'Respondente informou desconhecer a rotina.',
      dontKnowAction
    );
    setShowDontKnowModal(false);
    setDontKnowJustification('');
  };

  // Salvar intervenção pedagógica
  const handleSavePedagogical = () => {
    addPedagogicalIntervention({
      doorId: activeDoorId,
      concept: selectedConcept.concept,
      reason: 'Dúvida ou incompreensão conceitual do respondente sanada sem induzir resposta de conformidade.',
      contentPresented: selectedConcept.shortExplanation,
      concreteExample: selectedConcept.concreteExample,
      followUpQuestion: selectedConcept.neutralQuestion,
      previousResponseText: doorResponses.slice(-1)[0]?.originalText,
      subsequentResponseText: ''
    });
    setShowPedagogicalModal(false);
  };

  // Salvar sondagem
  const handleSaveProbing = () => {
    if (!probingQuestion.trim()) return;
    addProbingRecord({
      doorId: activeDoorId,
      origin: 'FACILITADOR_CRIADA',
      reason: 'Pergunta adicional formulada livremente durante a entrevista',
      questionEffectivelyAsked: probingQuestion,
      responseText: probingResponse || undefined,
      relatedCriterionOrCapacity: activeDoor.title
    });
    setProbingQuestion('');
    setProbingResponse('');
    setShowProbingModal(false);
  };

  // Salvar convite distribuído
  const handleSaveDistributed = () => {
    if (!distTargetName.trim() || !distNeutralQuestion.trim()) return;
    createDistributedRequest(
      activeDoorId,
      distTargetName,
      distDepartment || 'Outro Setor',
      'COMPLEMENTACAO',
      distNeutralQuestion,
      distContext
    );
    setDistTargetName('');
    setDistDepartment('');
    setDistNeutralQuestion('');
    setShowDistributedModal(false);
    alert('Pendência de verificação registrada para acompanhamento posterior.');
  };

  // Salvar evidência
  const handleSaveEvidence = () => {
    if (!evidenceTitle.trim()) return;
    addEvidence({
      title: evidenceTitle,
      type: evidenceType,
      origin: evidenceOrigin || 'Informado pelo participante',
      indicatedBy: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      status: 'INDICADA',
      sufficiencyNotes: 'Evidência indicada durante a entrevista. Aguarda apresentação do documento para verificação pelo Facilitador.',
      limitations: 'Pendente de verificação formal de autenticidade e alcance.',
      relatedCapacities: ['C1'],
      sensitivity: 'PUBLICA',
      aiUsageRule: 'AUTORIZADO_RESUMO'
    });
    setEvidenceTitle('');
    setEvidenceOrigin('');
    setShowEvidenceModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Seletor horizontal das 6 perguntas de descoberta */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {DOORS_DEFINITIONS.map(door => {
          const isSelected = door.id === activeDoorId;
          const status = doorStatuses[door.id];
          return (
            <button
              key={door.id}
              onClick={() => {
                if (door.id !== activeDoorId) persistCurrentResponse();
                setActiveDoorId(door.id);
              }}
              className={`px-3.5 py-2.5 rounded-xl text-left border transition-all shrink-0 min-w-[180px] cursor-pointer select-none active:scale-[0.98] ${
                isSelected
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-emerald-500/60'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/80 active:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs gap-2">
                <div className="flex items-center gap-1.5">
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                  <span>{door.code}</span>
                </div>
                {isSelected ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                    {status === 'SUFICIENTEMENTE_EXPLORADA' ? 'EXPLORADA' : status === 'SUFICIENTEMENTE_EXPLORADA_COMPROVACAO_PENDENTE' ? 'PENDENTE' : status.replace(/_/g, ' ')}
                  </span>
                ) : (
                  <DoorStatusBadge status={status} size="sm" showIcon={false} />
                )}
              </div>
              <div className="text-xs truncate font-medium mt-1">{door.title}</div>
            </button>
          );
        })}
      </div>

      {/* Banner de Entrevista Concluída */}
      {currentCycle?.interviewCompletedAt && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Entrevista Presencial Concluída:</strong> A etapa de escuta fática das 6 perguntas foi finalizada em {new Date(currentCycle.interviewCompletedAt).toLocaleDateString('pt-BR')}. Registros e retificações continuam acessíveis.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView('HOME')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline shrink-0 cursor-pointer"
          >
            Retornar à Jornada
          </button>
        </div>
      )}

      {/* Banner de Feedback Estruturado Essencial (Ajuste 9) */}
      {actionFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-2xs flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs text-slate-700">
              <p className="font-bold text-emerald-950">✓ {actionFeedback.message}</p>
              <p className="text-slate-600">📍 {actionFeedback.location}</p>
              <p className="text-emerald-800 font-medium font-serif">→ {actionFeedback.nextStep}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Contexto permanente da entrevista */}
      {currentOrg && (
        <div className="bg-gradient-to-r from-emerald-50 via-white to-slate-50 border border-emerald-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs">
          <div>
            <span className="text-slate-500">Instituição</span>
            <p className="font-bold text-slate-900">{currentOrg.name}</p>
          </div>
          <div className="sm:text-right">
            <span className="text-slate-500">Interlocutor(a)</span>
            <p className="font-semibold text-slate-800">{currentOrg.mainInterlocutorName || 'Não informado'} <span className="font-normal text-slate-500">· {currentOrg.mainInterlocutorRole || 'papel não informado'}</span></p>
          </div>
        </div>
      )}

      {/* Cabeçalho da Pergunta Ativa */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded font-mono">
                {activeDoor.code}
              </span>
              <h2 className="text-lg font-bold text-slate-800">{activeDoor.title}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <strong>Objetivo da descoberta:</strong> {activeDoor.objective}
            </p>
          </div>

          {/* Estado da Pergunta e Opções Avançadas Secundárias (Ajuste 4) */}
          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            <LocalSaveIndicator />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Situação:</span>
              <DoorStatusBadge status={currentDoorStatus} size="sm" />
            </div>

            <button
              type="button"
              onClick={() => setShowAdvancedStatuses(prev => !prev)}
              className="text-[11px] text-slate-500 hover:text-slate-700 underline font-medium cursor-pointer"
            >
              {showAdvancedStatuses ? 'Ocultar opções avançadas' : 'Opções avançadas de estado'}
            </button>
          </div>
        </div>

        {/* Seletor Avançado de Estados (Secundário sob demanda) */}
        {showAdvancedStatuses && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Classificação Metodológica Específica:</span>
              <span className="text-[10px] text-slate-500">Apenas para registros excepcionais ou complementares</span>
            </div>
            <select
              value={currentDoorStatus}
              onChange={e => updateDoorStatus(activeDoorId, e.target.value as DoorStatus)}
              className="w-full text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-700 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="NAO_INICIADA">NÃO INICIADA</option>
              <option value="EM_DESCOBERTA">EM DESCOBERTA</option>
              <option value="SUFICIENTEMENTE_EXPLORADA">SUFICIENTEMENTE EXPLORADA</option>
              <option value="SUFICIENTEMENTE_EXPLORADA_COMPROVACAO_PENDENTE">SUFICIENTEMENTE EXPLORADA — COMPROVAÇÃO PENDENTE</option>
              <option value="REQUER_OUTRA_FONTE">REQUER OUTRA FONTE</option>
              <option value="REQUER_APROFUNDAMENTO">REQUER APROFUNDAMENTO</option>
              <option value="NAO_APROFUNDADA_POR_PROPORCIONALIDADE">NÃO APROFUNDADA POR PROPORCIONALIDADE</option>
            </select>
          </div>
        )}

        {/* Pergunta Essencial Aberta com Apoio Contextual (Ajuste 2) */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-4 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
              {activeDoorId === 'D1.1' ? 'Pergunta:' : 'Pergunta:'}
            </span>
            <div className="flex items-center gap-2">
              {activeDoor.adaptedQuestion && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  Variação adaptada disponível
                </span>
              )}
              {activeDoor.contextualHelp && (
                <button
                  type="button"
                  onClick={() => setShowContextualHelp(prev => !prev)}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>{showContextualHelp ? 'Ocultar contextualização' : 'Ajudar a contextualizar'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <p className="text-sm font-semibold text-emerald-950 leading-relaxed font-serif flex-1">
              “{activeDoor.essentialQuestion}”
            </p>
            {'speechSynthesis' in window && (
              <button
                type="button"
                onClick={handleSpeakQuestion}
                className="shrink-0 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-white/80 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
                title={isSpeakingQuestion ? 'Parar leitura' : 'Ouvir pergunta'}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isSpeakingQuestion ? 'Parar' : 'Ouvir pergunta'}</span>
              </button>
            )}
          </div>

          {activeDoor.adaptedQuestion && (
            <p className="text-xs text-emerald-800 italic pt-0.5">
              Se necessário, aprofunde: {activeDoor.adaptedQuestion}
            </p>
          )}

          {activeDoor.contextualHelp && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-900">Exemplos do cotidiano para situar a conversa</p>
                <button type="button" onClick={() => setShowContextualHelp(prev => !prev)} className="text-[11px] font-semibold text-emerald-800 underline">
                  {showContextualHelp ? 'Ocultar' : 'Ver exemplos'}
                </button>
              </div>
              {showContextualHelp && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-700 font-serif">{activeDoor.contextualHelp.scopeExplanation}</p>
                  <ul className="space-y-1.5">
                    {activeDoor.contextualHelp.practicalSituations.map((sit, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex gap-2"><span className="text-emerald-700 font-bold">•</span><span>{sit}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Quadro de Apoio Contextual Expansível (Ajuste 2) */}
          {showContextualHelp && activeDoor.contextualHelp && (
            <div className="mt-3 pt-3 border-t border-emerald-200 space-y-2.5 text-xs text-emerald-950 bg-white/80 p-3.5 rounded-lg animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-[11px] uppercase tracking-wide">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Situações institucionais e práticas para apoio à escuta:</span>
              </div>
              <p className="font-serif text-slate-700 leading-relaxed">
                {activeDoor.contextualHelp.scopeExplanation}
              </p>
              <div className="space-y-1.5 pt-1">
                {activeDoor.contextualHelp.practicalSituations.map((sit, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-emerald-50/60 p-2 rounded border border-emerald-100 text-slate-700">
                    <span className="text-emerald-700 font-bold shrink-0">•</span>
                    <span className="font-serif leading-relaxed">{sit}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 italic pt-1">
                Nota ao Facilitador: Utilize estes exemplos neutros apenas se o interlocutor tiver dúvida para compreender o campo da pergunta. Não utilize como checklist nem antecipe respostas.
              </p>
            </div>
          )}
        </div>

        {/* Lentes e Focos Metodológicos Secundários (Ajuste 8) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowMethodologyLenses(prev => !prev)}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>{showMethodologyLenses ? 'Ocultar o que esta pergunta busca compreender' : 'Ver o que esta pergunta busca compreender'}</span>
          </button>

          {showMethodologyLenses && (
            <div className="mt-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs animate-in fade-in">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                  Áreas de Foco Metodológico:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeDoor.focusAreas.map(f => (
                    <span key={f} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              {activeDoor.internalLenses && activeDoor.internalLenses.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider block mb-1">
                    Lentes Internas de Investigação:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeDoor.internalLenses.map(lens => (
                      <span key={lens} className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-mono text-[10px]">
                        {lens}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Primeiro passo da conversa: registrar a resposta principal */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Resposta</h3>
          <p className="text-xs text-slate-500 font-serif">Registre o que foi informado pelo participante. Se ele não souber responder, use “Não sei informar”.</p>
        </div>
        {/* Caixa de Entrada de Fala do Participante */}
        <form onSubmit={handleSendResponse} className="space-y-2 pt-2">
          {retifyingResponseId && (
            <div className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded text-xs flex items-center justify-between">
              <span>Registrando <strong>retificação formal</strong> da fala original selecionada.</span>
              <button
                type="button"
                onClick={() => {
                  setRetifyingResponseId(null);
                  setInputText('');
                }}
                className="font-bold text-amber-800"
              >
                Cancelar
              </button>
            </div>
          )}

          <div className="relative">
            <textarea
              rows={4}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Digite a fala literal do respondente ou registre as declarações da entrevista..."
              className="w-full text-sm p-3 rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {inputText.trim() && <strong className="text-emerald-700">Rascunho protegido automaticamente · </strong>}
              {isFacilitator && currentOrg ? (
                <>Fala atribuída a: <strong>{currentOrg.mainInterlocutorName || 'Interlocutor da entrevista'}</strong> ({currentOrg.mainInterlocutorRole || 'papel não informado'}) · registrada pelo facilitador</>
              ) : (
                <>Registrado por: <strong>{currentUser.name}</strong> ({currentUser.department})</>
              )}
            </span>
            <div className="flex items-center gap-2">
              {!retifyingResponseId && activeDoorId !== 'D1.1' && (
                <button
                  type="button"
                  onClick={() => setShowDontKnowModal(true)}
                  className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 px-3 py-2 rounded-lg"
                >
                  Não sei informar
                </button>
              )}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {retifyingResponseId ? 'Salvar Retificação Relacionada' : complementingResponseId ? 'Salvar complemento' : 'Salvar resposta'}
            </button>
            </div>
          </div>
        </form>
      </div>

      {false && activeDoorId === 'D1.1' && doorResponses.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="space-y-1 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Organizar a rede identificada</h3>
            <p className="text-xs text-slate-600 font-serif leading-relaxed">
              A partir do que foi contado, registre quem participa quando necessário e como essa participação funciona. Não é preciso existir um responsável por privacidade em cada área.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['Encarregado(a)', 'Gestão / Presidência', 'RH / Gestão de Pessoas', 'TI', 'Jurídico', 'Controladoria', 'Ouvidoria / SIC', 'Comunicação'].map(actor => (
              <button
                key={actor}
                type="button"
                onClick={() => addGovernanceActor(actor)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
              >
                + {actor}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={newActorName}
              onChange={e => setNewActorName(e.target.value)}
              placeholder="Outra pessoa, área ou competência identificada"
              className="flex-1 p-2.5 border border-slate-300 rounded-lg text-xs"
            />
            <button
              type="button"
              onClick={() => addGovernanceActor(newActorName)}
              disabled={!newActorName.trim()}
              className="px-3 py-2 bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-semibold"
            >
              Adicionar
            </button>
          </div>

          {governanceActors.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500 text-center">
              Nenhum ator foi organizado ainda. Use apenas os que apareceram ou se mostraram relevantes na conversa.
            </div>
          ) : (
            <div className="space-y-3">
              {governanceActors.map(item => (
                <div key={item.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-sm text-slate-900">{item.actor}</strong>
                    <button type="button" onClick={() => removeGovernanceActor(item.id)} className="text-[11px] text-slate-400 hover:text-rose-600">Remover</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      value={item.exercisedBy}
                      onChange={e => updateGovernanceActor(item.id, { exercisedBy: e.target.value })}
                      placeholder="Quem exerce? Ex.: servidora do RH, empresa de TI"
                      className="p-2 border border-slate-300 rounded-lg text-xs"
                    />
                    <input
                      value={item.whenParticipates}
                      onChange={e => updateGovernanceActor(item.id, { whenParticipates: e.target.value })}
                      placeholder="Quando participa?"
                      className="p-2 border border-slate-300 rounded-lg text-xs"
                    />
                    <input
                      value={item.whatDoes}
                      onChange={e => updateGovernanceActor(item.id, { whatDoes: e.target.value })}
                      placeholder="O que faz quando participa?"
                      className="p-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="text-[11px] font-semibold text-slate-700 space-y-1">
                      <span className="block">Como essa participação funciona hoje?</span>
                      <select
                        value={item.participation}
                        onChange={e => updateGovernanceActor(item.id, { participation: e.target.value as ActorParticipation })}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-normal"
                      >
                        <option value="">Selecione somente se puder confirmar</option>
                        <option value="PARTICIPA_QUANDO_NECESSARIO">Participa quando necessário</option>
                        <option value="IDENTIFICADO_AINDA_NAO_NECESSARIO">Está identificado para ser acionado, mas ainda não foi necessário</option>
                        <option value="NECESSARIO_MAS_NAO_ESTAVA_CLARO">Já foi necessário, mas não estava claro quem deveria participar</option>
                        <option value="ATENDIDA_DE_OUTRA_FORMA">Essa competência é atendida de outra forma</option>
                        <option value="NAO_SE_APLICA">Não se aplica à realidade da Câmara</option>
                        <option value="NAO_SEI">Não sei informar</option>
                      </select>
                    </label>

                    <label className="text-[11px] font-semibold text-slate-700 space-y-1">
                      <span className="block">Como vocês sabem o que cabe a essa pessoa ou área fazer?</span>
                      <select
                        value={item.responsibilityBasis}
                        onChange={e => updateGovernanceActor(item.id, { responsibilityBasis: e.target.value as ResponsibilityBasis })}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-normal"
                      >
                        <option value="">Selecione somente se puder confirmar</option>
                        <option value="DOCUMENTO_OU_ATO">Está definido em documento ou ato institucional</option>
                        <option value="ATRIBUICAO_FUNCAO_AREA">Decorre das atribuições da função ou área</option>
                        <option value="PRATICA_INSTITUCIONAL_CONHECIDA">É uma prática institucional conhecida</option>
                        <option value="SEM_DEFINICAO_CLARA">Acontece assim, mas a responsabilidade não está claramente definida</option>
                        <option value="NAO_SEI">Não sei informar</option>
                      </select>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {governanceActors.length > 0 && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950">
              <strong>Confirmação da conversa:</strong> esta representação corresponde ao funcionamento atual? Há alguma pessoa, área ou competência importante que ficou de fora?
            </div>
          )}

          <p className="text-[10px] text-slate-500 italic">
            Teste de campo D1.1: este mapa organiza fatos da conversa. Ele não atribui nível de maturidade e não transforma a ausência de uma área em gap.
          </p>
        </div>
      )}

      {historicalResponses.length > 0 && (
        <HistoricalStructuredReadOnly doorId={activeDoorId} units={historicalStructured.filter(u => u.doorId === activeDoorId)} />
      )}

      {doorResponses.length > 0 && ['D1.1', 'D1.2', 'D1.5'].includes(activeDoorId) && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Validação dos fatos da escuta</h3>
            <p className="text-xs text-slate-500 font-serif mt-1">
              Marcação do facilitador a partir da resposta registrada e da escuta ativa. Confirme com o Encarregado sempre que houver dúvida.
            </p>
          </div>

          {activeDoorId === 'D1.1' ? (
            <div className="space-y-2">
              {C1_ITEMS.map(item => (
                <div key={item.id} className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-2 items-center py-2 border-b border-slate-100 last:border-b-0">
                  <span className="text-xs text-slate-700">{item.label}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Sim', 'Em parte', 'Não', 'Ainda não vivenciou'].map(value => (
                      <button key={value} type="button" disabled={structuredAlreadySaved}
                        onClick={() => setC1Validation(prev => ({...prev, [item.id]: value}))}
                        className={`px-2.5 py-1.5 rounded-md text-[11px] border ${c1Validation[item.id] === value ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-semibold' : 'bg-white border-slate-200 text-slate-600'} disabled:opacity-60`}>
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(activeDoorId === 'D1.2' ? C2_ITEMS : C5_ITEMS).map(item => (
                <label key={item.id} className="flex items-start gap-2.5 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 cursor-pointer">
                  <input type="checkbox" disabled={structuredAlreadySaved}
                    checked={multiValidation.includes(item.id)}
                    onChange={() => setMultiValidation(prev => prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id])}
                    className="mt-0.5 accent-emerald-600" />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <button type="button" onClick={handleSaveStructuredValidation} disabled={structuredAlreadySaved || (activeDoorId === 'D1.1' ? Object.keys(c1Validation).length === 0 : multiValidation.length === 0)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40">
              {structuredAlreadySaved ? 'Fatos validados e registrados' : 'Registrar fatos validados'}
            </button>
          </div>
        </div>
      )}

      {doorResponses.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-800">Registros adicionais</p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setShowProbingModal(true)} className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> + Pergunta adicional
              </button>
              <button type="button" onClick={() => setShowEvidenceModal(true)} className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-600" /> Indicar documento ou evidência
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card de Decisão Humana de Suficiência e Avanço (Ajustes 4 e 5) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Conclusão da pergunta</span>
            </h3>
            <p className="text-xs text-slate-500 font-serif">
              A conclusão é uma decisão do Facilitador sobre esta pergunta e não bloqueia a navegação entre as demais.
            </p>
          </div>
          <DoorStatusBadge status={currentDoorStatus} size="sm" />
        </div>

        {currentDoorStatus !== 'SUFICIENTEMENTE_EXPLORADA' ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800">
                Você considera esta pergunta suficientemente explorada?
              </h4>
              <p className="text-xs text-slate-600 font-serif leading-relaxed max-w-2xl">
                Use esta confirmação quando a resposta e os aprofundamentos necessários já permitirem compreender os fatos buscados nesta pergunta. Você pode navegar entre as perguntas a qualquer momento.
              </p>
            </div>

            <button
              type="button"
              onClick={handleConfirmSufficiency}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluir pergunta</span>
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs text-emerald-900 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pergunta concluída pelo Facilitador.</span>
              </div>
              <button
                type="button"
                onClick={() => updateDoorStatus(activeDoorId, 'EM_DESCOBERTA')}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Reabrir pergunta
              </button>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-emerald-200/60">
              <p className="text-xs text-slate-600 font-serif">
                {isLastDoor 
                  ? 'Todas as 6 perguntas da Dimensão D1 foram percorridas.'
                  : `A pergunta está concluída. Você pode seguir para outra pergunta ou reabri-la se precisar complementar a investigação.`}
              </p>

              {isLastDoor ? (
                <button
                  type="button"
                  onClick={() => setShowReviewAndFinishModal(true)}
                  className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Revisar e concluir entrevista</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAdvanceToNextDoor}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <span>Concluir e avançar para {nextDoorId}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Histórico da Conversa / Registro de Respostas Imutáveis */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>Registro de Falas Originais Imutáveis</span>
            <span className="text-xs text-slate-400 font-normal">({doorResponses.length} resposta(s) registrada(s))</span>
          </h3>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Imutável: correções criam novo registro relacionado
          </span>
        </div>

        {doorResponses.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Nenhuma resposta registrada ainda para esta pergunta. Apresente a pergunta essencial ou registre a fala do participante abaixo.
          </div>
        ) : (
          <div className="space-y-3">
            {doorResponses.map(resp => (
              <div 
                key={resp.id} 
                className={`p-3.5 rounded-lg border transition-all ${
                  resp.isRetificationOfResponseId 
                    ? 'bg-amber-50/60 border-amber-200' 
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{resp.respondentName}</span>
                    <span className="text-[11px] text-slate-500">({resp.respondentRole})</span>
                    {resp.isRetificationOfResponseId && (
                      <span className="bg-amber-200 text-amber-900 text-[10px] px-1.5 py-0.2 rounded font-bold">
                        Correção da informação anterior
                      </span>
                    )}
                    {resp.isComplementOfResponseId && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2 rounded font-bold">
                        Complemento da resposta
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-mono text-slate-400">{resp.id}</span>
                    <span>{new Date(resp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-800 leading-relaxed font-serif bg-white p-2.5 rounded border border-slate-100">
                  “{resp.originalText}”
                </p>

                {/* Ações sobre a resposta */}
                <div className="flex items-center justify-between pt-2 mt-2 text-xs">
                  <span className="text-[11px] text-slate-400">Modalidade: {resp.modality.replace('_', ' ')}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setComplementingResponseId(resp.id);
                        setRetifyingResponseId(null);
                        setInputText('');
                      }}
                      className="text-blue-700 hover:text-blue-800 font-medium text-[11px] underline cursor-pointer"
                    >
                      Adicionar informação
                    </button>
                    <button
                      onClick={() => {
                        setRetifyingResponseId(resp.id);
                        setComplementingResponseId(null);
                        setInputText(resp.originalText);
                      }}
                      className="text-amber-700 hover:text-amber-800 font-medium text-[11px] underline cursor-pointer"
                    >
                      Corrigir informação
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ocorrências de Não Sei registradas para esta pergunta */}
        {doorDontKnows.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
            <span className="font-bold text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Manifestação de "Não Sei" Registrada nesta Porta:
            </span>
            {doorDontKnows.map(dk => (
              <div key={dk.id} className="text-amber-800 pl-5 text-[11px]">
                • Motivo classificado: <strong>{dk.reasonCategory.replace(/_/g, ' ')}</strong>.
                {dk.justificationNotes && ` Nota: ${dk.justificationNotes}`}
                <span className="text-amber-900 font-semibold ml-1">
                  (Regra: Não é gap nem N1; gerou encaminhamento: {dk.nextStepAction})
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Sondagens registradas nesta pergunta */}
        {doorProbings.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1">
            <span className="font-bold text-blue-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Perguntas adicionais registradas ({doorProbings.length}):
            </span>
            {doorProbings.map(prb => (
              <div key={prb.id} className="text-blue-800 pl-5 text-[11px]">
                • <strong>P:</strong> “{prb.questionEffectivelyAsked}”
                {prb.responseText && <span className="text-slate-700 block italic pl-2">R: “{prb.responseText}”</span>}
              </div>
            ))}
          </div>
        )}

        {/* Intervenções pedagógicas registradas */}
        {doorPedagogical.length > 0 && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs space-y-1">
            <span className="font-bold text-purple-900 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
              Intervenção Pedagógica Aplicada:
            </span>
            {doorPedagogical.map(ped => (
              <div key={ped.id} className="text-purple-800 pl-5 text-[11px]">
                • Conceito explicado: <strong>{ped.concept}</strong>. Pergunta de retomada: “{ped.followUpQuestion}”
              </div>
            ))}
          </div>
        )}


      </div>

      {/* MODAL: Tratamento do Não Sei */}
      {showDontKnowModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  Tratamento Metodológico do "Não Sei"
                </h4>
                <p className="text-[11px] text-slate-500">
                  Princípio: "NÃO SEI" NÃO É GAP, NÃO É N1, NÃO É NÃO ATENDE.
                </p>
              </div>
              <button onClick={() => setShowDontKnowModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Qual a causa identificada para o "Não Sei"?</label>
                <select
                  value={dontKnowReason}
                  onChange={e => setDontKnowReason(e.target.value as DontKnowReason)}
                  className="w-full p-2 border border-slate-300 rounded"
                >
                  <option value="FORA_DA_VISIBILIDADE">FORA DA VISIBILIDADE DO RESPONDENTE (Ex: área técnica de TI)</option>
                  <option value="INCOMPREENSAO_CONCEITUAL">INCOMPREENSÃO CONCEITUAL (Requer explicação breve)</option>
                  <option value="OUTRA_FONTE_PODE_INFORMAR">OUTRA FONTE PODE INFORMAR (Setor ou responsável específico)</option>
                  <option value="RESPONDENTE_PODE_BUSCAR">RESPONDENTE PODE BUSCAR A INFORMAÇÃO</option>
                  <option value="INSTITUICAO_NAO_CONSEGUE_LOCALIZAR">INSTITUIÇÃO NÃO CONSEGUE LOCALIZAR</option>
                  <option value="MOTIVO_AINDA_INDETERMINADO">MOTIVO AINDA INDETERMINADO</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Próximo Passo Orientado:</label>
                <select
                  value={dontKnowAction}
                  onChange={e => setDontKnowAction(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded"
                >
                  <option value="CONVITE_OUTRA_FONTE">Solicitar contribuição à fonte adequada</option>
                  <option value="EXPLICACAO_PEDAGOGICA">Realizar intervenção pedagógica conceitual</option>
                  <option value="BUSCA_INTERNA">Respondente irá buscar o dado internamente</option>
                  <option value="REGISTRO_PENDENCIA">Registrar pendência de informação</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Observações de Justificativa:</label>
                <textarea
                  rows={2}
                  value={dontKnowJustification}
                  onChange={e => setDontKnowJustification(e.target.value)}
                  placeholder="Explique o contexto para assegurar que não seja interpretado como carência institucional..."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDontKnowModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveDontKnow}
                className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded"
              >
                Registrar "Não Sei" Metodológico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Intervenção Pedagógica */}
      {showPedagogicalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  Intervenção Pedagógica (Ensinar sem Induzir)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Fluxo: Conceito necessário → Explicação curta → Exemplo concreto → Pergunta → Descoberta.
                </p>
              </div>
              <button onClick={() => setShowPedagogicalModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Selecione o Conceito Necessário:</label>
                <select
                  value={selectedConcept.concept}
                  onChange={e => {
                    const c = PEDAGOGICAL_CONCEPTS.find(item => item.concept === e.target.value);
                    if (c) setSelectedConcept(c);
                  }}
                  className="w-full p-2 border border-slate-300 rounded font-medium"
                >
                  {PEDAGOGICAL_CONCEPTS.map(c => (
                    <option key={c.concept} value={c.concept}>{c.concept}</option>
                  ))}
                </select>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 space-y-2">
                <div>
                  <span className="font-bold text-purple-900">Explicação curta:</span>
                  <p className="text-purple-950 mt-0.5">{selectedConcept.shortExplanation}</p>
                </div>
                <div>
                  <span className="font-bold text-purple-900">Exemplo concreto:</span>
                  <p className="text-purple-950 italic mt-0.5">{selectedConcept.concreteExample}</p>
                </div>
                <div>
                  <span className="font-bold text-purple-900">Pergunta neutra de retomada:</span>
                  <p className="text-purple-950 font-semibold mt-0.5">“{selectedConcept.neutralQuestion}”</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPedagogicalModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePedagogical}
                className="px-4 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded"
              >
                Registrar Intervenção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Pergunta adicional livre do facilitador */}
      {showProbingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Pergunta adicional da conversa
                </h4>
                <p className="text-[11px] text-slate-500 font-serif">
                  Registre somente o que foi perguntado além da pergunta principal e a resposta obtida.
                </p>
              </div>
              <button onClick={() => setShowProbingModal(false)} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <span className="font-semibold text-slate-700">Pergunta feita ao participante:</span>

              <textarea
                rows={2}
                value={probingQuestion}
                onChange={e => setProbingQuestion(e.target.value)}
                placeholder="Ex: Na rotina diária, como essa solicitação chega até você e quem costuma analisar primeiro?"
                className="w-full p-2 border border-slate-300 rounded font-serif"
              />

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Resposta obtida:
                </label>
                <textarea
                  rows={2}
                  value={probingResponse}
                  onChange={e => setProbingResponse(e.target.value)}
                  placeholder="Registre as declarações ou explicações orais dadas à pergunta de sondagem..."
                  className="w-full p-2 border border-slate-300 rounded font-serif"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowProbingModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveProbing}
                disabled={!probingQuestion.trim()}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 cursor-pointer"
              >
                Salvar pergunta e resposta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Convidar Outra Fonte (Investigação Distribuída) */}
      {showDistributedModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <GitPullRequest className="w-4 h-4 text-sky-600" />
                  Investigação Distribuída (Convite Neutro à Fonte)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Regra estrita: NÃO revelar a fala do primeiro respondente ("Fulano disse X"). Enviar apenas formulação neutra.
                </p>
              </div>
              <button onClick={() => setShowDistributedModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nome da Fonte Convidada:</label>
                  <input
                    type="text"
                    value={distTargetName}
                    onChange={e => setDistTargetName(e.target.value)}
                    placeholder="Ex: Rodrigo Santoro Alencar"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Setor / Departamento:</label>
                  <input
                    type="text"
                    value={distDepartment}
                    onChange={e => setDistDepartment(e.target.value)}
                    placeholder="Ex: Tecnologia da Informação"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pergunta Neutra Dirigida:</label>
                <textarea
                  rows={3}
                  value={distNeutralQuestion}
                  onChange={e => setDistNeutralQuestion(e.target.value)}
                  placeholder="Ex: No âmbito do Departamento de TI, como estão organizadas as rotinas de backup e controle de acessos a sistemas com dados pessoais?"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contexto Mínimo Transparente Fornecido:</label>
                <input
                  type="text"
                  value={distContext}
                  onChange={e => setDistContext(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-slate-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDistributedModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveDistributed}
                disabled={!distTargetName.trim() || !distNeutralQuestion.trim()}
                className="px-4 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded disabled:opacity-50"
              >
                Enviar Solicitação Dirigida
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Indicar Evidência Citada (Ajuste 7) */}
      {showEvidenceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-600" />
                  Indicar Evidência ou Documento Citado
                </h4>
                <p className="text-[11px] text-slate-500 font-serif">
                  O registro durante a entrevista serve para rastrear o que foi citado na escuta. A verificação formal e suficiência do documento pertencem à etapa posterior de análise.
                </p>
              </div>
              <button onClick={() => setShowEvidenceModal(false)} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título / Descrição do Documento Citado:</label>
                <input
                  type="text"
                  value={evidenceTitle}
                  onChange={e => setEvidenceTitle(e.target.value)}
                  placeholder="Ex: Portaria nº 014/2023 - Designação do Encarregado"
                  className="w-full p-2 border border-slate-300 rounded font-serif"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipo de Evidência:</label>
                  <select
                    value={evidenceType}
                    onChange={e => setEvidenceType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded font-medium"
                  >
                    <option value="PORTARIA">Portaria / Ato Normativo</option>
                    <option value="CONTRATO">Contrato / Termo de Referência</option>
                    <option value="FLUXOGRAMA">Fluxograma / Procedimento</option>
                    <option value="RELATORIO">Relatório / Despacho</option>
                    <option value="SISTEMA_TICKET">Registro em Sistema / Chamado</option>
                    <option value="ATA_REUNIAO">Ata de Reunião</option>
                    <option value="EMAIL">E-mail Institucional</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Origem / Onde se encontra:</label>
                  <input
                    type="text"
                    value={evidenceOrigin}
                    onChange={e => setEvidenceOrigin(e.target.value)}
                    placeholder="Ex: Diário Oficial ou pasta da Secretaria Geral"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEvidenceModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEvidence}
                disabled={!evidenceTitle.trim()}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded disabled:opacity-50 cursor-pointer"
              >
                Registrar Evidência Citada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Encerramento e Revisão da Entrevista (Ajuste 6) */}
      {showReviewAndFinishModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Entrevista Concluída</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Fechamento da Coleta — Dimensão D1
                </h3>
                <p className="text-xs text-slate-500 font-serif mt-0.5">
                  Entrevista concluída: As seis áreas de investigação foram percorridas.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowReviewAndFinishModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Verificação Operacional das 6 Perguntas */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase font-bold text-slate-700 tracking-wider block">
                Verificação Operacional dos Registros de Campo:
              </span>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs overflow-hidden">
                {DOORS_DEFINITIONS.map(door => {
                  const responsesCount = effectiveResponses.filter(r => r.doorId === door.id).length;
                  const status = doorStatuses[door.id];
                  return (
                    <div key={door.id} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800">{door.code}</span>
                          <span className="font-medium text-slate-700">{door.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          {responsesCount === 0 ? 'Nenhuma fala direta registrada' : `${responsesCount} fala(s) gravada(s)`}
                        </span>
                      </div>
                      <DoorStatusBadge status={status} size="sm" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumo quantitativo simples */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 block uppercase">Falas Registradas</span>
                <span className="text-sm font-bold text-slate-800">{effectiveResponses.length}</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 block uppercase">Evidências Citadas</span>
                <span className="text-sm font-bold text-purple-700">{evidences.length}</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-500 block uppercase">"Não Sei" Tratados</span>
                <span className="text-sm font-bold text-amber-700">{dontKnowRecords.length}</span>
              </div>
            </div>

            {/* Esclarecimento Metodológico da Coleta vs Análise Posterior */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 space-y-1.5 font-serif leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs font-sans">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Distinção Metodológica entre Coleta e Análise Posterior:</span>
              </div>
              <p>
                A etapa de <strong>coleta da entrevista presencial está formalmente encerrada</strong>.
              </p>
              <p className="text-[11px] text-amber-900">
                A validação formal de documentos, complementações com outros setores, apuração de gaps, atribuição de nível de maturidade e plano de evolução pertencem exclusivamente à <strong>etapa posterior de trabalho do Facilitador</strong>.
              </p>
            </div>

            {/* Ações de Conclusão */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowReviewAndFinishModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Voltar à entrevista
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewAndFinishModal(false);
                  completeInterview();
                }}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Concluir entrevista e retornar à Jornada</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
