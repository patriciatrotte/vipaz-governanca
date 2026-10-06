import React from 'react';
import { BookOpen, Info, Sparkles, ShieldCheck } from 'lucide-react';

export const KnowledgeModuleView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      
      {/* Cabeçalho Visual da Base de Conhecimento */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xs">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            <BookOpen className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Conhecimento
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Base de Conhecimento, diretrizes institucionais e referências normativas da VIPAZ
            </p>
          </div>
        </div>
      </div>

      {/* Estado Vazio Informativo Adequado (Conforme Precisão 2: sem conteúdo fictício ou guias inventados) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center shadow-xs max-w-2xl mx-auto space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-xs">
          <BookOpen className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Base de Conhecimento em Estruturação
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-sans max-w-md mx-auto">
            Este módulo reunirá diretrizes técnicas, notas interpretativas e referências normativas da VIPAZ para suporte contínuo à governança e proteção de dados nas Câmaras Municipais.
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 text-left flex items-start gap-2.5 max-w-md mx-auto">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span className="text-[11px] leading-relaxed">
            Diretrizes técnicas, notas interpretativas e referências normativas da VIPAZ aplicáveis à governança e proteção de dados.
          </span>
        </div>
      </div>

    </div>
  );
};
