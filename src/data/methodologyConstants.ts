import { CapacityDefinition, DoorDefinition, MaturityLevel } from '../types';

export const METHODOLOGY_VERSION = 'D1 v1.0';
export const VERTICAL_NAME = 'Poder Público Municipal — Câmaras Municipais';

export const MOTHER_QUESTION =
  '“A organização possui capacidade institucional para conduzir a governança de privacidade, mobilizar a atuação necessária, alcançar as instâncias competentes, preservar e conectar conhecimento e manter essa governança em evolução?”';

export const DOORS_DEFINITIONS: DoorDefinition[] = [
  {
    id: 'D1.1',
    code: 'Pergunta 1',
    title: 'Condução da Governança',
    essentialQuestion: 'Quando chega até você uma questão relacionada à proteção de dados, como você normalmente conduz essa situação?',
    objective: 'Compreender como o Encarregado conduz sua atuação na prática e validar, pela escuta, as responsabilidades que consegue exercer.',
    focusAreas: ['Compreensão da demanda', 'Orientação', 'Articulação', 'Iniciativa', 'Escalonamento'],
    internalLenses: ['C1_CONDUCAO']
  },
  {
    id: 'D1.2',
    code: 'Pergunta 2',
    title: 'Fluidez da Atuação Institucional',
    essentialQuestion: 'Quando você precisa que outra pessoa ou área adote uma providência relacionada à proteção de dados, como isso costuma acontecer?',
    objective: 'Observar o esforço necessário para a atuação institucional: fluidez, orientação, cobrança, demora, urgência e reconhecimento dos caminhos.',
    focusAreas: ['Fluidez', 'Esforço', 'Insistência', 'Urgência', 'Caminhos conhecidos'],
    internalLenses: ['C2_FLUIDEZ']
  },
  {
    id: 'D1.3',
    code: 'Pergunta 3',
    title: 'Escalonamento Institucional',
    essentialQuestion: 'Quando uma questão de proteção de dados depende de decisão, autorização, priorização ou recurso da gestão, como isso costuma acontecer?',
    objective: 'Compreender se questões que ultrapassam a governabilidade do Encarregado conseguem alcançar a instância competente.',
    focusAreas: ['Caminho de escalonamento', 'Acesso à instância competente', 'Esforço necessário'],
    internalLenses: ['C3_ESCALONAMENTO']
  },
  {
    id: 'D1.4',
    code: 'Pergunta 4',
    title: 'Gestão do Conhecimento e Sustentação',
    essentialQuestion: 'Quando uma questão de proteção de dados já foi tratada, você consegue recuperar o que foi feito, decidido ou orientado para utilizar como referência posteriormente?',
    adaptedQuestion: 'Quando precisa recuperar essas informações, você sabe onde procurar e consegue acessar o que precisa?',
    objective: 'Compreender se o conhecimento distribuído pode ser localizado, recuperado, acessado, relacionado e reutilizado.',
    focusAreas: ['Recuperabilidade', 'Localização', 'Acesso', 'Memória institucional', 'Fontes de conhecimento'],
    internalLenses: ['C4_CONHECIMENTO']
  },
  {
    id: 'D1.5',
    code: 'Pergunta 5',
    title: 'Acompanhamento da Governança',
    essentialQuestion: 'Hoje, como você acompanha se a forma como a Câmara trata privacidade e proteção de dados continua adequada ou se alguma coisa precisa ser revista?',
    objective: 'Identificar como a governança é acompanhada e quais mudanças internas ou externas provocam revisão.',
    focusAreas: ['Acompanhamento contínuo', 'Mudanças normativas', 'Mudanças internas', 'Controles', 'Retroalimentação'],
    internalLenses: ['C5_ACOMPANHAMENTO']
  },
  {
    id: 'D1.6',
    code: 'Pergunta 6',
    title: 'Evolução e Retroalimentação',
    essentialQuestion: 'Quando você identifica algo que pode exigir uma mudança, o que normalmente acontece?',
    objective: 'Compreender como necessidades identificadas produzem análise, orientação, proposta, articulação, escalonamento ou acompanhamento.',
    focusAreas: ['Análise', 'Ajuste', 'Proposição', 'Encaminhamento', 'Reavaliação'],
    internalLenses: ['C5_EVOLUCAO']
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
