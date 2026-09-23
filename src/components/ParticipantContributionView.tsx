import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { 
  CheckCircle, 
  Clock, 
  Send, 
  FileText, 
  HelpCircle, 
  Lock, 
  Info, 
  AlertCircle,
  Building2,
  UserCheck,
  Plus
} from 'lucide-react';
import { InfoScope } from '../types';
import { LocalSaveIndicator } from './LocalSaveIndicator';

export const ParticipantContributionView: React.FC = () => {
  const { 
    currentUser, 
    currentOrg, 
    distributedRequests, 
    answerDistributedRequest,
    pendingItems,
    resolvePendingItem,
    evidences,
    addEvidence
  } = usePilot();

  const [activeSubTab, setActiveSubTab] = useState<'CONTRIBUTIONS' | 'PENDING' | 'GUIDANCE'>('CONTRIBUTIONS');

  // Filtra as solicitações pertinentes ao participante ativo
  const userFirstWord = currentUser.name.split(' ')[0].toLowerCase();
  const myRequests = distributedRequests.filter(req => {
    const target = req.targetPersonName.toLowerCase();
    const dept = req.targetDepartment.toLowerCase();
    const userDept = (currentUser.department || '').toLowerCase();
    return target.includes(userFirstWord) || dept.includes(userDept) || userDept.includes(dept);
  });

  // Se não encontrar nenhuma pelo filtro estrito, traz as disponíveis
  const displayRequests = myRequests.length > 0 ? myRequests : distributedRequests;

  // Minhas pendências
  const myPendingItems = pendingItems.filter(p => {
    const resp = p.responsible.toLowerCase();
    const userDept = (currentUser.department || '').toLowerCase();
    return resp.includes(userFirstWord) || resp.includes(userDept) || userDept.includes(resp);
  });

  // Estado para responder solicitação
  const [selectedReqId, setSelectedReqId] = useState<string | null>(displayRequests[0]?.id || null);
  const [responseText, setResponseText] = useState('');
  const [providedScope, setProvidedScope] = useState<InfoScope>('ACAO_PROPRIA');
  const [evidenceInput, setEvidenceInput] = useState('');
  const [justificationNotes, setJustificationNotes] = useState('');

  // Estado para adicionar evidência direta
  const [isAddingEvidence, setIsAddingEvidence] = useState(false);
  const [newEvidenceTitle, setNewEvidenceTitle] = useState('');
  const [newEvidenceNotes, setNewEvidenceNotes] = useState('');

  // Resolver pendência
  const [resolvingPendingId, setResolvingPendingId] = useState<string | null>(null);
  const [pendingNotes, setPendingNotes] = useState('');

  const selectedRequest = displayRequests.find(r => r.id === selectedReqId);

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqId || !responseText.trim()) return;

    const evs = evidenceInput
      ? evidenceInput.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    answerDistributedRequest(selectedReqId, responseText, providedScope, evs);
    setResponseText('');
    setEvidenceInput('');
    setJustificationNotes('');
    alert('Sua contribuição foi registrada com sucesso e integrada às fontes metodológicas!');
  };

  const handleResolvePending = (id: string) => {
    if (!pendingNotes.trim()) return;
    resolvePendingItem(id, pendingNotes);
    setResolvingPendingId(null);
    setPendingNotes('');
    alert('Pendência marcada como sanada!');
  };

  const handleCreateDirectEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidenceTitle.trim()) return;
    addEvidence({
      title: newEvidenceTitle,
      type: 'OUTRO',
      origin: currentUser.department || 'Setor Operacional da Câmara',
      indicatedBy: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      status: 'INDICADA',
      sufficiencyNotes: newEvidenceNotes || 'Apresentada diretamente pelo servidor do setor.',
      limitations: '',
      relatedCapacities: ['C3'],
      sensitivity: 'INTERNA_RESTRITA',
      aiUsageRule: 'RESTRITO_HUMANO'
    });
    setNewEvidenceTitle('');
    setNewEvidenceNotes('');
    setIsAddingEvidence(false);
    alert('Evidência registrada e enviada para conferência da facilitação.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Cabeçalho do Portal do Participante */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Portal de Contribuição Setorial • {currentUser.department}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Minhas Contribuições &amp; Respostas Fáticas
            </h1>
            <p className="text-xs text-slate-600 font-serif leading-relaxed max-w-2xl">
              Bem-vindo, <strong>{currentUser.name}</strong>. Sua colaboração esclarece a prática fática real das rotinas de trabalho e tratamento de informações na <strong>{currentOrg?.name}</strong>.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs space-y-1.5 shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Garantia Metodológica
            </span>
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Diagnóstico Colaborativo</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Sem apontamento de culpa ou ranqueamento individual.
            </div>
            <div className="pt-1 border-t border-slate-200/80">
              <LocalSaveIndicator />
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navegação em Abas do Participante */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('CONTRIBUTIONS')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer select-none active:scale-[0.98] flex items-center gap-2 shrink-0 ${
            activeSubTab === 'CONTRIBUTIONS'
              ? 'bg-slate-900 text-white font-bold shadow-xs ring-2 ring-sky-500/40'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-sky-400" />
          <span>Minhas Contribuições</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
            {displayRequests.filter(r => r.status === 'SOLICITADA').length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('PENDING')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer select-none active:scale-[0.98] flex items-center gap-2 shrink-0 ${
            activeSubTab === 'PENDING'
              ? 'bg-slate-900 text-white font-bold shadow-xs ring-2 ring-rose-500/40'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-rose-400" />
          <span>Minhas Pendências</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
            {myPendingItems.filter(p => p.status !== 'RESOLVIDA').length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('GUIDANCE')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer select-none active:scale-[0.98] flex items-center gap-2 shrink-0 ${
            activeSubTab === 'GUIDANCE'
              ? 'bg-slate-900 text-white font-bold shadow-xs ring-2 ring-amber-500/40'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Orientações da Câmara</span>
        </button>
      </div>

      {/* ABA 1: MINHAS CONTRIBUIÇÕES (RESPONDER PERGUNTAS DIRIGIDAS) */}
      {activeSubTab === 'CONTRIBUTIONS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lista Lateral de Solicitações */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs md:col-span-1 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Perguntas Fáticas ({displayRequests.length})
              </span>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {displayRequests.map(req => {
                  const isSelected = req.id === selectedReqId;
                  const isAnswered = req.status === 'RESPONDIDA';
                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedReqId(req.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all space-y-1.5 ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{req.doorId}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                          isAnswered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] line-clamp-2">
                        {req.minimalNeutralQuestion}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Painel de Resposta da Pergunta Selecionada */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs md:col-span-2 space-y-5">
              {selectedRequest ? (
                <>
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-mono uppercase text-sky-700 font-bold block">
                      Solicitação #{selectedRequest.id} • Setor: {selectedRequest.targetDepartment}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {selectedRequest.minimalNeutralQuestion}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Contexto: {selectedRequest.contextGiven}
                    </p>
                  </div>

                  {selectedRequest.status === 'RESPONDIDA' && selectedRequest.submittedResponse ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-emerald-900">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Sua resposta já foi registrada:</span>
                      </div>
                      <p className="text-slate-800 font-serif leading-relaxed italic bg-white p-3 rounded-lg border border-emerald-100">
                        “{selectedRequest.submittedResponse.text}”
                      </p>
                      <div className="text-[10px] text-slate-500">
                        Enviada em: {selectedRequest.submittedResponse.submittedAt ? new Date(selectedRequest.submittedResponse.submittedAt).toLocaleString('pt-BR') : 'Data registrada'}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitResponse} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Sua Resposta Fática (descreva a rotina como ela acontece):
                        </label>
                        <textarea
                          rows={4}
                          value={responseText}
                          onChange={e => setResponseText(e.target.value)}
                          placeholder="Exemplo: No dia a dia da TI, as cópias de segurança são geradas diariamente de forma automatizada e sincronizadas para um servidor em nuvem..."
                          className="w-full p-3 border border-slate-300 rounded-xl text-xs font-serif leading-relaxed focus:ring-2 focus:ring-sky-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Alcance do seu relato:
                          </label>
                          <select
                            value={providedScope}
                            onChange={e => setProvidedScope(e.target.value as InfoScope)}
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                          >
                            <option value="ACAO_PROPRIA">Ação própria do meu setor / sob meu controle direto</option>
                            <option value="ROTINA_SETORIAL">Rotina padronizada no setor</option>
                            <option value="OBSERVACAO_GERAL">Observação geral / sem controle direto</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Evidências que você pode apresentar (opcional):
                          </label>
                          <input
                            type="text"
                            value={evidenceInput}
                            onChange={e => setEvidenceInput(e.target.value)}
                            placeholder="Ex: Print do painel de backup, relatório semanal"
                            className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar Contribuição</span>
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Nenhuma pergunta selecionada.
                </div>
              )}
            </div>
          </div>

          {/* Adicionar Evidência Direta */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Apresentar Evidência Documental do Setor</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Anexe relatórios, termos, fluxos ou prints que comprovem práticas do seu departamento.
                </p>
              </div>
              <button
                onClick={() => setIsAddingEvidence(!isAddingEvidence)}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingEvidence ? 'Cancelar' : 'Apresentar Nova Evidência'}</span>
              </button>
            </div>

            {isAddingEvidence && (
              <form onSubmit={handleCreateDirectEvidence} className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-purple-950 mb-1">Título do Documento ou Registro:</label>
                  <input
                    type="text"
                    value={newEvidenceTitle}
                    onChange={e => setNewEvidenceTitle(e.target.value)}
                    placeholder="Ex: Print do Log de Execução de Backup do Servidor Principal"
                    className="w-full p-2 border border-purple-200 rounded-lg text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-950 mb-1">Breve Descrição / O que comprova:</label>
                  <textarea
                    rows={2}
                    value={newEvidenceNotes}
                    onChange={e => setNewEvidenceNotes(e.target.value)}
                    placeholder="Ex: Demonstra que a rotina foi executada no dia 15 sem falhas pelo time de TI."
                    className="w-full p-2 border border-purple-200 rounded-lg text-xs font-serif"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-xs"
                >
                  Salvar Evidência
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ABA 2: MINHAS PENDÊNCIAS */}
      {activeSubTab === 'PENDING' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Itens que Dependem do seu Setor</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pendências levantadas durante a investigação que precisam de comprovação ou esclarecimento pelo seu departamento.
            </p>
          </div>

          {myPendingItems.length > 0 ? (
            <div className="space-y-3">
              {myPendingItems.map(item => (
                <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{item.title}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      item.status === 'RESOLVIDA' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-slate-600 font-serif leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Responsável indicado: <strong>{item.responsible}</strong></span>
                    {item.status !== 'RESOLVIDA' && (
                      <button
                        onClick={() => setResolvingPendingId(item.id)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-2.5 py-1 rounded text-xs transition-colors"
                      >
                        Sanar Pendência
                      </button>
                    )}
                  </div>

                  {resolvingPendingId === item.id && (
                    <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                      <label className="block font-bold text-slate-800 text-[11px]">
                        Como a pendência foi esclarecida ou sanada:
                      </label>
                      <textarea
                        rows={2}
                        value={pendingNotes}
                        onChange={e => setPendingNotes(e.target.value)}
                        placeholder="Ex: Documento apresentado e fluxo validado com o Encarregado."
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResolvePending(item.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
                        >
                          Confirmar Resolução
                        </button>
                        <button
                          onClick={() => setResolvingPendingId(null)}
                          className="text-slate-500 hover:text-slate-700 text-xs px-2 py-1"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs space-y-1">
              <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto" />
              <div className="font-bold text-slate-700">Nenhuma pendência aberta para seu setor</div>
              <p className="text-slate-500 max-w-sm mx-auto">
                Todas as solicitações de esclarecimento e documentos do seu departamento estão em dia.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ABA 3: ORIENTAÇÕES AO PARTICIPANTE */}
      {activeSubTab === 'GUIDANCE' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 text-xs text-slate-700">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Orientações aos Participantes da Câmara</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Como funciona sua participação na metodologia D1 de governança de privacidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 text-xs block">Por que fomos convidados?</span>
              <p className="text-slate-600 leading-relaxed font-serif">
                A governança de privacidade em uma Câmara Municipal não é feita apenas em documentos formais da Presidência. Ela depende do dia a dia do Protocolo, da TI, do RH, das Comissões e da Secretaria Geral. Sua voz garante que o diagnóstico reflita a prática fática real.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 text-xs block">O que é uma Evidência Fática?</span>
              <p className="text-slate-600 leading-relaxed font-serif">
                Não precisa ser um documento solene ou complexo. Um fluxo anotado, um modelo de despacho no SEI/1Doc, uma tela de chamado da TI ou uma portaria de designação são evidências suficientes para demonstrar como o trabalho acontece.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 text-xs block">O que acontece se eu não souber responder?</span>
              <p className="text-slate-600 leading-relaxed font-serif">
                Na metodologia D1, não saber de uma prática não é uma falta ou erro: é uma informação metodológica valiosa que aponta se a rotina está centralizada ou precisa de treinamento conjunto.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 text-xs block">Quem terá acesso às respostas?</span>
              <p className="text-slate-600 leading-relaxed font-serif">
                As respostas são tratadas com sigilo metodológico pela equipe de facilitação. Os relatórios executivos finais para a Mesa Diretora consolidam apenas conclusões institucionais e planos de melhoria, sem expor falas individuais ou apontamento de culpa.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
