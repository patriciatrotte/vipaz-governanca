import { 
  UserProfile, 
  Organization, 
  DoorId, 
  DoorStatus, 
  PendingItem, 
  DivergenceRecord, 
  EvidenceRecord, 
  DistributedRequest, 
  DimensionalIntegration, 
  SnapshotD1, 
  EvolutionAction,
  OriginalResponse,
  EvaluationCycle
} from '../types';
import { AppView } from '../context/PilotContext';

export interface JourneyStage {
  id: string;
  label: string;
  status: 'CONCLUIDO' | 'EM_ANDAMENTO' | 'PENDENTE' | 'NAO_INICIADO' | 'EM_APROFUNDAMENTO';
  statusText: string;
  detail: string;
  isCurrent: boolean;
}

export interface UserJourneyInfo {
  onboarding: {
    dismissableKey: string;
    badge: string;
    title: string;
    roleHeadline: string;
    objective: string;
    firstStep: string;
    expectedResult: string;
    actionLabel: string;
    actionView: AppView;
    actionDoorId?: DoorId;
  };
  fourQuestions: {
    whereAmI: string;
    whatToDoNow: string;
    whyItMatters: string;
    whatWillIGet: string;
  };
  resumeState: {
    title: string;
    headline: string;
    detail: string;
    badgeText: string;
    badgeVariant: 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo';
    actionLabel: string;
    actionView: AppView;
    actionDoorId?: DoorId;
  };
  recommendedNextStep: {
    title: string;
    description: string;
    actionLabel: string;
    actionView: AppView;
    actionDoorId?: DoorId;
    priority: 'ALTA' | 'NORMAL' | 'URGENTE';
    reason: string;
  };
  stagesProgress: JourneyStage[];
}

interface JourneyEngineParams {
  doorStatuses: Record<DoorId, DoorStatus>;
  pendingItems: PendingItem[];
  divergences: DivergenceRecord[];
  evidences: EvidenceRecord[];
  distributedRequests: DistributedRequest[];
  integration: DimensionalIntegration;
  snapshot: SnapshotD1 | null;
  actions: EvolutionAction[];
  currentUser: UserProfile;
  currentOrg: Organization;
  activeDoorId: DoorId;
  originalResponses?: OriginalResponse[];
  currentCycle?: EvaluationCycle | null;
}

/**
 * Motor Determinístico de Jornada e Retomada por Perfil
 * REGRA CENTRAL:
 * - Sem chamadas de IA.
 * - Derivado estritamente dos dados e estados reais da plataforma.
 * - Progresso por estágios, sem barra única percentual que induza a erro.
 */
