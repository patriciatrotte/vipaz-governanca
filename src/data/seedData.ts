import { 
  Organization, 
  EvaluationCycle,
  UserProfile, 
  DoorId, 
  DoorStatus, 
  QuestionInstance, 
  OriginalResponse, 
  DontKnowRecord, 
  InformationUnit, 
  ProbingRecord, 
  PedagogicalIntervention, 
  DistributedRequest, 
  DivergenceRecord, 
  EvidenceRecord, 
  EvidenceLink,
  AIAnalysisRecord, 
  PendingItem, 
  DimensionalIntegration, 
  SnapshotD1, 
  ValidatedGap, 
  EvolutionAction, 
  ExperimentalIndicatorFeedback, 
  MethodologicalDiaryEntry,
  MethodologicalTelemetry
} from '../types';

export const SEED_CYCLE_VILA_ESPERANCA: EvaluationCycle = {
  id: 'ciclo-2026-1',
  organizationId: 'org-camara-vila-esperanca-01',
  name: 'Diagnóstico e Evolução Piloto D1 (2026.1)',
  dimension: 'D1',
  methodologyVersion: 'D1 v1.0',
  cycleType: 'INITIAL_ASSESSMENT',
  status: 'EM_ANDAMENTO',
  createdAt: '2026-02-10T09:00:00.000Z',
  updatedAt: '2026-02-18T14:30:00.000Z',
  interviewCompletedAt: '2026-02-12T12:00:00.000Z',
  isDemo: true
};

export const SEED_ORGANIZATION: Organization = {
  id: 'org-camara-vila-esperanca-01',
  name: 'Câmara Municipal de Vila Esperança',
  municipality: 'Vila Esperança',
  state: 'SP',
  type: 'CAMARA_MUNICIPAL',
  vertical: 'Poder Público Municipal — Câmara Municipal',
  mainInterlocutorName: 'Dr. Carlos Eduardo Menezes',
  mainInterlocutorRole: 'Procurador Jurídico e Encarregado Designado',
  mainInterlocutorEmail: 'carlos.menezes@camaravilaesperanca.sp.gov.br',
  cycleId: 'ciclo-2026-1',
  activeCycleName: 'Diagnóstico e Evolução Piloto D1 (2026.1)',
  methodologyVersion: 'D1 v1.0',
  createdAt: '2026-02-10T09:00:00.000Z',
  isDemo: true,
  cycleIds: ['ciclo-2026-1']
};

export const SEED_USERS: UserProfile[] = [
  {
    id: 'user-facilitador-01',
    name: 'Dra. Helena Brandão',
    role: 'FACILITADOR',
    email: 'helena.brandao@metodologia.org',
    department: 'Equipe Metodológica do Piloto',
    organizationId: 'org-camara-vila-esperanca-01'
  },
  {
    id: 'user-interlocutor-01',
    name: 'Dr. Carlos Eduardo Menezes',
    role: 'INTERLOCUTOR_PRINCIPAL',
    email: 'carlos.menezes@camaravilaesperanca.sp.gov.br',
    department: 'Procuradoria Jurídica / Encarregado Designado',
    organizationId: 'org-camara-vila-esperanca-01'
  },
  {
    id: 'user-gestor-01',
    name: 'Marcos Vinícius Prado',
    role: 'GESTOR_INSTITUCIONAL',
    email: 'marcos.prado@camaravilaesperanca.sp.gov.br',
    department: 'Diretoria Geral Administrativa',
    organizationId: 'org-camara-vila-esperanca-01'
  },
  {
    id: 'user-ti-01',
    name: 'Rodrigo Santoro Alencar',
    role: 'PARTICIPANTE',
    email: 'rodrigo.ti@camaravilaesperanca.sp.gov.br',
    department: 'Departamento de Tecnologia da Informação',
    organizationId: 'org-camara-vila-esperanca-01'
  },
  {
    id: 'user-protocolo-01',
    name: 'Sônia Regina Silveira',
    role: 'PARTICIPANTE',
    email: 'sonia.protocolo@camaravilaesperanca.sp.gov.br',
    department: 'Setor de Protocolo e Atendimento ao Cidadão',
    organizationId: 'org-camara-vila-esperanca-01'
  }
];

export const INITIAL_DOOR_STATUSES: Record<DoorId, DoorStatus> = {
  'D1.1': 'SUFICIENTEMENTE_EXPLORADA',
  'D1.2': 'SUFICIENTEMENTE_EXPLORADA_COMPROVACAO_PENDENTE',
  'D1.3': 'SUFICIENTEMENTE_EXPLORADA',
  'D1.4': 'REQUER_APROFUNDAMENTO',
  'D1.5': 'SUFICIENTEMENTE_EXPLORADA',
  'D1.6': 'SUFICIENTEMENTE_EXPLORADA'
};

export const SEED_QUESTION_INSTANCES: QuestionInstance[] = [
  {
    id: 'qi-d1-1',
    doorId: 'D1.1',
    text: 'Hoje, como a governança de privacidade e proteção de dados está organizada na Câmara?',
    respondentName: 'Dr. Carlos Eduardo Menezes',
    respondentRole: 'Procurador Jurídico e Encarregado de Dados',
    sessionId: 'sess-entrevista-01',
    timestamp: '2026-02-12T10:05:00.000Z',
    modality: 'ENTREVISTA'
  },
  {
    id: 'qi-d1-2',
    doorId: 'D1.2',
    text: 'Quando você precisa atuar como Encarregado, como isso acontece na prática?',
    respondentName: 'Dr. Carlos Eduardo Menezes',
    respondentRole: 'Procurador Jurídico e Encarregado de Dados',
    sessionId: 'sess-entrevista-01',
    timestamp: '2026-02-12T10:35:00.000Z',
    modality: 'ENTREVISTA'
  },
  {
    id: 'qi-d1-3',
    doorId: 'D1.3',
    text: 'Quando surge uma questão envolvendo dados pessoais, quem além do Encarregado precisa agir para que ela seja resolvida?',
    respondentName: 'Dr. Carlos Eduardo Menezes',
    respondentRole: 'Procurador Jurídico e Encarregado de Dados',
    sessionId: 'sess-entrevista-01',
    timestamp: '2026-02-12T11:15:00.000Z',
    modality: 'ENTREVISTA'
  },
  {
    id: 'qi-d1-4',
    doorId: 'D1.4',
    text: 'Quando uma questão de privacidade envolve mais de uma área ou pessoa da Câmara, como vocês se organizam para resolvê-la?',
    respondentName: 'Dr. Carlos Eduardo Menezes',
    respondentRole: 'Procurador Jurídico e Encarregado de Dados',
    sessionId: 'sess-entrevista-01',
    timestamp: '2026-02-12T14:10:00.000Z',
    modality: 'ENTREVISTA'
  },
  {
    id: 'qi-d1-5',
    doorId: 'D1.5',
    text: 'Quando uma questão de privacidade depende de decisão, apoio ou recurso da gestão, como isso acontece na Câmara?',
    respondentName: 'Dr. Carlos Eduardo Menezes',
    respondentRole: 'Procurador Jurídico e Encarregado de Dados',
    sessionId: 'sess-entrevista-01',
    timestamp: '2026-02-12T15:00:00.000Z',
    modality: 'ENTREVISTA'
  },
  {
    id: 'qi-d1-6',
    doorId: 'D1.6',
    text: 'Quando alguma ação relacionada à privacidade fica definida, como vocês sabem depois se ela foi realizada ou ainda está pendente?',
    respondentName: 'Dr. Carlos Eduardo Menezes',
    respondentRole: 'Procurador Jurídico e Encarregado de Dados',
    sessionId: 'sess-entrevista-01',
    timestamp: '2026-02-12T15:45:00.000Z',
    modality: 'ENTREVISTA'
  }
];

