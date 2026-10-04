import React, { useState } from 'react';
import { usePilot, AppView } from '../context/PilotContext';
import { 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Layers, 
  GitPullRequest, 
  Download, 
  CheckCircle2, 
  Award,
  BarChart3,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  Menu,
  X,
  Target,
  Send,
  Database,
  Compass
} from 'lucide-react';
import { UserRole } from '../types';
import { SimulationExperienceModal } from './SimulationExperienceModal';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    availableUsers, 
    currentOrg, 
    currentCycle,
    currentView, 
    setCurrentView,
    returnToOrganizationsHub,
    pendingItems,
    divergences,
    doorStatuses,
    integration,
    snapshot,
    actions
  } = usePilot();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [mobileEvolutionNotice, setMobileEvolutionNotice] = useState(false);

  const blockingPendingCount = pendingItems.filter(p => p.impact === 'BLOQUEANTE' && p.status !== 'RESOLVIDA').length;
  const activeDivergencesCount = divergences.filter(d => d.status !== 'EXPLICADA').length;

  const isMaturityValidated = 
    integration?.humanValidation?.isValidated === true && 
    Boolean(integration?.humanValidation?.validatedLevel);

  const isEvolutionAvailable = isMaturityValidated || Boolean(snapshot) || (actions && actions.length > 0);
  const doorsConsolidatedCount = Object.values(doorStatuses || {}).filter(
    s => s === 'SUFICIENTEMENTE_EXPLORADA' || s === 'SUFICIENTEMENTE_EXPLORADA_COMPROVACAO_PENDENTE'
  ).length;

  const role = currentUser.role;
  const isFacilitator = role === 'FACILITADOR';
  const isInterlocutor = role === 'INTERLOCUTOR_PRINCIPAL';
  const isGestor = role === 'GESTOR_INSTITUCIONAL';
  const isParticipant = role === 'PARTICIPANTE';
  const isAdmin = role === 'ADMINISTRADOR';

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown(prev => (prev === name ? null : name));
  };

  // Se estiver na Central de Organizações (ou nenhuma selecionada), exibir cabeçalho do Hub
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
                <span className="font-bold text-slate-100 text-xs sm:text-base truncate">VIPAZ • D1</span>
                <span className="text-[10px] sm:text-[11px] bg-emerald-950 text-emerald-300 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-800 font-mono shrink-0">
                  D1 v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                Central de Organizações &amp; Ciclos • Governança de Privacidade
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

            {/* Alternância rápida para demonstração da equipe de desenvolvimento */}
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

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 w-full">
      {/* 1. Barra superior de contexto organizacional e usuário (Desktop & Mobile Responsiva) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2 text-sm w-full min-w-0">
        
        {/* Lado Esquerdo: Voltar à Central + Contexto Organizacional Ativo */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={returnToOrganizationsHub}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 active:bg-slate-600 active:scale-[0.98] text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer shadow-xs shrink-0 min-h-[36px] justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="Voltar à Central de Organizações"
            aria-label="Voltar à Central de Organizações"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline text-xs">Central</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0" />

          {/* Identificação da Organização com Truncate Elástico */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-800/80 px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-700/80 min-w-0 flex-1 sm:flex-none">
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-100 text-xs sm:text-sm truncate">
              {currentOrg.name}
            </span>
            {currentOrg.isDemo && (
              <span className="hidden xs:inline text-[9px] bg-amber-500/20 text-amber-200 px-1.5 py-0.5 rounded border border-amber-500/30 font-semibold font-mono shrink-0">
                DEMO
              </span>
            )}
            <span className="hidden md:inline text-xs bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800 shrink-0">
              {currentOrg.methodologyVersion}
            </span>
          </div>

          <span className="hidden xl:inline text-xs text-slate-400 font-mono truncate">
            {currentCycle?.name || currentOrg.activeCycleName}
          </span>
        </div>

        {/* Lado Direito Desktop (>= md): Simulação de Perfil com Indicação Clara de Ambiente de Teste */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 sm:px-2.5 py-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setSimulationModalOpen(true)}
              className="inline-flex items-center gap-1.5 py-1 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-xs font-semibold transition-all cursor-pointer group"
              title="Ambiente de teste — a troca de perfil simula experiências de usuários com diferentes responsabilidades."
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="text-[10px] uppercase font-mono font-bold text-amber-300">Modo de Simulação</span>
            </button>

            <span className="text-slate-600 text-xs hidden lg:inline">|</span>

            {/* Alternância rápida para demonstração da equipe (Uso B) */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 hidden xl:inline">Simular:</span>
              <select
                value={currentUser.id}
                onChange={e => {
                  const selected = availableUsers.find(u => u.id === e.target.value);
                  if (selected) {
                    setCurrentUser(selected);
                    setOpenDropdown(null);
                  }
                }}
                title="Ambiente de teste — a troca de perfil simula experiências de usuários com diferentes responsabilidades."
                className="bg-slate-900 text-xs font-medium text-slate-200 border border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer transition-all hover:bg-slate-800"
              >
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.role === 'INTERLOCUTOR_PRINCIPAL' ? 'Encarregado' : user.role === 'GESTOR_INSTITUCIONAL' ? 'Gestor' : user.role === 'FACILITADOR' ? 'Facilitador' : user.role === 'PARTICIPANTE' ? 'Participante' : 'Admin'}: {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 text-xs bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate max-w-[140px]">{currentUser.department}</span>
          </div>
        </div>

        {/* Lado Direito Mobile (< md): Acesso Compacto ao Modo de Simulação + Menu Hambúrguer */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <button
            onClick={() => setSimulationModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-200 text-xs transition-all cursor-pointer min-h-[36px]"
            title="Ambiente de teste — a troca de perfil simula experiências de usuários com diferentes responsabilidades."
            aria-label="Simular perfil no ambiente de teste"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span className="text-[11px] font-medium max-w-[65px] xs:max-w-[85px] truncate">
              {currentUser.role === 'INTERLOCUTOR_PRINCIPAL' ? 'Encarregado' : currentUser.role === 'GESTOR_INSTITUCIONAL' ? 'Gestor' : currentUser.role === 'FACILITADOR' ? 'Facilitador' : currentUser.role === 'PARTICIPANTE' ? 'Participante' : 'Admin'}
            </span>
          </button>

          {/* Botão Hambúrguer Mobile (Área de toque confortável >= 38px) */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 active:scale-[0.98] text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer flex items-center justify-center min-h-[36px] min-w-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Abrir Menu de Navegação e Perfil"
            title="Menu de Navegação"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-amber-400" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Barra de navegação adaptada ao perfil (Desktop e Notebook) */}
      <div className="hidden md:block bg-slate-950 border-t border-slate-800/80 relative">
        {/* Backdrop para fechar dropdowns ao clicar fora */}
        {openDropdown && (
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setOpenDropdown(null)}
            aria-hidden="true"
          />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 py-1 relative z-50">
          
          {/* ======================================================== */}
          {/* NAVEGAÇÃO DO FACILITADOR (AGRUPADA EM 6 GRANDES ÁREAS)   */}
          {/* ======================================================== */}
          {isFacilitator && (
            <>
              {/* Visão Geral */}
              <button
                type="button"
                onClick={() => handleNavigate('HOME')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  currentView === 'HOME'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Visão Geral
              </button>

              {/* INVESTIGAÇÃO (Split / Menu de Investigação das 6 Portas D1) */}
              <div className="relative inline-flex items-center rounded-md">
                <button
                  type="button"
                  onClick={() => handleNavigate('INTERVIEW')}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-l-md transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    ['INTERVIEW', 'DISTRIBUTED', 'EVIDENCES', 'PENDING'].includes(currentView)
                      ? 'bg-slate-800 text-emerald-400 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Acessar investigação institucional D1"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Investigação</span>
                  {blockingPendingCount > 0 && (
                    <span className="bg-rose-500 text-white text-[9px] px-1 rounded-full font-bold">
                      {blockingPendingCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown('investigation');
                  }}
                  className={`px-1.5 py-1.5 text-xs font-semibold rounded-r-md transition-colors border-l border-slate-800/80 hover:bg-slate-800 hover:text-white flex items-center justify-center shrink-0 cursor-pointer ${
                    openDropdown === 'investigation' || ['INTERVIEW', 'DISTRIBUTED', 'EVIDENCES', 'PENDING'].includes(currentView)
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-400'
                  }`}
                  title="Opções de investigação"
                  aria-label="Abrir submenu de investigação"
                  aria-expanded={openDropdown === 'investigation'}
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'investigation' ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === 'investigation' && (
                  <div className="absolute left-0 top-full mt-1 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in">
                    <button
                      type="button"
                      onClick={() => handleNavigate('INTERVIEW')}
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-slate-800 cursor-pointer ${
                        currentView === 'INTERVIEW' ? 'text-emerald-400 font-bold bg-slate-800/60' : 'text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Investigação D1</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate('DISTRIBUTED')}
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-slate-800 cursor-pointer ${
                        currentView === 'DISTRIBUTED' ? 'text-emerald-400 font-bold bg-slate-800/60' : 'text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GitPullRequest className="w-3.5 h-3.5 text-sky-400" />
                        <span>Investigação Distribuída</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate('EVIDENCES')}
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-slate-800 cursor-pointer ${
                        currentView === 'EVIDENCES' ? 'text-emerald-400 font-bold bg-slate-800/60' : 'text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-purple-400" />
                        <span>Evidências</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate('PENDING')}
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-slate-800 cursor-pointer ${
                        currentView === 'PENDING' ? 'text-emerald-400 font-bold bg-slate-800/60' : 'text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-rose-400" />
                        <span>Pendências</span>
                      </div>
                      {blockingPendingCount > 0 && (
                        <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                          {blockingPendingCount}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* ANÁLISE E VALIDAÇÃO (Split / Menu de Análise e Validação da Facilitação) */}
              <div className="relative inline-flex items-center rounded-md">
                <button
                  type="button"
                  onClick={() => handleNavigate('FACILITATOR_PANEL')}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-l-md transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    ['FACILITATOR_PANEL', 'INTEGRATION', 'SNAPSHOT'].includes(currentView)
                      ? 'bg-slate-800 text-amber-400 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Acessar Painel Metodológico"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Análise e Validação</span>
                  {activeDivergencesCount > 0 && (
                    <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1 rounded-full border border-amber-500/40">
                      {activeDivergencesCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown('analysis');
                  }}
                  className={`px-1.5 py-1.5 text-xs font-semibold rounded-r-md transition-colors border-l border-slate-800/80 hover:bg-slate-800 hover:text-white flex items-center justify-center shrink-0 cursor-pointer ${
                    openDropdown === 'analysis' || ['FACILITATOR_PANEL', 'INTEGRATION', 'SNAPSHOT'].includes(currentView)
                      ? 'bg-slate-800 text-amber-400'
                      : 'text-slate-400'
                  }`}
                  title="Opções de análise e validação"
                  aria-label="Abrir submenu de análise e validação"
                  aria-expanded={openDropdown === 'analysis'}
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'analysis' ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === 'analysis' && (
                  <div className="absolute left-0 top-full mt-1 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in">
                    <button
                      type="button"
                      onClick={() => handleNavigate('FACILITATOR_PANEL')}
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-slate-800 cursor-pointer ${
                        currentView === 'FACILITATOR_PANEL' ? 'text-emerald-400 font-bold bg-slate-800/60' : 'text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Painel Metodológico</span>
                      </div>
                      {activeDivergencesCount > 0 && (
                        <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1 rounded-full border border-amber-500/40">
                          {activeDivergencesCount} div
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate('INTEGRATION')}
                      className={`w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-slate-800 cursor-pointer ${
                        currentView === 'INTEGRATION' ? 'text-emerald-400 font-bold bg-slate-800/60' : 'text-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>Integração C1–C6</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate('SNAPSHOT')}
                      className={`w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-slate-800 cursor-pointer ${
                        currentView === 'SNAPSHOT' ? 'text-emerald-400 font-bold bg-slate-800/60' : 'text-slate-200'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Snapshot D1</span>
                    </button>
                  </div>
                )}
              </div>

              {/* EVOLUÇÃO (Split / Feedback Institucional quando indisponível) */}
              <div className="relative inline-flex items-center rounded-md">
                <button
                  type="button"
                  onClick={() => {
                    if (isEvolutionAvailable) {
                      handleNavigate('ACTION_PLAN');
                    } else {
                      toggleDropdown('evolution');
                    }
                  }}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-l-md transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    ['ACTION_PLAN', 'INDICATOR'].includes(currentView)
                      ? 'bg-slate-800 text-teal-400 font-bold'
                      : !isEvolutionAvailable
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title={
                    isEvolutionAvailable
                      ? 'Acessar Plano de Evolução D1'
                      : 'Evolução ficará disponível após a consolidação/validação do diagnóstico'
                  }
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isEvolutionAvailable ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>Evolução</span>
                  {!isEvolutionAvailable && (
                    <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1 py-0.2 rounded border border-slate-700">
                      aguardo
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown('evolution');
                  }}
                  className={`px-1.5 py-1.5 text-xs font-semibold rounded-r-md transition-colors border-l border-slate-800/80 hover:bg-slate-800 hover:text-white flex items-center justify-center shrink-0 cursor-pointer ${
                    openDropdown === 'evolution' || ['ACTION_PLAN', 'INDICATOR'].includes(currentView)
                      ? 'bg-slate-800 text-teal-400'
                      : 'text-slate-400'
                  }`}
                  title={
                    isEvolutionAvailable 
                      ? 'Opções de evolução' 
                      : 'Ver motivo de aguardo da etapa de evolução'
                  }
                  aria-label="Opções de evolução"
                  aria-expanded={openDropdown === 'evolution'}
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'evolution' ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === 'evolution' && (
                  <div className="absolute left-0 top-full mt-1 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 text-xs animate-in fade-in">
                    {!isEvolutionAvailable ? (
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 mt-0.5">
                            <Clock className="w-4 h-4 text-amber-400" />
                          </div>
                          <div className="space-y-1">
                            <span className="font-bold text-slate-100 text-xs block">
                              Etapa em Aguardo Metodológico
                            </span>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-serif">
                              Evolução ficará disponível após a consolidação/validação do diagnóstico.
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px] text-slate-400">
                          <div className="flex items-center justify-between">
                            <span>Diagnóstico das 6 Portas:</span>
                            <span className="font-semibold text-amber-400">
                              {doorsConsolidatedCount === 6 ? '6/6 Concluído' : `${doorsConsolidatedCount}/6 consolidadas`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Validação Formal C1–C6:</span>
                            <span className="font-semibold text-slate-400">Pendente</span>
                          </div>
                        </div>

                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenDropdown(null);
                              handleNavigate('INTERVIEW');
                            }}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <span>Ir para Investigação D1</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => handleNavigate('ACTION_PLAN')}
                          className={`w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-slate-800 rounded-lg cursor-pointer ${
                            currentView === 'ACTION_PLAN' ? 'text-emerald-400 font-bold bg-slate-800/60' : 'text-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                          <span>Plano de Evolução</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNavigate('INDICATOR')}
                          className={`w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-slate-800 rounded-lg cursor-pointer ${
                            currentView === 'INDICATOR' ? 'text-emerald-400 font-bold bg-slate-800/60' : 'text-slate-200'
                          }`}
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Indicador Experimental</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* RELATÓRIOS (Hub Central) */}
              <button
                type="button"
                onClick={() => handleNavigate('OUTPUTS')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  currentView === 'OUTPUTS'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Relatórios</span>
              </button>

              {/* AMBIENTE DO PILOTO (Dropdown Técnico Metodológico) */}
              <div className="relative ml-auto">
                <button
                  type="button"
                  onClick={() => toggleDropdown('pilotEnv')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    ['DIARY', 'TESTS_HARNESS', 'BACKUP'].includes(currentView)
                      ? 'bg-indigo-900/60 text-indigo-300 font-bold border border-indigo-700/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ambiente do Piloto</span>
                  <ChevronDown className={`w-3 h-3 ml-0.5 text-slate-400 transition-transform ${openDropdown === 'pilotEnv' ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === 'pilotEnv' && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in">
                    <button
                      type="button"
                      onClick={() => handleNavigate('DIARY')}
                      className={`w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-slate-800 cursor-pointer ${
                        currentView === 'DIARY' ? 'text-indigo-400 font-bold bg-slate-800/60' : 'text-slate-200'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                      <span>Diário Metodológico</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate('TESTS_HARNESS')}
                      className={`w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-slate-800 cursor-pointer ${
                        currentView === 'TESTS_HARNESS' ? 'text-indigo-400 font-bold bg-slate-800/60' : 'text-slate-200'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                      <span>12 Testes Obrigatórios</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate('BACKUP')}
                      className={`w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-slate-800 cursor-pointer ${
                        currentView === 'BACKUP' ? 'text-indigo-400 font-bold bg-slate-800/60' : 'text-slate-200'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>Backup &amp; Exportação</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* NAVEGAÇÃO DO INTERLOCUTOR PRINCIPAL / ENCARREGADO        */}
          {/* ======================================================== */}
          {isInterlocutor && (
            <>
              <button
                onClick={() => handleNavigate('HOME')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                  currentView === 'HOME'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Visão Geral
              </button>

              <button
                onClick={() => handleNavigate('INTERVIEW')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                  currentView === 'INTERVIEW'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Diagnóstico</span>
              </button>

              <button
                onClick={() => handleNavigate('DISTRIBUTED')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                  currentView === 'DISTRIBUTED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <GitPullRequest className="w-3.5 h-3.5 text-sky-400" />
                <span>Contribuições</span>
              </button>

              <button
                onClick={() => handleNavigate('ACTION_PLAN')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                  currentView === 'ACTION_PLAN'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Plano de Evolução</span>
              </button>

              <button
                onClick={() => handleNavigate('INDICATOR')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                  currentView === 'INDICATOR'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Acompanhamento</span>
              </button>

              <button
                onClick={() => handleNavigate('OUTPUTS')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                  currentView === 'OUTPUTS'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Relatórios</span>
              </button>
            </>
          )}

          {/* ======================================================== */}
          {/* NAVEGAÇÃO DO GESTOR INSTITUCIONAL (ORIENTADA À DECISÃO)  */}
          {/* ======================================================== */}
          {isGestor && (
            <>
              <button
                onClick={() => handleNavigate('HOME')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                  currentView === 'HOME'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Visão Geral
              </button>

              <button
                onClick={() => handleNavigate('ACTION_PLAN')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                  currentView === 'ACTION_PLAN'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-teal-400" />
                <span>Prioridades</span>
              </button>

              <button
                onClick={() => handleNavigate('INDICATOR')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                  currentView === 'INDICATOR'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Acompanhamento</span>
              </button>

              <button
                onClick={() => handleNavigate('OUTPUTS')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                  currentView === 'OUTPUTS'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Relatórios</span>
              </button>
            </>
          )}

          {/* ======================================================== */}
          {/* NAVEGAÇÃO DO PARTICIPANTE CONVIDADO                      */}
          {/* ======================================================== */}
          {isParticipant && (
            <>
              <button
                onClick={() => handleNavigate('DISTRIBUTED')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                  currentView === 'DISTRIBUTED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span>Minhas Contribuições</span>
              </button>

              <button
                onClick={() => handleNavigate('EVIDENCES')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                  currentView === 'EVIDENCES'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Evidências do Setor</span>
              </button>

              <button
                onClick={() => handleNavigate('HOME')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                  currentView === 'HOME'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Orientações da Câmara</span>
              </button>
            </>
          )}

          {/* ======================================================== */}
          {/* NAVEGAÇÃO DO ADMINISTRADOR TÉCNICO                       */}
          {/* ======================================================== */}
          {isAdmin && (
            <>
              <button
                onClick={() => handleNavigate('HOME')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                  currentView === 'HOME'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Visão Geral Técnica
              </button>

              <button
                onClick={() => handleNavigate('BACKUP')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                  currentView === 'BACKUP'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Backup &amp; Exportação</span>
              </button>

              <button
                onClick={() => handleNavigate('TESTS_HARNESS')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0 ${
                  currentView === 'TESTS_HARNESS'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>12 Testes do Sistema</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. Menu Mobile / Tablet Recolhível (Drawer / Accordion) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-t border-slate-800 px-3.5 py-4 space-y-4 max-h-[85vh] overflow-y-auto w-full">
          {/* Contexto Organizacional & Alternância de Perfil no Menu Mobile */}
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-slate-100 truncate">{currentOrg.name}</span>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-mono shrink-0">
                {currentOrg.methodologyVersion}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Modo de Simulação
                </span>
                <span className="text-[10px] text-slate-400">Ambiente de teste</span>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                Ambiente de teste — a troca de perfil simula experiências de usuários com diferentes responsabilidades.
              </p>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSimulationModalOpen(true);
                }}
                className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 active:bg-amber-500/40 border border-amber-500/40 text-amber-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                Escolha a experiência que deseja simular
              </button>

              <div className="pt-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  Alternância Rápida:
                </label>
                <select
                  value={currentUser.id}
                  onChange={e => {
                    const selected = availableUsers.find(u => u.id === e.target.value);
                    if (selected) {
                      setCurrentUser(selected);
                    }
                  }}
                  className="w-full bg-slate-800 text-xs font-semibold text-slate-100 border border-slate-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.role === 'INTERLOCUTOR_PRINCIPAL' ? 'Encarregado' : user.role === 'GESTOR_INSTITUCIONAL' ? 'Gestor' : user.role === 'FACILITADOR' ? 'Facilitador' : user.role === 'PARTICIPANTE' ? 'Participante' : 'Admin'}: {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                <span>Setor: <strong className="text-slate-300">{currentUser.department}</strong></span>
                <span className="font-mono text-[10px] text-slate-400">{currentCycle?.name || currentOrg.activeCycleName}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-xs font-medium">
            {/* Facilitador Mobile */}
            {isFacilitator && (
              <>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-2 pt-2">
                  Navegação Metodológica
                </div>
                <button
                  onClick={() => handleNavigate('HOME')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'HOME' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>Visão Geral</span>
                  </div>
                  {currentView === 'HOME' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>

                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-2 pt-2">
                  Investigação
                </div>
                <button
                  onClick={() => handleNavigate('INTERVIEW')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'INTERVIEW' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>6 Portas D1</span>
                  </div>
                  {currentView === 'INTERVIEW' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
                <button
                  onClick={() => handleNavigate('DISTRIBUTED')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'DISTRIBUTED' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GitPullRequest className="w-4 h-4 text-sky-400" />
                    <span>Investigação Distribuída</span>
                  </div>
                  {currentView === 'DISTRIBUTED' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
                <button
                  onClick={() => handleNavigate('EVIDENCES')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'EVIDENCES' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>Evidências</span>
                  </div>
                  {currentView === 'EVIDENCES' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
                <button
                  onClick={() => handleNavigate('PENDING')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'PENDING' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-rose-400" />
                    <span>Pendências</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {blockingPendingCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                        {blockingPendingCount}
                      </span>
                    )}
                    {currentView === 'PENDING' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                  </div>
                </button>

                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-2 pt-2">
                  Análise e Validação
                </div>
                <button
                  onClick={() => handleNavigate('FACILITATOR_PANEL')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'FACILITATOR_PANEL' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Painel Metodológico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeDivergencesCount > 0 && (
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 rounded-full border border-amber-500/40">
                        {activeDivergencesCount}
                      </span>
                    )}
                    {currentView === 'FACILITATOR_PANEL' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                  </div>
                </button>
                <button
                  onClick={() => handleNavigate('INTEGRATION')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'INTEGRATION' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>Integração C1–C6</span>
                  </div>
                  {currentView === 'INTEGRATION' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
                <button
                  onClick={() => handleNavigate('SNAPSHOT')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'SNAPSHOT' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Snapshot D1</span>
                  </div>
                  {currentView === 'SNAPSHOT' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>

                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-2 pt-2 flex items-center justify-between">
                  <span>Evolução &amp; Relatórios</span>
                  {!isEvolutionAvailable && (
                    <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1 rounded border border-slate-700">
                      aguardo diagnóstico
                    </span>
                  )}
                </div>

                {!isEvolutionAvailable && mobileEvolutionNotice && (
                  <div className="p-3 bg-slate-900 border border-amber-500/40 rounded-xl text-xs space-y-2 text-slate-300 animate-in fade-in">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block text-xs">Etapa em Aguardo Metodológico</span>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          Evolução ficará disponível após a consolidação/validação do diagnóstico.
                        </p>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
                      <span>Portas D1 Consolidadas:</span>
                      <span className="text-amber-400 font-semibold">{doorsConsolidatedCount}/6</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (isEvolutionAvailable) {
                      handleNavigate('ACTION_PLAN');
                    } else {
                      setMobileEvolutionNotice(prev => !prev);
                    }
                  }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'ACTION_PLAN'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40'
                      : !isEvolutionAvailable
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 active:bg-slate-800'
                      : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`w-4 h-4 ${isEvolutionAvailable ? 'text-teal-400' : 'text-slate-400'}`} />
                    <span>Plano de Evolução</span>
                  </div>
                  {!isEvolutionAvailable ? (
                    <span className="text-[10px] text-slate-400 font-mono">aguardo</span>
                  ) : currentView === 'ACTION_PLAN' ? (
                    <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />
                  ) : null}
                </button>
                <button
                  onClick={() => {
                    if (isEvolutionAvailable) {
                      handleNavigate('INDICATOR');
                    } else {
                      setMobileEvolutionNotice(prev => !prev);
                    }
                  }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'INDICATOR'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40'
                      : !isEvolutionAvailable
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 active:bg-slate-800'
                      : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className={`w-4 h-4 ${isEvolutionAvailable ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>Indicador Experimental</span>
                  </div>
                  {!isEvolutionAvailable ? (
                    <span className="text-[10px] text-slate-400 font-mono">aguardo</span>
                  ) : currentView === 'INDICATOR' ? (
                    <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />
                  ) : null}
                </button>
                <button
                  onClick={() => handleNavigate('OUTPUTS')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'OUTPUTS' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Relatórios</span>
                  </div>
                  {currentView === 'OUTPUTS' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>

                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-2 pt-2">
                  Ambiente do Piloto
                </div>
                <button
                  onClick={() => handleNavigate('DIARY')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'DIARY' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-amber-300" />
                    <span>Diário Metodológico</span>
                  </div>
                  {currentView === 'DIARY' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
                <button
                  onClick={() => handleNavigate('TESTS_HARNESS')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'TESTS_HARNESS' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    <span>12 Testes Obrigatórios</span>
                  </div>
                  {currentView === 'TESTS_HARNESS' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
                <button
                  onClick={() => handleNavigate('BACKUP')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'BACKUP' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Backup &amp; Exportação</span>
                  </div>
                  {currentView === 'BACKUP' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
              </>
            )}

            {/* Interlocutor Mobile */}
            {isInterlocutor && (
              <>
                <button
                  onClick={() => handleNavigate('HOME')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'HOME' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>Visão Geral</span>
                  </div>
                  {currentView === 'HOME' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
                <button
                  onClick={() => handleNavigate('INTERVIEW')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'INTERVIEW' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Diagnóstico</span>
                  </div>
                  {currentView === 'INTERVIEW' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
                <button
                  onClick={() => handleNavigate('DISTRIBUTED')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'DISTRIBUTED' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GitPullRequest className="w-4 h-4 text-sky-400" />
                    <span>Contribuições</span>
                  </div>
                  {currentView === 'DISTRIBUTED' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
                <button
                  onClick={() => handleNavigate('ACTION_PLAN')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'ACTION_PLAN' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span>Plano de Evolução</span>
                  </div>
                  {currentView === 'ACTION_PLAN' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
                <button
                  onClick={() => handleNavigate('INDICATOR')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'INDICATOR' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    <span>Acompanhamento</span>
                  </div>
                  {currentView === 'INDICATOR' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
                <button
                  onClick={() => handleNavigate('OUTPUTS')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'OUTPUTS' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Relatórios</span>
                  </div>
                  {currentView === 'OUTPUTS' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
              </>
            )}

            {/* Gestor Mobile */}
            {isGestor && (
              <>
                <button
                  onClick={() => handleNavigate('HOME')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'HOME' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>Visão Geral</span>
                  </div>
                  {currentView === 'HOME' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
                <button
                  onClick={() => handleNavigate('ACTION_PLAN')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'ACTION_PLAN' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-teal-400" />
                    <span>Prioridades</span>
                  </div>
                  {currentView === 'ACTION_PLAN' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
                <button
                  onClick={() => handleNavigate('INDICATOR')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'INDICATOR' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    <span>Acompanhamento</span>
                  </div>
                  {currentView === 'INDICATOR' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
                <button
                  onClick={() => handleNavigate('OUTPUTS')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'OUTPUTS' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Relatórios</span>
                  </div>
                  {currentView === 'OUTPUTS' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
              </>
            )}

            {/* Participante Mobile */}
            {isParticipant && (
              <>
                <button
                  onClick={() => handleNavigate('DISTRIBUTED')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'DISTRIBUTED' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Send className="w-4 h-4 text-sky-400" />
                    <span>Minhas Contribuições</span>
                  </div>
                  {currentView === 'DISTRIBUTED' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
                <button
                  onClick={() => handleNavigate('EVIDENCES')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'EVIDENCES' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>Evidências do Setor</span>
                  </div>
                  {currentView === 'EVIDENCES' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
                <button
                  onClick={() => handleNavigate('HOME')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'HOME' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>Orientações da Câmara</span>
                  </div>
                  {currentView === 'HOME' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
              </>
            )}

            {/* Administrador Mobile */}
            {isAdmin && (
              <>
                <button
                  onClick={() => handleNavigate('HOME')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'HOME' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>Visão Geral Técnica</span>
                  </div>
                  {currentView === 'HOME' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
                <button
                  onClick={() => handleNavigate('BACKUP')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'BACKUP' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-4 h-4 text-slate-400" />
                    <span>Backup &amp; Exportação</span>
                  </div>
                  {currentView === 'BACKUP' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
                <button
                  onClick={() => handleNavigate('TESTS_HARNESS')}
                  className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between min-h-[44px] transition-all cursor-pointer active:scale-[0.98] ${
                    currentView === 'TESTS_HARNESS' ? 'bg-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-400/40' : 'text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    <span>12 Testes do Sistema</span>
                  </div>
                  {currentView === 'TESTS_HARNESS' && <span className="w-2 h-2 rounded-full bg-white ring-2 ring-emerald-300" />}
                </button>
              </>
            )}

            {/* Ação de Retorno à Central no Menu Mobile */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  returnToOrganizationsHub();
                }}
                className="w-full text-left px-3.5 py-3 rounded-xl flex items-center gap-3 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer active:scale-[0.98]"
              >
                <ArrowLeft className="w-4 h-4 text-slate-400" />
                <span>Voltar à Central de Organizações</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Escolha de Experiência no Modo de Simulação */}
      <SimulationExperienceModal isOpen={simulationModalOpen} onClose={() => setSimulationModalOpen(false)} />
    </header>
  );
};
