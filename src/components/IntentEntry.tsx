import React from 'react';
import { BookOpen, ClipboardPenLine, Route, ArrowRight } from 'lucide-react';
import { usePilot } from '../context/PilotContext';
import { isViewAllowedForRole } from '../utils/rolePermissions';
import type { AppView } from '../context/PilotContext';

/** UX-ENT-001: atalhos reversíveis; não alteram o ciclo nem criam registros. */
export const IntentEntry: React.FC<{ onContinue: () => void }> = ({ onContinue }) => {
  const { currentUser, setCurrentView } = usePilot();
  const registerView: AppView = isViewAllowedForRole(currentUser.role, 'INTERVIEW')
    ? 'INTERVIEW'
    : isViewAllowedForRole(currentUser.role, 'DISTRIBUTED')
      ? 'DISTRIBUTED'
      : 'DIAGNOSTIC';
  const options = [
    { title: 'Registrar ou atualizar', description: 'Informações, atividades e evidências', icon: ClipboardPenLine, action: () => setCurrentView(registerView), enabled: isViewAllowedForRole(currentUser.role, registerView) },
    { title: 'Aprender ou tirar dúvidas', description: 'Conhecimento, orientações e fontes', icon: BookOpen, action: () => setCurrentView('KNOWLEDGE'), enabled: isViewAllowedForRole(currentUser.role, 'KNOWLEDGE') },
    { title: 'Continuar minha jornada', description: 'Retomar o próximo passo recomendado', icon: Route, action: onContinue, enabled: true },
  ];
  return (
    <section aria-labelledby="vipaz-intent-heading" className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold tracking-wide uppercase text-emerald-700">Minha jornada VIPAZ</p>
        <h2 id="vipaz-intent-heading" className="text-lg sm:text-xl font-bold text-slate-900 mt-1">O que você deseja fazer hoje?</h2>
        <p className="text-sm text-slate-600 mt-1">Você pode mudar de caminho quando quiser, sem perder os registros já realizados.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.filter(option => option.enabled).map(option => (
          <button key={option.title} type="button" onClick={option.action}
            className="group text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 p-4 transition-colors">
            <option.icon aria-hidden="true" className="w-6 h-6 text-emerald-700 mb-3" />
            <span className="block font-semibold text-sm text-slate-900">{option.title}</span>
            <span className="block text-xs text-slate-600 mt-1">{option.description}</span>
            <ArrowRight aria-hidden="true" className="w-4 h-4 mt-3 text-slate-500 group-hover:text-emerald-700" />
          </button>
        ))}
      </div>
    </section>
  );
};