export const SEED_RESPONSES: OriginalResponse[] = [
  {
    id: 'resp-d1-1',
    questionInstanceId: 'qi-d1-1',
    doorId: 'D1.1',
    respondentId: 'user-interlocutor-01',
    respondentName: 'Dr. Carlos Eduardo Menezes',
    respondentRole: 'Encarregado de Dados e Procurador',
    originalText: 'A Câmara publicou em 2023 uma portaria me designando como Encarregado de Dados, acumulando com minhas funções na Procuradoria. Existe um Comitê de LGPD criado no papel, mas nós não temos reuniões periódicas fixas; nos reunimos quando surge um parecer complexo ou quando a Mesa Diretora solicita algum posicionamento.',
    timestamp: '2026-02-12T10:12:00.000Z',
    modality: 'SESSAO_CONDUZIDA'
  },
  {
    id: 'resp-d1-2',
    questionInstanceId: 'qi-d1-2',
    doorId: 'D1.2',
    respondentId: 'user-interlocutor-01',
    respondentName: 'Dr. Carlos Eduardo Menezes',
    respondentRole: 'Encarregado de Dados e Procurador',
    originalText: 'Eu atuo principalmente respondendo consultas jurídicas que chegam dos setores e analisando cláusulas de contratos de licitação. Não tenho dedicação exclusiva nem equipe de apoio dedicada. Se eu entrar em férias ou me afastar, não há um substituto formal designado para a função de Encarregado. Tenho acesso direto ao Diretor Geral para despachar.',
    timestamp: '2026-02-12T10:45:00.000Z',
    modality: 'SESSAO_CONDUZIDA'
  },
  {
    id: 'resp-d1-3',
    questionInstanceId: 'qi-d1-3',
    doorId: 'D1.3',
    respondentId: 'user-interlocutor-01',
    respondentName: 'Dr. Carlos Eduardo Menezes',
    respondentRole: 'Encarregado de Dados e Procurador',
    originalText: 'Depende do assunto. Quando é sistema de folha ou e-mail, acionamos a TI (o Rodrigo). Quando é contrato novo, a comissão de licitação me manda a minuta. Mas se for sobre a política de descarte de backups antigos ou logs de acesso na TI, não sei dizer como eles controlam isso na prática, pois essa rotina fica restrita ao setor deles.',
    timestamp: '2026-02-12T11:24:00.000Z',
    modality: 'SESSAO_CONDUZIDA'
  },
  {
    id: 'resp-d1-4',
    questionInstanceId: 'qi-d1-4',
    doorId: 'D1.4',
    respondentId: 'user-interlocutor-01',
    respondentName: 'Dr. Carlos Eduardo Menezes',
    respondentRole: 'Encarregado de Dados e Procurador',
    originalText: 'Geralmente conversamos por WhatsApp ou eu ligo diretamente para o chefe do setor. No caso de pedidos de cidadãos pelo Portal da Transparência, o Protocolo me avisa por e-mail com a cópia da solicitação, e eu redijo o despacho orientativo para o RH ou TI responder.',
    timestamp: '2026-02-12T14:18:00.000Z',
    modality: 'SESSAO_CONDUZIDA'
  },
  {
    id: 'resp-d1-5',
    questionInstanceId: 'qi-d1-5',
    doorId: 'D1.5',
    respondentId: 'user-interlocutor-01',
    respondentName: 'Dr. Carlos Eduardo Menezes',
    respondentRole: 'Encarregado de Dados e Procurador',
    originalText: 'Eu preparo um relatório técnico ou minuta de resolução e levo direto para o Diretor Geral, Marcos Prado. Ele costuma acatar minhas recomendações e pautar na Mesa Diretora. No ano passado conseguimos aprovação para contratar consultoria externa de segurança cibernética dessa forma.',
    timestamp: '2026-02-12T15:10:00.000Z',
    modality: 'SESSAO_CONDUZIDA'
  },
  {
    id: 'resp-d1-6',
    questionInstanceId: 'qi-d1-6',
    doorId: 'D1.6',
    respondentId: 'user-interlocutor-01',
    respondentName: 'Dr. Carlos Eduardo Menezes',
    respondentRole: 'Encarregado de Dados e Procurador',
    originalText: 'Hoje eu controlo as tarefas no meu próprio bloco de notas e na minha caixa de entrada de e-mails. Não temos uma planilha compartilhada nem reuniões mensais para verificar o status das ações de privacidade. Se eu não cobrar individualmente o setor, muitas vezes a ação fica parada sem que a gestão saiba.',
    timestamp: '2026-02-12T15:52:00.000Z',
    modality: 'SESSAO_CONDUZIDA'
  }
];

// Instância do "NÃO SEI" - Registrada estritamente conforme metodologia
export const SEED_DONT_KNOW_RECORD: DontKnowRecord = {
  id: 'dk-01',
  responseId: 'resp-d1-3',
  doorId: 'D1.3',
  respondentName: 'Dr. Carlos Eduardo Menezes',
  reasonCategory: 'FORA_DA_VISIBILIDADE',
  justificationNotes: 'O respondente declarou desconhecer a rotina interna de backup e logs da TI. Isto representa limitação de visibilidade do respondente e NÃO ausência de capacidade institucional da Câmara. Não classificar como N1 nem como gap.',
  nextStepAction: 'CONVITE_OUTRA_FONTE',
  timestamp: '2026-02-12T11:28:00.000Z'
};

// Unidades de informação extraídas com fontes e alcances
export const SEED_INFORMATION_UNITS: InformationUnit[] = [
  {
    id: 'uinfo-01',
    responseId: 'resp-d1-1',
    doorId: 'D1.1',
    statement: 'Existe portaria de 2023 designando o Procurador como Encarregado de Dados da Câmara.',
    sourceName: 'Dr. Carlos Eduardo Menezes',
    sourceRole: 'Encarregado de Dados',
    scope: 'ACAO_PROPRIA',
    extractedBy: 'IA_SUGESTAO',
    validationStatus: 'VALIDADO',
    relatedCapacity: 'C1',
    mentionedActors: ['Procurador Jurídico', 'Mesa Diretora'],
    mentionedEvidenceTitles: ['Portaria nº 014/2023'],
    timestamp: '2026-02-12T10:15:00.000Z'
  },
  {
    id: 'uinfo-02',
    responseId: 'resp-d1-1',
    doorId: 'D1.1',
    statement: 'Comitê de LGPD foi formalizado em ato normativo, porém não realiza reuniões periódicas rotineiras.',
    sourceName: 'Dr. Carlos Eduardo Menezes',
    sourceRole: 'Encarregado de Dados',
    scope: 'CONHECIMENTO_DIRETO',
    extractedBy: 'IA_SUGESTAO',
    validationStatus: 'VALIDADO',
    relatedCapacity: 'C1',
    mentionedActors: ['Comitê de LGPD'],
    timestamp: '2026-02-12T10:16:00.000Z'
  },
  {
    id: 'uinfo-03',
    responseId: 'resp-d1-2',
    doorId: 'D1.2',
    statement: 'O Encarregado não possui equipe de apoio dedicada e acumula integralmente a função com a Procuradoria.',
    sourceName: 'Dr. Carlos Eduardo Menezes',
    sourceRole: 'Encarregado de Dados',
    scope: 'ACAO_PROPRIA',
    extractedBy: 'IA_SUGESTAO',
    validationStatus: 'VALIDADO',
    relatedCapacity: 'C2',
    timestamp: '2026-02-12T10:48:00.000Z'
  },
  {
    id: 'uinfo-04',
    responseId: 'resp-d1-2',
    doorId: 'D1.2',
    statement: 'Não há substituto formal designado para cobrir férias ou afastamentos do Encarregado.',
    sourceName: 'Dr. Carlos Eduardo Menezes',
    sourceRole: 'Encarregado de Dados',
    scope: 'CONHECIMENTO_DIRETO',
    extractedBy: 'IA_SUGESTAO',
    validationStatus: 'VALIDADO',
    relatedCapacity: 'C2',
    timestamp: '2026-02-12T10:49:00.000Z'
  },
  {
    id: 'uinfo-05',
    responseId: 'resp-d1-4',
    doorId: 'D1.4',
    statement: 'O Encarregado informou que o Protocolo o avisa por e-mail quando chegam pedidos de munícipes.',
    sourceName: 'Dr. Carlos Eduardo Menezes',
    sourceRole: 'Encarregado de Dados',
    scope: 'PERCEPCAO_SOBRE_TERCEIRO',
    extractedBy: 'IA_SUGESTAO',
    validationStatus: 'AJUSTADO',
    relatedCapacity: 'C4',
    mentionedActors: ['Setor de Protocolo', 'RH', 'TI'],
    timestamp: '2026-02-12T14:22:00.000Z'
  },
  {
    id: 'uinfo-06',
    responseId: 'resp-d1-5',
    doorId: 'D1.5',
    statement: 'O Encarregado possui canal direto com o Diretor Geral, que pauta recomendações na Mesa Diretora com histórico de aprovação.',
    sourceName: 'Dr. Carlos Eduardo Menezes',
    sourceRole: 'Encarregado de Dados',
    scope: 'ACAO_PROPRIA',
    extractedBy: 'IA_SUGESTAO',
    validationStatus: 'VALIDADO',
    relatedCapacity: 'C5',
    mentionedActors: ['Diretor Geral', 'Mesa Diretora'],
    timestamp: '2026-02-12T15:15:00.000Z'
  },
  {
    id: 'uinfo-07',
    responseId: 'resp-d1-6',
    doorId: 'D1.6',
    statement: 'O acompanhamento de pendências ocorre individualmente por cobrança informal do Encarregado, sem rotina institucionalizada compartilhada.',
    sourceName: 'Dr. Carlos Eduardo Menezes',
    sourceRole: 'Encarregado de Dados',
    scope: 'ACAO_PROPRIA',
    extractedBy: 'IA_SUGESTAO',
    validationStatus: 'VALIDADO',
    relatedCapacity: 'C6',
    timestamp: '2026-02-12T15:55:00.000Z'
  }
];

// Sondagem adaptativa realizada
export const SEED_PROBINGS: ProbingRecord[] = [
  {
    id: 'prb-01',
    doorId: 'D1.2',
    origin: 'IA_SUGERIDA',
    reason: 'Investigar se o acúmulo de função na Procuradoria acarreta sobrecarga ou conflito de interesses na prática.',
    suggestedQuestionText: 'Na sua rotina, o acúmulo de funções entre Procuradoria e Encarregado costuma gerar escassez de tempo ou situações de dúvida sobre prioridades?',
    questionEffectivelyAsked: 'Na sua rotina prática, você consegue dedicar tempo regular às questões de privacidade ou a rotina da Procuradoria consome a maior parte do expediente?',
    responseText: 'A rotina da Procuradoria é pesada, com prazos judiciais. Dedico em média 2 a 3 horas por semana à privacidade, e mais quando há algum contrato urgente.',
    relatedCriterionOrCapacity: 'C2 - Sustentação do Encarregado',
    timestamp: '2026-02-12T10:50:00.000Z'
  },
  {
    id: 'prb-02',
    doorId: 'D1.3',
    origin: 'FACILITADOR_CRIADA',
    reason: 'Identificar papéis funcionais na contratação de fornecedores (DECIDE / ORIENTA / EXECUTA).',
    questionEffectivelyAsked: 'Quando um novo software é contratado para a Câmara, quem decide os requisitos de segurança e quem avalia a conformidade com a LGPD?',
    responseText: 'A TI elabora o termo de referência técnico, eu como Encarregado avalio a minuta jurídica, e a Mesa Diretora autoriza a contratação.',
    relatedCriterionOrCapacity: 'C3 - Distribuição',
    timestamp: '2026-02-12T11:30:00.000Z'
  }
];

