import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { 
  BarChart3, 
  Award, 
  FileText, 
  ShieldCheck, 
  GitCommit, 
  ArrowRight, 
  Lock, 
  Calendar,
  Building2,
  ExternalLink,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { OutputsView } from './OutputsView';
import { SnapshotView } from './SnapshotView';

type OutputType = 'HUB' | 'EXECUTIVE' | 'SNAPSHOT' | 'TECHNICAL' | 'PUBLIC_SUMMARY';

export const ReportsModuleView: React.FC = () => {
  const { currentView, snapshot, integration, currentOrg, currentUser } = usePilot();

  const [currentOutput, setCurrentOutput] = useState<OutputType>(() => {
    return currentView === 'SNAPSHOT' ? 'SNAPSHOT' : 'HUB';
  });

  const isFacilitator = currentUser.role === 'FACILITADOR';
  const isGestor = currentUser.role === 'GESTOR_INSTITUCIONAL';
  const isInterlocutor = currentUser.role === 'INTERLOCUTOR_PRINCIPAL';
  const isParticipant = currentUser.role === 'PARTICIPANTE';

  const canViewExecutive = isFacilitator || isGestor || isInterlocutor;
  const canViewTechnical = isFacilitator;
  const canViewSnapshot = isFacilitator || isGestor || isInterlocutor;
  const isValidated = integration?.humanValidation?.isValidated === true;

  // Se o usuário selecionou uma saída específica, renderiza o visualizador dedicado
  if (currentOutput === 'EXECUTIVE') {
    return (
      <OutputsView 
        initialTab="EXECUTIVE" 
        onBackToHub={() => setCurrentOutput('HUB')} 
      />
    );
  }

  if (currentOutput === 'SNAPSHOT') {
    return (
      <SnapshotView 
        onBackToHub={() => setCurrentOutput('HUB')} 
      />
    );
  }

  if (currentOutput === 'TECHNICAL') {
    return (
      <OutputsView 
        initialTab="TECHNICAL" 
        onBackToHub={() => setCurrentOutput('HUB')} 
      />
    );
  }

  if (currentOutput === 'PUBLIC_SUMMARY') {
    return (
      <OutputsView 
        initialTab="UPCOMING" 
        onBackToHub={() => setCurrentOutput('HUB')} 
      />
    );
  }

  // Visualização padrão: Central / Hub de Saídas Institucionais
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      
      {/* Cabeçalho do Hub de Relatórios */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <BarChart3 className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Central de Relatórios &amp; Saídas
                </h1>
                <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  VIPAZ
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Acesse documentos executivos, extratos oficiais e registros técnicos produzidos durante a investigação e consolidação do ciclo.
              </p>
            </div>
          </div>

          <div className="text-right hidden md:block">
            <span className="text-[11px] text-slate-400 block">Instituição</span>
            <span className="text-xs font-bold text-slate-200">{currentOrg?.name}</span>
          </div>
        </div>
      </div>

      {/* Grid de Saídas Realmente Existentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* SAÍDA 1: RETRATO EXECUTIVO */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <FileText className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                Visualização Dinâmica (Tempo Real)
              </span>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Retrato Executivo da Governança
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Síntese gerencial de alta autoridade para a Presidência e Mesa Diretora. Aponta o estágio de governança apurado, capacidades consolidadas, lacunas institucionais e ações prioritárias pactuadas.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Natureza:</span>
                <span className="font-semibold text-slate-700">Relatório Reativo</span>
              </div>
              <div className="flex justify-between">
                <span>Destinatários:</span>
                <span className="font-semibold text-slate-700">Mesa Diretora &amp; Encarregado</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2">
            {canViewExecutive ? (
              <button
                type="button"
                onClick={() => setCurrentOutput('EXECUTIVE')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Visualizar Retrato Executivo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="p-2 bg-slate-50 rounded-lg text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 border border-slate-200">
                <Lock className="w-3.5 h-3.5" />
                <span>Acesso reservado à governança</span>
              </div>
            )}
          </div>
        </div>

        {/* SAÍDA 2: SNAPSHOT D1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
                <Award className="w-5 h-5" />
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                snapshot 
                  ? 'bg-teal-100 text-teal-800 border-teal-200' 
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {snapshot ? 'Marco Técnico Congelado' : 'Aguardando Validação'}
              </span>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Snapshot D1 (Registro Imutável)
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Registro formal auditável que preserva o estado validado da Dimensão D1 neste ciclo. Imutável após homologação pelo Facilitador, garantindo linha de base histórica confiável.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Natureza:</span>
                <span className="font-semibold text-slate-700">Marco Histórico Imutável</span>
              </div>
              <div className="flex justify-between">
                <span>Situação:</span>
                <span className="font-semibold text-slate-700">
                  {snapshot ? `Registrado em ${snapshot.baseDate}` : 'Pendente de validação formal'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2">
            {canViewSnapshot ? (
              <button
                type="button"
                onClick={() => setCurrentOutput('SNAPSHOT')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>{snapshot ? 'Acessar Registro Snapshot' : 'Consultar Diretrizes do Snapshot'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="p-2 bg-slate-50 rounded-lg text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 border border-slate-200">
                <Lock className="w-3.5 h-3.5" />
                <span>Acesso restrito</span>
              </div>
            )}
          </div>
        </div>

        {/* SAÍDA 3: RASTREABILIDADE TÉCNICA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                <GitCommit className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md border border-indigo-200">
                Cadeia de Custódia Fática
              </span>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Rastreabilidade Técnica da Investigação
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Matriz técnica detalhada com respostas originais fáticas, decomposição em unidades de informação, sondagens aplicadas, registros de não-sei e conciliação de divergências.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Natureza:</span>
                <span className="font-semibold text-slate-700">Dossiê Técnico &amp; Auditoria</span>
              </div>
              <div className="flex justify-between">
                <span>Acesso exclusivo:</span>
                <span className="font-semibold text-slate-700">Equipe de Facilitação</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2">
            {canViewTechnical ? (
              <button
                type="button"
                onClick={() => setCurrentOutput('TECHNICAL')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Abrir Rastreabilidade Técnica</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="p-2 bg-slate-50 rounded-lg text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 border border-slate-200">
                <Lock className="w-3.5 h-3.5" />
                <span>Reservado à facilitação metodológica</span>
              </div>
            )}
          </div>
        </div>

        {/* SAÍDA 4: MINUTA PARA PUBLICAÇÃO OFICIAL */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-800 px-2 py-0.5 rounded-md border border-purple-200">
                Transparência Ativa
              </span>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Minuta Institucional para Publicação Oficial
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Extrato institucional higienizado de dados pessoais e operacionais sensíveis, formatado para publicação em Diário Oficial ou Portal de Transparência da Câmara.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Natureza:</span>
                <span className="font-semibold text-slate-700">Extrato Sanitizado</span>
              </div>
              <div className="flex justify-between">
                <span>Finalidade:</span>
                <span className="font-semibold text-slate-700">Diário Oficial e Portal</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2">
            {canViewExecutive ? (
              <button
                type="button"
                onClick={() => setCurrentOutput('PUBLIC_SUMMARY')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Visualizar Minuta de Publicação</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="p-2 bg-slate-50 rounded-lg text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 border border-slate-200">
                <Lock className="w-3.5 h-3.5" />
                <span>Acesso restrito</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
