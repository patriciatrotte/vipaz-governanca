import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { Target, BarChart3, CheckCircle2, Clock } from 'lucide-react';
import { EvolutionPlanView } from './EvolutionPlanView';
import { ExperimentalIndicatorView } from './ExperimentalIndicatorView';

export const EvolutionModuleView: React.FC = () => {
  const { currentView, actions, integration } = usePilot();

  const [activeTab, setActiveTab] = useState<'plano' | 'indicador'>(() => {
    return currentView === 'INDICATOR' ? 'indicador' : 'plano';
  });

  const isMaturityValidated =
    integration?.humanValidation?.isValidated === true &&
    Boolean(integration?.humanValidation?.validatedLevel);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      
      {/* Sub-abas do Módulo Jornada de Evolução */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('plano')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'plano'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Plano de Evolução</span>
          {actions && actions.length > 0 && (
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
              activeTab === 'plano' ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {actions.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('indicador')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'indicador'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Acompanhamento da Evolução</span>
        </button>
      </div>

      {/* Conteúdo da Sub-aba Ativa */}
      {activeTab === 'plano' ? (
        <EvolutionPlanView />
      ) : (
        <ExperimentalIndicatorView />
      )}

    </div>
  );
};