// Intervenção pedagógica realizada
export const SEED_PEDAGOGICAL_INTERVENTIONS: PedagogicalIntervention[] = [
  {
    id: 'ped-01',
    doorId: 'D1.3',
    concept: 'Distribuição de Responsabilidades em Privacidade',
    reason: 'O respondente hesitou inicialmente por pensar que apenas o Encarregado tinha obrigações perante a LGPD na Câmara.',
    contentPresented: 'No setor público municipal, a governança de privacidade não é um encargo isolado do Encarregado. Ela se divide em funções: quem decide (Mesa/Diretoria), quem orienta (Encarregado), quem executa (RH, TI, Compras) e quem guarda os dados.',
    concreteExample: 'Exemplo: O RH é quem coleta documentos dos servidores e aplica a política de retenção com o apoio do Encarregado.',
    followUpQuestion: 'Considerando essa divisão prática, além do seu trabalho orientativo, quais outros setores executam rotinas com dados pessoais de cidadãos ou servidores?',
    previousResponseText: 'Eu acho que sou só eu mesmo cuidando de privacidade na Câmara.',
    subsequentResponseText: 'Ah, compreendi. Sendo assim, o RH lida diretamente com os dados dos servidores e a TI opera os sistemas municipais.',
    timestamp: '2026-02-12T11:18:00.000Z'
  }
];

// Investigação distribuída / solicitação à fonte externa
export const SEED_DISTRIBUTED_REQUESTS: DistributedRequest[] = [
  {
    id: 'dist-01',
    doorId: 'D1.3',
    targetPersonName: 'Rodrigo Santoro Alencar',
    targetDepartment: 'Departamento de TI',
    reasonType: 'COMPLEMENTACAO',
    minimalNeutralQuestion: 'No âmbito do Departamento de Tecnologia da Informação, como estão organizadas atualmente as rotinas de backup, descarte e controle de acessos a sistemas com dados pessoais na Câmara?',
    contextGiven: 'A Câmara está realizando o diagnóstico metodológico de governança de dados para mapear as práticas operacionais existentes.',
    status: 'RESPONDIDA',
    submittedResponse: {
      text: 'Os backups do banco de dados do Legislativo são diários e automatizados em nuvem governamental contratada. Temos logs de acesso habilitados no servidor local, retidos por 6 meses. O descarte físico de máquinas segue laudo de desmagnetização emitido por empresa especializada.',
      submittedAt: '2026-02-13T09:30:00.000Z',
      providedScope: 'ACAO_PROPRIA',
      evidencesMentioned: ['Contrato de Backup Cloud nº 008/2024', 'Relatório de Logs de Auditoria']
    },
    createdAt: '2026-02-12T11:35:00.000Z'
  },
  {
    id: 'dist-02',
    doorId: 'D1.4',
    targetPersonName: 'Sônia Regina Silveira',
    targetDepartment: 'Setor de Protocolo e Atendimento ao Cidadão',
    reasonType: 'VALIDACAO',
    minimalNeutralQuestion: 'Quando um cidadão protocola um requerimento ou dúvida mencionando a LGPD ou seus dados pessoais no balcão ou no sistema de protocolo, qual é o fluxo que o Protocolo segue para tramitar esse pedido?',
    contextGiven: 'Mapeamento dos fluxos de atendimento ao munícipe no piloto de governança.',
    status: 'RESPONDIDA',
    submittedResponse: {
      text: 'Nós autuamos o processo no sistema eletrônico 1Doc e enviamos direto para a Diretoria Administrativa despachar. Nós não temos procedimento de enviar e-mail avulso para o Dr. Carlos da Procuradoria, a não ser quando o Diretor Geral determina que seja aberto parecer.',
      submittedAt: '2026-02-13T11:10:00.000Z',
      providedScope: 'ACAO_PROPRIA',
      evidencesMentioned: ['Fluxo padrão 1Doc']
    },
    createdAt: '2026-02-12T14:30:00.000Z'
  }
];

// Registro de DIVERGÊNCIA
export const SEED_DIVERGENCE: DivergenceRecord = {
  id: 'div-01',
  doorId: 'D1.4',
  title: 'Tramitação de requerimentos de titulares entre Protocolo e Encarregado',
  description: 'Incompatibilidade entre a fala do Encarregado (que afirmou que o Protocolo o notifica diretamente por e-mail) e a fala da Chefe de Protocolo (que afirmou que envia o processo eletrônico exclusivamente à Diretoria Administrativa, sem notificar o Encarregado).',
  sourceA: {
    name: 'Dr. Carlos Eduardo Menezes (Encarregado)',
    statement: 'No caso de pedidos de cidadãos, o Protocolo me avisa por e-mail com a cópia da solicitação.',
    scope: 'PERCEPCAO_SOBRE_TERCEIRO',
    responseId: 'resp-d1-4'
  },
  sourceB: {
    name: 'Sônia Regina Silveira (Protocolo)',
    statement: 'Nós autuamos no sistema 1Doc e enviamos direto para a Diretoria. Não temos procedimento de enviar e-mail para o Encarregado.',
    scope: 'ACAO_PROPRIA',
    responseId: 'dist-02'
  },
  status: 'EM_ANALISE',
  analysisNotes: 'Divergência mantida em análise. A IA não pode arbitrar qual versão é verdadeira nem fundir os relatos. A evidência dos chamados do sistema 1Doc indica que os pedidos ficam na fila geral da Diretoria antes de chegar ao Encarregado.',
  resolvedAt: undefined
};

// Evidências com suficiências diferentes (Regra estrita de suficiência!)
export const SEED_EVIDENCES: EvidenceRecord[] = [
  {
    id: 'ev-01',
    title: 'Portaria nº 014/2023 - Designação do Encarregado pelo Tratamento de Dados Pessoais',
    type: 'PORTARIA',
    origin: 'Diário Oficial da Câmara Municipal de Vila Esperança, Edição 412, p. 3',
    indicatedBy: 'Dr. Carlos Eduardo Menezes',
    date: '2023-05-18',
    status: 'VERIFICADA',
    verifierName: 'Dra. Helena Brandão (Facilitador)',
    verifiedAt: '2026-02-12T16:00:00.000Z',
    sufficiencyNotes: 'EVIDÊNCIA SUFICIENTE para demonstrar a designação formal do Encarregado (C1 - Estruturação). Contudo, é INSUFICIENTE para comprovar condições práticas, tempo disponível ou infraestrutura de atuação do Encarregado (C2). Designação ≠ Condições de atuação.',
    limitations: 'Não estabelece carga horária dedicada, substituto em afastamentos, nem recursos orçamentários específicos.',
    relatedCapacities: ['C1', 'C2'],
    sensitivity: 'PUBLICA',
    aiUsageRule: 'AUTORIZADO_RESUMO',
    fileAttachmentName: 'Portaria_014_2023_Designacao_Encarregado.pdf'
  },
  {
    id: 'ev-02',
    title: 'Despacho da Diretoria Geral no Memorando nº 042/2025 (Aprovação de Consultoria)',
    type: 'RELATORIO',
    origin: 'Processo Administrativo nº 109/2025',
    indicatedBy: 'Dr. Carlos Eduardo Menezes',
    date: '2025-11-20',
    status: 'VERIFICADA',
    verifierName: 'Dra. Helena Brandão (Facilitador)',
    verifiedAt: '2026-02-12T16:30:00.000Z',
    sufficiencyNotes: 'EVIDÊNCIA SUFICIENTE para demonstrar sustentação gerencial (C5): acolhimento pela Diretoria Geral de proposta técnica de privacidade formulada pelo Encarregado, com destinação orçamentária efetiva.',
    limitations: 'Trata de demanda pontual de contratação, não demonstrando ainda rotina periódica de revisão de riscos.',
    relatedCapacities: ['C5'],
    sensitivity: 'INTERNA_RESTRITA',
    aiUsageRule: 'AUTORIZADO_RESUMO',
    fileAttachmentName: 'Despacho_DG_Aprovacao_Consultoria.pdf'
  },
  {
    id: 'ev-03',
    title: 'Fluxograma Proposto de Atendimento ao Titular de Dados',
    type: 'FLUXOGRAMA',
    origin: 'Documento interno de trabalho elaborado na Procuradoria',
    indicatedBy: 'Dr. Carlos Eduardo Menezes',
    date: '2025-08-10',
    status: 'NAO_VERIFICAVEL_OU_INADEQUADA',
    verifierName: 'Dra. Helena Brandão (Facilitador)',
    verifiedAt: '2026-02-12T16:45:00.000Z',
    sufficiencyNotes: 'Minuta de trabalho sem ato formal de aprovação da Mesa Diretora e sem ciência dos setores de Protocolo e Ouvidoria. Não comprova institucionalização da prática de articulação.',
    limitations: 'Minuta não implantada.',
    relatedCapacities: ['C4'],
    sensitivity: 'INTERNA_RESTRITA',
    aiUsageRule: 'AUTORIZADO_RESUMO',
    fileAttachmentName: 'Minuta_Fluxo_Titulares_Rascunho.docx'
  }
];

// Vínculos relacionais de suficiência por capacidade (EvidenceLink)
// Princípio: A suficiência pertence ao vínculo entre evidência e capacidade, não à evidência como propriedade absoluta.
export const SEED_EVIDENCE_LINKS: EvidenceLink[] = [
  {
    id: 'link-ev01-c1',
    organizationId: 'org-camara-vila-esperanca-01',
    cycleId: 'ciclo-2026-1',
    evidenceId: 'ev-01',
    capacityId: 'C1',
    sufficiency: 'SUFICIENTE',
    rationale: 'Portaria nº 014/2023 comprova formalmente a designação do Encarregado pelo tratamento de dados pessoais no órgão.',
    assessedBy: 'Dra. Helena Brandão (Facilitador)',
    assessedAt: '2026-02-12T16:00:00.000Z'
  },
  {
    id: 'link-ev01-c2',
    organizationId: 'org-camara-vila-esperanca-01',
    cycleId: 'ciclo-2026-1',
    evidenceId: 'ev-01',
    capacityId: 'C2',
    sufficiency: 'INSUFICIENTE',
    rationale: 'A portaria de designação é insuficiente para comprovar condições práticas, disponibilidade de tempo, apoio ou infraestrutura para atuação efetiva do Encarregado.',
    assessedBy: 'Dra. Helena Brandão (Facilitador)',
    assessedAt: '2026-02-12T16:00:00.000Z'
  },
  {
    id: 'link-ev02-c5',
    organizationId: 'org-camara-vila-esperanca-01',
    cycleId: 'ciclo-2026-1',
    evidenceId: 'ev-02',
    capacityId: 'C5',
    sufficiency: 'SUFICIENTE',
    rationale: 'Despacho da DG comprova acolhimento de proposta técnica do Encarregado e alocação orçamentária.',
    assessedBy: 'Dra. Helena Brandão (Facilitador)',
    assessedAt: '2026-02-12T16:30:00.000Z'
  }
];

