/**
 * VIPAZ — Minha Rota
 * Bloco 2.2 — Regras de Menor Intervenção Suficiente (Versão Corrigida)
 *
 * Aplicação do princípio: MANTER → APROVEITAR → ADAPTAR → INTEGRAR → CONSTRUIR.
 *
 * Diretrizes estritas de integridade:
 * 1. A existência de determinado ativo ou estrutura NÃO implica automaticamente inadequação;
 * 2. APROVEITAR pode existir de forma pura, sem ADAPTAR ou INTEGRAR;
 * 3. INTEGRAR pode existir de forma pura, sem CONSTRUIR;
 * 4. Modalidades secundárias somente aparecem quando houver fundamento fático específico;
 * 5. Não inventa modalidades ausentes apenas para completar composições;
 * 6. Não confunde modalidades de intervenção com regimes decisórios (ASSISTIDO/HUMANO).
 */

import {
  BasicInterventionModality,
  InterventionStrategyComposition
} from '../../types/routing';

export interface InstitutionAssetContext {
  /** Existência fática de estrutura (norma, portaria, regimento, fluxo ou software) */
  hasExistingStructure?: boolean;
  /** Descrição objetiva da estrutura identificada */
  existingStructureDescription?: string;
  /** A estrutura existente foi verificada como suficiente e adequada aos objetivos? */
  isStructureSufficientAndAdequate?: boolean;

  /** Necessidade especificamente demonstrada por evidência de adaptação/revisão */
  demonstratedNeedForAdaptation?: boolean;
  adaptationNeedReason?: string;

  /** Necessidade especificamente demonstrada por evidência de integração (entre setores, rotinas ou sistemas) */
  demonstratedNeedForIntegration?: boolean;
  integrationNeedReason?: string;

  /** Componente, fluxo ou instrumento faticamente ausente que demande construção ex-nihilo */
  demonstratedMissingComponentNeedingConstruction?: boolean;
  constructionNeedReason?: string;

  /** Capacidade já atestada como plenamente demonstrada e em vigência */
  isCapacityFullyDemonstrated?: boolean;

  // Campos de compatibilidade para evitar quebras em chamadas legadas
  hasExistingNormOrInstrument?: boolean;
  existingInstrumentDescription?: string;
  hasInformalRoutine?: boolean;
  hasExistingSoftwareOrTool?: boolean;
}

/**
 * Avalia e deriva a composição da Menor Intervenção Suficiente.
 * Retorna undefined se os dados probatórios forem insuficientes para legitimar uma intervenção.
 * Não inventa modalidades secundárias sem lastro fático explícito.
 */
export function deriveInterventionComposition(
  context: InstitutionAssetContext,
  rationaleBase?: string
): InterventionStrategyComposition | undefined {
  // Normalização de compatibilidade de campos
  const hasStructure = 
    context.hasExistingStructure !== undefined 
      ? context.hasExistingStructure 
      : (context.hasExistingNormOrInstrument || context.hasExistingSoftwareOrTool);

  const structureDesc = 
    context.existingStructureDescription || context.existingInstrumentDescription;

  // Se nenhum fato ou evidência estrutural foi fornecido, não inventamos intervenção
  if (
    hasStructure === undefined &&
    context.isCapacityFullyDemonstrated === undefined &&
    context.demonstratedNeedForAdaptation === undefined &&
    context.demonstratedNeedForIntegration === undefined &&
    context.demonstratedMissingComponentNeedingConstruction === undefined &&
    context.hasInformalRoutine === undefined
  ) {
    return undefined;
  }

  // 1. MANTER: Capacidade já atestada como plenamente demonstrada
  if (context.isCapacityFullyDemonstrated) {
    return {
      primaryModality: 'MANTER',
      justification: rationaleBase || 'Prática ou capacidade plenamente demonstrada na Câmara; intervenção restrita à sustentação e continuidade.'
    };
  }

  // 2. APROVEITAR: Existe estrutura institucional preliminar legítima
  if (hasStructure) {
    const secondary: BasicInterventionModality[] = [];

    // Modalidades secundárias somente aparecem quando houver fundamento específico demonstrado
    if (context.demonstratedNeedForAdaptation) {
      secondary.push('ADAPTAR');
    }
    if (context.demonstratedNeedForIntegration) {
      secondary.push('INTEGRAR');
    }
    if (context.demonstratedMissingComponentNeedingConstruction) {
      secondary.push('CONSTRUIR');
    }

    const justificationDetails: string[] = [];
    if (context.isStructureSufficientAndAdequate) {
      justificationDetails.push('A estrutura existente é considerada adequada, demandando apenas aproveitamento direto.');
    }
    if (context.adaptationNeedReason) {
      justificationDetails.push(`Adaptação justificada: ${context.adaptationNeedReason}.`);
    }
    if (context.integrationNeedReason) {
      justificationDetails.push(`Integração justificada: ${context.integrationNeedReason}.`);
    }
    if (context.constructionNeedReason) {
      justificationDetails.push(`Construção complementar justificada: ${context.constructionNeedReason}.`);
    }

    return {
      primaryModality: 'APROVEITAR',
      secondaryModalities: secondary.length > 0 ? secondary : undefined,
      justification: rationaleBase || [
        `Aproveitamento da estrutura existente (${structureDesc || 'instrumento/ativo identificado'}).`,
        ...justificationDetails
      ].join(' ')
    };
  }

  // 3. INTEGRAR: Prática ou integração entre setores/rotinas sem estrutura formal prévia a aproveitar
  if (context.demonstratedNeedForIntegration || context.hasInformalRoutine) {
    const secondary: BasicInterventionModality[] = [];

    // INTEGRAR pode existir sem CONSTRUIR! Somente adiciona CONSTRUIR se houver necessidade demonstrada
    if (context.demonstratedMissingComponentNeedingConstruction) {
      secondary.push('CONSTRUIR');
    }

    return {
      primaryModality: 'INTEGRAR',
      secondaryModalities: secondary.length > 0 ? secondary : undefined,
      justification: rationaleBase || [
        'Integração e alinhamento de rotinas operacionais ou setoriais preexistentes.',
        context.integrationNeedReason ? `Fundamento: ${context.integrationNeedReason}.` : '',
        context.constructionNeedReason ? `Complemento: ${context.constructionNeedReason}.` : ''
      ].filter(Boolean).join(' ')
    };
  }

  // 4. CONSTRUIR: Ausência fática de base ou necessidade específica de construção demonstrada
  if (context.demonstratedMissingComponentNeedingConstruction || hasStructure === false) {
    return {
      primaryModality: 'CONSTRUIR',
      justification: rationaleBase || (
        context.constructionNeedReason 
          ? `Construção necessária: ${context.constructionNeedReason}.`
          : 'Edificação de nova estrutura ou processo normativo não existente na instituição.'
      )
    };
  }

  // Se não foi possível determinar legitimamente com os dados disponíveis, não inventamos
  return undefined;
}
