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
  // GESTOR INSTITUCIONAL: Somente Visão Geral, Diagnóstico (consulta), Prioridades, Acompanhamento e Relatórios.
  GESTOR_INSTITUCIONAL: ['HOME', 'DIAGNOSTIC', 'ACTION_PLAN', 'INDICATOR', 'OUTPUTS', 'KNOWLEDGE'],

  // INTERLOCUTOR PRINCIPAL / ENCARREGADO: Visão Geral, Diagnóstico, Contribuições Setoriais,
  // Plano de Evolução, Acompanhamento, Relatórios autorizados, Repositório de Evidências, Pendências e Conhecimento.
  INTERLOCUTOR_PRINCIPAL: [
    'HOME', 
    'DIAGNOSTIC',
    'INTERVIEW', 
    'DISTRIBUTED', 
    'ACTION_PLAN', 
    'INDICATOR', 
    'OUTPUTS', 
    'EVIDENCES', 
    'PENDING',
    'KNOWLEDGE'
  ],

  // PARTICIPANTE CONVIDADO: Somente contribuições pertinentes do seu setor, evidências do setor, orientações e conhecimento.
  PARTICIPANTE: ['DISTRIBUTED', 'EVIDENCES', 'HOME', 'KNOWLEDGE'],

  // FACILITADOR: Visão metodológica ampliada de investigação, análise fática, validação humana, evolução e relatórios.
  FACILITADOR: [
    'HOME', 
    'DIAGNOSTIC',
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
    'BACKUP',
    'KNOWLEDGE'
  ],

  // ADMINISTRADOR TÉCNICO: Funções técnicas autorizadas (testes de sistema, backup e diário), sem acesso institucional irrestrito.
  ADMINISTRADOR: ['HOME', 'DIAGNOSTIC', 'TESTS_HARNESS', 'BACKUP', 'DIARY', 'KNOWLEDGE']
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
