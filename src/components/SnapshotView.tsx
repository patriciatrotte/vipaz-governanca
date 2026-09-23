import React from 'react';
import { usePilot } from '../context/PilotContext';
import { CAPACITIES_DEFINITIONS, MATURITY_LEVELS_INFO } from '../data/methodologyConstants';
import { cleanPresentationText, formatCapacityStatus } from '../utils/formatters';
import { 
  Award, 
  Lock, 
  Download, 
  Calendar, 
  Building, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  Printer,
  ArrowRight
} from 'lucide-react';

export const SnapshotView: React.FC = () => {
  const { snapshot, integration, currentOrg, setCurrentView, currentUser } = usePilot();

  if (currentUser.role !== 'FACILITADOR') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto border border-slate-200 shadow-xs">
          <Lock className="w-8 h-8 text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Acesso Restrito ao Registro Técnico Snapshot</h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          {currentUser.role === 'ADMINISTRADOR' ? (
            <>Em conformidade com a governança do Piloto D1 (<strong>Privilégio Técnico ≠ Privilégio de Conteúdo</strong>), o Administrador da infraestrutura não possui acesso ao registro técnico de Snapshot.</>
          ) : (
            <>A geração e gestão do Snapshot técnico imutável da Dimensão D1 são reservadas à equipe de facilitação metodológica autorizada.</>
          )}
        </p>
        <div className="pt-2">
          <button
            onClick={() => setCurrentView('HOME')}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            Voltar para a Jornada D1
          </button>
        </div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mx-auto border border-slate-200">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Snapshot D1 Ainda Não Registrado</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          O Snapshot constitui o registro técnico imutável do estado validado da Dimensão D1 e só pode ser gerado após a validação metodológica formal do nível de maturidade na aba de Integração C1–C6.
        </p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `snapshot-d1-${snapshot.organizationId}-${snapshot.baseDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 print:p-0">
      {/* Barra de Ações (Oculta na Impressão) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">Registro Snapshot D1 (Imutável)</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Registro técnico imutável do estado validado da Dimensão D1 neste ciclo. Preserva o histórico de baseline e permite rastreabilidade técnica.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('OUTPUTS')}
            className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 text-slate-200 hover:text-white"
          >
            <FileText className="w-4 h-4 text-emerald-400" /> Ver Relatórios
          </button>
          <button
            onClick={handleDownloadJSON}
            className="bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Exportar JSON
          </button>
          <button
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Imprimir Registro
          </button>
        </div>
      </div>

      {/* DOCUMENTO OFICIAL DO SNAPSHOT */}
      <div className="bg-white border border-slate-300 rounded-2xl p-8 shadow-sm space-y-6 print:border-none print:p-0">
        {/* Cabeçalho Oficial */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold tracking-widest text-slate-500 uppercase block">
              DIAGNÓSTICO E EVOLUÇÃO DE PRIVACIDADE EM CÂMARAS MUNICIPAIS
            </span>
            <h1 className="text-2xl font-black text-slate-950">
              Snapshot Dimensional D1 — Governança de Privacidade
            </h1>
            <p className="text-sm font-semibold text-slate-700">
              {snapshot.organizationName} ({snapshot.municipality})
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-right space-y-0.5 shrink-0 text-xs">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">ID do Registro:</span>
            <span className="font-mono font-bold text-slate-900 text-xs block">{snapshot.snapshotId}</span>
            <span className="text-[10px] text-slate-500 block pt-1">Data-Base: <strong>{snapshot.baseDate}</strong></span>
          </div>
        </div>

        {/* Quadro Principal do Nível Validado */}
        <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-950 block">
              Nível de Maturidade Validado Metodologicamente (Humano Validou):
            </span>
            <h3 className="text-2xl font-black text-emerald-950 mt-1">
              {MATURITY_LEVELS_INFO[snapshot.validatedLevel]?.label || snapshot.validatedLevel}
            </h3>
            <p className="text-xs text-emerald-900 mt-1 max-w-xl font-serif">
              {MATURITY_LEVELS_INFO[snapshot.validatedLevel]?.shortDesc}
            </p>
          </div>

          <div className="bg-white px-4 py-3 rounded-lg border border-emerald-200 text-center shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Validador Técnico</span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">{cleanPresentationText(snapshot.validatorName)}</span>
            <span className="text-[10px] text-emerald-700 font-semibold block flex items-center justify-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Validado Metodologicamente
            </span>
          </div>
        </div>

        {/* Quadro das Seis Capacidades (C1 - C6) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            Status das Capacidades Metodológicas (C1 a C6)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {CAPACITIES_DEFINITIONS.map(cap => {
              const assessment = snapshot.capacitiesAssessment[cap.id];
              const isDem = assessment?.status === 'DEMONSTRADA';
              const isStruct = assessment?.status === 'EM_ESTRUTURACAO';

              return (
                <div key={cap.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800">{cap.id} — {cap.name}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isDem ? 'bg-emerald-100 text-emerald-800' :
                      isStruct ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {formatCapacityStatus(assessment?.status) || 'Avaliado'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] font-serif leading-relaxed">
                    {assessment?.rationale}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gaps e Próxima Conquista */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Gaps Institucionais Validados ({snapshot.validatedGaps.length})
            </h4>
            <ul className="space-y-1.5 text-slate-600">
              {snapshot.validatedGaps.map(g => (
                <li key={g.id} className="border-b border-slate-200 pb-1 last:border-none">
                  <strong className="text-slate-900 block">• {g.title}</strong>
                  <span className="text-[11px] text-slate-500 font-serif">{g.description}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2">
            <h4 className="font-bold text-teal-950 uppercase tracking-wider text-[11px]">
              Próxima Conquista Institucional
            </h4>
            <p className="text-teal-900 font-serif leading-relaxed text-xs">
              {snapshot.nextAchievement}
            </p>

            <div className="pt-3 border-t border-teal-200 text-[11px] text-teal-800">
              <strong>Previsão de Reavaliação / Novo Ciclo:</strong> {snapshot.scheduledNextReview}
            </div>
          </div>
        </div>

        {/* Indicador Experimental Baseline */}
        {snapshot.experimentalIndicatorBaseline && (
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs space-y-1">
            <span className="font-bold text-indigo-950 uppercase tracking-wider text-[11px] block">
              Indicador Experimental de Acompanhamento (Baseline do Ciclo)
            </span>
            <div className="flex items-center justify-between">
              <span className="text-indigo-900 font-medium">
                {snapshot.experimentalIndicatorBaseline.name}
              </span>
              <span className="text-base font-bold font-mono text-indigo-700">
                {snapshot.experimentalIndicatorBaseline.trackedPercentage}%
              </span>
            </div>
            <p className="text-[11px] text-indigo-800/80 italic">
              {snapshot.experimentalIndicatorBaseline.notes}
            </p>
          </div>
        )}

        {/* Plano de Ações Resumido */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
            Ações Pactuadas no Ciclo de Evolução ({snapshot.plannedActions.length})
          </h4>
          <div className="divide-y divide-slate-100">
            {snapshot.plannedActions.map(act => (
              <div key={act.id} className="py-2 flex items-start justify-between gap-2">
                <div>
                  <strong className="text-slate-900 block">{act.actionTitle}</strong>
                  <span className="text-slate-500 text-[11px]">
                    Resultado Pretendido: {act.expectedResult}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 block">
                    {act.deadlineOrPhase}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {act.actors.join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé e Autenticação */}
        <div className="border-t-2 border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>
            Registro técnico de baseline emitido no âmbito do Piloto Dimensional D1 v1.0. Preserva histórico e rastreabilidade técnica, sem configurar certificação oficial de conformidade.
          </span>
          <span className="font-mono shrink-0">
            Hash: {snapshot.snapshotId.slice(0, 16).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};
