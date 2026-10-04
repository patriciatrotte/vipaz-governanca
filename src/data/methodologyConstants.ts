import { CapacityDefinition, DoorDefinition, MaturityLevel } from '../types';

export const METHODOLOGY_VERSION = 'VIPAZ-D1 / 2.0 / DRAFT';
export const VERTICAL_NAME = 'Poder Público Municipal — Câmaras Municipais';

export const MOTHER_QUESTION =
  '“A organização demonstra capacidades institucionais suficientes para sustentar a governança de privacidade e proteção de dados no contexto avaliado?”';

export const DOORS_DEFINITIONS: DoorDefinition[] = [
  {
    id: 'D1.1', code: 'Pergunta 1', title: 'Atuação do Encarregado',
    essentialQuestion: 'Quando chega até você uma questão relacionada à proteção de dados, como você normalmente conduz essa situação?',
    objective: 'Compreender como o Encarregado conduz sua atuação na prática e distinguir o que realiza diretamente, o que conduz com apoio e quando aciona outras pessoas ou áreas.',
    focusAreas: ['Compreensão da demanda', 'Orientação', 'Articulação', 'Atuação com apoio', 'Iniciativa', 'Encaminhamento'],
    internalLenses: ['C1_CONDUCAO'],
    contextualHelp: {
      scopeExplanation: 'Pense em situações reais que possam chegar ao Encarregado. Os exemplos ajudam a situar a conversa; não é necessário que todos já tenham ocorrido.',
      practicalSituations: [
        'Um cidadão ou servidor pergunta quais dados a Câmara possui sobre ele ou solicita acesso, correção ou outra providência.',
        'Surge dúvida sobre dados pessoais ou dados sensíveis, como informações de saúde, biometria, filiação sindical, origem racial ou étnica.',
        'Uma área pretende iniciar ou alterar um processo, sistema, contrato ou serviço que utiliza dados pessoais.',
        'Ocorre um incidente, exposição indevida ou outro problema envolvendo dados e é necessário orientar quem deve participar.',
        'Você não sabe resolver sozinho, mas identifica quem pode apoiar — por exemplo, Jurídico, TI, RH, gestão ou outra área.'
      ]
    }
  },
  {
    id: 'D1.2', code: 'Pergunta 2', title: 'Avanço das providências',
    essentialQuestion: 'Quando você precisa que outra pessoa ou área adote uma providência relacionada à proteção de dados, como isso costuma acontecer?',
    objective: 'Observar o esforço necessário para que uma providência avance: compreensão, orientação, acompanhamento, cobrança, demora, urgência e reconhecimento dos caminhos.',
    focusAreas: ['Fluidez', 'Esforço', 'Insistência', 'Urgência', 'Caminhos conhecidos'],
    internalLenses: ['C2_FLUIDEZ'],
    contextualHelp: {
      scopeExplanation: 'Considere qualquer situação em que o andamento dependa de outra pessoa ou área. Se ainda não houve experiência suficiente, isso também é uma informação válida.',
      practicalSituations: [
        'Pedir a uma área uma informação necessária para responder uma demanda.',
        'Solicitar uma correção ou providência relacionada ao uso de dados pessoais.',
        'Orientar alguém sobre como tratar uma situação e acompanhar se ela avançou.',
        'Precisar cobrar uma resposta, explicar novamente o pedido ou lidar com demora.',
        'Descobrir quem é a pessoa ou área responsável porque o caminho ainda não está claro.'
      ]
    }
  },
  {
    id: 'D1.3', code: 'Pergunta 3', title: 'Apoio e decisões da gestão',
    essentialQuestion: 'Quando uma questão de proteção de dados depende de decisão, autorização, priorização ou recurso da gestão, como isso costuma acontecer?',
    objective: 'Compreender se questões que ultrapassam a atuação direta do Encarregado conseguem chegar a quem pode orientar, autorizar, priorizar ou decidir.',
    focusAreas: ['Caminho até a gestão', 'Acesso a quem decide', 'Apoio institucional', 'Esforço necessário'],
    internalLenses: ['C3_ESCALONAMENTO'],
    contextualHelp: {
      scopeExplanation: 'Pense em situações que o Encarregado não consegue resolver sozinho e que precisam chegar a alguém com competência para decidir ou viabilizar uma providência.',
      practicalSituations: [
        'Levar uma questão à Presidência, Mesa Diretora, Diretoria ou outra instância de gestão.',
        'Buscar apoio do Jurídico, TI, RH, Ouvidoria, Controle Interno ou outra área que participe do assunto.',
        'Solicitar autorização, prioridade, recurso, contratação ou mudança que depende da gestão.',
        'Não haver um caminho formal, mas existir acesso direto a quem pode analisar ou decidir.',
        'Ainda não ter surgido situação desse tipo desde a sua designação.'
      ]
    }
  },
  {
    id: 'D1.4', code: 'Pergunta 4', title: 'Recuperação das informações',
    essentialQuestion: 'Quando uma questão de proteção de dados já foi tratada, você consegue recuperar o que foi feito, decidido ou orientado para utilizar como referência posteriormente?',
    adaptedQuestion: 'Quando precisa recuperar essas informações, você sabe onde procurar e consegue acessar o que precisa?',
    objective: 'Compreender se informações e registros podem ser localizados, recuperados, acessados, relacionados e reutilizados.',
    focusAreas: ['Recuperabilidade', 'Localização', 'Acesso', 'Memória institucional', 'Fontes de conhecimento'],
    internalLenses: ['C4_CONHECIMENTO'],
    contextualHelp: {
      scopeExplanation: 'Considere onde ficam as informações que ajudam a lembrar o que já aconteceu e a reutilizar decisões ou orientações anteriores.',
      practicalSituations: [
        'Localizar uma portaria, parecer, e-mail, ata, processo administrativo ou registro em sistema.',
        'Recuperar uma orientação dada anteriormente para utilizar em situação semelhante.',
        'Encontrar informações que estão com outra pessoa ou área.',
        'Saber onde procurar mesmo quando os registros estão distribuídos em locais diferentes.',
        'Perceber que determinada informação existe, mas é difícil localizá-la ou acessá-la.'
      ]
    }
  },
  {
    id: 'D1.5', code: 'Pergunta 5', title: 'Acompanhamento das mudanças',
    essentialQuestion: 'Hoje, como você acompanha se a forma como a Câmara trata privacidade e proteção de dados continua adequada ou se alguma coisa precisa ser revista?',
    objective: 'Identificar como mudanças, dificuldades, ocorrências ou novas orientações são percebidas e levam à análise da forma de atuação.',
    focusAreas: ['Acompanhamento', 'Mudanças normativas', 'Mudanças internas', 'Controles', 'Sinais de revisão'],
    internalLenses: ['C5_ACOMPANHAMENTO'],
    contextualHelp: {
      scopeExplanation: 'A revisão não precisa acontecer por uma rotina formal ou periódica. Queremos compreender o que faz você perceber que algo pode precisar ser analisado novamente.',
      practicalSituations: [
        'Surge nova lei, norma, orientação ou manifestação da ANPD.',
        'A Câmara muda um sistema, processo, serviço, fornecedor ou forma de utilizar dados.',
        'Começa um novo tratamento ou passam a ser utilizados novos tipos de dados.',
        'Ocorre incidente, reclamação, demanda de titular ou dificuldade na rotina.',
        'Uma análise, controle ou experiência anterior mostra que algo pode ser melhorado.'
      ]
    }
  },
  {
    id: 'D1.6', code: 'Pergunta 6', title: 'Providências e melhorias',
    essentialQuestion: 'Quando você identifica algo que pode exigir uma mudança, o que normalmente acontece?',
    objective: 'Compreender o caminho entre perceber uma necessidade e analisar, propor, encaminhar, implementar ou acompanhar uma mudança, sem presumir que todas essas etapas ocorram.',
    focusAreas: ['Análise', 'Proposição', 'Encaminhamento', 'Implementação', 'Acompanhamento'],
    internalLenses: ['C5_EVOLUCAO'],
    contextualHelp: {
      scopeExplanation: 'Pense no que acontece depois que uma necessidade de mudança é percebida. Queremos entender até onde você acompanha esse caminho e quem participa dele.',
      practicalSituations: [
        'A situação é analisada antes de decidir se alguma mudança é necessária.',
        'Uma orientação ou proposta de melhoria é preparada e encaminhada.',
        'Outra pessoa, área ou a gestão precisa decidir ou executar a providência.',
        'A mudança é implementada e existe alguma forma de acompanhar o que aconteceu.',
        'A necessidade é reconhecida, mas a implementação ainda depende de tempo, recurso, contratação, decisão ou outra condição.'
      ]
    }
  }
];

export const CAPACITIES_DEFINITIONS: CapacityDefinition[] = [
  {
    id: 'C1',
    name: 'Condução da Governança',
    description: 'O Encarregado compreende seu papel e consegue orientar, articular, propor, encaminhar e escalar adequadamente aquilo que surge em sua atuação.'
  },
  {
    id: 'C2',
    name: 'Fluidez da Atuação Institucional',
    description: 'As providências necessárias avançam por caminhos suficientemente reconhecíveis e com esforço proporcional, sem dependência sistemática de improvisação, insistência ou urgência.'
  },
  {
    id: 'C3',
    name: 'Escalonamento Institucional',
    description: 'Questões que ultrapassam a governabilidade do Encarregado conseguem alcançar a instância competente.'
  },
  {
    id: 'C4',
    name: 'Gestão do Conhecimento e Sustentação',
    description: 'Conhecimentos, registros e evidências distribuídos podem ser localizados, recuperados, relacionados e reutilizados para sustentar a governança.'
  },
  {
    id: 'C5',
    name: 'Acompanhamento e Evolução',
    description: 'A governança permanece sob acompanhamento, considera mudanças internas e externas e retroalimenta sua evolução.'
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
