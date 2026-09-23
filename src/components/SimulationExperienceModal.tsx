import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { 
  UserCheck, 
  ShieldCheck, 
  Target, 
  Send, 
  Layers, 
  X, 
  Compass, 
  ChevronRight, 
  Lock, 
  Cpu,
  Info,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { getDefaultViewForRole } from '../utils/rolePermissions';

interface SimulationExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  onSelectExperience?: (role: UserRole, targetUser: UserProfile) => void;
}

export const SimulationExperienceModal: React.FC<SimulationExperienceModalProps> = ({
  isOpen,
  onClose,
  title = 'Escolha a experiência que deseja simular',
  subtitle = 'Ambiente de teste — a troca de perfil simula experiências de usuários com diferentes responsabilidades institucionais.',
  onSelectExperience
}) => {
  const { 
    currentUser, 
    setCurrentUser, 
    availableUsers, 
    setCurrentView,
    currentOrg
  } = usePilot();

  const [showDevOptions, setShowDevOptions] = useState(false);

  if (!isOpen) return null;

  // Encontra os usuários representativos de cada papel na organização ativa
  const interlocutorUser = availableUsers.find(u => u.role === 'INTERLOCUTOR_PRINCIPAL') || availableUsers[0];
  const gestorUser = availableUsers.find(u => u.role === 'GESTOR_INSTITUCIONAL') || availableUsers[0];
  const facilitadorUser = availableUsers.find(u => u.role === 'FACILITADOR') || availableUsers[0];
  const participanteUser = availableUsers.find(u => u.role === 'PARTICIPANTE') || availableUsers[0];
  const adminUser = availableUsers.find(u => u.role === 'ADMINISTRADOR');

  const handleSelectExperience = (role: UserRole, targetUser: UserProfile) => {
    setCurrentUser(targetUser);
    if (onSelectExperience) {
      onSelectExperience(role, targetUser);
    } else {
      const targetView = getDefaultViewForRole(role);
      setCurrentView(targetView);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="simulation-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* Cabeçalho do Modal com aviso de Simulação */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar seletor de experiência"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider mb-2.5">
            <span>🧪 Modo de Simulação • Ambiente de Teste</span>
          </div>

          <h2 id="simulation-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed font-serif">
            {subtitle}
          </p>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-start gap-2 text-[11px] text-slate-400">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span className="leading-snug">
              Na versão final de produção, o usuário será autenticado por login e terá acesso restrito aos contextos, papéis e permissões atribuídos à sua conta institucional.
            </span>
          </div>
        </div>

        {/* Corpo: Grade das 4 Experiências com Linguagem Orientada à Função */}
        <div className="p-5 sm:p-6 space-y-3.5 max-h-[68vh] overflow-y-auto">
          
          {/* 1. ENCARREGADO / INTERLOCUTOR PRINCIPAL */}
          <button
            type="button"
            onClick={() => handleSelectExperience('INTERLOCUTOR_PRINCIPAL', interlocutorUser)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start justify-between gap-3 group cursor-pointer ${
              currentUser.role === 'INTERLOCUTOR_PRINCIPAL'
                ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Encarregado / Interlocutor Principal
                  </h3>
                  {currentUser.role === 'INTERLOCUTOR_PRINCIPAL' && (
                    <span className="text-[10px] font-bold bg-emerald-700 text-white px-2 py-0.5 rounded-full">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-emerald-900 mt-1">
                  “Conduza e acompanhe o diagnóstico institucional.”
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-serif">
                  Articulação interna, resposta às 6 Portas, solicitação de contribuições a setores e gestão do Plano de Evolução.
                </p>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                  <span>Simulado: {interlocutorUser.name}</span>
                  <span>•</span>
                  <span className="truncate">{interlocutorUser.department}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
          </button>

          {/* 2. GESTOR INSTITUCIONAL */}
          <button
            type="button"
            onClick={() => handleSelectExperience('GESTOR_INSTITUCIONAL', gestorUser)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start justify-between gap-3 group cursor-pointer ${
              currentUser.role === 'GESTOR_INSTITUCIONAL'
                ? 'border-teal-600 bg-teal-50/60 shadow-xs'
                : 'border-slate-200 hover:border-teal-400 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200 group-hover:scale-105 transition-transform">
                <Target className="w-5 h-5 text-teal-700" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Gestor Institucional
                  </h3>
                  {currentUser.role === 'GESTOR_INSTITUCIONAL' && (
                    <span className="text-[10px] font-bold bg-teal-700 text-white px-2 py-0.5 rounded-full">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-teal-900 mt-1">
                  “Acompanhe situação, prioridades, decisões e evolução.”
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-serif">
                  Mesa Diretora e Presidência: consulta a relatórios consolidados, deliberação sobre apoios institucionais e prazos (sem preenchimento de diagnóstico).
                </p>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                  <span>Simulado: {gestorUser.name}</span>
                  <span>•</span>
                  <span className="truncate">{gestorUser.department}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
          </button>

          {/* 3. FACILITADOR */}
          <button
            type="button"
            onClick={() => handleSelectExperience('FACILITADOR', facilitadorUser)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start justify-between gap-3 group cursor-pointer ${
              currentUser.role === 'FACILITADOR'
                ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-indigo-700" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Facilitador
                  </h3>
                  {currentUser.role === 'FACILITADOR' && (
                    <span className="text-[10px] font-bold bg-indigo-700 text-white px-2 py-0.5 rounded-full">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-indigo-900 mt-1">
                  “Conduza a investigação e valide metodologicamente os resultados.”
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-serif">
                  Condução de entrevistas fáticas, conciliação de divergências, controle de suficiência probatória e validação metodológica humana de maturidade C1–C6.
                </p>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                  <span>Simulado: {facilitadorUser.name}</span>
                  <span>•</span>
                  <span className="truncate">{facilitadorUser.department}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
          </button>

          {/* 4. PARTICIPANTE CONVIDADO */}
          <button
            type="button"
            onClick={() => handleSelectExperience('PARTICIPANTE', participanteUser)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start justify-between gap-3 group cursor-pointer ${
              currentUser.role === 'PARTICIPANTE'
                ? 'border-sky-600 bg-sky-50/60 shadow-xs'
                : 'border-slate-200 hover:border-sky-400 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 mt-0.5 border border-sky-200 group-hover:scale-105 transition-transform">
                <Send className="w-5 h-5 text-sky-700" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Participante Convidado
                  </h3>
                  {currentUser.role === 'PARTICIPANTE' && (
                    <span className="text-[10px] font-bold bg-sky-700 text-white px-2 py-0.5 rounded-full">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-sky-900 mt-1">
                  “Contribua com informações específicas solicitadas.”
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-serif">
                  Servidor setorial: responde apenas a rotinas do seu departamento (TI, RH ou Protocolo) e fornece evidências fáticas do dia a dia.
                </p>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                  <span>Simulado: {participanteUser.name}</span>
                  <span>•</span>
                  <span className="truncate">{participanteUser.department}</span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
          </button>

          {/* Opção Exclusiva de Desenvolvimento: Administrador Técnico (Oculta por Padrão) */}
          {adminUser && (
            <div className="pt-2 border-t border-slate-100">
              {!showDevOptions ? (
                <button
                  type="button"
                  onClick={() => setShowDevOptions(true)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ambiente de desenvolvimento: exibir Administrador Técnico</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSelectExperience('ADMINISTRADOR', adminUser)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 bg-slate-50 hover:bg-slate-100 ${
                    currentUser.role === 'ADMINISTRADOR' ? 'border-slate-800' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-xs">
                        Administrador Técnico (Desenvolvimento)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Manutenção de integridade operacional, testes de sistema e backups.
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Rodapé Metodológico e de Persistência */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Os dados deste piloto estão armazenados neste navegador/dispositivo.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
