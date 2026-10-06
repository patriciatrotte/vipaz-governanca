/**
 * VIPAZ — Minha Rota
 * Bloco D1-A — Definições Canônicas de Capacidades e Critérios D1
 *
 * Taxonomia homologada:
 * - 6 Capacidades: D1.1 a D1.6
 * - 19 Critérios: C1.1-A até C1.6-D
 *
 * NOTA: Campos dependentes da Matriz Mestra (proofRequirement, nonTriggeredEffect,
 * pointsOfValidation) permanecem nulos/indefinidos até injeção da Matriz Mestra D1 v2.
 */

import {
  CanonicalCapacityId,
  CanonicalCriterionId,
  CanonicalCapacityDefinition,
  CanonicalCriterionDefinition
} from '../../types/d1Inference';

export const CANONICAL_CAPACITIES_D1: Record<CanonicalCapacityId, CanonicalCapacityDefinition> = {
  'D1.1': {
    id: 'D1.1',
    code: 'D1.1',
    title: 'Organização institucional',
    description: 'Arranjo funcional reconhecível, acionável e com cobertura funcional mínima para a governança.',
    criteriaIds: ['C1.1-A', 'C1.1-B']
  },
  'D1.2': {
    id: 'D1.2',
    code: 'D1.2',
    title: 'Encarregado',
    description: 'Instituição regular, exercício funcional, acesso, condições e compatibilidade funcional do Encarregado.',
    criteriaIds: ['C1.2-A', 'C1.2-B', 'C1.2-C', 'C1.2-D']
  },
  'D1.3': {
    id: 'D1.3',
    code: 'D1.3',
    title: 'Responsabilidades',
    description: 'Distribuição funcional, apropriação e exercício efetivo das responsabilidades em privacidade.',
    criteriaIds: ['C1.3-A', 'C1.3-B', 'C1.3-C']
  },
  'D1.4': {
    id: 'D1.4',
    code: 'D1.4',
    title: 'Articulação',
    description: 'Participação responsiva, coordenação funcional e encaminhamento/fechamento das demandas.',
    criteriaIds: ['C1.4-A', 'C1.4-B', 'C1.4-C']
  },
  'D1.5': {
    id: 'D1.5',
    code: 'D1.5',
    title: 'Gestão',
    description: 'Acesso decisório, resposta deliberativa e viabilização proporcional de recursos e prioridades.',
    criteriaIds: ['C1.5-A', 'C1.5-B', 'C1.5-C']
  },
  'D1.6': {
    id: 'D1.6',
    code: 'D1.6',
    title: 'Continuidade',
    description: 'Substituibilidade funcional, recuperabilidade de conhecimento/pendências e reutilização de aprendizagens.',
    criteriaIds: ['C1.6-A', 'C1.6-B', 'C1.6-C', 'C1.6-D']
  }
};

