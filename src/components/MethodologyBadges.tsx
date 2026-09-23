import React from 'react';
import { DoorStatus, CycleStatus } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  Search, 
  AlertCircle, 
  HelpCircle, 
  Users2, 
  MinusCircle, 
  ShieldCheck,
  FileCheck,
  Sparkles
} from 'lucide-react';

/**
 * Utilitários e Badges Visuais Padronizados para o Design System D1
 * Alinhados com a identidade visual da Central de Organizações (Slate Azul-Marinho / Esmeralda / Celeste / Púrpura)
 */

export interface DoorStatusBadgeProps {
  status: DoorStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const DoorStatusBadge: React.FC<DoorStatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showIcon = true 
}) => {
  const isSm = size === 'sm';
  const paddingClass = isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';
  const iconSize = isSm ? 'w-3 h-3' : 'w-3.5 h-3.5';

  switch (status) {
    case 'SUFICIENTEMENTE_EXPLORADA':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${paddingClass}`}>
          {showIcon && <CheckCircle2 className={`${iconSize} text-emerald-600 shrink-0`} />}
          <span>Suficientemente Explorada</span>
        </span>
      );

    case 'SUFICIENTEMENTE_EXPLORADA_COMPROVACAO_PENDENTE':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-md bg-emerald-50/80 text-emerald-900 border border-emerald-300 ${paddingClass}`}>
          {showIcon && <FileCheck className={`${iconSize} text-purple-600 shrink-0`} />}
          <span>Explorada · Comprovação Pendente</span>
        </span>
      );

    case 'EM_DESCOBERTA':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-md bg-sky-50 text-sky-800 border border-sky-200 ${paddingClass}`}>
          {showIcon && <Search className={`${iconSize} text-sky-600 shrink-0`} />}
          <span>Em Descoberta</span>
        </span>
      );

    case 'REQUER_OUTRA_FONTE':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-md bg-sky-50/70 text-sky-900 border border-sky-200 ${paddingClass}`}>
          {showIcon && <Users2 className={`${iconSize} text-sky-600 shrink-0`} />}
          <span>Requer Outra Fonte</span>
        </span>
      );

    case 'REQUER_APROFUNDAMENTO':
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 ${paddingClass}`}>
          {showIcon && <AlertCircle className={`${iconSize} text-amber-600 shrink-0`} />}
          <span>Requer Aprofundamento</span>
        </span>
      );

    case 'NAO_APROFUNDADA_POR_PROPORCIONALIDADE':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${paddingClass}`}>
          {showIcon && <MinusCircle className={`${iconSize} text-slate-500 shrink-0`} />}
          <span>Não Aprofundada (Proporcionalidade)</span>
        </span>
      );

    case 'NAO_INICIADA':
    default:
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-slate-100 text-slate-600 border border-slate-200 ${paddingClass}`}>
          {showIcon && <Clock className={`${iconSize} text-slate-400 shrink-0`} />}
          <span>Não Iniciada</span>
        </span>
      );
  }
};

export const CycleStatusBadge: React.FC<{ status: CycleStatus }> = ({ status }) => {
  switch (status) {
    case 'CONCLUIDO_VALIDADO':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>Concluído / Validado</span>
        </span>
      );
    case 'EM_ANDAMENTO':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
          <Clock className="w-3 h-3 text-sky-600 shrink-0" />
          <span>Em Andamento</span>
        </span>
      );
    case 'NAO_INICIADO':
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
          <span>Não Iniciado</span>
        </span>
      );
  }
};
