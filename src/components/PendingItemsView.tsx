import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  ShieldAlert, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { PendingItem } from '../types';

export const PendingItemsView: React.FC = () => {
  const { pendingItems, resolvePendingItem, addPendingItem, currentUser } = usePilot();

  const [selectedPending, setSelectedPending] = useState<PendingItem | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Nova pendência
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImpact, setNewImpact] = useState<PendingItem['impact']>('BLOQUEANTE');
  const [newType, setNewType] = useState<PendingItem['type']>('EVIDENCIA');
  const [newResponsible, setNewResponsible] = useState('');
  const [newDoorId, setNewDoorId] = useState<PendingItem['doorId']>('D1.1');

  const blockingCount = pendingItems.filter(p => p.impact === 'BLOQUEANTE' && p.status !== 'RESOLVIDA').length;

  const handleOpenResolve = (item: PendingItem) => {
    setSelectedPending(item);
    setResolutionNotes(item.resolutionNotes || '');
    setIsResolving(true);
  };

  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPending) return;

    resolvePendingItem(selectedPending.id, resolutionNotes || 'Pendência sanada com a apresentação dos documentos devidos.');
    setIsResolving(false);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addPendingItem({
      doorId: newDoorId,
      title: newTitle,
      description: newDesc,
      type: newType,
      impact: newImpact,
      responsible: newResponsible || 'Secretaria Geral',
      status: 'ABERTA'
    });

    setIsAdding(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner de Pendências */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold">Gestão Metodológica de Pendências</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Distinção de rigor metodológico: <strong>Pendências Bloqueantes</strong> (impedem concluir a análise de determinada capacidade ou atribuir nível superior) 
            vs <strong>Pendências Relevantes Não Bloqueantes</strong> (devem constar no Snapshot e no Plano de Evolução, mas não paralisam a apuração).
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 self-start md:self-auto shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4 text-rose-200" />
          <span>Cadastrar Pendência</span>
        </button>
      </div>

      {/* Alerta de Pendências Bloqueantes */}
      {blockingCount > 0 ? (
        <div className="bg-rose-50 border border-rose-300 rounded-lg p-4 text-xs text-rose-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-rose-950 text-sm">
              Atenção: Existem {blockingCount} Pendência(s) Bloqueante(s) Ativa(s)
            </span>
            <p className="leading-relaxed">
              Enquanto houver pendências com impacto <strong>BLOQUEANTE</strong> em aberto, a Dimensão D1 não pode ser dada por concluída em nível definitivo. 
              O Facilitador pode gerar um diagnóstico preliminar, demarcando expressamente a limitação imposta por tais bloqueios.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Nenhuma pendência bloqueante em aberto no momento. Todas as capacidades essenciais possuem base mínima para análise.</span>
        </div>
      )}

      {/* Lista de Pendências */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingItems.map(item => {
          const isResolved = item.status === 'RESOLVIDA';
          const isBlocking = item.impact === 'BLOQUEANTE';

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                isResolved
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : isBlocking
                  ? 'bg-white border-rose-300 shadow-xs'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {item.doorId}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      isBlocking
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {item.impact}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>

                {item.resolutionNotes && (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded p-2.5 text-xs text-emerald-950 space-y-1">
                    <span className="font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Resolução Registrada:
                    </span>
                    <p className="italic text-[11px]">{item.resolutionNotes}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  Resp: <strong>{item.responsible}</strong>
                </span>
                {!isResolved && (
                  <button
                    onClick={() => handleOpenResolve(item)}
                    className="text-xs font-semibold text-rose-700 hover:text-rose-900 px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 transition-colors"
                  >
                    Resolver Pendência
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Resolver Pendência */}
      {isResolving && selectedPending && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Resolver Pendência Metodológica
                </h4>
                <p className="text-[11px] text-slate-500">
                  {selectedPending.title}
                </p>
              </div>
              <button onClick={() => setIsResolving(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveResolution} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Justificativa / Comprovação de Resolução:
                </label>
                <textarea
                  rows={4}
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="Descreva qual documento foi fornecido, qual reunião ocorreu ou qual esclarecimento fático foi validado metodologicamente..."
                  className="w-full p-2.5 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResolving(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded"
                >
                  Confirmar Resolução
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Cadastrar Pendência */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-rose-600" />
                Cadastrar Nova Pendência
              </h4>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveNew} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título da Pendência:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ex: Apresentar comprovação de canal direto entre Encarregado e Mesa Diretora"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Impacto Metodológico:</label>
                  <select
                    value={newImpact}
                    onChange={e => setNewImpact(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded font-semibold"
                  >
                    <option value="BLOQUEANTE">BLOQUEANTE (Impede concluir ou atribuir nível)</option>
                    <option value="RELEVANTE_NAO_BLOQUEANTE">RELEVANTE NÃO BLOQUEANTE</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Porta Relacionada:</label>
                  <select
                    value={newDoorId}
                    onChange={e => setNewDoorId(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="D1.1">D1.1 - Liderança</option>
                    <option value="D1.2">D1.2 - Atuação do Encarregado</option>
                    <option value="D1.3">D1.3 - Estrutura e Prática</option>
                    <option value="D1.4">D1.4 - Atores Críticos</option>
                    <option value="D1.5">D1.5 - Orçamento e Prioridade</option>
                    <option value="D1.6">D1.6 - Continuidade</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Descrição Detalhada:</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Explique o que é necessário para sanar a pendência..."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Responsável Interno:</label>
                <input
                  type="text"
                  value={newResponsible}
                  onChange={e => setNewResponsible(e.target.value)}
                  placeholder="Ex: Procuradoria / Gabinete da Presidência"
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
                  disabled={!newTitle.trim()}
                  className="px-4 py-1.5 font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded disabled:opacity-50"
                >
                  Salvar Pendência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
