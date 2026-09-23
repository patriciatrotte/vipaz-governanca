import React from 'react';
import { UserJourneyInfo } from '../utils/journeyEngine';
import { usePilot } from '../context/PilotContext';
import { 
  ArrowRight, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Compass, 
  Sparkles,
  AlertCircle,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { LocalSaveIndicator } from './LocalSaveIndicator';
import { cleanPresentationText } from '../utils/formatters';

interface ActionFocalCardProps {
  journeyInfo: UserJourneyInfo;
  attentionItem: {
    type: 'BLOQUEIO' | 'DIVERGENCIA' | 'APROFUNDAMENTO' | 'SOLICITACAO' | 'VALIDACAO' | 'NORMAL';
    title: string;
    description: string;
    impactText: string;
  };
}

export const ActionFocalCard: React.FC<ActionFocalCardProps> = ({ 
  journeyInfo,
  attentionItem 
}) => {
  const { setCurrentView, setActiveDoorId } = usePilot();
  const { resumeState, recommendedNextStep } = journeyInfo;

  const handleAction = () => {
    // Se a recomendação prioritária tiver porta de ação específica, ativa-a
    if (recommendedNextStep.actionDoorId) {
      setActiveDoorId(recommendedNextStep.actionDoorId);
    } else if (resumeState.actionDoorId) {
      setActiveDoorId(resumeState.actionDoorId);
    }
    
    // Direciona para a view recomendada (ou resumeState como fallback)
    setCurrentView(recommendedNextStep.actionView || resumeState.actionView);
  };

  const getAttentionStyle = (type: ActionFocalCardProps['attentionItem']['type']) => {
    switch (type) {
      case 'BLOQUEIO':
        return {
          bg: 'bg-rose-50/80 border-rose-200 text-rose-950',
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
        };
      case 'DIVERGENCIA':
        return {
          bg: 'bg-amber-50/80 border-amber-200 text-amber-950',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        };
      case 'APROFUNDAMENTO':
        return {
          bg: 'bg-sky-50/80 border-sky-200 text-sky-950',
          badge: 'bg-sky-100 text-sky-800 border-sky-300',
          icon: <Clock className="w-4 h-4 text-sky-600 shrink-0" />
        };
      case 'VALIDACAO':
        return {
          bg: 'bg-indigo-50/80 border-indigo-200 text-indigo-950',
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          icon: <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
        };
      case 'SOLICITACAO':
      case 'NORMAL':
      default:
        return {
          bg: 'bg-emerald-50/80 border-emerald-200 text-emerald-950',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        };
    }
  };

  const attentionStyles = getAttentionStyle(attentionItem.type);

  return (
    <div className="bg-white border-2 border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 transition-all">
      {/* Fluxo Visual Contínuo: ESTADO ATUAL → O QUE REQUER ATENÇÃO → PRÓXIMO PASSO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Bloco 1: ESTADO ATUAL (4 Colunas) */}
        <div className="lg:col-span-4 bg-slate-50/90 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-2">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
              1. Estado Atual
            </span>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              {cleanPresentationText(resumeState.headline)}
            </h4>
            <p className="text-xs text-slate-600 font-serif leading-relaxed line-clamp-3">
              {cleanPresentationText(resumeState.detail)}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
            <span>Status da apuração:</span>
            <span className="font-bold text-slate-700">{cleanPresentationText(resumeState.badgeText)}</span>
          </div>
        </div>

        {/* Bloco 2: O QUE REQUER ATENÇÃO (4 Colunas) - Sem Repetições */}
        <div className={`lg:col-span-4 border rounded-xl p-4 flex flex-col justify-between space-y-2 ${attentionStyles.bg}`}>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono opacity-80">
                2. O Que Requer Atenção
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${attentionStyles.badge}`}>
                {attentionItem.type}
              </span>
            </div>
            <div className="flex items-start gap-1.5">
              {attentionStyles.icon}
              <h4 className="text-xs sm:text-sm font-bold leading-snug">
                {cleanPresentationText(attentionItem.title)}
              </h4>
            </div>
            <p className="text-xs font-serif leading-relaxed opacity-90">
              {cleanPresentationText(attentionItem.description)}
            </p>
          </div>
          <div className="pt-2 border-t border-current/10 text-[10px] font-medium opacity-80">
            {cleanPresentationText(attentionItem.impactText)}
          </div>
        </div>

        {/* Bloco 3: PRÓXIMO PASSO & AÇÃO PRINCIPAL (4 Colunas) */}
        <div className="lg:col-span-4 bg-emerald-950 text-white rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">
                3. Próximo Passo
              </span>
              {recommendedNextStep.priority === 'URGENTE' && (
                <span className="text-[9px] bg-rose-500/30 text-rose-200 border border-rose-400/40 font-bold px-1.5 py-0.2 rounded">
                  Prioritário
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-white leading-snug">
              {cleanPresentationText(recommendedNextStep.title)}
            </h4>
            <p className="text-xs text-emerald-200/90 font-serif leading-relaxed line-clamp-2">
              {cleanPresentationText(recommendedNextStep.description)}
            </p>
          </div>

          {/* 4. AÇÃO PRINCIPAL */}
          <button
            type="button"
            onClick={handleAction}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{cleanPresentationText(recommendedNextStep.actionLabel || resumeState.actionLabel)}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
