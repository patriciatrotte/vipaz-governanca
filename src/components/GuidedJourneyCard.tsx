import React, { useState, useEffect } from 'react';
import { UserJourneyInfo } from '../utils/journeyEngine';
import { usePilot } from '../context/PilotContext';
import { cleanPresentationText } from '../utils/formatters';
import { 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  HelpCircle, 
  Target, 
  Sparkles,
  Award
} from 'lucide-react';

interface GuidedJourneyCardProps {
  journeyInfo: UserJourneyInfo;
  forceOpen?: boolean;
  onToggleForceOpen?: () => void;
}

export const GuidedJourneyCard: React.FC<GuidedJourneyCardProps> = ({ 
  journeyInfo,
  forceOpen,
  onToggleForceOpen
}) => {
  const { setCurrentView, setActiveDoorId } = usePilot();
  const { onboarding } = journeyInfo;

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem(onboarding.dismissableKey) === 'true';
  });

  // Atualizar quando mudar de perfil ou organização
  useEffect(() => {
    setIsDismissed(localStorage.getItem(onboarding.dismissableKey) === 'true');
  }, [onboarding.dismissableKey]);

  const handleDismiss = () => {
    localStorage.setItem(onboarding.dismissableKey, 'true');
    setIsDismissed(true);
    if (onToggleForceOpen && forceOpen) {
      onToggleForceOpen();
    }
  };

  const handleRestore = () => {
    localStorage.removeItem(onboarding.dismissableKey);
    setIsDismissed(false);
  };

  const handleAction = () => {
    if (onboarding.actionDoorId) {
      setActiveDoorId(onboarding.actionDoorId);
    }
    setCurrentView(onboarding.actionView);
  };

  // Se o usuário dispensou e não solicitou reabrir, exibe um gatilho discreto "Como funciona"
  if (isDismissed && !forceOpen) {
    return (
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200/90 rounded-xl px-4 py-2.5 text-xs text-slate-600 transition-all">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Precisa de orientação sobre sua função? Veja como funciona o seu papel na plataforma.
          </span>
        </div>
        <button
          onClick={handleRestore}
          className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
        >
          <span>Como funciona</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-2 border-emerald-500/40 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden transition-all animate-in fade-in">
      {/* Detalhe de fundo decorativo */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative space-y-4">
        {/* Topo do Card */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Comece por aqui • {onboarding.badge}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight pt-1">
              {cleanPresentationText(onboarding.title)}
            </h2>
            <p className="text-xs text-slate-300 font-serif">
              {cleanPresentationText(onboarding.roleHeadline)}
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Dispensar orientação inicial (você poderá reabri-la em 'Como funciona')"
            aria-label="Dispensar orientação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Blocos de Orientação Rápida */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 py-1 text-xs">
          {/* 1. Objetivo */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Target className="w-3.5 h-3.5" />
              <span>Seu Objetivo</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {cleanPresentationText(onboarding.objective)}
            </p>
          </div>

          {/* 2. Primeiro Passo */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-sky-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Primeiro Passo Recomendado</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {cleanPresentationText(onboarding.firstStep)}
            </p>
          </div>

          {/* 3. Resultado Esperado */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>O que Você Obterá</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {cleanPresentationText(onboarding.expectedResult)}
            </p>
          </div>
        </div>

        {/* Botão de Ação e Dispensar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <button
            onClick={handleAction}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{cleanPresentationText(onboarding.actionLabel)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px] text-slate-400">
            <span>Você pode dispensar este aviso quando quiser.</span>
            <button
              onClick={handleDismiss}
              className="text-slate-300 hover:text-white underline cursor-pointer hover:text-slate-200"
            >
              Dispensar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
