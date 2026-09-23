import { CapacityDefinition, DoorDefinition, MaturityLevel } from '../types';

export const METHODOLOGY_VERSION = 'D1 v1.0';
export const VERTICAL_NAME = 'Poder Público Municipal — Câmaras Municipais';

export const MOTHER_QUESTION = 
  '“Em que medida a Câmara possui uma estrutura de governança em privacidade capaz de definir responsabilidades, sustentar a atuação do Encarregado, articular os diferentes atores e manter essa capacidade institucional ao longo do tempo?”';

export const DOORS_DEFINITIONS: DoorDefinition[] = [
  {
    id: 'D1.1',
    code: 'D1.1',
    title: 'Rede de Governança',
    essentialQuestion: 'Pensando em como as coisas acontecem hoje na Câmara, quando surge algum assunto envolvendo privacidade ou dados pessoais, quem normalmente participa e o que cada pessoa ou área costuma fazer? Pense nas situações da rotina: algumas podem ser tratadas diretamente pelo Encarregado; outras podem exigir alguém do RH, da TI, da gestão ou de outra área. Não é necessário que exista uma pessoa específica de privacidade em cada área. Queremos compreender quem participa quando é necessário e como isso funciona hoje na prática.',
    objective: 'Construir o mapa real de atores e competências mobilizados quando necessário, sem pressupor representantes de privacidade em cada área.',
    focusAreas: ['Atores necessários', 'Competências mobilizadas', 'Responsabilidades na prática', 'Definição institucional', 'Fontes mencionadas'],
    internalLenses: ['ATOR', 'QUANDO_PARTICIPA', 'RESPONSABILIDADE', 'DEFINICAO_INSTITUCIONAL', 'FONTE']
  },
  {
    id: 'D1.2',
    code: 'D1.2',
    title: 'Condições de Atuação do Encarregado',
    essentialQuestion: 'Quando você precisa atuar como Encarregado, como isso acontece na prática?',
    objective: 'Investigar condições institucionais de atuação sem avaliar desempenho pessoal.',
    focusAreas: ['Formalização', 'Acessibilidade', 'Publicidade', 'Compreensão do papel', 'Disponibilidade e tempo', 'Apoio e recursos', 'Acesso à gestão', 'Substituição/continuidade'],
    contextualHelp: {
      scopeExplanation: 'Ajuda a esclarecer as condições práticas de trabalho da função, sem qualquer avaliação sobre o desempenho individual do profissional.',
      practicalSituations: [
        'Como a rotina institucional viabiliza tempo, acesso a setores e canais institucionais para o atendimento das demandas.',
        'O que acontece quando surgem dúvidas, necessidade de apoio institucional ou quando há períodos de ausência ou maior volume de atividades.'
      ]
    }
  },
  {
    id: 'D1.3',
    code: 'D1.3',
    title: 'Distribuição de Responsabilidades',
    essentialQuestion: 'Quando surge uma questão envolvendo dados pessoais, quem além do Encarregado precisa agir para que ela seja resolvida?',
    objective: 'Descobrir como responsabilidades são distribuídas entre setores e atores.',
    focusAreas: ['Identificação de atores', 'Processos/situações práticas', 'Funções desempenhadas'],
    internalLenses: ['DECIDE', 'ORIENTA_ARTICULA', 'EXECUTA', 'DETEM_INFORMACAO_EVIDENCIA'],
    contextualHelp: {
      scopeExplanation: 'Auxilia a identificar como diferentes setores e atores institucionais participam dos processos que envolvem dados no dia a dia.',
      practicalSituations: [
        'Em situações práticas que envolvem informações de pessoas (como atendimento ao público, recursos humanos ou informática), quem orienta, quem executa e quem detém os registros.',
        'Como os diversos setores compreendem sua participação na condução das tarefas cotidianas relacionadas a esses dados.'
      ]
    }
  },
  {
    id: 'D1.4',
    code: 'D1.4',
    title: 'Articulação',
    essentialQuestion: 'Quando uma questão de privacidade envolve mais de uma área ou pessoa da Câmara, como vocês se organizam para resolvê-la?',
    objective: 'Descobrir como os atores trabalham conjuntamente em situações concretas.',
    focusAreas: ['Casos multi-setoriais', 'Canais de acionamento', 'Coordenação do fluxo', 'Registro e histórico'],
    internalLenses: ['ACIONAMENTO', 'COORDENACAO', 'RESPOSTA', 'REGISTRO', 'CONTINUIDADE'],
    contextualHelp: {
      scopeExplanation: 'Ajuda a compreender os canais e a dinâmica de colaboração quando uma situação requer o envolvimento de mais de um setor.',
      practicalSituations: [
        'Como os setores se comunicam e coordenam ações conjuntas quando uma demanda ou solicitação envolve mais de uma área institucional.',
        'Quais canais, comunicações ou formas de contato costumam ser utilizados para alinhar o andamento entre as partes envolvidas.'
      ]
    }
  },
  {
    id: 'D1.5',
    code: 'D1.5',
    title: 'Sustentação Gerencial',
    essentialQuestion: 'Quando uma questão de privacidade depende de decisão, apoio ou recurso da gestão, como isso acontece na Câmara?',
    objective: 'Verificar se decisões, prioridades e condições chegam à instância competente e como são tratadas.',
    focusAreas: ['Instância decisória competente', 'Formalização de demandas', 'Priorização institucional', 'Segurança da decisão'],
    internalLenses: ['ACESSO', 'DECISAO', 'PRIORIZACAO', 'RESPONSABILIZACAO'],
    contextualHelp: {
      scopeExplanation: 'Apoia a reflexão sobre como necessidades de deliberação ou recursos chegam e são tratadas nas instâncias de gestão da instituição.',
      practicalSituations: [
        'Quando uma necessidade de recurso, orientação ou decisão institucional precisa ser apreciada pela gestão, como ela costuma ser encaminhada.',
        'Como a direção institucional recebe, responde ou prioriza os temas que dependem de sua deliberação.'
      ]
    }
  },
  {
    id: 'D1.6',
    code: 'D1.6',
    title: 'Continuidade e Evolução',
    essentialQuestion: 'Como vocês acompanham se essa organização de responsabilidades continua funcionando ao longo do tempo?',
    adaptedQuestion: 'Quando alguma ação relacionada à privacidade fica definida, como vocês sabem depois se ela foi realizada ou ainda está pendente?',
    objective: 'Verificar se a governança consegue permanecer funcionando, ser acompanhada e aprender.',
    focusAreas: ['Controle de pendências', 'Acompanhamento periódico', 'Revisão de práticas', 'Aprendizagem institucional'],
    internalLenses: ['PENDENCIA', 'ACOMPANHAMENTO', 'CONTINUIDADE', 'REVISAO', 'APRENDIZAGEM'],
    contextualHelp: {
      scopeExplanation: 'Ajuda a situar como a instituição acompanha suas rotinas, providências e aprendizados ao longo do tempo.',
      practicalSituations: [
        'Como a instituição sabe se orientações, encaminhamentos ou pendências acordadas anteriormente continuam ativas ou foram concluídas.',
        'Como são percebidas necessidades de atualização ou revisão nas práticas que já vinham sendo adotadas.'
      ]
    }
  }
];