// Análise de apoio da IA (claramente segregada)
export const SEED_AI_ANALYSIS: AIAnalysisRecord = {
  id: 'ai-ana-01',
  doorId: 'D1.4',
  category: 'INFORMADO_AINDA_NAO_COMPROVADO',
  summary: 'Identificada articulação pontual e baseada em relações pessoais (WhatsApp e chamadas telefônicas) entre o Encarregado e setores operacionais. Há divergência formal entre o relato do Encarregado e o Protocolo sobre o canal oficial de entrada de pedidos.',
  signalsOfCapacity: [
    'Existe canal de diálogo aberto e colaborativo entre Encarregado, TI e Procuradoria.',
    'Disposição manifesta dos setores para colaborar em demandas concretas.'
  ],
  potentialGaps: [
    'Ausência de fluxo formalizado e unificado de atendimento às solicitações de titulares.',
    'Risco de pedidos de munícipes ficarem parados no sistema de protocolo sem ciência tempestiva do Encarregado.'
  ],
  suggestedProbes: [
    'Verificar junto à Ouvidoria se há registro formal de solicitações de titulares nos últimos 12 meses.'
  ],
  dataScopeUsed: 'TEXTO_DA_PORTA_MINIMIZADO',
  timestamp: '2026-02-12T16:50:00.000Z',
  humanValidation: {
    status: 'ACEITO',
    facilitatorNotes: 'Análise metodologicamente correta; preserva a divergência e não conclui prematuramente por inexistência de fluxo.',
    validatedAt: '2026-02-12T17:00:00.000Z'
  }
};

// Pendência Bloqueante (Impede conclusão de N3 sem impedir continuidade da investigação)
export const SEED_PENDING_ITEMS: PendingItem[] = [
  {
    id: 'pend-01',
    doorId: 'D1.4',
    title: 'Esclarecer formalmente o canal de entrada e tramitação de requisições de titulares de dados',
    description: 'Devido à divergência entre a Procuradoria e o Protocolo, é necessário verificar uma amostra de 3 processos no sistema 1Doc para confirmar como as demandas tramitam até o Encarregado.',
    type: 'EVIDENCIA',
    impact: 'BLOQUEANTE',
    status: 'EM_TRATAMENTO',
    responsible: 'Dra. Helena Brandão (Facilitador) com Dr. Carlos e Sônia Silveira',
    createdAt: '2026-02-12T17:15:00.000Z'
  },
  {
    id: 'pend-02',
    doorId: 'D1.2',
    title: 'Definição institucional de substituto para o Encarregado de Dados',
    description: 'A Câmara necessita formalizar quem responde pelas demandas de privacidade durante ausências regulamentares do Encarregado titular.',
    type: 'DECISAO',
    impact: 'RELEVANTE_NAO_BLOQUEANTE',
    status: 'ABERTA',
    responsible: 'Marcos Vinícius Prado (Diretor Geral)',
    createdAt: '2026-02-12T17:20:00.000Z'
  }
];

// Integração Dimensional C1-C6
export const SEED_INTEGRATION: DimensionalIntegration = {
  dimensionId: 'D1',
  methodologyVersion: 'D1 v1.0',
  capacities: {
    C1: {
      capacityId: 'C1',
      status: 'DEMONSTRADA',
      rationale: 'Existe configuração reconhecível de governança através da Portaria nº 014/2023 e Comitê formalizado.',
      groundingUnits: ['uinfo-01', 'uinfo-02'],
      supportingEvidences: ['ev-01'],
      advancedElements: ['Comitê de Governança criado formalmente.'],
      insufficiencies: []
    },
    C2: {
      capacityId: 'C2',
      status: 'EM_ESTRUTURACAO',
      rationale: 'O Encarregado atua regularmente, mas acumula carga pesada na Procuradoria e não conta com substituto formal nem equipe de apoio.',
      groundingUnits: ['uinfo-03', 'uinfo-04'],
      supportingEvidences: ['ev-01'],
      insufficiencies: ['Ausência de substituto designado formalmente.']
    },
    C3: {
      capacityId: 'C3',
      status: 'EM_ESTRUTURACAO',
      rationale: 'Responsabilidades identificadas na TI e Compras em casos concretos, embora ainda sem matriz formalizada de papéis.',
      groundingUnits: ['uinfo-01', 'uinfo-03'],
      supportingEvidences: [],
      insufficiencies: ['Falta de formalização de matriz de papéis por área.']
    },
    C4: {
      capacityId: 'C4',
      status: 'INSUFICIENTEMENTE_DEMONSTRADA',
      rationale: 'Divergência aberta entre Protocolo e Encarregado quanto ao trâmite de pedidos de titulares. Práticas dependem de contatos pessoais informais.',
      groundingUnits: ['uinfo-05'],
      supportingEvidences: ['ev-03'],
      insufficiencies: ['Fluxo de atendimento a titulares diverge na prática operacional.']
    },
    C5: {
      capacityId: 'C5',
      status: 'DEMONSTRADA',
      rationale: 'Acesso direto e efetivo à Diretoria Geral e à Mesa Diretora demonstrado por despacho e contratação executada.',
      groundingUnits: ['uinfo-06'],
      supportingEvidences: ['ev-02'],
      advancedElements: ['Canal direto e acolhimento comprovado de demandas orçamentárias de privacidade.']
    },
    C6: {
      capacityId: 'C6',
      status: 'EM_ESTRUTURACAO',
      rationale: 'Acompanhamento depende de anotações individuais do Encarregado, sem rotina periódica colegiada de revisão ou indicadores formalizados.',
      groundingUnits: ['uinfo-07'],
      supportingEvidences: [],
      insufficiencies: ['Inexistência de acompanhamento institucional compartilhado de pendências.']
    }
  },
  blockingPendingIds: ['pend-01'],
  demonstratedLevel: 'N2_EM_ESTRUTURACAO',
  nextLevelInAnalysis: 'N3_IMPLEMENTADO',
  limitations: [
    'A divergência sobre o fluxo de atendimento a titulares no Protocolo impede considerar a capacidade C4 demonstrada neste ciclo.',
    'A ausência de substituto para o Encarregado fragiliza a sustentação de C2.'
  ],
  nextInstitutionalAchievement: 'Padronizar e formalizar o fluxo de atendimento aos direitos dos titulares (C4) e instituir substituto formal do Encarregado (C2).',
  aiSuggestedMaturity: {
    level: 'N2_EM_ESTRUTURACAO',
    rationaleWhyProposedLevelSustained: 'A Câmara demonstrou estruturação inicial reconhecível (C1), atuação fática do Encarregado com dedicação semanal (C2) e sustentação gerencial efetiva com decisões acolhidas pela Direção Geral (C5).',
    rationaleWhyNextLevelNotSustained: 'O nível N3 (Implementado) exige que papéis, articulação e condições de funcionamento estejam suficientemente definidos e demonstráveis independentemente de relações estritamente individuais. A capacidade C4 está insuficientemente demonstrada e a capacidade C6 permanece informal.',
    advancedElementsAlreadyPresent: [
      'Acolhimento gerencial pela Diretoria Geral com aprovação orçamentária para consultoria técnica (C5).',
      'Rotinas automatizadas de backup em nuvem governamental já implementadas na TI (C3).'
    ],
    blockingPendenciesIdentified: [
      'Pendência pend-01: Esclarecer canal e fluxo oficial de atendimento aos titulares entre Protocolo e Procuradoria.'
    ],
    suggestedAt: '2026-02-12T17:30:00.000Z'
  },
  humanValidation: {
    isValidated: true,
    validatedLevel: 'N2_EM_ESTRUTURACAO',
    facilitatorName: 'Dra. Helena Brandão',
    validationNotes: 'Concordo com a análise. N2 é o patamar sustentado com segurança pelas evidências. N3 não pode ser concedido enquanto C4 e C6 estiverem frágeis e a pendência de protocolo estiver aberta.',
    validatedAt: '2026-02-12T17:45:00.000Z'
  }
};

// Gaps Institucionais Validados
export const SEED_GAPS: ValidatedGap[] = [
  {
    id: 'gap-01',
    doorId: 'D1.4',
    capacityId: 'C4',
    title: 'Ausência de procedimento operacional padronizado para atendimento aos direitos dos titulares',
    description: 'Protocolo e Ouvidoria não possuem fluxo unificado com a Procuradoria para encaminhar, registrar prazos e monitorar pedidos de cidadãos baseados na LGPD.',
    markers: ['ESTRUTURANTE', 'OBRIGATORIO', 'CAPACIDADE'],
    rootCauseType: 'FLUXO_INSTITUCIONAL',
    requiresTraining: false,
    isValidatedByHuman: true,
    validatedAt: '2026-02-12T18:00:00.000Z'
  },
  {
    id: 'gap-02',
    doorId: 'D1.2',
    capacityId: 'C2',
    title: 'Inexistência de substituto designado para o Encarregado de Dados',
    description: 'A atuação fica paralisada durante férias, licenças ou impedimentos do titular da Procuradoria.',
    markers: ['CAPACIDADE', 'MATURIDADE'],
    rootCauseType: 'DEFINICAO_PAPEL',
    requiresTraining: false,
    isValidatedByHuman: true,
    validatedAt: '2026-02-12T18:05:00.000Z'
  },
  {
    id: 'gap-03',
    doorId: 'D1.6',
    capacityId: 'C6',
    title: 'Monitoramento de pendências restrito a controles pessoais do Encarregado',
    description: 'Não existe mecanismo compartilhado para acompanhar se deliberações de privacidade foram implementadas pelos setores.',
    markers: ['MATURIDADE', 'OPORTUNIDADE_DE_MELHORIA'],
    rootCauseType: 'FLUXO_INSTITUCIONAL',
    requiresTraining: false,
    isValidatedByHuman: true,
    validatedAt: '2026-02-12T18:10:00.000Z'
  }
];

