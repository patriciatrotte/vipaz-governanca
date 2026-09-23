import React from 'react';
import { UserJourneyInfo } from '../utils/journeyEngine';
import { usePilot } from '../context/PilotContext';
import { 
  ArrowRight, 
  Play, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Compass, 
  Sparkles,
  Layers,
  FileCheck
} from 'lucide-react';
import { cleanPresentationText } from '../utils/formatters';
import { LocalSaveIndicator } from './LocalSaveIndicator';

interface ResumeJourneyCardProps {
  journeyInfo: UserJourneyInfo;
}

export const ResumeJourneyCard: React.FC<ResumeJourneyCardProps> = ({ journeyInfo }) => {
  const { setCurrentView, setActiveDoorId } = usePilot();
  const { resumeState, recommendedNextStep } = journeyInfo;

  const handleResumeAction = () => {
    if (resumeState.actionDoorId) {
      setActiveDoorId(resumeState.actionDoorId);
    }
    setCurrentView(resumeState.actionView);
  };

  const handleNextStepAction = () => {
    if (recommendedNextStep.actionDoorId) {
      setActiveDoorId(recommendedNextStep.actionDoorId);
    }
    setCurrentView(recommendedNextStep.actionView);
  };

  const getVariantStyles = (variant: 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo') => {
    switch (variant) {
      case 'rose':
        return {
          border: 'border-rose-300 bg-rose-50/70 text-rose-900',
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
        };
      case 'amber':
        return {
          border: 'border-amber-300 bg-amber-50/70 text-amber-900',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <Clock className="w-4 h-4 text-amber-600 shrink-0" />
        };
      case 'sky':
        return {
          border: 'border-sky-300 bg-sky-50/70 text-sky-900',
          badge: 'bg-sky-100 text-sky-800 border-sky-300',
          icon: <Compass className="w-4 h-4 text-sky-600 shrink-0" />
        };
      case 'indigo':
        return {
          border: 'border-indigo-300 bg-indigo-50/70 text-indigo-900',
          badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          icon: <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
        };
      case 'emerald':
      default:
        return {
          border: 'border-emerald-300 bg-emerald-50/70 text-emerald-950',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        };
    }
  };

  const currentStyles = getVariantStyles(resumeState.badgeVariant);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* 1. Card Principal: Continuar de Onde Parei (7 Colunas) */}
      <div className={`lg:col-span-7 rounded-2xl border ${currentStyles.border} p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 transition-all`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              {cleanPresentationText(resumeState.title)}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentStyles.badge}`}>
              {cleanPresentationText(resumeState.badgeText)}
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            {currentStyles.icon}
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {cleanPresentationText(resumeState.headline)}
              </h3>
              <p className="text-xs text-slate-600 font-serif leading-relaxed">
                {cleanPresentationText(resumeState.detail)}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={handleResumeAction}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>{cleanPresentationText(resumeState.actionLabel)}</span>
          </button>

          <LocalSaveIndicator />
        </div>
      </div>

      {/* 2. Card Secundário: Próximo Passo Recomendado (5 Colunas) */}
      <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 transition-all">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Próximo Passo Recomendado</span>
            </div>
            {recommendedNextStep.priority === 'URGENTE' ? (
              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full border border-rose-200">
                Prioritário
              </span>
            ) : (
              <span className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-full border border-slate-200">
                Recomendado
              </span>
            )}
          </div>

          <h4 className="text-sm font-bold text-slate-900 leading-snug">
            {cleanPresentationText(recommendedNextStep.title)}
          </h4>

          <p className="text-xs text-slate-600 leading-relaxed font-serif">
            {cleanPresentationText(recommendedNextStep.description)}
          </p>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
            <strong>Motivo metodológico:</strong> {cleanPresentationText(recommendedNextStep.reason)}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={handleNextStepAction}
            className="w-full px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{cleanPresentationText(recommendedNextStep.actionLabel)}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
