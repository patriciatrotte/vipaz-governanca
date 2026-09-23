import React, { useState } from 'react';
import { cleanPresentationText } from '../utils/formatters';
import { 
  MapPin, 
  CheckCircle, 
  HelpCircle, 
  Gift, 
  ChevronDown, 
  ChevronUp,
  Compass
} from 'lucide-react';

interface FourQuestionsCardProps {
  whereAmI: string;
  whatToDoNow: string;
  whyItMatters: string;
  whatWillIGet: string;
  defaultExpanded?: boolean;
}

export const FourQuestionsCard: React.FC<FourQuestionsCardProps> = ({
  whereAmI,
  whatToDoNow,
  whyItMatters,
  whatWillIGet,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs transition-all">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none group"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-100/80 text-emerald-800 shrink-0 group-hover:bg-emerald-200/80 transition-colors">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                Guia Rápido de Orientação
              </h3>
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                • 4 respostas para clareza da sua jornada
              </span>
            </div>
            {!isExpanded && (
              <p className="text-[11px] text-slate-500 truncate max-w-[280px] xs:max-w-md sm:max-w-xl font-serif">
                <span className="font-semibold text-slate-700">Momento atual:</span> {cleanPresentationText(whereAmI)}
              </p>
            )}
          </div>
        </div>

        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shrink-0 ml-2"
          aria-label={isExpanded ? 'Recolher guia' : 'Expandir guia das 4 perguntas'}
        >
          <span className="text-[11px]">{isExpanded ? 'Recolher' : 'Ver 4 perguntas'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 mt-3 border-t border-slate-200/70 text-xs animate-in fade-in">
          {/* 1. Onde estou */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-sky-700 font-bold text-[11px] uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>1. Onde estou?</span>
            </div>
            <p className="text-slate-700 text-[11px] leading-relaxed font-serif">
              {cleanPresentationText(whereAmI)}
            </p>
          </div>

          {/* 2. O que faço agora */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px] uppercase tracking-wider">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>2. O que faço agora?</span>
            </div>
            <p className="text-slate-700 text-[11px] leading-relaxed font-serif">
              {cleanPresentationText(whatToDoNow)}
            </p>
          </div>

          {/* 3. Por que isso importa */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-amber-700 font-bold text-[11px] uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>3. Por que isso importa?</span>
            </div>
            <p className="text-slate-700 text-[11px] leading-relaxed font-serif">
              {cleanPresentationText(whyItMatters)}
            </p>
          </div>

          {/* 4. O que vou obter */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-purple-700 font-bold text-[11px] uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>4. O que vou obter?</span>
            </div>
            <p className="text-slate-700 text-[11px] leading-relaxed font-serif">
              {cleanPresentationText(whatWillIGet)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
