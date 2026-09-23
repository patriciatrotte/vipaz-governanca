import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { CAPACITIES_DEFINITIONS, MATURITY_LEVELS_INFO } from '../data/methodologyConstants';
import { formatCapacityStatus } from '../utils/formatters';
import { 
  CapacityId, 
  CapacityStatus, 
  MaturityLevel 
} from '../types';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  Award, 
  Info,
  Lock,
  Layers,
  HelpCircle,
  FileText
} from 'lucide-react';

export const IntegrationView: React.FC = () => {
  const { 
    integration, 
    updateCapacityAssessment, 
    validateHumanMaturity, 
    currentUser,
    createSnapshot,
    setCurrentView
  } = usePilot();

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<MaturityLevel>(
    integration.humanValidation.validatedLevel || integration.demonstratedLevel
  );
  const [facilitatorNotes, setFacilitatorNotes] = useState(
    integration.humanValidation.validationNotes || ''
  );
  const [facilitatorName, setFacilitatorName] = useState(
    integration.humanValidation.facilitatorName || currentUser.name
  );

  // Capacidade selecionada para edição detalhada
  const [editingCapacityId, setEditingCapacityId] = useState<CapacityId | null>(null);
  const [capStatus, setCapStatus] = useState<CapacityStatus>('DEMONSTRADA');
  const [capRationale, setCapRationale] = useState('');
  const [capAdv, setCapAdv] = useState('');
  const [capInsuff, setCapInsuff] = useState('');

  const handleOpenEditCap = (capId: CapacityId) => {
    const current = integration.capacities[capId];
    setEditingCapacityId(capId);
    setCapStatus(current.status);
    setCapRationale(current.rationale);
    setCapAdv(current.advancedElements?.join('\n') || '');
    setCapInsuff(current.insufficiencies?.join('\n') || '');
  };

  const handleSaveCapacity = () => {
    if (!editingCapacityId) return;
    const advList = capAdv.split('\n').map(s => s.trim()).filter(Boolean);
    const insuffList = capInsuff.split('\n').map(s => s.trim()).filter(Boolean);

    updateCapacityAssessment(
      editingCapacityId,
      capStatus,
      capRationale,
      advList,
      insuffList
    );
    setEditingCapacityId(null);
  };

  // Sugestão com IA (chamada ao endpoint seguro no backend)
  const handleRequestAISuggestion = async () => {
    if (currentUser.role !== 'FACILITADOR') {
      alert('Acesso restrito ao Facilitador Metodológico.');
      return;
    }
    setIsLoadingAI(true);
    try {
      const res = await fetch('/api/ai/suggest-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capacities: integration.capacities
        })
      });
      const data = await res.json();
      if (data.suggestedLevel) {
        setSelectedLevel(data.suggestedLevel);
        setFacilitatorNotes(data.reasoning?.summary || 'Sugestão da IA avaliada e incorporada com validação humana.');
      }
    } catch (err) {
      console.error(err);
      alert('Falha ao conectar com o serviço de IA. Use a validação manual do Facilitador.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSaveValidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role !== 'FACILITADOR') {
      alert('Acesso negado: Apenas o Facilitador Metodológico possui autorização para validar a maturidade.');
      return;
    }
    if (!facilitatorNotes.trim()) {
      alert('A justificativa do Facilitador é obrigatória para validar metodologicamente o nível de maturidade.');
      return;
    }
    validateHumanMaturity(selectedLevel, facilitatorNotes, facilitatorName);
    alert('Integração Dimensional D1 validada metodologicamente com sucesso.');
  };

  const isFacilitator = currentUser.role === 'FACILITADOR';

  if (!isFacilitator) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto border border-slate-200 shadow-xs">
          <Lock className="w-8 h-8 text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Acesso Restrito à Facilitação Metodológica</h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          {currentUser.role === 'ADMINISTRADOR' ? (
            <>Em conformidade com a governança do Piloto D1 (<strong>Privilégio Técnico ≠ Privilégio de Conteúdo</strong>), o Administrador da infraestrutura não possui acesso automático à integração das capacidades nem à validação metodológica.</>
          ) : (
            <>A integração técnica das capacidades C1–C6 e a validação metodológica de maturidade são instrumentos de condução técnica exclusiva da equipe de facilitação.</>
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner de Integração Dimensional */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">Integração Dimensional D1 (C1 a C6)</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            A maturidade não decorre de fórmulas de média nem de ponderação numérica. Ela expressa o <strong>nível sustentável de governança</strong>, 
            respeitando a regra da não compensação: conquistas em recursos ou tecnologia não suprem a falta de articulação ou liderança.
          </p>
        </div>

        {isFacilitator && (
          <button
            onClick={handleRequestAISuggestion}
            disabled={isLoadingAI}
            className="bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 self-start md:self-auto shrink-0 disabled:opacity-50 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-sky-200" />
            {isLoadingAI ? 'Consultando IA...' : 'Obter Sugestão da IA'}
          </button>
        )}
      </div>

      {/* Regra Fundamental: Não Compensação */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Regra Estrita da Não Compensação:</strong> A presença de elementos avançados em <em>C5 (Sustentação Gerencial / Orçamento)</em> 
          ou <em>C3 (Backup de TI em nuvem)</em> <strong>NÃO</strong> compensa a fragilidade estrutural em <em>C4 (Articulação com Terceiros)</em> 
          ou <em>C6 (Continuidade)</em>. O nível demonstrado é definido pelo patamar que a Câmara sustenta de forma homogênea.
        </div>
      </div>

      {/* As 6 Capacidades Metodológicas (C1 - C6) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Quadro de Demonstração das Seis Capacidades D1
          </h3>
          <span className="text-xs text-slate-500">
            Clique em "Ajustar Racional" para editar a avaliação de cada capacidade
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAPACITIES_DEFINITIONS.map(cap => {
            const current = integration.capacities[cap.id];
            const isDemonstrated = current?.status === 'DEMONSTRADA';
            const isStructuring = current?.status === 'EM_ESTRUTURACAO';
            const isInsufficient = current?.status === 'INSUFICIENTEMENTE_DEMONSTRADA';

            const statusBadge = 
              isDemonstrated ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
              isStructuring ? 'bg-blue-100 text-blue-800 border-blue-300' :
              isInsufficient ? 'bg-amber-100 text-amber-800 border-amber-300' :
              'bg-slate-100 text-slate-700 border-slate-300';

            return (
              <div
                key={cap.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {cap.id}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${statusBadge}`}>
                      {formatCapacityStatus(current?.status)}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {cap.name}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed font-serif">
                    {current?.rationale}
                  </p>

                  {/* Elementos Avançados */}
                  {current?.advancedElements && current.advancedElements.length > 0 && (
                    <div className="bg-emerald-50/70 p-2 rounded text-[11px] text-emerald-900 space-y-0.5">
                      <span className="font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Elemento Avançado Presente:
                      </span>
                      {current.advancedElements.map((adv, i) => (
                        <p key={i} className="pl-4 italic">• {adv}</p>
                      ))}
                    </div>
                  )}

                  {/* Insuficiências / Limites */}
                  {current?.insufficiencies && current.insufficiencies.length > 0 && (
                    <div className="bg-amber-50/70 p-2 rounded text-[11px] text-amber-900 space-y-0.5">
                      <span className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Limitação / Insuficiência:
                      </span>
                      {current.insufficiencies.map((ins, i) => (
                        <p key={i} className="pl-4">• {ins}</p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Origem: D1 v1.0</span>
                  {isFacilitator && (
                    <button
                      onClick={() => handleOpenEditCap(cap.id)}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
                    >
                      Ajustar Racional
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* As 4 Respostas Obrigatórias da Metodologia */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-600" />
          As Quatro Explicações Obrigatórias do Diagnóstico D1
        </h3>
        <p className="text-xs text-slate-500">
          Nenhum diagnóstico dimensional pode ser entregue com um nível abstrato sem responder taxativamente a estas quatro perguntas:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="font-bold text-slate-700 block">
              1. O que já está efetivamente demonstrado?
            </span>
            <p className="text-slate-600 leading-relaxed font-serif">
              {integration.aiSuggestedMaturity?.rationaleWhyProposedLevelSustained || 'Estruturação inicial com Encarregado formalizado e sustentação gerencial demonstrada na prática.'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="font-bold text-slate-700 block">
              2. O que está apenas em estruturação ou informal?
            </span>
            <p className="text-slate-600 leading-relaxed font-serif">
              {integration.aiSuggestedMaturity?.rationaleWhyNextLevelNotSustained || 'A articulação com o Protocolo e a sistemática de acompanhamento de pendências ainda operam informalmente.'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="font-bold text-slate-700 block">
              3. Qual a principal carência que impede nível superior?
            </span>
            <p className="text-slate-600 leading-relaxed font-serif">
              {integration.aiSuggestedMaturity?.blockingPendenciesIdentified?.join('; ') || 'Divergência sobre o trâmite de pedidos de titulares e ausência de substituto designado.'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="font-bold text-slate-700 block">
              4. Qual a próxima conquista institucional necessária?
            </span>
            <p className="text-slate-600 leading-relaxed font-serif">
              {integration.nextInstitutionalAchievement || 'Formalização do fluxo de titulares no Protocolo e designação de substituto do Encarregado.'}
            </p>
          </div>
        </div>
      </div>

      {/* Validação Humana do Facilitador (Obrigatória para Snapshot) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-xs space-y-4">
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Validação Metodológica</h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              "IA RECOMENDA, HUMANO VALIDA". A classificação de maturidade somente pode ser consolidada após validação metodológica formal.
            </p>
          </div>

          <span className={`text-xs px-2.5 py-1 rounded font-mono font-bold ${
            integration.humanValidation.isValidated
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}>
            {integration.humanValidation.isValidated ? 'VALIDADA METODOLOGICAMENTE' : 'PENDENTE DE VALIDAÇÃO'}
          </span>
        </div>

        <form onSubmit={handleSaveValidation} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Nível de Maturidade Dimensional D1 Validado Metodologicamente:
              </label>
              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value as MaturityLevel)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded font-bold"
              >
                {(Object.keys(MATURITY_LEVELS_INFO) as MaturityLevel[]).map(lvl => (
                  <option key={lvl} value={lvl}>
                    {MATURITY_LEVELS_INFO[lvl].label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1 italic">
                {MATURITY_LEVELS_INFO[selectedLevel]?.shortDesc}
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Nome do Facilitador Responsável:
              </label>
              <input
                type="text"
                value={facilitatorName}
                onChange={e => setFacilitatorName(e.target.value)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Selo de responsabilidade técnica anexado ao Snapshot D1.
              </span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Justificativa Técnica do Facilitador (Motivação Metodológica):
            </label>
            <textarea
              rows={3}
              value={facilitatorNotes}
              onChange={e => setFacilitatorNotes(e.target.value)}
              placeholder="Descreva as razões metodológicas para a definição deste nível..."
              className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded font-serif text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">
              {integration.humanValidation.isValidated && (
                <>Validado metodologicamente em: {new Date(integration.humanValidation.validatedAt || '').toLocaleString()}</>
              )}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
              >
                Validar Análise Metodológica
              </button>

              {integration.humanValidation.isValidated && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      createSnapshot();
                      setCurrentView('SNAPSHOT');
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    Gerar Snapshot Imutável
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentView('OUTPUTS')}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Ver Relatórios
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* MODAL: Ajustar Racional de Capacidade */}
      {editingCapacityId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-800">
                Ajustar Demonstração: {editingCapacityId}
              </h4>
              <button onClick={() => setEditingCapacityId(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Status da Capacidade:</label>
                <select
                  value={capStatus}
                  onChange={e => setCapStatus(e.target.value as CapacityStatus)}
                  className="w-full p-2 border border-slate-300 rounded font-semibold"
                >
                  <option value="DEMONSTRADA">DEMONSTRADA (Evidenciada na prática sustentada)</option>
                  <option value="EM_ESTRUTURACAO">EM ESTRUTURAÇÃO (Iniciada mas ainda informal ou frágil)</option>
                  <option value="INSUFICIENTEMENTE_DEMONSTRADA">INSUFICIENTEMENTE DEMONSTRADA</option>
                  <option value="INFORMACAO_INSUFICIENTE">INFORMAÇÃO INSUFICIENTE</option>
                  <option value="ELEMENTO_AVANCADO">ELEMENTO AVANÇADO (Não compensatório)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Racional Fático:</label>
                <textarea
                  rows={3}
                  value={capRationale}
                  onChange={e => setCapRationale(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-serif"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Elementos Avançados (1 por linha):</label>
                <textarea
                  rows={2}
                  value={capAdv}
                  onChange={e => setCapAdv(e.target.value)}
                  placeholder="Ex: Apoio explícito da Mesa Diretora..."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Insuficiências / Limites (1 por linha):</label>
                <textarea
                  rows={2}
                  value={capInsuff}
                  onChange={e => setCapInsuff(e.target.value)}
                  placeholder="Ex: Ausência de procedimento para resposta a incidentes..."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingCapacityId(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCapacity}
                className="px-4 py-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded"
              >
                Salvar Racional
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