export function calculateUserJourney(params: JourneyEngineParams): UserJourneyInfo {
  const {
    doorStatuses,
    pendingItems,
    divergences,
    evidences,
    distributedRequests,
    integration,
    snapshot,
    actions,
    currentUser,
    currentOrg,
    activeDoorId,
    originalResponses
  } = params;

  const role = currentUser.role;
  const isFacilitator = role === 'FACILITADOR';
  const isInterlocutor = role === 'INTERLOCUTOR_PRINCIPAL';
  const isGestor = role === 'GESTOR_INSTITUCIONAL';
  const isParticipant = role === 'PARTICIPANTE';

  // Contagens e avaliações do estado real
  const doorsArray = Object.keys(doorStatuses) as DoorId[];
  const doorsInDiscovery = doorsArray.filter(d => doorStatuses[d] === 'EM_DESCOBERTA');
  const doorsRequiringDeepening = doorsArray.filter(d => doorStatuses[d] === 'REQUER_APROFUNDAMENTO');
  const doorsRequiringSource = doorsArray.filter(d => doorStatuses[d] === 'REQUER_OUTRA_FONTE');
  const doorsWithPendingVerification = doorsArray.filter(
    d => doorStatuses[d] === 'SUFICIENTEMENTE_EXPLORADA_COMPROVACAO_PENDENTE'
  );
  const doorsExplored = doorsArray.filter(
    d => doorStatuses[d] === 'SUFICIENTEMENTE_EXPLORADA' || 
         doorStatuses[d] === 'SUFICIENTEMENTE_EXPLORADA_COMPROVACAO_PENDENTE'
  );
  const exploredDoorsCount = doorsExplored.length;
  const isInterviewComplete = Boolean(params.currentCycle?.interviewCompletedAt) || doorsExplored.length === 6;

  // Atividade investigativa ativa: identifica se qualquer porta já saiu do estado estático
  const hasInvestigativeActivity = 
    doorsInDiscovery.length > 0 || 
    doorsRequiringSource.length > 0 || 
    doorsRequiringDeepening.length > 0 || 
    doorsExplored.length > 0 ||
    Boolean(originalResponses && originalResponses.length > 0);

  const blockingPendings = pendingItems.filter(p => p.impact === 'BLOQUEANTE' && p.status !== 'RESOLVIDA');
  const openPendings = pendingItems.filter(p => p.status !== 'RESOLVIDA');
  const activeDivergences = divergences.filter(d => d.status !== 'EXPLICADA');
  const unverifiedEvidences = evidences.filter(e => e.status === 'INDICADA' || e.status === 'APRESENTADA');

  const myDistributedRequests = distributedRequests.filter(
    r => r.targetPersonName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]) ||
         r.targetDepartment.toLowerCase().includes(currentUser.department.toLowerCase())
  );
  const pendingRequestsForMe = myDistributedRequests.filter(r => r.status === 'SOLICITADA');

  const isMaturityValidated = integration.humanValidation.isValidated;
  const hasSnapshot = Boolean(snapshot?.isLockedImmutable);
  const hasActionsInPlan = actions.length > 0;

  // --------------------------------------------------------------------------
  // 1. ESTÁGIOS METODOLÓGICOS DO PROGRESSO INSTITUCIONAL
  // --------------------------------------------------------------------------
  const stagesProgress: JourneyStage[] = [
    {
      id: 'portas',
      label: 'Diagnóstico das 6 Portas D1',
      status: doorsRequiringDeepening.length > 0
        ? 'EM_APROFUNDAMENTO'
        : isInterviewComplete
        ? 'CONCLUIDO'
        : (doorsExplored.length > 0 || hasInvestigativeActivity)
        ? 'EM_ANDAMENTO'
        : 'NAO_INICIADO',
      statusText: doorsRequiringDeepening.length > 0
        ? `${doorsExplored.length}/6 percorridas • Aprofundamento requerido (${doorsRequiringDeepening.join(', ')})`
        : isInterviewComplete
        ? '6/6 concluídas • Coleta fática encerrada'
        : doorsExplored.length > 0
        ? `${doorsExplored.length}/6 percorridas`
        : hasInvestigativeActivity
        ? 'Em andamento'
        : 'Não iniciado',
      detail: 'Investigação fática não indutiva com respondentes institucionais da Câmara.',
      isCurrent: !isInterviewComplete && (doorsExplored.length < 6 || doorsRequiringDeepening.length > 0)
    },
    {
      id: 'contribuicoes',
      label: 'Contribuições Setoriais',
      status: distributedRequests.length === 0
        ? 'NAO_INICIADO'
        : distributedRequests.some(r => r.status === 'SOLICITADA')
        ? 'EM_ANDAMENTO'
        : 'CONCLUIDO',
      statusText: distributedRequests.length === 0
        ? 'Nenhuma solicitação distribuída'
        : `${distributedRequests.filter(r => r.status === 'RESPONDIDA').length} de ${distributedRequests.length} respondidas`,
      detail: 'Apuração descentralizada com TI, RH, Protocolo e Comissões.',
      isCurrent: distributedRequests.some(r => r.status === 'SOLICITADA')
    },
    {
      id: 'evidencias_pendencias',
      label: 'Evidências & Pendências',
      status: blockingPendings.length > 0
        ? 'PENDENTE'
        : unverifiedEvidences.length > 0
        ? 'EM_ANDAMENTO'
        : evidences.length > 0
        ? 'CONCLUIDO'
        : 'NAO_INICIADO',
      statusText: blockingPendings.length > 0
        ? `${blockingPendings.length} bloqueio(s) impedindo validação • ${unverifiedEvidences.length} evidência(s) em verificação`
        : unverifiedEvidences.length > 0
        ? `${unverifiedEvidences.length} evidência(s) aguardando conferência`
        : `${evidences.length} evidência(s) registradas`,
      detail: 'Comprovação documental, limites probatórios e saneamento de lacunas.',
      isCurrent: blockingPendings.length > 0 || unverifiedEvidences.length > 0
    },
    {
      id: 'integracao_validacao',
      label: 'Consolidação & Validação Humana',
      status: isMaturityValidated
        ? 'CONCLUIDO'
        : blockingPendings.length === 0 && doorsExplored.length === 6
        ? 'EM_ANDAMENTO'
        : 'PENDENTE',
      statusText: isMaturityValidated
        ? `Nível ${integration.humanValidation.validatedLevel.replace('_', ' ')} homologado pelo Facilitador`
        : blockingPendings.length > 0
        ? 'Aguardando saneamento de pendências bloqueadoras'
        : 'Aguardando validação formal da facilitação',
      detail: 'Avaliação das capacidades C1–C6 sem compensação e sem pontuação cega.',
      isCurrent: !isMaturityValidated && blockingPendings.length === 0 && doorsExplored.length === 6
    },
    {
      id: 'plano_evolucao',
      label: 'Plano de Evolução & Governança',
      status: hasSnapshot && hasActionsInPlan
        ? 'EM_ANDAMENTO'
        : hasSnapshot
        ? 'EM_ANDAMENTO'
        : 'NAO_INICIADO',
      statusText: hasActionsInPlan
        ? `${actions.length} ações estruturantes em acompanhamento`
        : hasSnapshot
        ? 'Snapshot D1 registrado • Pronto para cadastro de ações'
        : 'Aguardando homologação do diagnóstico',
      detail: 'Metas pactuadas com responsáveis, prazos e sustentação institucional.',
      isCurrent: isMaturityValidated && hasSnapshot
    }
  ];

  // --------------------------------------------------------------------------
  // 2. DETERMINAÇÃO ESPECÍFICA POR PERFIL
  // --------------------------------------------------------------------------

  // ==========================================
  // PERFIL: GESTOR INSTITUCIONAL (Presidência / Mesa)
  // ==========================================
  if (isGestor) {
    const hasManagementDecision = pendingItems.some(
      p => p.type === 'DECISAO' && p.status !== 'RESOLVIDA'
    );
    const managementDecisionItem = pendingItems.find(
      p => p.type === 'DECISAO' && p.status !== 'RESOLVIDA'
    );

    return {
      onboarding: {
        dismissableKey: `onboarding_gestor_${currentOrg.id}`,
        badge: 'Painel da Gestão e Presidência',
        title: 'O que você encontrará aqui',
        roleHeadline: 'Visão executiva e estratégica orientada à Mesa Diretora da Câmara.',
        objective: 'Acompanhar o diagnóstico de governança, deliberar sobre decisões institucionais e assegurar os apoios necessários para a conformidade da Casa.',
        firstStep: 'Consultar a situação atual da governança e identificar as prioridades estruturantes do ciclo.',
        expectedResult: 'Segurança jurídica, relatórios executivos homologados para órgãos de controle e Plano de Evolução com metas claras.',
        actionLabel: 'Ver Situação da Governança',
        actionView: 'OUTPUTS'
      },
      fourQuestions: {
        whereAmI: `Painel Executivo da Gestão da ${currentOrg.name} no Ciclo D1 (${currentOrg.methodologyVersion}).`,
        whatToDoNow: hasManagementDecision
          ? `Deliberar sobre a decisão institucional pendente: "${managementDecisionItem?.title}".`
          : isMaturityValidated
          ? 'Analisar o Retrato Executivo homologado e pactuar os apoios para o Plano de Evolução.'
          : 'Acompanhar a consolidação do diagnóstico pelos setores e facilitação.',
        whyItMatters: 'A governança de dados e a LGPD no Legislativo exigem respaldo da Mesa Diretora para terem eficácia prática.',
        whatWillIGet: 'Um Retrato Executivo oficial da governança e um Plano de Evolução que orienta os investimentos e regulamentos da Câmara.'
      },
      resumeState: {
        title: 'Atenção da Gestão Institucional',
        headline: hasManagementDecision
          ? `Há 1 decisão/apoio da Mesa Diretora que requer atenção: ${managementDecisionItem?.title}`
          : isMaturityValidated
          ? 'Diagnóstico D1 validado formalmente pela facilitação. Prioridades disponíveis para deliberação.'
          : 'A apuração fática com as áreas da Câmara está em andamento pela facilitação.',
        detail: hasManagementDecision
          ? `Responsável registrado: ${managementDecisionItem?.responsible}. Essa decisão destrava a estruturação da governança.`
          : isMaturityValidated
          ? `Nível Homologado: ${integration.humanValidation.validatedLevel.replace('_', ' ')}. Consulte o Retrato Executivo.`
          : 'Você pode consultar a síntese executiva preliminar sem interferir na apuração técnica das portas.',
        badgeText: hasManagementDecision ? 'Decisão Requerida' : isMaturityValidated ? 'Maturidade Validada' : 'Em Andamento',
        badgeVariant: hasManagementDecision ? 'amber' : isMaturityValidated ? 'emerald' : 'sky',
        actionLabel: hasManagementDecision ? 'Ver Decisão & Apoios' : 'Consultar Retrato Executivo',
        actionView: hasManagementDecision ? 'ACTION_PLAN' : 'OUTPUTS'
      },
      recommendedNextStep: {
        title: hasManagementDecision ? 'Deliberar sobre Apoio Institucional' : 'Acompanhar Prioridades Estruturantes',
        description: hasManagementDecision
          ? `Formalizar a indicação do substituto do Encarregado e acolhimento das diretrizes pelo Diretor Geral.`
          : `Revisar o Plano de Evolução D1 para garantir alocação de tempo e recursos aos setores operacionais.`,
        actionLabel: hasManagementDecision ? 'Abrir Plano de Prioridades' : 'Ver Situação da Governança',
        actionView: hasManagementDecision ? 'ACTION_PLAN' : 'OUTPUTS',
        priority: hasManagementDecision ? 'ALTA' : 'NORMAL',
        reason: 'O avanço das capacidades organizacionais depende da liderança institucional da Mesa.'
      },
      stagesProgress
    };
  }

  // ==========================================
  // PERFIL: PARTICIPANTE CONVIDADO (Servidor Setorial)
  // ==========================================
  if (isParticipant) {
    const hasPendingQuestion = pendingRequestsForMe.length > 0;
    const currentQuestion = pendingRequestsForMe[0];

    return {
      onboarding: {
        dismissableKey: `onboarding_participante_${currentOrg.id}`,
        badge: 'Portal de Contribuição Setorial',
        title: 'Você foi convidado para contribuir com a investigação institucional',
        roleHeadline: `Servidor participante do setor: ${currentUser.department}.`,
        objective: 'Esclarecer como ocorrem na prática do seu setor o trâmite de documentos, dados de cidadãos e rotinas operacionais.',
        firstStep: 'Ler a pergunta direcionada ao seu setor e responder apenas sobre o que você executa diretamente.',
        expectedResult: 'Registro autêntico da sua colaboração fática, sem ranqueamento de servidores ou apontamento de culpa.',
        actionLabel: 'Ver Minha Contribuição',
        actionView: 'DISTRIBUTED'
      },
      fourQuestions: {
        whereAmI: `Portal de Contribuição do Servidor na ${currentOrg.name}.`,
        whatToDoNow: hasPendingQuestion
          ? `Responder à questão dirigida: "${currentQuestion.minimalNeutralQuestion}"`
          : 'Suas contribuições solicitadas já foram enviadas. Você pode consultar o histórico ou anexar evidências do setor.',
        whyItMatters: 'O diagnóstico não presume processos ideais; ele precisa conhecer como o trabalho realmente é feito na Câmara.',
        whatWillIGet: 'Processos internos mais claros, seguros e protegidos para o seu setor no dia a dia.'
      },
      resumeState: {
        title: 'Sua Contribuição na Jornada',
        headline: hasPendingQuestion
          ? `Você tem 1 pergunta fática aguardando sua resposta sobre o setor de ${currentUser.department}.`
          : `Suas respostas foram registradas com sucesso e integradas à apuração metodológica.`,
        detail: hasPendingQuestion
          ? `Pergunta sobre a Porta ${currentQuestion.doorId}. Não se preocupe em saber tudo: responda apenas a sua prática direta.`
          : 'Caso encontre modelos ou portarias antigas do seu setor, você pode enviá-las na aba Evidências.',
        badgeText: hasPendingQuestion ? 'Resposta Pendente' : 'Participação Registrada',
        badgeVariant: hasPendingQuestion ? 'sky' : 'emerald',
        actionLabel: hasPendingQuestion ? 'Responder Agora' : 'Acessar Meu Portal',
        actionView: 'DISTRIBUTED'
      },
      recommendedNextStep: {
        title: hasPendingQuestion ? 'Responder Pergunta Dirigida' : 'Revisar Evidências Apresentadas',
        description: hasPendingQuestion
          ? `Esclarecer as rotinas reais do seu setor para que a facilitação registre seu escopo de atuação.`
          : `Verificar se há documentos do seu setor que possam comprovar fluxos operacionais citados.`,
        actionLabel: hasPendingQuestion ? 'Responder Questão' : 'Ver Evidências do Setor',
        actionView: hasPendingQuestion ? 'DISTRIBUTED' : 'EVIDENCES',
        priority: hasPendingQuestion ? 'ALTA' : 'NORMAL',
        reason: 'Sua contribuição com declaração de escopo próprio valida a realidade das práticas.'
      },
      stagesProgress
    };
  }

  // ==========================================
  // PERFIL: INTERLOCUTOR PRINCIPAL / ENCARREGADO
  // ==========================================
  if (isInterlocutor) {
    // Determina onde o Encarregado parou
    let resumeHeadline = '';
    let resumeDetail = '';
    let resumeTargetView: AppView = 'INTERVIEW';
    let resumeTargetDoorId: DoorId = activeDoorId;

    if (doorsRequiringDeepening.length > 0) {
      const target = doorsRequiringDeepening[0];
      resumeTargetDoorId = target;
      resumeTargetView = 'INTERVIEW';
      resumeHeadline = `Você interrompeu o diagnóstico na Porta ${target}, que requer aprofundamento de rotinas.`;
      resumeDetail = `A equipe de facilitação identificou que ${target} precisa de esclarecimentos adicionais e verificação fática com os setores.`;
    } else if (doorsWithPendingVerification.length > 0) {
      const target = doorsWithPendingVerification[0];
      resumeTargetDoorId = target;
      resumeTargetView = 'INTERVIEW';
      resumeHeadline = `A Porta ${target} está explorada, mas possui comprovação documental pendente.`;
      resumeDetail = `Apresente a evidência formal (ex: portaria ou documento do processo) para que o Facilitador conclua a verificação.`;
    } else if (doorsInDiscovery.length > 0) {
      const target = doorsInDiscovery[0];
      resumeTargetDoorId = target;
      resumeTargetView = 'INTERVIEW';
      resumeHeadline = `Você está no percurso da Porta ${target}, atualmente em descoberta.`;
      resumeDetail = `Continue a conversa fática para mapear a governança e as práticas vigentes na Câmara.`;
    } else {
      resumeHeadline = 'As 6 portas foram percorridas. Há pontos de aprofundamento e pendências sob sua articulação.';
      resumeDetail = 'Acompanhe os documentos comprobatórios e as pendências solicitadas pela facilitação.';
      resumeTargetView = blockingPendings.length > 0 ? 'PENDING' : 'INTERVIEW';
    }

    // Próximo passo recomendado determinístico
    let nextStepTitle = 'Continuar Diagnóstico das Portas';
    let nextStepDesc = 'Prosseguir com a apuração fática da governança.';
    let nextStepView: AppView = 'INTERVIEW';
    let nextStepDoor: DoorId = resumeTargetDoorId;
    let nextStepPriority: 'ALTA' | 'NORMAL' | 'URGENTE' = 'NORMAL';

    if (blockingPendings.length > 0) {
      const bp = blockingPendings[0];
      nextStepTitle = `Tratar Pendência Bloqueadora (${bp.doorId})`;
      nextStepDesc = `Sanar "${bp.title}". Bloqueios probatórios impedem a validação da maturidade.`;
      nextStepView = 'PENDING';
      nextStepDoor = bp.doorId;
      nextStepPriority = 'URGENTE';
    } else if (doorsRequiringDeepening.length > 0) {
      nextStepTitle = `Aprofundar Porta ${doorsRequiringDeepening[0]}`;
      nextStepDesc = `Responder às dúvidas fáticas identificadas na facilitação sobre os fluxos entre áreas.`;
      nextStepView = 'INTERVIEW';
      nextStepDoor = doorsRequiringDeepening[0];
      nextStepPriority = 'ALTA';
    } else if (doorsWithPendingVerification.length > 0) {
      nextStepTitle = `Apresentar Evidência da Porta ${doorsWithPendingVerification[0]}`;
      nextStepDesc = `Localizar e anexar documento de suporte para comprovação probatória.`;
      nextStepView = 'EVIDENCES';
      nextStepPriority = 'ALTA';
    }

    return {
      onboarding: {
        dismissableKey: `onboarding_interlocutor_${currentOrg.id}`,
        badge: 'Seu Papel nesta Jornada',
        title: 'Você é o principal ponto de articulação do diagnóstico institucional',
        roleHeadline: 'Encarregado de Dados / Interlocutor Principal da Câmara.',
        objective: 'Coordenar a descoberta fática de como a Câmara lida com dados, articulando respostas da Procuradoria e dos setores operacionais.',
        firstStep: 'Iniciar o diagnóstico das 6 Portas D1. Não é necessário conhecer sozinho todas as respostas: você poderá solicitar apoio de outros setores sempre que necessário.',
        expectedResult: 'Retrato Executivo fático validado, clareza das responsabilidades e Plano de Evolução para proteção da instituição.',
        actionLabel: 'Continuar Diagnóstico',
        actionView: 'INTERVIEW',
        actionDoorId: resumeTargetDoorId
      },
      fourQuestions: {
        whereAmI: `Diagnóstico Institucional D1 da ${currentOrg.name} (${exploredDoorsCount}/6 portas percorridas).`,
        whatToDoNow: nextStepDesc,
        whyItMatters: 'O diagnóstico não busca avaliar individualmente o Encarregado, mas registrar a maturidade institucional para estruturar a Casa.',
        whatWillIGet: 'Um Retrato Executivo homologado e um Plano de Evolução detalhado com responsáveis e prazos.'
      },
      resumeState: {
        title: 'Continue de onde parou',
        headline: resumeHeadline,
        detail: `${resumeDetail} • Situação: ${blockingPendings.length} pendência(s) bloqueadora(s) e ${openPendings.length} pendência(s) no ciclo.`,
        badgeText: blockingPendings.length > 0 ? 'Bloqueio Ativo' : doorsRequiringDeepening.length > 0 ? 'Requer Aprofundamento' : 'Em Descoberta',
        badgeVariant: blockingPendings.length > 0 ? 'rose' : doorsRequiringDeepening.length > 0 ? 'amber' : 'emerald',
        actionLabel: 'Continuar Diagnóstico',
        actionView: resumeTargetView,
        actionDoorId: resumeTargetDoorId
      },
      recommendedNextStep: {
        title: nextStepTitle,
        description: nextStepDesc,
        actionLabel: 'Avançar nesta Etapa',
        actionView: nextStepView,
        actionDoorId: nextStepDoor,
        priority: nextStepPriority,
        reason: 'Evita retrabalho mental e direciona diretamente ao gargalo fático atual.'
      },
      stagesProgress
    };
  }

  // ==========================================
  // PERFIL: FACILITADOR METODOLÓGICO
  // ==========================================
  // Determinação para o Facilitador (Dra. Helena Brandão)
  let facilResumeHeadline = '';
  let facilResumeDetail = '';
  let facilTargetView: AppView = 'INTERVIEW';
  let facilTargetDoor: DoorId = activeDoorId;

  if (blockingPendings.length > 0) {
    const bp = blockingPendings[0];
    facilTargetView = 'PENDING';
    facilTargetDoor = bp.doorId;
    facilResumeHeadline = `Você interrompeu a facilitação com ${blockingPendings.length} pendência bloqueadora ativa (${bp.doorId}).`;
    facilResumeDetail = `"${bp.title}". Essa pendência impede a validação sustentada do nível de maturidade.`;
  } else if (activeDivergences.length > 0) {
    const div = activeDivergences[0];
    facilTargetView = 'FACILITATOR_PANEL';
    facilTargetDoor = div.doorId;
    facilResumeHeadline = `Há 1 divergência operacional aberta na Porta ${div.doorId}: "${div.title}".`;
    facilResumeDetail = 'Conciliar as falas divergentes antes de atribuir suficiência à capacidade correspondente.';
  } else if (doorsRequiringDeepening.length > 0) {
    const d = doorsRequiringDeepening[0];
    facilTargetView = 'INTERVIEW';
    facilTargetDoor = d;
    facilResumeHeadline = `A Porta ${d} requer aprofundamento probatório com os setores da Câmara.`;
    facilResumeDetail = 'Aplicar perguntas adaptativas e registrar unidades de informação complementares.';
  } else if (!isMaturityValidated) {
    facilTargetView = 'INTEGRATION';
    facilResumeHeadline = 'Investigação fática percorrida. Análise de integração C1–C6 aguardando validação metodológica.';
    facilResumeDetail = 'Conferir o rationale de sustentação de cada capacidade e registrar a validação humana formal.';
  } else if (!hasSnapshot) {
    facilTargetView = 'SNAPSHOT';
    facilResumeHeadline = 'Maturidade validada pelo Facilitador. Snapshot D1 pronto para registro imutável.';
    facilResumeDetail = 'Formalizar o marco temporal auditável do ciclo para homologação da Mesa Diretora.';
  } else {
    facilTargetView = 'ACTION_PLAN';
    facilResumeHeadline = 'Ciclo D1 consolidado e Snapshot homologado.';
    facilResumeDetail = 'Acompanhar a execução das ações estruturantes e o indicador experimental de tração.';
  }

  // Próximo passo recomendado determinístico do Facilitador
  let facNextTitle = '';
  let facNextDesc = '';
  let facNextView: AppView = 'INTERVIEW';
  let facNextDoor: DoorId = facilTargetDoor;
  let facNextPriority: 'ALTA' | 'NORMAL' | 'URGENTE' = 'NORMAL';

  if (blockingPendings.length > 0) {
    facNextTitle = 'Tratar Pendência Bloqueadora';
    facNextDesc = `Conferir a amostra documental para sanar a pendência na Porta ${blockingPendings[0].doorId}.`;
    facNextView = 'PENDING';
    facNextDoor = blockingPendings[0].doorId;
    facNextPriority = 'URGENTE';
  } else if (activeDivergences.length > 0) {
    facNextTitle = 'Conciliar Divergência Operacional';
    facNextDesc = `Avaliar contradição entre relatos na Porta ${activeDivergences[0].doorId} no Painel de Facilitação.`;
    facNextView = 'FACILITATOR_PANEL';
    facNextDoor = activeDivergences[0].doorId;
    facNextPriority = 'ALTA';
  } else if (doorsRequiringDeepening.length > 0) {
    facNextTitle = `Aprofundar Porta ${doorsRequiringDeepening[0]}`;
    facNextDesc = 'Conduzir sondagem complementar sobre fluxos de atendimento com o Protocolo e TI.';
    facNextView = 'INTERVIEW';
    facNextDoor = doorsRequiringDeepening[0];
    facNextPriority = 'ALTA';
  } else if (!isMaturityValidated) {
    facNextTitle = 'Validar Análise Metodológica C1–C6';
    facNextDesc = 'Revisar matriz de capacidades e registrar validação humana de maturidade.';
    facNextView = 'INTEGRATION';
    facNextPriority = 'ALTA';
  } else if (!hasSnapshot) {
    facNextTitle = 'Registrar Snapshot D1 Imutável';
    facNextDesc = 'Criar marco temporal com hash auditável e travar os dados do ciclo.';
    facNextView = 'SNAPSHOT';
    facNextPriority = 'ALTA';
  } else {
    facNextTitle = 'Acompanhar Plano de Evolução';
    facNextDesc = 'Monitorar o andamento das ações pactuadas com a administração da Câmara.';
    facNextView = 'ACTION_PLAN';
    facNextPriority = 'NORMAL';
  }

  return {
    onboarding: {
      dismissableKey: `onboarding_facilitador_${currentOrg.id}`,
      badge: 'Ambiente de Facilitação Metodológica',
      title: 'Condução do Ciclo D1 — Governança e Responsabilidades',
      roleHeadline: 'Facilitador Metodológico Independente.',
      objective: 'Conduzir a apuração investigativa não indutiva, avaliar a suficiência probatória, conciliar divergências e validar o nível de maturidade sem pontuação cega.',
      firstStep: 'Avaliar as portas em andamento, verificar as evidências apresentadas e tratar eventuais pendências bloqueadoras.',
      expectedResult: 'Diagnóstico autêntico, sem compensação de carências estruturais, homologado com registro Snapshot imutável.',
      actionLabel: 'Continuar Investigação',
      actionView: facilTargetView,
      actionDoorId: facilTargetDoor
    },
    fourQuestions: {
      whereAmI: `Ciclo D1 da ${currentOrg.name} (${exploredDoorsCount}/6 portas percorridas, ${blockingPendings.length} bloqueios ativos).`,
      whatToDoNow: facNextDesc,
      whyItMatters: 'A metodologia D1 exige comprovação fática sem atalhos automáticos: 6 portas percorridas não significam diagnóstico concluído.',
      whatWillIGet: 'Uma matriz de capacidades C1–C6 plenamente fundamentada em evidências reais e livre de vulnerabilidades probatórias.'
    },
    resumeState: {
      title: 'Continuar de onde parou',
      headline: facilResumeHeadline,
      detail: facilResumeDetail,
      badgeText: blockingPendings.length > 0 ? '1 Bloqueio Ativo' : activeDivergences.length > 0 ? 'Divergência Aberta' : 'Em Aprofundamento',
      badgeVariant: blockingPendings.length > 0 ? 'rose' : activeDivergences.length > 0 ? 'amber' : 'sky',
      actionLabel: 'Retomar Análise Metodológica',
      actionView: facilTargetView,
      actionDoorId: facilTargetDoor
    },
    recommendedNextStep: {
      title: facNextTitle,
      description: facNextDesc,
      actionLabel: 'Executar Próximo Passo',
      actionView: facNextView,
      actionDoorId: facNextDoor,
      priority: facNextPriority,
      reason: 'Assegura a cadeia probatória e a integridade da consolidação dimensional.'
    },
    stagesProgress
  };
}
