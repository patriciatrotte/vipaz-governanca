import React, { useState, useEffect } from 'react';
import { usePilot, AppView } from '../context/PilotContext';
import {
  LayoutDashboard,
  Layers,
  Target,
  FileCheck,
  BookOpen,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';
import { isViewAllowedForRole } from '../utils/rolePermissions';
import { DOORS_DEFINITIONS } from '../data/methodologyConstants';

interface InstitutionalSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavModule {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  targetView: AppView;
  activeMatchViews: AppView[];
  badge?: () => { count?: number; label?: string; variant: 'danger' | 'warning' | 'info' | 'success' } | null;
}

export const InstitutionalSidebar: React.FC<InstitutionalSidebarProps> = ({
  mobileOpen,
  onCloseMobile
}) => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    pendingItems,
    divergences,
    doorStatuses,
    integration,
    actions
  } = usePilot();

  // Preferência de recolhimento da sidebar persistida
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vipaz_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('vipaz_sidebar_collapsed', String(next));
      } catch {
        // noop
      }
      return next;
    });
  };

  // Contadores reais de pendências e estado
  const blockingPendingCount = pendingItems.filter(
    p => p.impact === 'BLOQUEANTE' && p.status !== 'RESOLVIDA'
  ).length;

  const isMaturityValidated =
    integration?.humanValidation?.isValidated === true &&
    Boolean(integration?.humanValidation?.validatedLevel);

  const modules: NavModule[] = [
    {
      id: 'overview',
      name: 'Visão Geral',
      subtitle: 'Painel situacional do ciclo',
      icon: LayoutDashboard,
      targetView: 'HOME',
      activeMatchViews: ['HOME']
    },
    {
      id: 'diagnostic',
      name: 'Diagnóstico',
      subtitle: 'D1 · Governança e Responsabilidades',
      icon: Layers,
      targetView: 'DIAGNOSTIC',
      activeMatchViews: ['DIAGNOSTIC', 'INTERVIEW', 'DISTRIBUTED', 'FACILITATOR_PANEL', 'INTEGRATION'],
      badge: () => {
        const totalAspects = DOORS_DEFINITIONS.length;
        const doors = Object.values(doorStatuses || {});
        const explored = doors.filter(
          s => s === 'SUFICIENTEMENTE_EXPLORADA' || s === 'SUFICIENTEMENTE_EXPLORADA_COMPROVACAO_PENDENTE'
        ).length;
        return { label: `${explored}/${totalAspects}`, variant: explored === totalAspects ? 'success' : 'info' };
      }
    },
    {
      id: 'evolution',
      name: 'Jornada de Evolução',
      subtitle: 'Ações e acompanhamento',
      icon: Target,
      targetView: 'ACTION_PLAN',
      activeMatchViews: ['ACTION_PLAN', 'INDICATOR'],
      badge: () => {
        if (actions && actions.length > 0) {
          return { count: actions.length, variant: 'info' };
        }
        if (!isMaturityValidated) {
          return { label: 'Aguardo', variant: 'warning' };
        }
        return null;
      }
    },
    {
      id: 'evidencias',
      name: 'Evidências',
      subtitle: 'Comprovação e referências',
      icon: FileCheck,
      targetView: 'EVIDENCES',
      activeMatchViews: ['EVIDENCES', 'PENDING'],
      badge: () => {
        if (blockingPendingCount > 0) {
          return { count: blockingPendingCount, variant: 'danger' };
        }
        return null;
      }
    },
    {
      id: 'knowledge',
      name: 'Conhecimento',
      subtitle: 'Base de diretrizes e apoio',
      icon: BookOpen,
      targetView: 'KNOWLEDGE',
      activeMatchViews: ['KNOWLEDGE']
    },
    {
      id: 'reports',
      name: 'Relatórios',
      subtitle: 'Saídas e snapshots',
      icon: BarChart3,
      targetView: 'OUTPUTS',
      activeMatchViews: ['OUTPUTS', 'SNAPSHOT']
    }
  ];

  const handleSelectModule = (mod: NavModule) => {
    // Se for participante, direcionar para telas permitidas
    if (currentUser.role === 'PARTICIPANTE') {
      if (mod.id === 'diagnostic') {
        setCurrentView('DISTRIBUTED');
        onCloseMobile();
        return;
      }
    }
    // Verificar permissão
    if (isViewAllowedForRole(currentUser.role, mod.targetView)) {
      setCurrentView(mod.targetView);
    } else if (mod.id === 'diagnostic' && isViewAllowedForRole(currentUser.role, 'INTERVIEW')) {
      setCurrentView('INTERVIEW');
    } else if (mod.id === 'diagnostic' && isViewAllowedForRole(currentUser.role, 'DISTRIBUTED')) {
      setCurrentView('DISTRIBUTED');
    } else {
      setCurrentView(mod.targetView);
    }
    onCloseMobile();
  };

  const isModuleActive = (mod: NavModule) => {
    return mod.activeMatchViews.includes(currentView);
  };

  const isModuleAllowed = (mod: NavModule) => {
    if (mod.id === 'diagnostic' && currentUser.role === 'PARTICIPANTE') {
      return isViewAllowedForRole(currentUser.role, 'DISTRIBUTED');
    }
    return mod.activeMatchViews.some(v => isViewAllowedForRole(currentUser.role, v));
  };

  const isFacilitatorOrAdmin = currentUser.role === 'FACILITADOR' || currentUser.role === 'ADMINISTRADOR';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 select-none">
      {/* Topo da Sidebar: Identificação institucional e controle de recolhimento */}
      <div className="shrink-0 p-3.5 border-b border-slate-800/90 flex items-center justify-between gap-2 min-h-[56px]">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
              V
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm tracking-tight text-white block truncate">
                VIPAZ
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase block truncate">
                Navegação Institucional
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              V
            </div>
          </div>
        )}

        {/* Botão de recolher/expandir (Desktop) */}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          aria-label={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Botão fechar (Mobile) */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="flex md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Fechar menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Lista de 6 Módulos Principais */}
      <nav className="flex-1 min-h-0 py-3 px-2 space-y-1.5 overflow-y-auto">
        <div className={`px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? '•' : 'Módulos'}
        </div>

        {modules.map(mod => {
          const active = isModuleActive(mod);
          const allowed = isModuleAllowed(mod);
          const badgeData = mod.badge ? mod.badge() : null;
          const IconComponent = mod.icon;

          if (!allowed) {
            return null;
          }

          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => handleSelectModule(mod)}
              title={isCollapsed ? `${mod.name} — ${mod.subtitle}` : undefined}
              className={`w-full group relative flex items-center rounded-xl transition-all cursor-pointer text-left ${
                isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 gap-3'
              } ${
                active
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-slate-100 hover:text-white hover:bg-slate-800/80 active:bg-slate-800'
              }`}
            >
              {/* Ícone */}
              <div className={`shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 ${
                active ? 'text-white' : 'text-slate-200 group-hover:text-emerald-400'
              }`}>
                <IconComponent className="w-5 h-5" />
              </div>

              {/* Rótulo e Descrição (quando expandida) */}
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold tracking-tight truncate">
                      {mod.name}
                    </span>

                    {/* Badge */}
                    {badgeData && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold shrink-0 ${
                          badgeData.variant === 'danger'
                            ? 'bg-rose-500 text-white'
                            : badgeData.variant === 'warning'
                            ? active ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : badgeData.variant === 'success'
                            ? active ? 'bg-emerald-700 text-white' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : active ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {badgeData.count !== undefined ? badgeData.count : badgeData.label}
                      </span>
                    )}
                  </div>
                  <span className={`text-[11px] truncate block ${
                    active ? 'text-emerald-100' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {mod.subtitle}
                  </span>
                </div>
              )}

              {/* Indicador quando recolhido com badge pendente */}
              {isCollapsed && badgeData && (
                <span
                  className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                    badgeData.variant === 'danger'
                      ? 'bg-rose-500 animate-pulse'
                      : badgeData.variant === 'warning'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  title={`${mod.name}: ${badgeData.label || badgeData.count}`}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Seção Inferior: Ferramentas Técnicas do Piloto (Facilitador/Admin) */}
      {isFacilitatorOrAdmin && (
        <div className="shrink-0 mt-auto p-2 border-t border-slate-800/90 bg-slate-950/40">
          {!isCollapsed && (
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Ambiente Técnico
            </div>
          )}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                setCurrentView('DIARY');
                onCloseMobile();
              }}
              title={isCollapsed ? 'Diário Metodológico' : undefined}
              className={`w-full flex items-center rounded-lg transition-colors cursor-pointer text-left ${
                isCollapsed ? 'justify-center p-2' : 'px-2.5 py-1.5 gap-2 text-xs'
              } ${
                currentView === 'DIARY'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
              {!isCollapsed && <span className="truncate">Diário Metodológico</span>}
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentView('TESTS_HARNESS');
                onCloseMobile();
              }}
              title={isCollapsed ? '12 Testes do Sistema' : undefined}
              className={`w-full flex items-center rounded-lg transition-colors cursor-pointer text-left ${
                isCollapsed ? 'justify-center p-2' : 'px-2.5 py-1.5 gap-2 text-xs'
              } ${
                currentView === 'TESTS_HARNESS'
                  ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
              {!isCollapsed && <span className="truncate">12 Testes do Sistema</span>}
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentView('BACKUP');
                onCloseMobile();
              }}
              title={isCollapsed ? 'Backup e Exportação' : undefined}
              className={`w-full flex items-center rounded-lg transition-colors cursor-pointer text-left ${
                isCollapsed ? 'justify-center p-2' : 'px-2.5 py-1.5 gap-2 text-xs'
              } ${
                currentView === 'BACKUP'
                  ? 'bg-slate-800 text-slate-200 font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Download className="w-4 h-4 text-slate-400 shrink-0" />
              {!isCollapsed && <span className="truncate">Backup &amp; Exportação</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop Fixa */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 ease-in-out z-30 ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        <div className="sticky top-[56px] h-[calc(100vh-56px)] overflow-hidden flex flex-col">
          {sidebarContent}
        </div>
      </aside>

      {/* Drawer Mobile com Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
