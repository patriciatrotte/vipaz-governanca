import { MaturityLevel, CapacityStatus, UserRole } from '../types';
import { MATURITY_LEVELS_INFO } from '../data/methodologyConstants';

/**
 * Formata visualmente o nível de maturidade para apresentação ao usuário,
 * garantindo que nenhum enum técnico bruto (ex: N2_EM_ESTRUTURACAO) seja exibido.
 * Não altera dados internos ou valores do banco.
 */
export function formatMaturityLevel(level?: string | null): string {
  if (!level) return 'Maturidade ainda não apurada';
  
  const trimmed = level.trim();
  const normalizedKey = trimmed.replace(/\s+/g, '_').toUpperCase() as MaturityLevel;

  if (MATURITY_LEVELS_INFO[normalizedKey]) {
    return MATURITY_LEVELS_INFO[normalizedKey].label;
  }

  // Tratamento de variações de enum e texto
  if (normalizedKey.includes('N1')) return 'N1 — Inicial';
  if (normalizedKey.includes('N2')) return 'N2 — Em Estruturação';
  if (normalizedKey.includes('N3')) return 'N3 — Implementado';
  if (normalizedKey.includes('N4')) return 'N4 — Gerenciado';
  if (normalizedKey.includes('N5')) return 'N5 — Otimizado';
  if (normalizedKey.includes('NAO') || normalizedKey.includes('NÃO')) {
    return 'Maturidade ainda não apurada';
  }

  return trimmed.replace(/_/g, ' ');
}

/**
 * Formata visualmente o status das capacidades metodológicas (C1 a C6).
 */
export function formatCapacityStatus(status?: string | null): string {
  if (!status) return '';
  const key = status.trim().toUpperCase();

  switch (key) {
    case 'DEMONSTRADA':
      return 'Demonstrada';
    case 'EM_ESTRUTURACAO':
    case 'EM ESTRUTURACAO':
    case 'EM_ESTRUTURAÇÃO':
      return 'Em Estruturação';
    case 'INSUFICIENTEMENTE_DEMONSTRADA':
    case 'INSUFICIENTEMENTE DEMONSTRADA':
      return 'Insuficientemente Demonstrada';
    case 'INFORMACAO_INSUFICIENTE':
    case 'INFORMACAO INSUFICIENTE':
    case 'INFORMAÇÃO_INSUFICIENTE':
      return 'Informação Insuficiente';
    case 'ELEMENTO_AVANCADO':
    case 'ELEMENTO AVANCADO':
    case 'ELEMENTO_AVANÇADO':
      return 'Elemento Avançado';
    default:
      return status.replace(/_/g, ' ');
  }
}

/**
 * Formata o papel do usuário para exibição institucional sóbria e precisa.
 */
export function formatUserRole(role?: UserRole | string | null): string {
  if (!role) return '';
  switch (role) {
    case 'FACILITADOR':
      return 'Facilitador Metodológico';
    case 'INTERLOCUTOR_PRINCIPAL':
      return 'Interlocutor Principal';
    case 'GESTOR_INSTITUCIONAL':
      return 'Gestor Institucional';
    case 'PARTICIPANTE':
      return 'Participante Setorial';
    case 'ADMINISTRADOR':
      return 'Administrador';
    default:
      return role.replace(/_/g, ' ');
  }
}

/**
 * Formata os rótulos das etapas da jornada na interface principal.
 */
export function formatStageLabel(stageId: string, defaultLabel: string): string {
  switch (stageId) {
    case 'portas':
      return 'Diagnóstico D1';
    case 'contribuicoes':
      return 'Contribuições';
    case 'evidencias_pendencias':
      return 'Evidências e Pendências';
    case 'integracao_validacao':
      return 'Análise e Validação';
    case 'plano_evolucao':
      return 'Plano de Evolução';
    default:
      return defaultLabel;
  }
}

/**
 * Camada de apresentação que higieniza textos derivados e títulos,
 * substituindo termos proibidos (ex: "homologação", "Facilitador Credenciado", etc.)
 * sem alterar dados primários ou regras do journeyEngine.
 */
export function cleanPresentationText(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/N2_EM_ESTRUTURACAO/g, 'N2 — Em Estruturação')
    .replace(/N2 EM_ESTRUTURACAO/g, 'N2 — Em Estruturação')
    .replace(/N2 EM ESTRUTURACAO/g, 'N2 — Em Estruturação')
    .replace(/N1_INICIAL/g, 'N1 — Inicial')
    .replace(/N3_IMPLEMENTADO/g, 'N3 — Implementado')
    .replace(/N4_GERENCIADO/g, 'N4 — Gerenciado')
    .replace(/N5_OTIMIZADO/g, 'N5 — Otimizado')
    .replace(/Maturidade Homologada/gi, 'Maturidade Validada Metodologicamente')
    .replace(/maturidade homologada/gi, 'maturidade validada metodologicamente')
    .replace(/homologação humana/gi, 'validação metodológica humana')
    .replace(/homologação de maturidade/gi, 'validação metodológica de maturidade')
    .replace(/homologação do diagnóstico/gi, 'validação metodológica do diagnóstico')
    .replace(/Nível\s+([Nn][1-5]\s*[-—–]\s*[^,\.\n]+?)\s+(?:homologado|validado\s+metodologicamente)\s+pelo\s+Facilitador/gi, 'Nível consolidado: $1')
    .replace(/([Nn][1-5]\s*[-—–]\s*[^,\.\n]+?)\s+(?:homologado|validado\s+metodologicamente)\s+pelo\s+Facilitador/gi, '$1 • Validado metodologicamente')
    .replace(/Nível\s+([Nn][1-5]\s*[-—–]\s*[^,\.\n]+?)\s+homologado/gi, 'Nível consolidado: $1')
    .replace(/Nível Homologado:\s*/gi, 'Nível consolidado: ')
    .replace(/homologado pelo Facilitador/gi, 'validado metodologicamente')
    .replace(/homologada pelo Facilitador/gi, 'validada metodologicamente')
    .replace(/validado metodologicamente pelo Facilitador/gi, 'validado metodologicamente')
    .replace(/validada metodologicamente pelo Facilitador/gi, 'validada metodologicamente')
    .replace(/validada pelo Facilitador/gi, 'validada metodologicamente')
    .replace(/validado pelo Facilitador/gi, 'validado metodologicamente')
    .replace(/homologados para órgãos de controle/gi, 'validados metodologicamente para órgãos de controle')
    .replace(/Retrato Executivo homologado/gi, 'Retrato Executivo validado')
    .replace(/Snapshot homologado/gi, 'Snapshot validado metodologicamente')
    .replace(/Snapshots homologados/gi, 'Snapshots validados metodologicamente')
    .replace(/homologação da Mesa Diretora/gi, 'pactuação com a Mesa Diretora')
    .replace(/Facilitador Credenciado/gi, 'Facilitador Metodológico')
    .replace(/bloqueia homologação de maturidade/gi, 'permanece em tratamento antes da conclusão da análise')
    .replace(/bloqueia homologação/gi, 'requer tratamento antes da validação metodológica')
    .replace(/TI, RH ou Protocolo/gi, 'setores identificados da instituição')
    .replace(/TI, RH, Protocolo e Comissões/gi, 'setores identificados da instituição')
    .replace(/Acervo Probatório/gi, 'Evidências Registradas')
    .replace(/Percorrimento Fático/gi, 'Diagnóstico');
}
