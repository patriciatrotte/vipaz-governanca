import { UserRole } from '../types';
import { AppView } from '../context/PilotContext';

/**
 * Matriz de Telas Autorizadas por Perfil de Acesso
 * 
 * Regra fundamental:
 * A alternância de perfil no Modo de Simulação NÃO amplia as permissões 
 * definidas para o perfil selecionado.
 */
export const ROLE_ALLOWED_VIEWS: Record<UserRole, AppView[]> = {
  // GESTOR INSTITUCIONAL: Somente Visão Geral, Prioridades, Acompanhamento e Relatórios.
  // NÃO tem acesso a formulários de diagnóstico das portas, painel de facilitação ou validação de maturidade.
  GESTOR_INSTITUCIONAL: ['HOME', 'ACTION_PLAN', 'INDICATOR', 'OUTPUTS'],

  // INTERLOCUTOR PRINCIPAL / ENCARREGADO: Visão Geral, Diagnóstico das Portas, Contribuições Setoriais,
  // Plano de Evolução, Acompanhamento, Relatórios autorizados, Repositório de Evidências e Pendências.
  // NÃO tem acesso exclusivo à Facilitação (painel de facilitação, consolidação dimensional C1-C6 ou snapshot imutável).
  INTERLOCUTOR_PRINCIPAL: [
    'HOME', 
    'INTERVIEW', 
    'DISTRIBUTED', 
    'ACTION_PLAN', 
    'INDICATOR', 
    'OUTPUTS', 
    'EVIDENCES', 
    'PENDING'
  ],

  // PARTICIPANTE CONVIDADO: Somente contribuições pertinentes do seu setor, evidências do setor e orientações.
  // NUNCA tem acesso ao diagnóstico institucional completo nem deliberações de governança.
  PARTICIPANTE: ['DISTRIBUTED', 'EVIDENCES', 'HOME'],

  // FACILITADOR: Visão metodológica ampliada de investigação, análise fática, validação humana, evolução e relatórios.
  FACILITADOR: [
    'HOME', 
    'INTERVIEW', 
    'DISTRIBUTED', 
    'EVIDENCES', 
    'PENDING', 
    'FACILITATOR_PANEL', 
    'INTEGRATION', 
    'SNAPSHOT', 
    'ACTION_PLAN', 
    'INDICATOR', 
    'OUTPUTS', 
    'DIARY', 
    'TESTS_HARNESS', 
    'BACKUP'
  ],

  // ADMINISTRADOR TÉCNICO: Funções técnicas autorizadas (testes de sistema, backup e diário), sem acesso institucional irrestrito.
  ADMINISTRADOR: ['HOME', 'TESTS_HARNESS', 'BACKUP', 'DIARY']
};

/**
 * Verifica se a tela solicitada é autorizada para o papel do usuário.
 */
export function isViewAllowedForRole(role: UserRole, view: AppView): boolean {
  if (view === 'CENTRAL') return true;
  const allowed = ROLE_ALLOWED_VIEWS[role] || ['HOME'];
  return allowed.includes(view);
}

/**
 * Retorna a tela padrão de entrada para um perfil específico.
 */
export function getDefaultViewForRole(role: UserRole): AppView {
  switch (role) {
    case 'PARTICIPANTE':
      return 'DISTRIBUTED';
    case 'GESTOR_INSTITUCIONAL':
    case 'INTERLOCUTOR_PRINCIPAL':
    case 'FACILITADOR':
    case 'ADMINISTRADOR':
    default:
      return 'HOME';
  }
}