// Ações de Evolução (com Resultado Esperado estritamente SEPARADO de Ação)
export const SEED_ACTIONS: EvolutionAction[] = [
  {
    id: 'act-01',
    gapId: 'gap-01',
    expectedResult: 'Canal de recebimento e tramitação de pedidos de titulares unificado, com prazo legal de resposta monitorado e responsabilidade clara entre Protocolo e Encarregado.',
    actionTitle: 'Elaborar e publicar Ordem de Serviço Normativa sobre o Fluxo de Atendimento a Titulares',
    actionDetails: 'Mapear a rotina no 1Doc, criar categoria específica de requerimento LGPD e definir notificação automática ao Encarregado com prazo de 15 dias.',
    actors: ['Dr. Carlos Eduardo Menezes', 'Sônia Silveira (Protocolo)', 'Marcos Prado (Diretor Geral)'],
    deadlineOrPhase: 'Fase 1 (60 dias)',
    nextImmediateStep: 'Reunião de alinhamento entre Procuradoria, Protocolo e TI para parametrizar o modelo de chamado no sistema 1Doc.',
    supportInstrument: 'Modelo de Ordem de Serviço Orientativa D1',
    expectedEvidence: 'Ordem de Serviço assinada e publicada em Diário Oficial + Print da tela de chamada parametrizada no 1Doc.',
    successCriterion: '100% dos pedidos de titulares autuados no sistema 1Doc chegam à caixa do Encarregado em menos de 24 horas da protocolização.',
    relatedIndicatorName: 'Indicador de Continuidade das Ações de Governança',
    status: 'EM_ANDAMENTO',
    lastFollowUpDate: '2026-02-15',
    followUpOwner: 'Dr. Carlos Eduardo Menezes'
  },
  {
    id: 'act-02',
    gapId: 'gap-02',
    expectedResult: 'Continuidade ininterrupta da função de Encarregado assegurada institucionalmente em afastamentos e férias.',
    actionTitle: 'Editar portaria complementar designando Encarregado Adjunto / Substituto',
    actionDetails: 'Minutar ato administrativo indicando servidor efetivo da Diretoria Administrativa para atuar subsidiariamente.',
    actors: ['Marcos Prado (Diretor Geral)', 'Presidente da Mesa Diretora'],
    deadlineOrPhase: 'Fase 1 (30 dias)',
    nextImmediateStep: 'Apresentar a minuta de portaria para despacho da Mesa Diretora.',
    supportInstrument: 'Minuta Padrão de Designação de Encarregado Substituto em Câmaras',
    expectedEvidence: 'Portaria de Designação publicada no Portal da Transparência.',
    successCriterion: 'Publicação de portaria indicando nominalmente o substituto e suas atribuições regimentais.',
    relatedIndicatorName: 'Indicador de Continuidade das Ações de Governança',
    status: 'NAO_INICIADA',
    lastFollowUpDate: '2026-02-12',
    followUpOwner: 'Marcos Vinícius Prado'
  },
  {
    id: 'act-03',
    gapId: 'gap-03',
    expectedResult: 'Mesa Diretora e Diretor Geral recebem balanço semestral das providências de privacidade executadas e pendentes pelos setores da Câmara.',
    actionTitle: 'Implantar Planilha/Painel Bimestral de Acompanhamento das Ações de Privacidade',
    actionDetails: 'Estruturar painel simples contendo: ação, responsável, fase, próximo passo e data de última atualização.',
    actors: ['Dr. Carlos Eduardo Menezes', 'Rodrigo Santoro (TI)'],
    deadlineOrPhase: 'Fase 2 (90 dias)',
    nextImmediateStep: 'Criar modelo compartilhado em nuvem segura com permissões restritas aos chefes de setor.',
    supportInstrument: 'Planilha Modelo de Acompanhamento Transversal D1',
    expectedEvidence: 'Relatório bimestral protocolado com assinaturas dos responsáveis.',
    successCriterion: 'Realização de ao menos 1 reunião bimestral documentada de monitoramento das ações com a Diretoria Geral.',
    relatedIndicatorName: 'Indicador de Continuidade das Ações de Governança',
    status: 'NAO_INICIADA',
    lastFollowUpDate: '2026-02-12',
    followUpOwner: 'Dr. Carlos Eduardo Menezes'
  }
];

// Indicador Experimental D1
export const SEED_EXPERIMENTAL_INDICATOR: ExperimentalIndicatorFeedback = {
  indicatorName: 'Indicador de Continuidade das Ações de Governança',
  objective: 'Verificar se as ações definidas permanecem acompanhadas após o diagnóstico.',
  formula: '(Número de ações previstas com acompanhamento ativo ÷ Total de ações previstas no período) × 100',
  actionsTotal: 3,
  actionsTracked: 2, // act-01 possui responsável, prazo, próximo passo e acompanhamento ativo
  calculatedValue: 66.7,
  perceivedUtility: 'MUITO_UTIL',
  feasibilityAssessment: 'Totalmente viável para Câmaras Municipais porque mede disciplina de acompanhamento e não gera burocracia complexa.',
  probableResponsibleSource: 'Diretoria Geral Administrativa conjuntamente com o Encarregado.',
  proposedPeriodicity: 'BIMESTRAL',
  identifiedDifficulties: 'Risco de reuniões de acompanhamento serem canceladas por prioridades da pauta de votações legislativas.',
  observations: 'O indicador demonstrou alto valor reflexivo para a gestão entender que o diagnóstico não é um evento isolado.',
  collectedAt: '2026-02-12T18:20:00.000Z'
};

// Snapshot D1 Imutável
export const SEED_SNAPSHOT_D1: SnapshotD1 = {
  snapshotId: 'snap-d1-vilaesperanca-2026-01',
  organizationId: 'org-camara-vila-esperanca-01',
  organizationName: 'Câmara Municipal de Vila Esperança',
  municipality: 'Vila Esperança - SP',
  dimensionId: 'D1',
  cycleId: 'ciclo-2026-1',
  baseDate: '2026-02-12',
  methodologyVersion: 'D1 v1.0',
  validatedLevel: 'N2_EM_ESTRUTURACAO',
  capacitiesAssessment: SEED_INTEGRATION.capacities,
  demonstratedCapacities: ['C1', 'C5'],
  structuringCapacities: ['C2', 'C3', 'C6'],
  advancedElements: [
    'Acolhimento gerencial pela Diretoria Geral com aprovação orçamentária efetiva (C5).',
    'Rotinas automatizadas de backup em nuvem governamental já em operação na TI (C3).'
  ],
  validatedGaps: SEED_GAPS,
  relevantPendingItems: SEED_PENDING_ITEMS,
  nextAchievement: 'Padronizar e formalizar o fluxo de atendimento aos direitos dos titulares (C4) e instituir substituto formal do Encarregado (C2).',
  plannedActions: SEED_ACTIONS,
  experimentalIndicatorBaseline: {
    name: 'Indicador de Continuidade das Ações de Governança',
    formula: '(Ações acompanhadas ÷ Total de ações) × 100',
    trackedPercentage: 66.7,
    notes: 'Baseline do Ciclo 2026.1 registrado com 2 de 3 ações acompanhadas.'
  },
  limitations: [
    'Divergência mantida entre Procuradoria e Protocolo referente ao fluxo de atendimento a titulares.',
    'Ausência de substituto designado para ausências do Encarregado.'
  ],
  validatorName: 'Dra. Helena Brandão (Facilitador Credenciado)',
  validatedAt: '2026-02-12T18:30:00.000Z',
  scheduledNextReview: '2026-08-12',
  isLockedImmutable: true
};

