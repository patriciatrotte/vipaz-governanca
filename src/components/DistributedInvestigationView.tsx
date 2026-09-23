import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { 
  GitPullRequest, 
  Send, 
  CheckCircle, 
  Clock, 
  Lock, 
  FileText, 
  UserCheck, 
  AlertCircle 
} from 'lucide-react';
import { InfoScope } from '../types';

export const DistributedInvestigationView: React.FC = () => {
  const {
    distributedRequests,
    answerDistributedRequest,
    createDistributedRequest,
    currentUser,
    availableUsers,
    setCurrentUser
  } = usePilot();

  // Modo de resposta direta como fonte convidada
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    distributedRequests[0]?.id || null
  );
  const [responseText, setResponseText] = useState('');
  const [providedScope, setProvidedScope] = useState<InfoScope>('ACAO_PROPRIA');
  const [evidencesInput, setEvidencesInput] = useState('');

  // Novo convite neutro
  const [isCreating, setIsCreating] = useState(false);
  const [targetName, setTargetName] = useState('');
  const [targetDept, setTargetDept] = useState('');
  const [neutralQuestion, setNeutralQuestion] = useState('');
  const [context, setContext] = useState('Diagnóstico metodológico de governança de privacidade.');

  const selectedRequest = distributedRequests.find(r => r.id === selectedRequestId);

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !responseText.trim()) return;

    const evs = evidencesInput
      ? evidencesInput.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    answerDistributedRequest(selectedRequestId, responseText, providedScope, evs);
    setResponseText('');
    setEvidencesInput('');
    alert('Contribuição enviada com sucesso e integrada às unidades de informação fáticas.');
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName.trim() || !neutralQuestion.trim()) return;

    createDistributedRequest(
      'D1.3',
      targetName,
      targetDept || 'Departamento Interno',
      'COMPLEMENTACAO',
      neutralQuestion,
      context
    );
    setIsCreating(false);
    setTargetName('');
    setTargetDept('');
    setNeutralQuestion('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner de Investigação Distribuída */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold">Investigação Distribuída</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Quando o respondente inicial não possui visibilidade direta sobre determinado aspecto técnico ou operacional, 
            a metodologia direciona <strong>perguntas neutras e específicas</strong> aos atores competentes, 
            sem violar a confidencialidade ou expor falas de terceiros.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 self-start md:self-auto shrink-0"
        >
          + Nova Solicitação Dirigida
        </button>
      </div>

      {/* Regra de Ouro Metodológica */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs text-sky-900 flex items-start gap-2">
        <Lock className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
        <div>
          <strong>Regra Estrita de Neutralidade:</strong> É expressamente proibido enviar perguntas do tipo: 
          <em>"O Encarregado informou que o setor de TI não faz backup, você confirma?"</em>. 
          O convite deve ser estritamente neutro: 
          <em>"No âmbito da TI, quais são as rotinas práticas de backup e guarda de registros adotadas pela Casa?"</em>.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Lista de Solicitações */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Solicitações no Ciclo</span>
            <span className="text-xs text-slate-500 font-normal">
              {distributedRequests.length} ativa(s)
            </span>
          </h3>

          <div className="space-y-2">
            {distributedRequests.map(req => {
              const isSelected = req.id === selectedRequestId;
              const isAnswered = req.status === 'RESPONDIDA';
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestId(req.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-50/80 border-sky-300 ring-1 ring-sky-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                    <span>{req.targetPersonName}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isAnswered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px]">{req.targetDepartment}</div>
                  <p className="text-slate-700 text-xs line-clamp-2 mt-1 italic">
                    “{req.minimalNeutralQuestion}”
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna 2 e 3: Visualizador / Formulário Simplificado da Fonte */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          {selectedRequest ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    Porta {selectedRequest.doorId} • Solicitação #{selectedRequest.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-800 mt-1">
                    Contribuição Dirigida: {selectedRequest.targetPersonName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Setor: {selectedRequest.targetDepartment} • Motivo: {selectedRequest.reasonType.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="text-xs text-slate-400">
                  Enviado em: {new Date(selectedRequest.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Pergunta Neutra Apresentada */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 block">
                  Pergunta Neutra Apresentada à Fonte Convidada:
                </span>
                <p className="text-sm font-semibold text-slate-900 leading-relaxed font-serif">
                  “{selectedRequest.minimalNeutralQuestion}”
                </p>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  Contexto fornecido: {selectedRequest.contextGiven}
                </div>
              </div>

              {/* Se já foi respondida, exibe a contribuição */}
              {selectedRequest.submittedResponse ? (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Contribuição Fática Registrada
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      {selectedRequest.submittedResponse.providedScope.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-sm text-slate-800 leading-relaxed font-serif bg-white p-3 rounded border border-emerald-100">
                    “{selectedRequest.submittedResponse.text}”
                  </p>

                  {selectedRequest.submittedResponse.evidencesMentioned && (
                    <div className="text-xs text-purple-800 font-medium flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Evidências indicadas: {selectedRequest.submittedResponse.evidencesMentioned.join(', ')}
                    </div>
                  )}

                  <div className="text-[11px] text-emerald-800">
                    Respondido em: {new Date(selectedRequest.submittedResponse.submittedAt).toLocaleString()}
                  </div>
                </div>
              ) : (
                /* Formulário simplificado da fonte */
                <form onSubmit={handleSubmitResponse} className="space-y-3 pt-2">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded text-xs text-amber-900">
                    <strong>Simulação de Resposta da Fonte:</strong> Você pode responder agora em nome de {selectedRequest.targetPersonName}.
                  </div>

                  <div>
                    <label className="font-semibold text-xs text-slate-700 block mb-1">
                      Declaração Fática da Fonte:
                    </label>
                    <textarea
                      rows={4}
                      value={responseText}
                      onChange={e => setResponseText(e.target.value)}
                      placeholder="Descreva a prática real executada no setor..."
                      className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Alcance da Declaração:
                      </label>
                      <select
                        value={providedScope}
                        onChange={e => setProvidedScope(e.target.value as InfoScope)}
                        className="w-full p-2 border border-slate-300 rounded"
                      >
                        <option value="ACAO_PROPRIA">AÇÃO PRÓPRIA (Processo que o respondente executa)</option>
                        <option value="CONHECIMENTO_DIRETO">CONHECIMENTO DIRETO (Presencia na rotina)</option>
                        <option value="PERCEPCAO_SOBRE_TERCEIRO">PERCEPÇÃO SOBRE OUTRO SETOR</option>
                        <option value="FORA_DA_VISIBILIDADE_DESCONHECIDO">FORA DA VISIBILIDADE / DESCONHECIDO</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Evidências Indicadas (títulos separados por vírgula):
                      </label>
                      <input
                        type="text"
                        value={evidencesInput}
                        onChange={e => setEvidencesInput(e.target.value)}
                        placeholder="Ex: Contrato de TI, Relatório mensal de backup"
                        className="w-full p-2 border border-slate-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={!responseText.trim()}
                      className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" /> Enviar Resposta Simplificada
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Selecione uma solicitação na barra lateral para visualizar os detalhes.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Nova Solicitação Dirigida */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <GitPullRequest className="w-4 h-4 text-sky-600" />
                Nova Solicitação de Contribuição Dirigida
              </h4>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nome do Servidor/Profissional:</label>
                  <input
                    type="text"
                    value={targetName}
                    onChange={e => setTargetName(e.target.value)}
                    placeholder="Ex: Rodrigo Santoro Alencar"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Setor Institucional:</label>
                  <input
                    type="text"
                    value={targetDept}
                    onChange={e => setTargetDept(e.target.value)}
                    placeholder="Ex: TI / Protocolo / Gabinete"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pergunta Neutra Dirigida:</label>
                <textarea
                  rows={3}
                  value={neutralQuestion}
                  onChange={e => setNeutralQuestion(e.target.value)}
                  placeholder="Formule a pergunta sem juízos de valor e sem mencionar o que outros respondentes disseram..."
                  className="w-full p-2 border border-slate-300 rounded font-serif"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contexto Mínimo Transparente:</label>
                <input
                  type="text"
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!targetName.trim() || !neutralQuestion.trim()}
                  className="px-4 py-1.5 font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded disabled:opacity-50"
                >
                  Criar Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
