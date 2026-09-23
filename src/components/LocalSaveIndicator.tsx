import React from 'react';
import { HardDrive, CheckCircle2 } from 'lucide-react';

interface LocalSaveIndicatorProps {
  className?: string;
}

export const LocalSaveIndicator: React.FC<LocalSaveIndicatorProps> = ({ className = '' }) => {
  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 border border-slate-200 text-slate-600 text-[11px] font-medium shadow-2xs select-none ${className}`}
      title="Os dados deste piloto estão armazenados neste navegador/dispositivo (sem sincronização em nuvem ou compartilhamento com outros usuários/dispositivos)."
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      <span>Os dados deste piloto estão armazenados neste navegador/dispositivo.</span>
      <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">• Armazenamento Local</span>
    </div>
  );
};
