import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { 
  CheckCircle2, 
  Target, 
  Clock, 
  User, 
  FileCheck, 
  Plus, 
  Award, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { EvolutionAction, CapacityId, ActionStatus } from '../types';
import { LocalSaveIndicator } from './LocalSaveIndicator';

export const EvolutionPlanView: React.FC = () => {
  const { 
    gaps, 
    actions, 
    addAction, 
    updateActionStatus, 
    currentUser,
    setCurrentView 
  } = usePilot();

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newExpectedResult, setNewExpectedResult] = useState('');
  const [newRelatedGapId, setNewRelatedGapId] = useState(gaps[0]?.id || 'gap-01');
  const [newActionDetails, setNewActionDetails] = useState('');
  const [newResponsible, setNewResponsible] = useState('');
  const [newDeadline, setNewDeadline] = useState('Fase 1 (60 dias)');
  const [newNextStep, setNewNextStep] = useState('');
  const [newEvidence, setNewEvidence] = useState('');
  const [newSuccessCriterion, setNewSuccessCriterion] = useState('');
  const [newSupportInstrument, setNewSupportInstrument] = useState('');

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newExpectedResult.trim()) return;

    addAction({
      gapId: newRelatedGapId,
      expectedResult: newExpectedResult,
      actionTitle: newTitle,
      actionDetails: newActionDetails || newTitle,
      actors: [newResponsible || 'Encarregado de Dados'],
      deadlineOrPhase: newDeadline,
      nextImmediateStep: newNextStep || 'Reunião preliminar de alinhamento',
      supportInstrument: newSupportInstrument || 'Modelo Orientativo D1 v1.0',
      expectedEvidence: newEvidence || 'Documento comprobatório formal',
      successCriterion: newSuccessCriterion || 'Prática validada e em operação contínua',
      relatedIndicatorName: 'Indicador de Continuidade das Ações de Governança',
      status: 'NAO_INICIADA',
      lastFollowUpDate: new Date().toISOString().split('T')[0],
      followUpOwner: newResponsible || currentUser.name
    });

    setIsAdding(false);
    setNewTitle('');
    setNewExpectedResult('');
    setNewActionDetails('');
    setNewEvidence('');
    setNewSuccessCriterion('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner de Plano de Evolução */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">Plano de Evolução da Governança</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            A metodologia D1 separa estritamente o <strong>Resultado Esperado</strong> (o estado institucional pretendido) da <strong>Ação Proposta</strong> (a tarefa a executar). 
            Cada ação é vinculada a um gap validado, com ator responsável, prazo realista, evidência esperada e critério de sucesso.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
          <LocalSaveIndicator />

          <button
            onClick={() => setCurrentView('OUTPUTS')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold px-3.5 py-2.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Ver Relatórios</span>
          </button>

          <button
            onClick={() => setIsAdding(true)}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Nova Ação de Evolução</span>
          </button>
        </div>
      </div>

      {/* Regra de Ouro da Metodologia */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
        <Target className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <strong>Princípio de Eficácia da Ação:</strong> Uma ação não pode ter como critério de sucesso apenas "elaborar documento". 
          O critério de sucesso deve demonstrar a <strong>prática incorporada</strong> (ex: "Fluxo publicado no SEI e servidores treinados no protocolo de atendimento").
        </div>
      </div>

      {/* Gaps Validados (Origem das Ações) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
          <span>Gaps Institucionais Validados ({gaps.length})</span>
          <span className="text-xs text-slate-500 font-normal">Identificados a partir das evidências e falas fáticas</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {gaps.map(gap => (
            <div key={gap.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded">
                  {gap.capacityId}
                </span>
                <span className="font-mono text-[10px] text-slate-400">{gap.doorId}</span>
              </div>
              <h4 className="font-bold text-slate-900 leading-snug">{gap.title}</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-3 font-serif">
                {gap.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabela de Ações do Plano de Evolução */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800">
          Ações Programadas para o Ciclo de Evolução ({actions.length})
        </h3>

        <div className="space-y-4">
          {actions.map(act => {
            const isCompleted = act.status === 'RESULTADO_VALIDADO';
            const isVerified = act.status === 'EVIDENCIA_VERIFICADA';
            const isEvidencePresented = act.status === 'EVIDENCIA_APRESENTADA';
            const isInProgress = act.status === 'EM_ANDAMENTO';

            const statusColor = 
              isCompleted ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
              isVerified ? 'bg-sky-100 text-sky-800 border-sky-300' :
              isEvidencePresented ? 'bg-purple-100 text-purple-800 border-purple-300' :
              isInProgress ? 'bg-blue-100 text-blue-800 border-blue-300' :
              'bg-slate-100 text-slate-700 border-slate-300';

            return (
              <div
                key={act.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        Gap: {act.gapId}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{act.actionTitle}</h4>
                    </div>
                  </div>

                  {/* Status da Ação com Progressão */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${statusColor}`}>
                      {act.status.replace(/_/g, ' ')}
                    </span>
                    <select
                      value={act.status}
                      onChange={e => updateActionStatus(act.id, e.target.value as ActionStatus)}
                      className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 font-semibold text-slate-700"
                    >
                      <option value="NAO_INICIADA">NÃO INICIADA</option>
                      <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
                      <option value="EVIDENCIA_APRESENTADA">EVIDÊNCIA APRESENTADA</option>
                      <option value="EVIDENCIA_VERIFICADA">EVIDÊNCIA VERIFICADA</option>
                      <option value="RESULTADO_EM_VALIDACAO">RESULTADO EM VALIDAÇÃO</option>
                      <option value="RESULTADO_VALIDADO">RESULTADO VALIDADO</option>
                    </select>
                  </div>
                </div>

                {/* Diferenciação Rigorosa: Resultado Esperado vs Ação */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg space-y-1">
                    <span className="font-bold text-teal-950 uppercase tracking-wider text-[10px] block">
                      Resultado Esperado (Estado Pretendido):
                    </span>
                    <p className="text-teal-900 font-serif leading-relaxed">
                      {act.expectedResult}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                      Critério de Sucesso Mensurável:
                    </span>
                    <p className="text-slate-800 font-serif leading-relaxed">
                      {act.successCriterion}
                    </p>
                  </div>
                </div>

                {/* Metadados Operacionais: Ator, Prazo, Evidência e Instrumento */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Responsáveis:</span>
                      <strong className="text-slate-800 truncate block">{act.actors.join(', ')}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Prazo / Fase:</span>
                      <strong className="text-slate-800 block">{act.deadlineOrPhase}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Evidência Esperada:</span>
                      <span className="text-slate-800 truncate block text-[11px]">{act.expectedEvidence}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Instrumento Apoio:</span>
                      <span className="text-slate-800 truncate block text-[11px]">{act.supportInstrument}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: Nova Ação de Evolução */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-teal-600" />
                Cadastrar Ação de Evolução
              </h4>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveAction} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título da Ação Proposta:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ex: Regulamentar fluxo formal de acolhimento e resposta a titulares de dados"
                  className="w-full p-2 border border-slate-300 rounded font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Resultado Esperado (Estado Institucional Pretendido):
                </label>
                <textarea
                  rows={2}
                  value={newExpectedResult}
                  onChange={e => setNewExpectedResult(e.target.value)}
                  placeholder="Ex: Canal unificado de atendimento a titulares no Protocolo com prazos de resposta formalizados."
                  className="w-full p-2 border border-slate-300 rounded font-serif"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gap Relacionado:</label>
                  <select
                    value={newRelatedGapId}
                    onChange={e => setNewRelatedGapId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    {gaps.map(g => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prazo Realista:</label>
                  <input
                    type="text"
                    value={newDeadline}
                    onChange={e => setNewDeadline(e.target.value)}
                    placeholder="Ex: Fase 1 (60 dias)"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ator Responsável:</label>
                <input
                  type="text"
                  value={newResponsible}
                  onChange={e => setNewResponsible(e.target.value)}
                  placeholder="Ex: Dr. Carlos Menezes (Procuradoria) + Sônia Silveira (Protocolo)"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Critério de Sucesso Mensurável:</label>
                <input
                  type="text"
                  value={newSuccessCriterion}
                  onChange={e => setNewSuccessCriterion(e.target.value)}
                  placeholder="Ex: Mínimo de 1 requerimento simulado ou real tramitado no novo fluxo com protocolo"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || !newExpectedResult.trim()}
                  className="px-4 py-1.5 font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded disabled:opacity-50"
                >
                  Salvar Ação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