export const CANONICAL_CRITERIA_D1: Record<CanonicalCriterionId, CanonicalCriterionDefinition> = {
  // D1.1 — Organização institucional (2)
  'C1.1-A': {
    id: 'C1.1-A',
    capacityId: 'D1.1',
    code: 'C1.1-A',
    title: 'Arranjo funcional reconhecível e acionável',
    description: 'A governança de privacidade dispõe de arranjo funcional reconhecível internamente e capaz de ser acionado na rotina.',
    allowNonTriggered: false
  },
  'C1.1-B': {
    id: 'C1.1-B',
    capacityId: 'D1.1',
    code: 'C1.1-B',
    title: 'Cobertura funcional mínima',
    description: 'O arranjo existente cobre os âmbitos essenciais de operação e tomada de providências da instituição.',
    allowNonTriggered: false
  },

  // D1.2 — Encarregado (4)
  'C1.2-A': {
    id: 'C1.2-A',
    capacityId: 'D1.2',
    code: 'C1.2-A',
    title: 'Instituição regular da função',
    description: 'A designação do Encarregado está regularmente estabelecida na instituição.',
    allowNonTriggered: false
  },
  'C1.2-B': {
    id: 'C1.2-B',
    capacityId: 'D1.2',
    code: 'C1.2-B',
    title: 'Exercício funcional',
    description: 'O Encarregado exerce de fato suas atribuições na condução, orientação e mediação de demandas.',
    allowNonTriggered: false
  },
  'C1.2-C': {
    id: 'C1.2-C',
    capacityId: 'D1.2',
    code: 'C1.2-C',
    title: 'Acesso e condições institucionais',
    description: 'O Encarregado possui acesso às áreas, informações e condições institucionais necessárias à sua atuação.',
    allowNonTriggered: false
  },
  'C1.2-D': {
    id: 'C1.2-D',
    capacityId: 'D1.2',
    code: 'C1.2-D',
    title: 'Compatibilidade funcional',
    description: 'A atuação do Encarregado é compatível com suas demais atribuições, sem conflitos estruturais de interesse ou sobrecarga impeditiva.',
    allowNonTriggered: false
  },

  // D1.3 — Responsabilidades (3)
  'C1.3-A': {
    id: 'C1.3-A',
    capacityId: 'D1.3',
    code: 'C1.3-A',
    title: 'Distribuição funcional',
    description: 'As responsabilidades por proteção de dados estão distribuídas pelas áreas e setores competentes da instituição.',
    allowNonTriggered: false
  },
  'C1.3-B': {
    id: 'C1.3-B',
    capacityId: 'D1.3',
    code: 'C1.3-B',
    title: 'Apropriação da responsabilidade',
    description: 'As áreas e servidores compreendem e reconhecem seu papel e responsabilidades em suas respectivas rotinas.',
    allowNonTriggered: false
  },
  'C1.3-C': {
    id: 'C1.3-C',
    capacityId: 'D1.3',
    code: 'C1.3-C',
    title: 'Exercício',
    description: 'As áreas e servidores executam as providências de proteção de dados cabíveis no fluxo de suas atividades.',
    allowNonTriggered: false
  },

  // D1.4 — Articulação (3)
  'C1.4-A': {
    id: 'C1.4-A',
    capacityId: 'D1.4',
    code: 'C1.4-A',
    title: 'Participação responsiva',
    description: 'As áreas acionadas respondem tempestivamente e cooperam com as demandas de privacidade.',
    allowNonTriggered: false
  },
  'C1.4-B': {
    id: 'C1.4-B',
    capacityId: 'D1.4',
    code: 'C1.4-B',
    title: 'Coordenação funcional',
    description: 'Existe coordenação fluida entre Encarregado, TI, Jurídico, RH e áreas de negócio na condução dos casos.',
    allowNonTriggered: false
  },
  'C1.4-C': {
    id: 'C1.4-C',
    capacityId: 'D1.4',
    code: 'C1.4-C',
    title: 'Encaminhamento e fechamento',
    description: 'As demandas e orientações de privacidade alcançam conclusão efetiva e fechamento operacional.',
    allowNonTriggered: false
  },

  // D1.5 — Gestão (3)
  'C1.5-A': {
    id: 'C1.5-A',
    capacityId: 'D1.5',
    code: 'C1.5-A',
    title: 'Acesso decisório',
    description: 'Questões que demandam deliberação superior alcançam as instâncias decisórias com governabilidade.',
    allowNonTriggered: false
  },
  'C1.5-B': {
    id: 'C1.5-B',
    capacityId: 'D1.5',
    code: 'C1.5-B',
    title: 'Resposta decisória',
    description: 'A gestão manifesta-se formal ou materialmente sobre as necessidades e riscos de proteção de dados submetidos.',
    allowNonTriggered: false
  },
  'C1.5-C': {
    id: 'C1.5-C',
    capacityId: 'D1.5',
    code: 'C1.5-C',
    title: 'Viabilização proporcional',
    description: 'A instituição assegura recursos, priorizações e meios proporcionais à viabilização das deliberações.',
    allowNonTriggered: false
  },

  // D1.6 — Continuidade (4)
  'C1.6-A': {
    id: 'C1.6-A',
    capacityId: 'D1.6',
    code: 'C1.6-A',
    title: 'Substituibilidade funcional',
    description: 'A governança de dados sustenta-se institucionalmente sem risco de descontinuidade imediata por ausência de agente individual.',
    allowNonTriggered: false
  },
  'C1.6-B': {
    id: 'C1.6-B',
    capacityId: 'D1.6',
    code: 'C1.6-B',
    title: 'Recuperabilidade da informação e do conhecimento',
    description: 'Orientações, pareceres, mapeamentos e conhecimentos acumulados podem ser localizados e recuperados.',
    allowNonTriggered: false
  },
  'C1.6-C': {
    id: 'C1.6-C',
    capacityId: 'D1.6',
    code: 'C1.6-C',
    title: 'Recuperabilidade das pendências',
    description: 'O andamento de providências abertas, prazos e demandas pendentes permanece rastreável e recuperável.',
    allowNonTriggered: false
  },
  'C1.6-D': {
    id: 'C1.6-D',
    capacityId: 'D1.6',
    code: 'C1.6-D',
    title: 'Reutilização da aprendizagem institucional',
    description: 'Experiências anteriores, incidentes tratados e recomendações são reutilizados para aperfeiçoar a atuação.',
    allowNonTriggered: true // Admite NAO_ACIONADO caso não tenha havido histórico de incidentes/revisões
  }
};