export const CAPACITIES_DEFINITIONS: CapacityDefinition[] = [
  {
    id: 'C1',
    name: 'Estruturação',
    description: 'Existe configuração reconhecível de governança na Câmara, com papéis e posicionamento identificáveis.'
  },
  {
    id: 'C2',
    name: 'Sustentação do Encarregado',
    description: 'A função do Encarregado possui condições institucionais, tempo, acesso e suporte para funcionar na prática.'
  },
  {
    id: 'C3',
    name: 'Distribuição',
    description: 'Responsabilidades relevantes não estão concentradas exclusivamente no Encarregado, envolvendo atores-chave.'
  },
  {
    id: 'C4',
    name: 'Articulação',
    description: 'Os diferentes atores e setores conseguem atuar conjuntamente de forma coordenada e previsível.'
  },
  {
    id: 'C5',
    name: 'Sustentação Gerencial',
    description: 'Decisões, prioridades e condições necessárias chegam à instância gerencial competente e recebem encaminhamento.'
  },
  {
    id: 'C6',
    name: 'Continuidade e Evolução',
    description: 'A governança consegue permanecer ativa ao longo do tempo, acompanhar suas ações e aperfeiçoar sua capacidade.'
  }
];

export const MATURITY_LEVELS_INFO: Record<MaturityLevel, { label: string; shortDesc: string; criteriaText: string }> = {
  N1_INICIAL: {
    label: 'N1 — Inicial',
    shortDesc: 'Governança predominantemente individual e informal.',
    criteriaText: 'Papéis e responsabilidades inexistentes, pouco conhecidos ou essencialmente informais. A simples designação do Encarregado não caracteriza maturidade superior.'
  },
  N2_EM_ESTRUTURACAO: {
    label: 'N2 — Em Estruturação',
    shortDesc: 'Iniciativas relevantes em andamento, porém ainda fragmentadas.',
    criteriaText: 'A organização iniciou a estruturação de papéis, responsabilidades e práticas. Existem iniciativas formais ou informais relevantes, mas ainda fragmentadas, reativas, incompletas ou excessivamente dependentes de pessoas específicas.'
  },
  N3_IMPLEMENTADO: {
    label: 'N3 — Implementado',
    shortDesc: 'Governança institucionalizada e demonstrável.',
    criteriaText: 'Papéis, responsabilidades, articulação e condições de funcionamento estão suficientemente definidos e funcionam institucionalmente. A capacidade pode ser demonstrada e não depende exclusivamente do Encarregado.'
  },
  N4_GERENCIADO: {
    label: 'N4 — Gerenciado',
    shortDesc: 'Acompanhamento sistemático e gestão por informações.',
    criteriaText: 'A organização acompanha o funcionamento da governança, revisa responsabilidades e condições, identifica dificuldades e utiliza informações de acompanhamento para gerenciar a capacidade.'
  },
  N5_OTIMIZADO: {
    label: 'N5 — Otimizado',
    shortDesc: 'Aperfeiçoamento contínuo baseado em resultados e riscos.',
    criteriaText: 'Resultados, mudanças, riscos e aprendizados são utilizados sistematicamente para aperfeiçoar a governança.'
  },
  NAO_APURADA: {
    label: 'Maturidade Não Apurada',
    shortDesc: 'D1 em aprofundamento por insuficiência de informações ou comprovação pendente.',
    criteriaText: 'Não há elementos e comprovações suficientes para sustentar seguramente uma conclusão institucional. A falta de informação jamais deve ser convertida em N1.'
  }
};

