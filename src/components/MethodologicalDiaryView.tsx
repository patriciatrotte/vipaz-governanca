import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  Lightbulb, 
  AlertCircle, 
  CheckCircle, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { MethodologicalDiaryEntry, DoorId } from '../types';

export const MethodologicalDiaryView: React.FC = () => {
  const { diaryEntries, addDiaryEntry, currentUser, currentOrg } = usePilot();

  const [isAdding, setIsAdding] = useState(false);
  const [selectedDoor, setSelectedDoor] = useState<DoorId>('D1.2');
  const [hypothesis, setHypothesis] = useState('');
  const [observedProblem, setObservedProblem] = useState('');
  const [decisionTaken, setDecisionTaken] = useState('');
  const [justification, setJustification] = useState('');
  const [fieldEvidence, setFieldEvidence] = useState('');
  const [methodologicalImplication, setMethodologicalImplication] = useState('');
  const [productImplication, setProductImplication] = useState('');
  const [researchImplication, setResearchImplication] = useState('');

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionTaken.trim() || !justification.trim() || !currentOrg) return;

    addDiaryEntry({
      organizationId: currentOrg.id,
      dimensionId: 'D1',
      doorId: selectedDoor,
      sessionId: 'sess-entrevista-01',
      methodologyVersion: 'D1 v1.0',
      origin: 'CAMPO',
      theme: 'EVIDENCIA',
      hypothesis,
      observedProblem,
      decisionTaken,
      justification,
      fieldEvidence,
      proposedChange: 'Manter aprimoramento contínuo das salvaguardas D1.',
      howToTest: 'Verificar no próximo ciclo de validação metodológica com fontes reais.',
      result: 'Decisão acolhida e registrada formalmente.',
      methodologicalImplication,
      productImplication,
      researchImplication,
      authorName: currentUser.name
    });

    setIsAdding(false);
    setHypothesis('');
    setObservedProblem('');
    setDecisionTaken('');
    setJustification('');
    setFieldEvidence('');
    setMethodologicalImplication('');
    setProductImplication('');
    setResearchImplication('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Banner do Diário Metodológico */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">Diário de Desenvolvimento Metodológico</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Registro sistemático de campo para aprimoramento da D1. Cada decisão metodológica registra o 
            problema real enfrentado na Câmara, a justificativa, a evidência fática e as implicações para o método e a pesquisa científica.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 self-start md:self-auto shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Novo Registro de Campo</span>
        </button>
      </div>

      {/* Lista de Registros do Diário */}
      <div className="space-y-4">
        {diaryEntries.map(entry => (
          <div
            key={entry.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                {entry.doorId && (
                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    {entry.doorId}
                  </span>
                )}
                <span className="text-xs font-bold text-slate-800">
                  Decisão por: {entry.authorName}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(entry.date).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Hipótese vs Problema */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="font-bold text-slate-700 block">Hipótese Inicial:</span>
                <p className="text-slate-600 font-serif leading-relaxed">
                  {entry.hypothesis}
                </p>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-1">
                <span className="font-bold text-amber-950 block">Problema Encontrado em Campo:</span>
                <p className="text-amber-900 font-serif leading-relaxed">
                  {entry.observedProblem}
                </p>
              </div>
            </div>

            {/* Decisão e Justificativa */}
            <div className="p-3 bg-slate-900 text-white rounded-lg space-y-2 text-xs">
              <div>
                <span className="text-amber-400 font-bold block uppercase text-[10px] tracking-wider">
                  Decisão Tomada no Piloto:
                </span>
                <p className="font-medium text-slate-100 mt-0.5">
                  {entry.decisionTaken}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">
                  Justificativa Metodológica:
                </span>
                <p className="text-slate-300 font-serif leading-relaxed mt-0.5">
                  {entry.justification}
                </p>
              </div>

              {entry.fieldEvidence && (
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                  <strong className="text-slate-400">Evidência Fática Associada:</strong> {entry.fieldEvidence}
                </div>
              )}
            </div>

            {/* Implicações Tríplices: Método, Produto e Pesquisa */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-lg space-y-0.5">
                <span className="font-bold text-blue-900 block">Implicação para o Método:</span>
                <p className="text-blue-800 leading-snug">{entry.methodologicalImplication || 'N/A'}</p>
              </div>

              <div className="p-2.5 bg-purple-50/60 border border-purple-200 rounded-lg space-y-0.5">
                <span className="font-bold text-purple-900 block">Implicação para o Produto:</span>
                <p className="text-purple-800 leading-snug">{entry.productImplication || 'N/A'}</p>
              </div>

              <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-0.5">
                <span className="font-bold text-emerald-900 block">Implicação para a Pesquisa:</span>
                <p className="text-emerald-800 leading-snug">{entry.researchImplication || 'N/A'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Novo Registro */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-5 space-y-4 shadow-xl border border-slate-200 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-amber-600" />
                Novo Registro no Diário de Campo
              </h4>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Porta Vinculada:</label>
                <select
                  value={selectedDoor}
                  onChange={e => setSelectedDoor(e.target.value as DoorId)}
                  className="w-full p-2 border border-slate-300 rounded font-semibold"
                >
                  <option value="D1.1">D1.1 - Configuração e Estrutura</option>
                  <option value="D1.2">D1.2 - Atuação do Encarregado</option>
                  <option value="D1.3">D1.3 - Responsabilidades Operacionais</option>
                  <option value="D1.4">D1.4 - Articulação Intersetorial</option>
                  <option value="D1.5">D1.5 - Sustentação Gerencial e Recursos</option>
                  <option value="D1.6">D1.6 - Continuidade e Acompanhamento</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hipótese Inicial do Método:</label>
                <textarea
                  rows={2}
                  value={hypothesis}
                  onChange={e => setHypothesis(e.target.value)}
                  placeholder="Ex: Supunha-se que portaria formal seria suficiente para demonstrar canal com a Mesa..."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Problema Encontrado em Campo:</label>
                <textarea
                  rows={2}
                  value={observedProblem}
                  onChange={e => setObservedProblem(e.target.value)}
                  placeholder="Ex: Na prática, a portaria existe mas o Encarregado nunca teve reunião formal..."
                  className="w-full p-2 border border-slate-300 rounded font-serif"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Decisão Tomada no Piloto:</label>
                <textarea
                  rows={2}
                  value={decisionTaken}
                  onChange={e => setDecisionTaken(e.target.value)}
                  placeholder="Ex: Desclassificar a suficiência da portaria isolada para C5 e exigir evidência fática..."
                  className="w-full p-2 border border-slate-300 rounded font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Justificativa Metodológica:</label>
                <textarea
                  rows={2}
                  value={justification}
                  onChange={e => setJustification(e.target.value)}
                  placeholder="Ex: Evita diagnóstico meramente burocrático e protege a veracidade do patamar N2..."
                  className="w-full p-2 border border-slate-300 rounded font-serif"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Evidência Fática Associada:</label>
                <input
                  type="text"
                  value={fieldEvidence}
                  onChange={e => setFieldEvidence(e.target.value)}
                  placeholder="Ex: Ausência de despachos ou reuniões nos últimos 6 meses"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Implicação - Método:</label>
                  <input
                    type="text"
                    value={methodologicalImplication}
                    onChange={e => setMethodologicalImplication(e.target.value)}
                    placeholder="Regra de não suficiência..."
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Implicação - Produto:</label>
                  <input
                    type="text"
                    value={productImplication}
                    onChange={e => setProductImplication(e.target.value)}
                    placeholder="Trava no formulário..."
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Implicação - Pesquisa:</label>
                  <input
                    type="text"
                    value={researchImplication}
                    onChange={e => setResearchImplication(e.target.value)}
                    placeholder="Nota de rodapé metodológica..."
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
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
                  disabled={!decisionTaken.trim() || !justification.trim()}
                  className="px-4 py-1.5 font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded disabled:opacity-50"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
