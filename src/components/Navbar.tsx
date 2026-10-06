import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { 
  Building2, 
  ArrowLeft, 
  Menu, 
  UserCheck, 
  Sparkles, 
  ShieldCheck, 
  Calendar 
} from 'lucide-react';
import { SimulationExperienceModal } from './SimulationExperienceModal';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const { 
    currentUser, 
    setCurrentUser, 
    availableUsers, 
    currentOrg, 
    currentCycle,
    currentView, 
    returnToOrganizationsHub 
  } = usePilot();

  const [simulationModalOpen, setSimulationModalOpen] = useState(false);

  // Se estiver na Central de Organizações (ou nenhuma selecionada), exibir cabeçalho do Hub Central
  if (!currentOrg || currentView === 'CENTRAL') {
    return (
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 text-sm w-full min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-100 text-xs sm:text-base truncate">Piloto Dimensional D1</span>
                <span className="text-[10px] sm:text-[11px] bg-emerald-950 text-emerald-300 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-800 font-mono shrink-0">
                  D1 v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                Central de Organizações &amp; Aplicações • Governança de Privacidade em Câmaras Municipais
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSimulationModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-200 text-xs font-semibold transition-all shadow-xs cursor-pointer group"
              title="Ambiente de teste — a troca de perfil simula experiências de usuários com diferentes responsabilidades."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="text-[10px] uppercase font-mono font-bold text-amber-300">Simular Perfil</span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-white hidden sm:inline max-w-[120px] truncate">
                {currentUser.role === 'INTERLOCUTOR_PRINCIPAL' ? 'Encarregado' : currentUser.role === 'GESTOR_INSTITUCIONAL' ? 'Gestor' : currentUser.role === 'FACILITADOR' ? 'Facilitador' : currentUser.role === 'PARTICIPANTE' ? 'Participante' : 'Admin'}
              </span>
            </button>

            <select
              value={currentUser.id}
              onChange={e => {
                const selected = availableUsers.find(u => u.id === e.target.value);
                if (selected) setCurrentUser(selected);
              }}
              title="Ambiente de teste — a troca de perfil simula experiências de usuários com diferentes responsabilidades."
              className="bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer max-w-[110px] sm:max-w-none truncate transition-all"
            >
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.role === 'INTERLOCUTOR_PRINCIPAL' ? 'Encarregado' : user.role === 'GESTOR_INSTITUCIONAL' ? 'Gestor' : user.role === 'FACILITADOR' ? 'Facilitador' : user.role === 'PARTICIPANTE' ? 'Participante' : 'Admin'}: {user.name.split(' ')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <SimulationExperienceModal isOpen={simulationModalOpen} onClose={() => setSimulationModalOpen(false)} />
      </header>
    );
  }

  // =========================================================================
  // CABEÇALHO DO AMBIENTE INSTITUCIONAL COMPACTO
  // Requisitos:
  // - nome da instituição
  // - domínio atual: Governança de Privacidade e Proteção de Dados
  // - ciclo vigente
  // - situação do ciclo
  // - usuário/perfil
  // =========================================================================
  const cycleStatus = currentCycle?.status === 'EM_ANDAMENTO'
    ? 'Em andamento'
    : currentCycle?.status === 'CONCLUIDO_VALIDADO'
    ? 'Concluído e Validado'
    : currentCycle?.status === 'NAO_INICIADO'
    ? 'Não Iniciado'
    : currentCycle?.status === 'ARQUIVADO'
    ? 'Arquivado'
    : 'Em andamento';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 w-full shadow-xs">
      <div className="max-w-full px-3 sm:px-5 py-2 flex items-center justify-between gap-3 text-sm min-w-0">
        
        {/* Lado Esquerdo: Menu Hambúrguer (Mobile) + Retorno à Central + Nome da Instituição e Domínio */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Botão Hambúrguer Mobile para abrir a Sidebar */}
          {onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="flex md:hidden p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer shrink-0"
              aria-label="Abrir barra lateral de navegação"
              title="Abrir menu de navegação"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* Botão de Retorno à Central */}
          <button
            type="button"
            onClick={returnToOrganizationsHub}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer shadow-xs shrink-0"
            title="Voltar à Central de Organizações"
            aria-label="Voltar à Central de Organizações"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline text-xs">Central</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0" />

          {/* Identificação da Instituição e Domínio Atual */}
          <div className="min-w-0 flex-1 sm:flex-none">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-100 text-xs sm:text-sm tracking-tight truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
                {currentOrg.name}
              </span>

              {currentOrg.isDemo && (
                <span className="text-[9px] bg-amber-500/20 text-amber-200 px-1.5 py-0.2 rounded border border-amber-500/30 font-semibold font-mono shrink-0">
                  DEMO
                </span>
              )}
            </div>

            {/* Domínio Atual (Fixado conforme especificação: Governança de Privacidade e Proteção de Dados) */}
            <div className="text-[10px] sm:text-[11px] text-slate-400 truncate flex items-center gap-1.5">
              <span>Domínio:</span>
              <span className="text-emerald-400 font-medium truncate">
                Governança de Privacidade e Proteção de Dados
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden lg:block shrink-0" />

          {/* Ciclo Vigente e Situação do Ciclo (visível durante toda a navegação) */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80 shrink-0 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-200 truncate max-w-[150px] xl:max-w-[200px]">
              {currentCycle?.name || currentOrg.activeCycleName || 'Ciclo D1 Inicial'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 uppercase">
              {cycleStatus}
            </span>
          </div>
        </div>

        {/* Lado Direito: Perfil do Usuário e Modo de Simulação */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Tag de Ciclo compacta no Mobile/Tablet (< lg) */}
          <div className="flex lg:hidden items-center gap-1 text-[10px] bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
            <span className="font-mono text-emerald-400 font-semibold truncate max-w-[90px] xs:max-w-[120px]">
              {currentCycle?.name?.split(' ')[0] || 'Ciclo D1'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-300 font-bold">{cycleStatus}</span>
          </div>

          {/* Botão Simular Perfil */}
          <button
            type="button"
            onClick={() => setSimulationModalOpen(true)}
            className="inline-flex items-center gap-1.5 py-1 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-200 text-xs font-semibold transition-all cursor-pointer group shrink-0"
            title="Ambiente de teste — a troca de perfil simula experiências de usuários com diferentes responsabilidades."
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="text-[10px] uppercase font-mono font-bold text-amber-300 hidden xs:inline">
              Simular Perfil
            </span>
            <span className="text-slate-500 hidden md:inline">•</span>
            <span className="text-white hidden md:inline max-w-[110px] truncate">
              {currentUser.role === 'INTERLOCUTOR_PRINCIPAL' ? 'Encarregado' : currentUser.role === 'GESTOR_INSTITUCIONAL' ? 'Gestor' : currentUser.role === 'FACILITADOR' ? 'Facilitador' : currentUser.role === 'PARTICIPANTE' ? 'Participante' : 'Admin'}
            </span>
          </button>

          {/* Seletor rápido para desenvolvimento */}
          <select
            value={currentUser.id}
            onChange={e => {
              const selected = availableUsers.find(u => u.id === e.target.value);
              if (selected) setCurrentUser(selected);
            }}
            title="Ambiente de teste — a troca de perfil simula experiências de usuários com diferentes responsabilidades."
            className="hidden sm:block bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer max-w-[110px] lg:max-w-[150px] truncate transition-all"
          >
            {availableUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.role === 'INTERLOCUTOR_PRINCIPAL' ? 'Encarregado' : user.role === 'GESTOR_INSTITUCIONAL' ? 'Gestor' : user.role === 'FACILITADOR' ? 'Facilitador' : user.role === 'PARTICIPANTE' ? 'Participante' : 'Admin'}: {user.name.split(' ')[0]}
              </option>
            ))}
          </select>
        </div>

      </div>

      <SimulationExperienceModal 
        isOpen={simulationModalOpen} 
        onClose={() => setSimulationModalOpen(false)} 
      />
    </header>
  );
};