export const PEDAGOGICAL_CONCEPTS = [
  {
    concept: 'Encarregado pelo Tratamento de Dados (DPO)',
    shortExplanation: 'É a pessoa indicada pela Câmara para atuar como canal de comunicação entre a instituição, os titulares dos dados e a Autoridade Nacional de Proteção de Dados (ANPD).',
    concreteExample: 'Exemplo: Quando um munícipe solicita informações sobre os dados dele no portal da Câmara, o Encarregado orienta os setores para atender o pedido dentro do prazo.',
    neutralQuestion: 'Na rotina da Câmara, existe alguém designado para essa função ou alguém que exerça esse papel na prática?'
  },
  {
    concept: 'Distribuição de Responsabilidades em Privacidade',
    shortExplanation: 'Privacidade não é tarefa exclusiva de uma pessoa ou da TI. Envolve quem decide (gestão/mesa), quem orienta (Encarregado/jurídico), quem executa (RH, protocolo, licitações) e quem detém sistemas e registros.',
    concreteExample: 'Exemplo: Se o RH contrata um estagiário e coleta atestados médicos, é o RH que executa o processo com orientação de privacidade.',
    neutralQuestion: 'Quando surgem dúvidas sobre tratamento de dados no dia a dia, quais setores costumam ser consultados?'
  },
  {
    concept: 'Evidência Institucional de Governança',
    shortExplanation: 'É um documento, fluxo, registro em sistema ou ata que comprova que uma prática de fato ocorre e não é apenas uma intenção verbal.',
    concreteExample: 'Exemplo: Uma ata de reunião da Mesa Diretora aprovando o plano de adequação, ou uma portaria de designação publicada no Diário Oficial.',
    neutralQuestion: 'Essa prática que você descreveu possui algum registro escrito, portaria, chamado em sistema ou modelo arquivado?'
  },
  {
    concept: 'Sustentação Gerencial',
    shortExplanation: 'É a capacidade da estrutura de governança de ter suas necessidades ouvidas, avaliadas e decididas pelos dirigentes com poder deliberativo e orçamentário.',
    concreteExample: 'Exemplo: O Encarregado solicita a contratação de uma ferramenta de segurança e a Presidência/Diretoria-Geral pauta a demanda para deliberação formal.',
    neutralQuestion: 'Como as demandas de privacidade chegam até a Presidência ou Diretoria Geral quando precisam de aprovação?'
  }
];
