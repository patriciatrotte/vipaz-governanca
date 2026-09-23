import React, { useState, useEffect } from 'react';
import { JourneyStage } from '../utils/journeyEngine';
import { formatStageLabel, cleanPresentationText } from '../utils/formatters';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Circle, 
  Search,
  ChevronRight,
  ChevronDown,
  Compass,
  Lock,
  Info,
  X
} from 'lucide-react';

export interface StageProgressTrackerProps {
  stages: JourneyStage[];
  selectedStageId: string;
  onSelectStage: (stageId: string) => void;
  isRestrictedForRole?: (stageId: string) => boolean;
}

export const StageProgressTracker: React.FC<StageProgressTrackerProps> = ({ 
  stages,
  selectedStageId,
  onSelectStage,
  isRestrictedForRole
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [hintDismissed, setHintDismissed] = useState<boolean>(() => {
    return localStorage.getItem('d1_stage_nav_hint_dismissed') === 'true';
  });

  const handleDismissHint = () => {
    localStorage.setItem('d1_stage_nav_hint_dismissed', 'true');
    setHintDismissed(true);
  };

  const selectedIndex = Math.max(0, stages.findIndex(s => s.id === selectedStageId));
  const activeStage = stages[selectedIndex] || stages[0];

  const getStageSymbol = (stage: JourneyStage, isSelected: boolean, isRestricted: boolean) => {
    if (isRestricted) {
      return <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
    if (isSelected) {
      return <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 inline-block shadow-xs" title="Etapa Selecionada" />;
    }
    if (stage.status === 'CONCLUIDO') {
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    }
    if (stage.status === 'PENDENTE' || stage.status === 'EM_APROFUNDAMENTO') {
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    }
    if (stage.status === 'EM_ANDAMENTO') {
      return <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />;
    }
    return <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  const handleStageClick = (stageId: string) => {
    onSelectStage(stageId);
    setMobileMenuOpen(false);
  };

  return (
    <nav 
      aria-label="Mapa da Jornada D1"
      className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-2xs space-y-2.5"
    >
      {/* Orientação curta de primeiro contato (Section 4 do Prompt) */}
      {!hintDismissed && (
        <div className="flex items-center justify-between px-3 py-2 bg-emerald-50/90 border border-emerald-200 rounded-xl text-xs text-emerald-950 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-medium text-[11px] sm:text-xs">
              Selecione uma etapa para acessar as atividades correspondentes.
            </span>
          </div>
          <button
            type="button"
            onClick={handleDismissHint}
            className="text-emerald-800 hover:text-emerald-950 font-bold text-[11px] px-2 py-0.5 rounded hover:bg-emerald-100 transition-colors cursor-pointer shrink-0 ml-2"
            title="Dispensar aviso de orientação"
          >
            Entendi
          </button>
        </div>
      )}

      {/* Topo do Navegador: Título e Identificação da Etapa */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              Jornada D1
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">•</span>
            <span className="text-[11px] font-semibold text-slate-600 hidden sm:inline">
              Workspace da Etapa {selectedIndex + 1} de {stages.length}:
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
              {formatStageLabel(activeStage.id, activeStage.label)}
            </span>
          </div>
        </div>

        {/* Botão de alternância para telas menores / mobile */}
        <div className="sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors border border-slate-300"
            aria-expanded={mobileMenuOpen}
            aria-label="Trocar etapa da jornada"
          >
            <span>Trocar etapa</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* NAVEGADOR DESKTOP & NOTEBOOK (MAPA DA JORNADA COMPACTO COM FORTE AFFORDANCE) */}
      <div className="hidden sm:flex items-center justify-between gap-1.5 pt-1">
        {stages.map((stage, idx) => {
          const isSelected = stage.id === selectedStageId;
          const isRestricted = isRestrictedForRole ? isRestrictedForRole(stage.id) : false;
          const isCurrentInMethodology = stage.isCurrent;

          return (
            <React.Fragment key={stage.id}>
              <button
                type="button"
                onClick={() => handleStageClick(stage.id)}
                className={`group flex-1 p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-1 min-h-[64px] focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                  isSelected
                    ? 'bg-slate-900 border-slate-800 text-white shadow-md ring-2 ring-emerald-500'
                    : isRestricted
                    ? 'bg-slate-50 border-slate-200/60 text-slate-400 hover:bg-slate-100/80'
                    : isCurrentInMethodology
                    ? 'bg-emerald-50/50 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-2xs'
                    : 'bg-white border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 hover:shadow-2xs'
                }`}
                title={`Clique para navegar para o Workspace da Etapa ${idx + 1}: ${formatStageLabel(stage.id, stage.label)}`}
              >
                {/* Linha 1: Marcador numérico e Símbolo Hierárquico */}
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                    0{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    {getStageSymbol(stage, isSelected, isRestricted)}
                  </div>
                </div>

                {/* Linha 2: Rótulo da Etapa */}
                <div className="truncate w-full">
                  <div className={`text-xs font-bold truncate leading-tight ${isSelected ? 'text-white' : 'text-slate-800 group-hover:text-emerald-800'}`}>
                    {formatStageLabel(stage.id, stage.label)}
                  </div>
                  <div className={`text-[9px] font-semibold truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {isRestricted ? 'Apenas Facilitação' : cleanPresentationText(stage.statusText.split('•')[0].trim())}
                  </div>
                </div>

                {/* Indicador de Seleção Ativa no rodapé do item */}
                {isSelected && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-emerald-500 rounded-full" />
                )}
              </button>

              {/* Conector entre etapas */}
              {idx < stages.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 hidden md:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* DROPDOWN / MENU EXPANSÍVEL MOBILE (~390px) (Section 24 do Prompt) */}
      {mobileMenuOpen && (
        <div className="sm:hidden grid grid-cols-1 gap-2 pt-2 border-t border-slate-100 animate-in fade-in">
          <p className="text-[11px] font-semibold text-slate-500 px-1">
            Selecione uma etapa para abrir o workspace correspondente:
          </p>
          {stages.map((stage, idx) => {
            const isSelected = stage.id === selectedStageId;
            const isRestricted = isRestrictedForRole ? isRestrictedForRole(stage.id) : false;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => handleStageClick(stage.id)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-slate-900 border-slate-800 text-white font-bold ring-2 ring-emerald-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`text-xs font-mono font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold leading-tight">
                      {formatStageLabel(stage.id, stage.label)}
                    </div>
                    <div className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {cleanPresentationText(stage.statusText)}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {getStageSymbol(stage, isSelected, isRestricted)}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