// Diário de Desenvolvimento Metodológico
export const SEED_DIARY_ENTRIES: MethodologicalDiaryEntry[] = [
  {
    id: 'diary-01',
    organizationId: 'org-camara-vila-esperanca-01',
    dimensionId: 'D1',
    doorId: 'D1.3',
    sessionId: 'sess-entrevista-01',
    methodologyVersion: 'D1 v1.0',
    date: '2026-02-12T11:35:00.000Z',
    origin: 'CAMPO',
    theme: 'FONTE_ADEQUADA',
    hypothesis: 'O Encarregado em Câmaras de médio porte tende a não ter visibilidade sobre políticas operacionais de TI, gerando risco de falso gap se não houver convite à fonte adequada.',
    observedProblem: 'Quando questionado sobre backup e logs, o Encarregado respondeu "não sei como eles controlam isso". Um checklist comum marcaria não conformidade imediatamente.',
    decisionTaken: 'Registrou-se "Não sei por limite de visibilidade", mantendo o estado da porta aberto e enviando solicitação neutra dirigida ao Chefe de TI.',
    justification: 'A Câmara de fato possui rotina avançada de backup em nuvem, que só foi evidenciada ao consultar a fonte tecnicamente competente.',
    fieldEvidence: 'Contrato nº 008/2024 e relatório de logs apresentado pela TI comprovou a existência da capacidade.',
    proposedChange: 'Manter a regra de nunca converter "não sei" de interlocutor jurídico em inexistência de capacidade de TI.',
    howToTest: 'Testar com respondentes de gabinetes parlamentares na D1.3.',
    result: 'Evitou distorção grave do diagnóstico e preservou a legitimidade da avaliação perante a Diretoria.',
    methodologicalImplication: 'Valida a premissa de investigação distribuída por unidade de informação.',
    productImplication: 'Reforçar na interface o botão rápido "Solicitar contribuição à fonte" após registro de "não sei".',
    researchImplication: 'Comprova a tese de que a assimetria informacional interna é o principal causador de falsos diagnósticos de maturidade em privacidade no setor público.',
    authorName: 'Dra. Helena Brandão'
  },
  {
    id: 'diary-02',
    organizationId: 'org-camara-vila-esperanca-01',
    dimensionId: 'D1',
    doorId: 'D1.4',
    sessionId: 'sess-entrevista-01',
    methodologyVersion: 'D1 v1.0',
    date: '2026-02-12T15:00:00.000Z',
    origin: 'CAMPO',
    theme: 'IA',
    hypothesis: 'A IA de apoio deve apontar divergências mas jamais fundir relatos discrepantes.',
    observedProblem: 'Encarregado e Protocolo divergiram sobre a tramitação de requerimentos de titulares.',
    decisionTaken: 'O módulo da IA classificou o estado como DIVERGENCIA_DETECTADA e propôs pendência bloqueante para amostragem no sistema 1Doc.',
    justification: 'Se a IA tentasse "conciliar" as respostas, teria ocultado um gap operacional real de fluxo institucional.',
    fieldEvidence: 'Amostra no 1Doc mostrou que pedidos ficaram 22 dias na caixa geral da Diretoria.',
    proposedChange: 'Blindar o prompt da IA com proibição expressa de síntese apaziguadora quando houver divergência fática.',
    howToTest: 'Simular respostas contraditórias sobre prazos.',
    result: 'O Facilitador manteve a divergência aberta com pendência bloqueante.',
    methodologicalImplication: 'Regra de ouro: a divergência preservada é insumo de governança, não defeito do sistema.',
    productImplication: 'Painel do Facilitador deve destacar divergências com status visual de alta atenção.',
    researchImplication: 'Divergências operacionais em governança pública revelam zonas cegas entre o normativo e o fático.',
    authorName: 'Dra. Helena Brandão'
  },
  {
    id: 'diary-st-001',
    organizationId: 'org-camara-vila-esperanca-01',
    dimensionId: 'D1',
    doorId: 'D1.1',
    sessionId: 'sess-stress-test-01',
    methodologyVersion: 'D1 v1.0',
    date: '2026-02-13T10:30:00.000Z',
    origin: 'CAMPO',
    theme: 'USABILIDADE',
    hypothesis: 'ST-D1-001 — Persistência contextual da navegação: A retomada da jornada deve ser determinada pelo contexto da organização, ciclo e perfil. Um novo contexto não herda a localização de outro contexto.',
    observedProblem: 'Durante o stress test com uma nova organização (Câmara Municipal de Santa Aurora), o workspace abriu diretamente na Etapa 4 — Análise e Validação, herdando a última etapa visitada na organização anterior (Vila Esperança).',
    decisionTaken: 'Isolamento estrito da chave de localização de navegação no formato journeyActiveStage:{organizationId}:{cycleId}:{profile}. Abertura inicial garantida na Etapa 1 — Diagnóstico D1 para novos ciclos (0/6 portas).',
    justification: 'Navegação é estado de interface, não metodológico. Perfis, ciclos e organizações independentes devem preservar suas próprias localizações sem contaminação.',
    fieldEvidence: 'Stress test executado na transição Vila Esperança (Etapa 4) -> Santa Aurora (Etapa 1) -> Vila Esperança (retomada na Etapa 4).',
    proposedChange: 'Remover chave global legada e ancorar a localização aos identificadores de organização, ciclo e perfil de usuário.',
    howToTest: 'Testes A a F de isolamento multi-organização, multi-ciclo e multi-perfil.',
    result: 'Nova organização abre na Etapa 1 com 0/6 portas e cada contexto retoma precisamente sua própria etapa.',
    methodologicalImplication: 'Evita indução ou confusão cognitiva em novos respondentes ao iniciar avaliações D1.',
    productImplication: 'Classificação: BUG FUNCIONAL / UX DE JORNADA sanado com persistência contextualizada.',
    researchImplication: 'Garante fidelidade empírica nos testes comparativos entre diferentes Câmaras Municipais.',
    authorName: 'Dra. Helena Brandão'
  },
  {
    id: 'diary-st-003',
    organizationId: 'org-camara-santa-aurora-01',
    dimensionId: 'D1',
    doorId: 'D1.1',
    sessionId: 'sess-stress-test-03',
    methodologyVersion: 'D1 v1.0',
    date: '2026-02-13T11:45:00.000Z',
    origin: 'CAMPO',
    theme: 'SUFICIENCIA',
    hypothesis: 'ST-D1-003 — Análise de unidades, autorização por perfil e apresentação semântica do estado "Em Descoberta". A decomposição analítica é atribuição exclusiva da facilitação metodológica; e o início fático da investigação na porta não deve ser classificado como "Não iniciado" no mapa da jornada.',
    observedProblem: 'O comando "Analisar Unidades no Painel" estava visível para o Interlocutor Principal, cujo clique provocava retorno involuntário à Visão Geral por falta de autorização. Além disso, mesmo com a Porta D1.1 em estado "EM DESCOBERTA" com resposta e sondagem registradas na Santa Aurora, o card geral da Etapa 1 mantinha a indicação "Não iniciado".',
    decisionTaken: '1) Ocultação estrita do comando "Analisar Unidades no Painel" para o Interlocutor Principal, preservando a affordance no perfil Facilitador com passagem de contexto completa (responseId, doorId, cycleId, orgId). 2) Exibição de banner de rastreabilidade metodológica no Painel do Facilitador referenciando a fala original imutável. 3) Atualização do motor de jornada para reconhecer atividade investigativa ativa (EM_DESCOBERTA), transicionando a Etapa 1 de "Não iniciado" para "Em andamento", sem alterar o contador quantitativo de suficiência (0/6 portas investigadas).',
    justification: 'Papel institucional não se confunde com validação analítica; a fala do respondente é primária e imutável, e a decomposição em unidades cabe à facilitação. A indicação "Em andamento" reflete a realidade fática de investigação iniciada.',
    fieldEvidence: 'Teste de estresse em Santa Aurora (D1.1 em descoberta com resposta e sondagem): Interlocutor não vê comando analítico; Facilitador transita com contexto íntegro; Card geral exibe "Em andamento" com contador "0/6".',
    proposedChange: 'Blindagem de autorização no componente de investigação e atualização semântica determinística no journeyEngine.',
    howToTest: 'Verificar visão do Interlocutor Principal e Facilitador na Porta D1.1 da Santa Aurora e validar o card da Etapa 1 na Visão Geral.',
    result: 'Interface alinhada à separação de papéis metodológicos, sem perda de rastreabilidade ou indução de falsos estados.',
    methodologicalImplication: 'Preserva a integridade da coleta não indutiva e a soberania do Facilitador na decomposição das afirmativas.',
    productImplication: 'Classificação: AUTORIZAÇÃO / UX METODOLÓGICA / RASTREABILIDADE sanadas.',
    researchImplication: 'Assegura uniformidade na aplicação do método em novos pilotos municipais.',
    authorName: 'Dra. Helena Brandão'
  },
  {
    id: 'diary-st-d1-005',
    organizationId: 'org-camara-santa-aurora-01',
    dimensionId: 'D1',
    doorId: 'D1.1',
    sessionId: 'sess-stress-test-05',
    methodologyVersion: 'D1 v1.0',
    date: '2026-02-14T15:30:00.000Z',
    origin: 'CAMPO',
    theme: 'IA',
    hypothesis: 'ST-D1-005 — Staging transitório de extração por IA, proveniência analítica e soberania decisória do Facilitador. A sugestão da IA nunca deve ser registrada automaticamente no estado persistido nem enviada à fila de pendências sem a revisão ativa e decisão explícita do Facilitador.',
    observedProblem: 'O fluxo anterior de extração por IA gravava unidades diretamente no estado persistido com status EM_ANALISE sem staging prévio, além de poder mascarar erros de comunicação HTTP como se fossem ausência de sugestões factuais.',
    decisionTaken: 'Implementação de área transitória (staging) com edição local antes do registro; preservação de proveniência completa (organizationId, cycleId, responseId, doorId, aiSuggestedText, statement registrado, humanEdited, registeredBy); diferenciação estrita entre estados de carregamento, sugestões geradas, nenhuma sugestão identificada com segurança e erro HTTP/API com retry; e aviso explícito de substituição em caso de reextração.',
    justification: 'A metodologia D1 v1.0 exige que a inteligência artificial atue como suporte analítico estritamente mediado pelo Facilitador. O Facilitador detém o julgamento metodológico primário sobre a pertinência e alcance de cada afirmativa fática.',
    fieldEvidence: 'Fluxo validado no Painel do Facilitador sobre a fala focal: sugestões exibidas em staging editável, registro individual com preservação de proveniência, descarte sem efeitos colaterais e tratamento robusto de falhas de API sem fallback inventado.',
    proposedChange: 'Criação da interface de staging transitório no FacilitatorPanelView, blindagem de endpoints no backend sem fallbacks fictícios e sincronização do modelo de proveniência em types.ts.',
    howToTest: 'Selecionar fala focal no Painel do Facilitador, clicar em "Extrair com IA", verificar apresentação das sugestões em staging, editar afirmativa, validar flag humanEdited ao registrar, testar descarte e simular erro de API com botão "Tentar novamente".',
    result: 'Soberania do Facilitador preservada, proveniência metodológica auditável de ponta a ponta e eliminação de registros autômatos ou falsos positivos.',
    methodologicalImplication: 'Reforça o princípio de não delegação da análise fática a agentes computacionais não supervisionados.',
    productImplication: 'Classificação: UX ANALÍTICA / PROVENIÊNCIA / ROBUSTEZ DE API sanadas.',
    researchImplication: 'Garante que os dados do piloto reflitam intervenções humanas conscientes e rastreáveis para fins de validação científica da metodologia D1.',
    authorName: 'Dra. Helena Brandão'
  },
  {
    id: 'diary-fase1b-01',
    organizationId: 'org-camara-vila-esperanca-01',
    dimensionId: 'D1',
    doorId: 'D1.1',
    sessionId: 'sess-auditoria-fase1b',
    methodologyVersion: 'D1 v1.0',
    date: '2026-02-15T09:00:00.000Z',
    origin: 'CAMPO',
    theme: 'MATURIDADE',
    hypothesis: 'A consolidação e validação de maturidade C1–C6 pressupõe que todos os aspectos aplicáveis da dimensão foram suficientemente investigados, independentemente de haver entrevista única ou encerramento formal prévio.',
    observedProblem: 'Durante a auditoria no Preview, observou-se recomendação prematura de próximo passo para "Validar Análise Metodológica C1–C6" quando apenas 1 aspecto da dimensão havia sido explorado (1/6), saltando aspectos ainda não investigados.',
    decisionTaken: 'Condicionar a recomendação da etapa de validação C1–C6 à cobertura investigativa suficiente de todos os aspectos aplicáveis da dimensão (allAspectsInvestigated). Quando houver aspectos pendentes, o próximo passo recomendado orienta objetivamente para o próximo aspecto da investigação.',
    justification: 'A metodologia não permite validação de capacidades com base em amostragem fragmentada da dimensão. Todas as capacidades dependem da apuração fática abrangente.',
    fieldEvidence: 'Auditoria de uso no Preview: recomendação C1–C6 disparada com diagnóstico em 1/6.',
    proposedChange: 'Ajuste na árvore de decisão do journeyEngine.ts para checar allAspectsInvestigated antes de recomendar validação de maturidade.',
    howToTest: 'Iniciar um ciclo ou manter 1/6 aspectos explorados: verificar que o próximo passo recomenda investigar o aspecto pendente seguinte (ex: D1.2), e não validar C1–C6.',
    result: 'O motor de jornada orienta sequencialmente por todos os aspectos e só recomenda consolidação/validação quando a apuração fática da dimensão for concluída.',
    methodologicalImplication: 'Preserva o princípio metodológico de suficiência abrangente da dimensão antes da consolidação de capacidades.',
    productImplication: 'Elimina indução de erro e salto prematuro de etapas na jornada do Facilitador e do Interlocutor.',
    researchImplication: 'Garante que os dados de maturidade homologados decorram de investigação completa dos aspectos dimensionais.',
    authorName: 'Equipe de Facilitação e Auditoria VIPAZ'
  },
  {
    id: 'diary-fase1b-02',
    organizationId: 'org-camara-vila-esperanca-01',
    dimensionId: 'D1',
    doorId: 'D1.1',
    sessionId: 'sess-auditoria-fase1b',
    methodologyVersion: 'D1 v1.0',
    date: '2026-02-15T09:30:00.000Z',
    origin: 'FALHA_TECNICA',
    theme: 'CONTINUIDADE',
    hypothesis: 'O ciclo institucional deve transitar de NAO_INICIADO para EM_ANDAMENTO mediante o primeiro ato investigativo substantivo persistido, e não por mera visualização ou exclusivamente por encerramento de entrevista.',
    observedProblem: 'Na auditoria do Preview, o ciclo era exibido com situação "NÃO INICIADO" no cabeçalho e na Visão Geral simultaneamente a um diagnóstico com aspectos já explorados (1/6).',
    decisionTaken: 'Implementação de gatilho contextual seguro (ensureCycleInProgress) acionado na persistência do primeiro registro investigativo substantivo (respostas originais, declarações formais de não-sei, sondagens, unidades de informação, evidências ou avanço de status do aspecto). Mera navegação/consulta não altera o status.',
    justification: 'A situação do ciclo deve expressar com precisão o estado empírico da apuração fática, distinguindo preparativos estáticos de investigação em curso.',
    fieldEvidence: 'Inconsistência visual constatada no cabeçalho institucional entre o badge "NÃO INICIADO" e o progresso investigativo "1/6".',
    proposedChange: 'Criação de ensureCycleInProgress() no PilotContext.tsx e chamada nos métodos de persistência investigativa.',
    howToTest: 'Criar nova organização (ciclo NAO_INICIADO), navegar pelas telas (permanece NAO_INICIADO). Registrar uma resposta ou sondagem (transita imediatamente e persiste como EM_ANDAMENTO).',
    result: 'Sincronização perfeita entre o estado persistido do ciclo e os registros substantivos da apuração.',
    methodologicalImplication: 'Garante rastreabilidade formal do marco inicial substantivo da avaliação institucional.',
    productImplication: 'Elimina incongruência de apresentação e reforça a confiabilidade institucional do sistema.',
    researchImplication: 'Permite medir com precisão o tempo real de condução da apuração entre o primeiro ato fático e a homologação final.',
    authorName: 'Equipe Técnica VIPAZ'
  },
  {
    id: 'diary-fase1b1-01',
    organizationId: 'org-camara-vila-esperanca-01',
    dimensionId: 'D1',
    doorId: 'D1.1',
    sessionId: 'sess-fase1b1-ajustes',
    methodologyVersion: 'D1 v1.0',
    date: '2026-02-15T14:00:00.000Z',
    origin: 'CAMPO',
    theme: 'SUFICIENCIA',
    hypothesis: 'A Visão Geral institucional deve comunicar o progresso fático sem induzir confusão entre suficiência de coleta em um aspecto e consolidação metodológica dimensional.',
    observedProblem: 'A interface apresentava "Análise consolidada x/n" ao lado de "Aspectos investigados x/n". A inspeção semântica confirmou que o indicador lia apenas doorStatuses === SUFICIENTEMENTE_EXPLORADA, sem consolidação analítica real.',
    decisionTaken: 'Remoção de "Análise consolidada x/n" da casca institucional da Visão Geral, mantendo um indicador único e límpido: "Investigação x/n".',
    justification: 'A palavra consolidação pertence à Matriz Dimensional C1–C6 e não à escuta fática individual de aspectos.',
    fieldEvidence: 'Auditoria pós-Fase 1B e inspeção pré-implementação Fase 1B.1-A.',
    proposedChange: 'Simplificação em InstitutionalOverviewView.tsx e DiagnosticModuleView.tsx.',
    howToTest: 'Verificar card Diagnóstico na Visão Geral: exibe apenas "Investigação x/6" e barra de progresso.',
    result: 'Apresentação semântica fiel ao estado real dos dados sem inflação de maturidade.',
    methodologicalImplication: 'Evita a falsa impressão de que a análise metodológica já foi efetuada durante a simples escuta fática.',
    productImplication: 'Natureza: UX / Semântica Institucional.',
    researchImplication: 'Garante clareza cognitiva para os gestores e respondentes das Câmaras.',
    authorName: 'Equipe Metodológica VIPAZ'
  },
  {
    id: 'diary-fase1b1-02',
    organizationId: 'org-camara-vila-esperanca-01',
    dimensionId: 'D1',
    doorId: 'D1.1',
    sessionId: 'sess-fase1b1-ajustes',
    methodologyVersion: 'D1 v1.0',
    date: '2026-02-15T14:15:00.000Z',
    origin: 'CAMPO',
    theme: 'USABILIDADE',
    hypothesis: 'A experiência institucional deve utilizar linguagem natural e intuitiva ("Aspectos"), preservando os identificadores internos e a persistência técnica íntegros.',
    observedProblem: 'A expressão "Porta/Portas" dominava a interface interna (DiagnosticModuleView, DoorInvestigationView, OutputsView), contrastando com a evolução institucional da VIPAZ.',
    decisionTaken: 'Substituição da terminologia na camada de apresentação: "Portas de Entrada da Investigação" -> "Aspectos da investigação", "Porta D1.X" -> "Aspecto D1.X", "Investigação das 6 Portas" -> "Investigação D1", mantendo intocados identificadores internos como doorStatuses, DoorId e activeDoorId.',
    justification: 'Modernização da linguagem sem risco de quebra de schema ou corrupção de chaves persistidas no localStorage.',
    fieldEvidence: 'Relatório de auditoria funcional v1.1.',
    proposedChange: 'Ajustes editoriais nas views de diagnóstico, entrevista e relatórios.',
    howToTest: 'Navegar pelo Diagnóstico, Entrevista e Relatórios: conferir uso de "Aspecto" e "Investigação" nos títulos e rótulos.',
    result: 'Linguagem institucional elegante e alinhada à governança pública.',
    methodologicalImplication: 'Natureza: UX / Linguagem Institucional.',
    productImplication: 'Melhora a receptividade do método em ambientes legislativos municipais.',
    researchImplication: 'Elimina ruído terminológico em pesquisas e entrevistas de campo.',
    authorName: 'Equipe de Produto VIPAZ'
  },
  {
    id: 'diary-fase1b1-03',
    organizationId: 'org-camara-vila-esperanca-01',
    dimensionId: 'D1',
    doorId: 'D1.1',
    sessionId: 'sess-fase1b1-ajustes',
    methodologyVersion: 'D1 v1.0',
    date: '2026-02-15T14:30:00.000Z',
    origin: 'CAMPO',
    theme: 'CONTINUIDADE',
    hypothesis: 'Gaps fáticos confirmados na investigação podem originar ações e orientações institucionais sem exigir que a totalidade da dimensão esteja fechada.',
    observedProblem: 'A Visão Geral informava textualmente que a definição de ações estruturantes "aguarda a apuração integral dos aspectos e a validação humana de maturidade", o que contradizia a possibilidade técnica e metodológica de agir sobre gaps confirmados.',
    decisionTaken: 'Reformulação textual para explicitar que gaps confirmados na investigação podem originar orientações e ações de melhoria institucional, sem antecipar o nível de maturidade final.',
    justification: 'A governança de privacidade se beneficia de ações tempestivas sobre vulnerabilidades críticas conhecidas, sem necessidade de paralisar a atuação até o encerramento formal do ciclo.',
    fieldEvidence: 'Inspeção semântica pré-implementação Fase 1B.1-A.',
    proposedChange: 'Ajuste textual no card da Jornada de Evolução em InstitutionalOverviewView.tsx e títulos em EvolutionModuleView.tsx.',
    howToTest: 'Verificar card da Jornada de Evolução na Visão Geral na ausência de validação: texto orientativo sem falso bloqueio.',
    result: 'Comunicação precisa entre a investigação fática contínua e a pactuação de ações.',
    methodologicalImplication: 'Natureza: Metodologia / Regra de Negócio.',
    productImplication: 'Evita a paralisia decisória institucional.',
    researchImplication: 'Possibilita estudar a geração precoce de ações versus ações pós-homologação.',
    authorName: 'Dra. Helena Brandão'
  },
  {
    id: 'diary-fase1b1-04',
    organizationId: 'org-camara-vila-esperanca-01',
    dimensionId: 'D1',
    doorId: 'D1.1',
    sessionId: 'sess-fase1b1-ajustes',
    methodologyVersion: 'D1 v1.0',
    date: '2026-02-15T14:45:00.000Z',
    origin: 'CAMPO',
    theme: 'EVIDENCIA',
    hypothesis: 'A plataforma VIPAZ prioriza a referência de evidências em suas fontes primárias de origem, não devendo ser concebida como repositório documental exaustivo.',
    observedProblem: 'O módulo de Evidências ocupava espaço fixo com textos metodológicos densos e cabeçalhos genéricos, induzindo percepção de arquivo documental central.',
    decisionTaken: 'Simplificação do módulo para "Evidências", adoção do princípio "Referenciar sempre que possível; armazenar somente quando necessário", reorganização da tabela com foco em "Onde Está", e recolhimento contextual da regra didática de suficiência.',
    justification: 'Câmaras municipais já operam sistemas próprios de processo eletrônico (ex: SEI, 1Doc); a VIPAZ referencia onde os artefatos residem.',
    fieldEvidence: 'Registro de Auditoria v1.1.',
    proposedChange: 'Ajustes em EvidencesView.tsx mantendo intactos a máquina de estados e o EvidenceLink.',
    howToTest: 'Acessar módulo Evidências: verificar cabeçalho limpo, princípio explícito, colunas organizadas e modal de vínculos operando.',
    result: 'Apresentação operacional limpa com inteligência probatória relacional preservada.',
    methodologicalImplication: 'Natureza: UX / Princípio Metodológico.',
    productImplication: 'Elimina atrito de cadastro e desonera a custódia de arquivos sensíveis.',
    researchImplication: 'Fortalece o modelo de auditoria por referência documental.',
    authorName: 'Equipe de Facilitação VIPAZ'
  },
  {
    id: 'diary-fase1b1-05',
    organizationId: 'org-camara-vila-esperanca-01',
    dimensionId: 'D1',
    doorId: 'D1.1',
    sessionId: 'sess-fase1b1-ajustes',
    methodologyVersion: 'D1 v1.0',
    date: '2026-02-15T15:00:00.000Z',
    origin: 'CAMPO',
    theme: 'MATURIDADE',
    hypothesis: 'A periodicidade de reavaliação institucional deve ser contextual e pactuada, não devendo a plataforma impor 12 meses fixos ou cálculo automático de 180 dias.',
    observedProblem: 'O Retrato Executivo exibia "Previsão de 12 meses" em fallback hardcoded e o método registerSnapshot calculava arbitrariamente +180 dias.',
    decisionTaken: 'Remoção do fallback de 12 meses e do cálculo automatizado de +180 dias. O campo scheduledNextReview exibe "A definir conforme pactuação institucional" quando não houver data formal registrada.',
    justification: 'A cadência de monitoramento varia conforme a complexidade da Câmara e o plano de evolução definido com os gestores.',
    fieldEvidence: 'Inspeção semântica no código (OutputsView.tsx:438 e PilotContext.tsx:1329).',
    proposedChange: 'Tornar scheduledNextReview opcional em types.ts, ajustar registerSnapshot em PilotContext.tsx e visualizadores em OutputsView.tsx e SnapshotView.tsx.',
    howToTest: 'Verificar Retrato Executivo e SnapshotView: datas existentes continuam exibidas; novos registros sem data definida mostram "A definir conforme pactuação institucional".',
    result: 'Respeito à autonomia institucional de cada Câmara sem fórmulas cronológicas cegas.',
    methodologicalImplication: 'Natureza: Metodologia / Regra de Negócio.',
    productImplication: 'Flexibilidade e transparência para os ciclos futuros.',
    researchImplication: 'Permite analisar empiricamente as periodicidades reais adotadas por diferentes municípios.',
    authorName: 'Equipe Metodológica VIPAZ'
  },
  {
    id: 'diary-fase1b1-06',
    organizationId: 'org-camara-vila-esperanca-01',
    dimensionId: 'D1',
    doorId: 'D1.1',
    sessionId: 'sess-fase1b1-ajustes',
    methodologyVersion: 'D1 v1.0',
    date: '2026-02-15T15:15:00.000Z',
    origin: 'FEEDBACK',
    theme: 'USABILIDADE',
    hypothesis: 'O módulo de Relatórios deve operar como um Hub de saídas com cartões informativos e visualizadores dedicados, eliminando navegação aninhada e saturação de tela.',
    observedProblem: 'Na auditoria no Preview, a tela Relatórios exigia forte redução de zoom (zoom out) por acumular abas superiores, abas internas e documentos densos no mesmo contêiner.',
    decisionTaken: 'Reestruturação de ReportsModuleView.tsx em uma Central de Relatórios com cards para cada saída real (Retrato Executivo, Snapshot D1, Rastreabilidade Técnica e Minuta para Publicação), abrindo visualizadores específicos com botão de retorno.',
    justification: 'Redução drástica da carga cognitiva e preservação da legibilidade em resolução padrão (100% de zoom).',
    fieldEvidence: 'Auditoria de tela no Preview e feedback de usabilidade.',
    proposedChange: 'Transformação de ReportsModuleView.tsx em Hub e adaptação de OutputsView.tsx e SnapshotView.tsx com suporte a retorno.',
    howToTest: 'Abrir módulo Relatórios: observar Hub de 4 cards. Clicar em cada saída: abre visualizador dedicado com "Voltar ao Hub" e botão de impressão.',
    result: 'Navegação fluida, visualmente limpa e legível sem necessidade de zoom artificial.',
    methodologicalImplication: 'Natureza: UX / Arquitetura de Informação.',
    productImplication: 'Experiência executiva de padrão profissional para a liderança pública.',
    researchImplication: 'Aumenta a taxa de leitura dos relatórios gerenciais.',
    authorName: 'Equipe de Produto VIPAZ'
  },
  {
    id: 'diary-fase1b1-07',
    organizationId: 'org-camara-vila-esperanca-01',
    dimensionId: 'D1',
    doorId: 'D1.1',
    sessionId: 'sess-fase1b1-ajustes',
    methodologyVersion: 'D1 v1.0',
    date: '2026-02-15T15:30:00.000Z',
    origin: 'FALHA_TECNICA',
    theme: 'USABILIDADE',
    hypothesis: 'A sidebar institucional deve manter a seção de ferramentas técnicas visível na viewport em qualquer altura padrão de tela, desacoplada da rolagem do conteúdo principal.',
    observedProblem: 'O contêiner desktop utilizava h-screen com sticky top-0 logo abaixo de uma navbar fixa de 56px, deslocando a base da sidebar (Ambiente Técnico) para fora da dobra inferior visível.',
    decisionTaken: 'Ajuste da altura para h-[calc(100vh-56px)] com sticky top-[56px], estruturação do flexbox interno com flex-1 min-h-0 overflow-y-auto no menu intermediário e shrink-0 mt-auto na base técnica.',
    justification: 'Garante que os botões de Diário, Testes e Backup fiquem sempre acessíveis ao Facilitador e Administrador sem necessidade de rolar a página até o fim.',
    fieldEvidence: 'Inspeção do layout em App.tsx e InstitutionalSidebar.tsx.',
    proposedChange: 'Correção de classes CSS no InstitutionalSidebar.tsx.',
    howToTest: 'Verificar barra lateral em telas com altura de 700px a 900px: Ambiente Técnico permanece fixado na base visível.',
    result: 'Sidebar perfeitamente responsiva e alinhada à viewport.',
    methodologicalImplication: 'Natureza: Bug Técnico / Layout CSS.',
    productImplication: 'Acesso imediato às ferramentas de auditoria e contingência.',
    researchImplication: 'Facilita anotações de campo em tempo real no Diário Metodológico durante entrevistas.',
    authorName: 'Equipe Técnica VIPAZ'
  }
];

// Telemetria metodológica inicial do piloto
export const SEED_TELEMETRY: MethodologicalTelemetry = {
  totalProbes: 2,
  probesByOrigin: { ia: 1, adapted: 0, created: 1 },
  pedagogicalInterventionsCount: 1,
  dontKnowCount: 1,
  dontKnowByReason: {
    FORA_DA_VISIBILIDADE: 1,
    INCOMPREENSAO_CONCEITUAL: 0,
    OUTRA_FONTE_PODE_INFORMAR: 0
  },
  distributedRequestsCount: 2,
  divergencesCount: 1,
  divergencesResolved: 0,
  evidencesCount: {
    indicated: 3,
    presented: 3,
    verified: 2,
    inadequate: 1
  },
  aiAnalysesAccepted: 1,
  aiAnalysesAdjusted: 0,
  aiAnalysesRejected: 0,
  blockingPendenciesCount: 1,
  doorExplorationStates: INITIAL_DOOR_STATUSES,
  sufficiencyStatus: 'SUFICIENTE_PARA_NIVEL',
  cycleTimeMinutesApprox: 165
};
