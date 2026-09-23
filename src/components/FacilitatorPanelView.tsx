import React, { useState, useEffect } from 'react';
import { usePilot } from '../context/PilotContext';
import { DOORS_DEFINITIONS } from '../data/methodologyConstants';
import { 
  DoorId, 
  InfoScope, 
  InformationUnit, 
  DivergenceStatus, 
  CapacityId 
} from '../types';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  GitPullRequest, 
  FileText, 
  Users, 
  Plus, 
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  Eye,
  Filter,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Info,
  Edit3
} from 'lucide-react';

// Interface de sugestão transitória para revisão do Facilitador (ST-D1-005)
interface TransientAISuggestion {
  id: string;
  originalStatement: string;
  statement: string;
  suggestedScope: InfoScope;
  scope: InfoScope;
  relatedCapacity: CapacityId;
  mentionedActors: string[];
  mentionedEvidenceTitles: string[];
  humanEdited: boolean;
}

export const FacilitatorPanelView: React.FC = () => {
  const {
    currentOrg,
    currentCycle,
    activeDoorId,
    setActiveDoorId,
    activeResponseId,
    setActiveResponseId,
    setCurrentView,
    originalResponses,
    informationUnits,
    addInformationUnit,
    updateUnitValidation,
    aiAnalyses,
    updateAIAnalysisValidation,
    divergences,
    updateDivergenceStatus,
    addDivergence,
    pendingItems,
    addPendingItem,
    currentUser
  } = usePilot();

  // Localiza a resposta original selecionada no fluxo de investigação
  const focusedResponse = activeResponseId 
    ? originalResponses.find(r => r.id === activeResponseId) || null 
    : null;

  const [selectedDoorFilter, setSelectedDoorFilter] = useState<DoorId | 'ALL'>(() => {
    return focusedResponse ? focusedResponse.doorId : activeDoorId;
  });

  const [filterByFocusedResponse, setFilterByFocusedResponse] = useState<boolean>(Boolean(focusedResponse));

  // Sincroniza se activeResponseId mudar
  useEffect(() => {
    if (focusedResponse) {
      setSelectedDoorFilter(focusedResponse.doorId);
      setFilterByFocusedResponse(true);
      setNewUnitSourceName(focusedResponse.respondentName || 'Dr. Carlos Eduardo Menezes');
      setNewUnitSourceRole(focusedResponse.respondentRole || 'Encarregado de Dados');
    }
  }, [activeResponseId, focusedResponse]);

  // Modal para criar unidade de informação manual
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [newUnitStatement, setNewUnitStatement] = useState('');
  const [newUnitScope, setNewUnitScope] = useState<InfoScope>('CONHECIMENTO_DIRETO');
  const [newUnitSourceName, setNewUnitSourceName] = useState(
    focusedResponse ? focusedResponse.respondentName : 'Dr. Carlos Eduardo Menezes'
  );
  const [newUnitSourceRole, setNewUnitSourceRole] = useState(
    focusedResponse ? focusedResponse.respondentRole : 'Encarregado de Dados'
  );
  const [newUnitCapacity, setNewUnitCapacity] = useState<CapacityId>('C1');

  // Modal para registrar divergência
  const [showAddDivergenceModal, setShowAddDivergenceModal] = useState(false);
  const [isLoadingAIUnits, setIsLoadingAIUnits] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<TransientAISuggestion[]>([]);
  const [aiExtractionStatus, setAiExtractionStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'EMPTY_SAFE' | 'ERROR'>('IDLE');
  const [aiExtractionError, setAiExtractionError] = useState<string | null>(null);
  const [showReextractWarning, setShowReextractWarning] = useState(false);

  const [divTitle, setDivTitle] = useState('');
  const [divDesc, setDivDesc] = useState('');
  const [divSourceAName, setDivSourceAName] = useState('');
  const [divSourceAStmt, setDivSourceAStmt] = useState('');
  const [divSourceBName, setDivSourceBName] = useState('');
  const [divSourceBStmt, setDivSourceBStmt] = useState('');

  // Extrair unidades via IA do servidor (/api/ai/analyze-units)
  // ST-D1-005: Utiliza estritamente a resposta focal, gera sugestões transitórias e não registra automaticamente
  const handleExtractWithAI = async (forceOverwrite = false) => {
    if (!focusedResponse) {
      setAiExtractionError('Selecione uma fala focal na porta antes de solicitar a extração com IA.');
      setAiExtractionStatus('ERROR');
      return;
    }

    if (aiSuggestions.length > 0 && !forceOverwrite) {
      setShowReextractWarning(true);
      return;
    }

    setShowReextractWarning(false);
    setIsLoadingAIUnits(true);
    setAiExtractionStatus('LOADING');
    setAiExtractionError(null);

    try {
      const res = await fetch('/api/ai/analyze-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responseText: focusedResponse.originalText,
          doorId: focusedResponse.doorId,
          respondentName: focusedResponse.respondentName
        })
      });

      if (!res.ok) {
        let errMessage = 'Não foi possível realizar a extração por IA no momento.';
        try {
          const errData = await res.json();
          if (errData?.error) {
            errMessage = errData.error;
          }
        } catch (_) {}
        setAiExtractionError(errMessage);
        setAiExtractionStatus('ERROR');
        return;
      }

      const data = await res.json();
      const rawUnits = Array.isArray(data?.units) ? data.units : [];
      if (rawUnits.length === 0) {
        setAiSuggestions([]);
        setAiExtractionStatus('EMPTY_SAFE');
        return;
      }

      const validScopes: InfoScope[] = [
        'ACAO_PROPRIA',
        'CONHECIMENTO_DIRETO',
        'PERCEPCAO_SOBRE_TERCEIRO',
        'FORA_DA_VISIBILIDADE_DESCONHECIDO'
      ];

      const newSuggestions: TransientAISuggestion[] = rawUnits.map((u: any, idx: number) => {
        const stmt = String(u.statement || '').trim();
        const scp: InfoScope = validScopes.includes(u.suggestedScope) ? u.suggestedScope : 'CONHECIMENTO_DIRETO';
        return {
          id: `transient-sug-${Date.now()}-${idx}`,
          originalStatement: stmt,
          statement: stmt,
          suggestedScope: scp,
          scope: scp,
          relatedCapacity: 'C1',
          mentionedActors: Array.isArray(u.mentionedActors) ? u.mentionedActors : [],
          mentionedEvidenceTitles: Array.isArray(u.mentionedEvidenceTitles) ? u.mentionedEvidenceTitles : [],
          humanEdited: false
        };
      });

      setAiSuggestions(newSuggestions);
      setAiExtractionStatus('SUCCESS');
    } catch (err: any) {
      console.error('Erro ao sugerir unidades via IA:', err);
      setAiExtractionError('Não foi possível realizar a extração — Falha na conexão com o servidor. Tente novamente.');
      setAiExtractionStatus('ERROR');
    } finally {
      setIsLoadingAIUnits(false);
    }
  };

  const handleUpdateTransientStatement = (id: string, newText: string) => {
    setAiSuggestions(prev => prev.map(s => {
      if (s.id !== id) return s;
      return {
        ...s,
        statement: newText,
        humanEdited: newText.trim() !== s.originalStatement.trim()
      };
    }));
  };

  const handleUpdateTransientScope = (id: string, newScope: InfoScope) => {
    setAiSuggestions(prev => prev.map(s => s.id === id ? { ...s, scope: newScope } : s));
  };

  const handleUpdateTransientCapacity = (id: string, newCap: CapacityId) => {
    setAiSuggestions(prev => prev.map(s => s.id === id ? { ...s, relatedCapacity: newCap } : s));
  };

  const handleRegisterTransientUnit = (suggestion: TransientAISuggestion) => {
    if (!focusedResponse) return;
    const finalStatement = suggestion.statement.trim();
    if (!finalStatement) return;

    addInformationUnit({
      responseId: focusedResponse.id,
      doorId: focusedResponse.doorId,
      statement: finalStatement,
      sourceName: focusedResponse.respondentName,
      sourceRole: focusedResponse.respondentRole,
      scope: suggestion.scope,
      extractedBy: 'IA_SUGESTAO',
      validationStatus: 'VALIDADO',
      relatedCapacity: suggestion.relatedCapacity,
      mentionedActors: suggestion.mentionedActors,
      mentionedEvidenceTitles: suggestion.mentionedEvidenceTitles,
      organizationId: currentOrg?.id,
      cycleId: currentCycle?.id,
      aiSuggestedText: suggestion.originalStatement,
      humanEdited: finalStatement !== suggestion.originalStatement.trim(),
      registeredBy: currentUser?.name || 'Facilitador'
    });

    setAiSuggestions(prev => {
      const remaining = prev.filter(s => s.id !== suggestion.id);
      if (remaining.length === 0) {
        setAiExtractionStatus('IDLE');
      }
      return remaining;
    });
  };

  const handleDiscardTransientUnit = (id: string) => {
    setAiSuggestions(prev => {
      const remaining = prev.filter(s => s.id !== id);
      if (remaining.length === 0) {
        setAiExtractionStatus('IDLE');
      }
      return remaining;
    });
  };

  const handleDiscardAllTransient = () => {
    setAiSuggestions([]);
    setAiExtractionStatus('IDLE');
    setShowReextractWarning(false);
  };

  // Filtro
  const filteredUnits = informationUnits.filter(u => {
    if (selectedDoorFilter !== 'ALL' && u.doorId !== selectedDoorFilter) return false;
    if (focusedResponse && filterByFocusedResponse) {
      return u.responseId === focusedResponse.id;
    }
    return true;
  });

  const allDoorUnits = informationUnits.filter(u => 
    selectedDoorFilter === 'ALL' ? true : u.doorId === selectedDoorFilter
  );

  const filteredAnalyses = aiAnalyses.filter(a =>
    selectedDoorFilter === 'ALL' ? true : a.doorId === selectedDoorFilter
  );

  const filteredDivergences = divergences.filter(d =>
    selectedDoorFilter === 'ALL' ? true : d.doorId === selectedDoorFilter
  );

  const handleSaveUnit = () => {
    if (!newUnitStatement.trim()) return;
    addInformationUnit({
      responseId: focusedResponse ? focusedResponse.id : `resp-manual-${Date.now()}`,
      doorId: selectedDoorFilter === 'ALL' ? activeDoorId : selectedDoorFilter,
      statement: newUnitStatement,
      sourceName: newUnitSourceName,
      sourceRole: newUnitSourceRole,
      scope: newUnitScope,
      extractedBy: 'FACILITADOR',
      validationStatus: 'VALIDADO',
      relatedCapacity: newUnitCapacity,
      mentionedActors: [],
      mentionedEvidenceTitles: []
    });
    setNewUnitStatement('');
    setShowAddUnitModal(false);
  };

  const handleSaveDivergence = () => {
    if (!divTitle.trim() || !divDesc.trim()) return;
    addDivergence({
      doorId: selectedDoorFilter === 'ALL' ? activeDoorId : selectedDoorFilter,
      title: divTitle,
      description: divDesc,
      sourceA: {
        name: divSourceAName,
        statement: divSourceAStmt,
        scope: 'PERCEPCAO_SOBRE_TERCEIRO',
        responseId: 'resp-a'
      },
      sourceB: {
        name: divSourceBName,
        statement: divSourceBStmt,
        scope: 'ACAO_PROPRIA',
        responseId: 'resp-b'
      },
      status: 'DETECTADA'
    });
    setDivTitle('');
    setDivDesc('');
    setShowAddDivergenceModal(false);
  };

  const currentReturnDoor = selectedDoorFilter !== 'ALL' ? selectedDoorFilter : activeDoorId;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Barra de Retorno à Investigação da Porta (Orientação de Retorno do Facilitador) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl shadow-xs">
        <button
          type="button"
          onClick={() => {
            setActiveDoorId(currentReturnDoor);
            setCurrentView('INTERVIEW');
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 group"
          title={`Retornar ao ambiente da investigação ${currentReturnDoor}`}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>← Voltar à investigação {currentReturnDoor}</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span className="text-slate-200 font-semibold">{currentOrg?.name}</span>
          <span>•</span>
          <span className="font-mono text-[11px] text-slate-400">{currentCycle?.name || currentOrg?.activeCycleName || 'Ciclo D1'}</span>
        </div>
      </div>

      {/* Banner de Orientação do Facilitador */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">Painel Metodológico do Facilitador</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Ambiente exclusivo para decomposição das falas originais em <strong>Unidades de Informação</strong>, 
            classificação de <strong>Alcance</strong> por afirmação, mediação de <strong>Divergências</strong> e validação humana de propostas da IA.
          </p>
        </div>

        {/* Seletor de Porta para Filtro */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Filtrar por Porta:</span>
          <select
            value={selectedDoorFilter}
            onChange={e => setSelectedDoorFilter(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
          >
            <option value="ALL">Todas as Portas (D1.1 - D1.6)</option>
            {DOORS_DEFINITIONS.map(d => (
              <option key={d.id} value={d.id}>{d.code} - {d.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Banner Contextual da Resposta Original Selecionada (Cadeia de Rastreabilidade Metodológica) */}
      {focusedResponse && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 sm:p-5 text-white space-y-3 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
                {focusedResponse.doorId}
              </span>
              <span className="text-white font-bold">
                Resposta Original Imutável Vinculada
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                ({focusedResponse.id})
              </span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-slate-300 text-[11px] hidden sm:inline">
                {currentOrg?.name} ({currentCycle?.name || currentOrg?.activeCycleName || 'Ciclo D1'})
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={() => setFilterByFocusedResponse(prev => !prev)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  filterByFocusedResponse
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Alternar entre ver somente unidades desta resposta ou todas as unidades da porta"
              >
                <Filter className="w-3 h-3" />
                <span>{filterByFocusedResponse ? 'Filtro: Apenas desta resposta' : 'Filtro: Todas da porta'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveDoorId(focusedResponse.doorId);
                  setCurrentView('INTERVIEW');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg text-[11px] font-semibold border border-slate-600 flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Retornar à entrevista investigativa desta porta"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar à Entrevista</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveResponseId(null);
                  setFilterByFocusedResponse(false);
                }}
                className="text-slate-400 hover:text-slate-200 text-[11px] px-2 py-1 cursor-pointer"
                title="Remover foco da resposta e ver painel geral da porta"
              >
                ✕ Limpar foco
              </button>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-[11px] text-slate-300 flex-wrap">
              <span>Respondente: <strong>{focusedResponse.respondentName}</strong> ({focusedResponse.respondentRole})</span>
              <span>•</span>
              <span>Modalidade: <strong>{focusedResponse.modality.replace('_', ' ')}</strong></span>
              <span>•</span>
              <span>Registrado em: {new Date(focusedResponse.timestamp).toLocaleString('pt-BR')}</span>
            </div>
            <div className="bg-slate-800/90 rounded-lg p-3 border border-slate-700 text-slate-100 font-serif italic text-xs sm:text-sm leading-relaxed">
              “{focusedResponse.originalText}”
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Rastreabilidade: Resposta Original Imutável → Unidade Derivada → Fonte / Alcance → Análise → Validação Humana.
            </p>
          </div>
        </div>
      )}

      {/* Grid: 1. Unidades de Informação & Alcance / 2. Divergências Operacionais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 e 2: Unidades de Informação */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>
                  {focusedResponse && filterByFocusedResponse 
                    ? `Unidades Derivadas da Resposta (${focusedResponse.id})`
                    : 'Unidades de Informação Analisáveis'}
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                  {filteredUnits.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                A unidade interpretável é: <strong>Afirmação + Fonte + Alcance + Eventual Evidência</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExtractWithAI(false)}
                disabled={isLoadingAIUnits || !focusedResponse}
                title={!focusedResponse ? 'Selecione uma resposta focal na porta para extrair com IA' : 'Solicitar sugestões de unidades com IA a partir da fala focal'}
                className="text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                {isLoadingAIUnits ? 'Extraindo com IA...' : 'Extrair com IA'}
              </button>
              <button
                onClick={() => setShowAddUnitModal(true)}
                className="text-xs font-medium bg-slate-800 hover:bg-slate-900 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Extrair Manual
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {/* Aviso de reextração com sugestões pendentes (ST-D1-005) */}
            {showReextractWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Gerar nova sugestão substituirá a sugestão atual ainda não registrada.</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleExtractWithAI(true)}
                    className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white font-medium rounded transition-colors cursor-pointer"
                  >
                    Substituir e extrair
                  </button>
                  <button
                    onClick={() => setShowReextractWarning(false)}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 font-medium rounded transition-colors cursor-pointer"
                  >
                    Manter atual
                  </button>
                </div>
              </div>
            )}

            {/* Estado: Extraindo... */}
            {aiExtractionStatus === 'LOADING' && (
              <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-lg flex items-center gap-3 text-xs text-sky-900 animate-pulse">
                <Sparkles className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
                <div>
                  <p className="font-semibold text-sky-950">Extraindo com IA...</p>
                  <p className="text-[11px] text-sky-700">Decompondo a fala focal selecionada em afirmativas factuais e alcances metodológicos.</p>
                </div>
              </div>
            )}

            {/* Estado: Erro na extração */}
            {aiExtractionStatus === 'ERROR' && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start justify-between gap-3 text-xs text-rose-900">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-rose-950">Não foi possível realizar a extração — Tentar novamente</p>
                    <p className="text-[11px] text-rose-800 mt-0.5">{aiExtractionError || 'Ocorreu uma falha na comunicação com o serviço de inteligência artificial.'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleExtractWithAI(true)}
                    className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white font-medium rounded transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Tentar novamente
                  </button>
                  <button
                    onClick={() => { setAiExtractionStatus('IDLE'); setAiExtractionError(null); }}
                    className="p-1 text-rose-600 hover:text-rose-800 rounded hover:bg-rose-100 transition-colors cursor-pointer"
                    title="Fechar aviso"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Estado: Nenhuma sugestão identificada com segurança */}
            {aiExtractionStatus === 'EMPTY_SAFE' && (
              <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-lg flex items-start justify-between gap-3 text-xs text-slate-800">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Nenhuma sugestão identificada com segurança</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">A análise da fala focal não identificou afirmativas factuais com clareza suficiente para decomposição automática segura. Como Facilitador, você pode registrar unidades manualmente pelo botão "Extrair Manual".</p>
                  </div>
                </div>
                <button
                  onClick={() => setAiExtractionStatus('IDLE')}
                  className="p-1 text-slate-500 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                  title="Dispensar aviso"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Estado: Sugestões geradas — Staging Transitório para Revisão do Facilitador (ST-D1-005) */}
            {aiSuggestions.length > 0 && (
              <div className="p-4 bg-amber-50/40 border-2 border-amber-200/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                      {aiSuggestions.length}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Sugestões da IA em Revisão Transitória (não registradas)
                      </h4>
                      <p className="text-[11px] text-amber-800">
                        Como Facilitador, revise ou edite as afirmativas antes de decidir o registro definitivo. Nenhuma unidade é gravada ou validada sem sua ação explícita.
                      </p>
                    </div>
                  </div>
                  {aiSuggestions.length > 1 && (
                    <button
                      onClick={handleDiscardAllTransient}
                      className="text-[11px] text-amber-800 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-amber-100/70 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Descartar todas
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {aiSuggestions.map((sug, idx) => (
                    <div key={sug.id} className="p-3.5 bg-white border border-amber-200 rounded-lg shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                            Sugestão #{idx + 1}
                          </span>
                          <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                            Transitória (Local)
                          </span>
                          {sug.humanEdited && (
                            <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                              <Edit3 className="w-2.5 h-2.5" /> Editado pelo Facilitador
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500">Capacidade:</span>
                          <select
                            value={sug.relatedCapacity}
                            onChange={e => handleUpdateTransientCapacity(sug.id, e.target.value as CapacityId)}
                            className="text-xs font-semibold rounded px-1.5 py-0.5 border border-slate-300 bg-slate-50 text-slate-700"
                          >
                            <option value="C1">C1 - Liderança</option>
                            <option value="C2">C2 - Mapeamento</option>
                            <option value="C3">C3 - Direitos</option>
                            <option value="C4">C4 - Segurança</option>
                            <option value="C5">C5 - Terceiros</option>
                            <option value="C6">C6 - Incidentes</option>
                          </select>

                          <span className="text-[11px] text-slate-500">Alcance:</span>
                          <select
                            value={sug.scope}
                            onChange={e => handleUpdateTransientScope(sug.id, e.target.value as InfoScope)}
                            className="text-xs font-semibold rounded px-1.5 py-0.5 border border-slate-300 bg-slate-50 text-slate-700 font-mono"
                          >
                            <option value="ACAO_PROPRIA">AÇÃO PRÓPRIA</option>
                            <option value="CONHECIMENTO_DIRETO">CONHECIMENTO DIRETO</option>
                            <option value="PERCEPCAO_SOBRE_TERCEIRO">PERCEPÇÃO SOBRE TERCEIRO</option>
                            <option value="FORA_DA_VISIBILIDADE_DESCONHECIDO">FORA DA VISIBILIDADE / DESCONHECIDO</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Afirmação / Unidade de Informação (editável):
                        </label>
                        <textarea
                          value={sug.statement}
                          onChange={e => handleUpdateTransientStatement(sug.id, e.target.value)}
                          rows={2}
                          className="w-full text-xs font-medium text-slate-900 border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                          placeholder="Texto da afirmação..."
                        />
                      </div>

                      {sug.humanEdited && (
                        <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
                          <span className="font-semibold text-slate-600">Texto original da IA:</span> “{sug.originalStatement}”
                        </div>
                      )}

                      {(sug.mentionedActors.length > 0 || sug.mentionedEvidenceTitles.length > 0) && (
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                          {sug.mentionedActors.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-slate-400" />
                              Atores: <strong className="text-slate-700">{sug.mentionedActors.join(', ')}</strong>
                            </span>
                          )}
                          {sug.mentionedEvidenceTitles.length > 0 && (
                            <span className="flex items-center gap-1 text-purple-700">
                              <FileText className="w-3 h-3" />
                              Evidências mencionadas: <strong>{sug.mentionedEvidenceTitles.join(', ')}</strong>
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleDiscardTransientUnit(sug.id)}
                          className="text-xs font-medium px-2.5 py-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Descartar
                        </button>
                        <button
                          onClick={() => handleRegisterTransientUnit(sug)}
                          className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Registrar Unidade
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredUnits.length === 0 ? (
              <div className="py-8 px-4 text-center text-slate-500 text-xs bg-slate-50/60 rounded-lg border border-dashed border-slate-200 space-y-1">
                <p className="font-semibold text-slate-700">
                  {focusedResponse && filterByFocusedResponse
                    ? 'Nenhuma unidade de informação extraída desta resposta original ainda.'
                    : 'Nenhuma unidade de informação extraída para a porta selecionada.'}
                </p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  {focusedResponse && filterByFocusedResponse
                    ? 'Como Facilitador, você pode registrar unidades manualmente ou solicitar sugestões à IA para revisar antes do registro.'
                    : 'Selecione outra porta ou utilize a entrevista investigativa para capturar falas e extrair unidades de informação.'}
                </p>
              </div>
            ) : (
              filteredUnits.map(unit => {
                const scopeBadgeColor = 
                  unit.scope === 'ACAO_PROPRIA' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                  unit.scope === 'CONHECIMENTO_DIRETO' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                  unit.scope === 'PERCEPCAO_SOBRE_TERCEIRO' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                  'bg-rose-50 text-rose-800 border-rose-200';

                return (
                  <div key={unit.id} className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="font-bold text-slate-700 font-mono">{unit.doorId}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-bold ${scopeBadgeColor}`}>
                            {unit.scope.replace(/_/g, ' ')}
                          </span>
                          {unit.relatedCapacity && (
                            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                              Capacidade {unit.relatedCapacity}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            Extraído por: {unit.extractedBy}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                          {unit.statement}
                        </p>
                      </div>

                      {/* Status de Validação pelo Facilitador */}
                      <div className="shrink-0 flex items-center gap-1">
                        <select
                          value={unit.validationStatus}
                          onChange={e => updateUnitValidation(unit.id, e.target.value as any)}
                          className={`text-xs font-semibold rounded px-2 py-1 border ${
                            unit.validationStatus === 'VALIDADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                            unit.validationStatus === 'AJUSTADO' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                            unit.validationStatus === 'REJEITADO' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                            'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="VALIDADO">VALIDADO</option>
                          <option value="AJUSTADO">AJUSTADO</option>
                          <option value="EM_ANALISE">EM ANÁLISE</option>
                          <option value="REJEITADO">REJEITADO</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span>Fonte: <strong>{unit.sourceName}</strong> ({unit.sourceRole})</span>
                      </div>
                      {unit.mentionedEvidenceTitles && unit.mentionedEvidenceTitles.length > 0 && (
                        <span className="text-purple-700 font-medium text-[11px] flex items-center gap-1">
                          <FileText className="w-3 h-3" /> {unit.mentionedEvidenceTitles.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna 3: Divergências & Análise de IA */}
        <div className="space-y-6">
          {/* Caixa de Divergências */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Divergências Operacionais
              </h3>
              <button
                onClick={() => setShowAddDivergenceModal(true)}
                className="text-[11px] text-amber-700 hover:text-amber-900 font-medium"
              >
                + Registrar
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Regra estrita: Se duas fontes apresentarem relatos incompatíveis, a IA NÃO pode arbitrar nem fundir relatos.
            </p>

            {filteredDivergences.length === 0 ? (
              <div className="py-4 text-center text-slate-400 text-xs">
                Nenhuma divergência registrada nesta porta.
              </div>
            ) : (
              filteredDivergences.map(div => (
                <div key={div.id} className="p-3 border border-amber-200 bg-amber-50/50 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900">{div.title}</span>
                    <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded">
                      {div.status}
                    </span>
                  </div>
                  <p className="text-slate-700 text-[11px]">{div.description}</p>

                  <div className="bg-white p-2 rounded border border-amber-100 space-y-1 text-[11px]">
                    <div className="text-slate-800">
                      <strong>Fonte A ({div.sourceA.name}):</strong> “{div.sourceA.statement}”
                    </div>
                    <div className="text-slate-800">
                      <strong>Fonte B ({div.sourceB.name}):</strong> “{div.sourceB.statement}”
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">Ação do Facilitador:</span>
                    <select
                      value={div.status}
                      onChange={e => updateDivergenceStatus(div.id, e.target.value as DivergenceStatus)}
                      className="text-[10px] bg-white border border-slate-300 rounded px-1.5 py-0.5"
                    >
                      <option value="DETECTADA">DETECTADA</option>
                      <option value="EM_ANALISE">EM ANÁLISE</option>
                      <option value="MANTIDA_COMO_DIVERGENCIA">MANTIDA COMO DIVERGÊNCIA</option>
                      <option value="REQUER_OUTRA_FONTE">REQUER OUTRA FONTE</option>
                      <option value="EXPLICADA">EXPLICADA</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Análises Preliminares da IA */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-600" />
                Apoio Metodológico da IA
              </h3>
              <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-mono">
                Minimizado
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              A IA sintetiza sinais de capacidade e aponta gaps potenciais. Toda proposta exige validação humana antes de integrar o diagnóstico.
            </p>

            {filteredAnalyses.length === 0 ? (
              <div className="py-4 text-center text-slate-400 text-xs">
                Nenhuma análise prévia registrada nesta porta.
              </div>
            ) : (
              filteredAnalyses.map(ana => (
                <div key={ana.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">{ana.category.replace(/_/g, ' ')}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      ana.humanValidation.status === 'ACEITO' ? 'bg-emerald-100 text-emerald-800' :
                      ana.humanValidation.status === 'AJUSTADO' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {ana.humanValidation.status}
                    </span>
                  </div>

                  <p className="text-slate-800 text-[11px]">{ana.summary}</p>

                  <div className="space-y-1 text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                    <span className="font-bold text-emerald-800 block">Sinais de Capacidade:</span>
                    {ana.signalsOfCapacity.map((s, i) => (
                      <div key={i}>• {s}</div>
                    ))}
                    <span className="font-bold text-amber-800 block pt-1">Gaps Potenciais Apontados:</span>
                    {ana.potentialGaps.map((g, i) => (
                      <div key={i}>• {g}</div>
                    ))}
                  </div>

                  {/* Validação do Facilitador */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Validação Humana:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateAIAnalysisValidation(ana.id, 'ACEITO', 'Validado pelo facilitador sem ressalvas.')}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px]"
                      >
                        Aceitar
                      </button>
                      <button
                        onClick={() => updateAIAnalysisValidation(ana.id, 'AJUSTADO', 'Ajustado com ressalva fática.')}
                        className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px]"
                      >
                        Ajustar
                      </button>
                      <button
                        onClick={() => updateAIAnalysisValidation(ana.id, 'REJEITADO', 'Rejeitado por incompatibilidade fática.')}
                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px]"
                      >
                        Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Extrair Unidade Manual */}
      {showAddUnitModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-800">Registrar Unidade de Informação</h4>
              <button onClick={() => setShowAddUnitModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Afirmação Fática (Unidade Interpretável):</label>
                <textarea
                  rows={3}
                  value={newUnitStatement}
                  onChange={e => setNewUnitStatement(e.target.value)}
                  placeholder="Ex: A Câmara possui contrato ativo de backup em nuvem diário com retenção semestral."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Alcance da Informação:</label>
                  <select
                    value={newUnitScope}
                    onChange={e => setNewUnitScope(e.target.value as InfoScope)}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="ACAO_PROPRIA">AÇÃO PRÓPRIA</option>
                    <option value="CONHECIMENTO_DIRETO">CONHECIMENTO DIRETO</option>
                    <option value="PERCEPCAO_SOBRE_TERCEIRO">PERCEPÇÃO SOBRE TERCEIRO</option>
                    <option value="FORA_DA_VISIBILIDADE_DESCONHECIDO">FORA DA VISIBILIDADE / DESCONHECIDO</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Capacidade Relacionada:</label>
                  <select
                    value={newUnitCapacity}
                    onChange={e => setNewUnitCapacity(e.target.value as CapacityId)}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="C1">C1 — Estruturação</option>
                    <option value="C2">C2 — Sustentação do Encarregado</option>
                    <option value="C3">C3 — Distribuição</option>
                    <option value="C4">C4 — Articulação</option>
                    <option value="C5">C5 — Sustentação Gerencial</option>
                    <option value="C6">C6 — Continuidade e Evolução</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nome da Fonte:</label>
                  <input
                    type="text"
                    value={newUnitSourceName}
                    onChange={e => setNewUnitSourceName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cargo / Setor da Fonte:</label>
                  <input
                    type="text"
                    value={newUnitSourceRole}
                    onChange={e => setNewUnitSourceRole(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddUnitModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveUnit}
                disabled={!newUnitStatement.trim()}
                className="px-4 py-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded disabled:opacity-50"
              >
                Salvar Unidade Validada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Registrar Divergência */}
      {showAddDivergenceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Registrar Divergência entre Fontes
              </h4>
              <button onClick={() => setShowAddDivergenceModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título da Divergência:</label>
                <input
                  type="text"
                  value={divTitle}
                  onChange={e => setDivTitle(e.target.value)}
                  placeholder="Ex: Tramitação de requerimentos de titulares entre Protocolo e Procuradoria"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Descrição do Ponto Incompatível:</label>
                <textarea
                  rows={2}
                  value={divDesc}
                  onChange={e => setDivDesc(e.target.value)}
                  placeholder="Descreva detalhadamente a contradição entre os dois relatos..."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded space-y-2">
                <span className="font-bold text-slate-700 block">Fonte A:</span>
                <input
                  type="text"
                  value={divSourceAName}
                  onChange={e => setDivSourceAName(e.target.value)}
                  placeholder="Nome e cargo da Fonte A"
                  className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs mb-1"
                />
                <textarea
                  rows={2}
                  value={divSourceAStmt}
                  onChange={e => setDivSourceAStmt(e.target.value)}
                  placeholder="Fala literal da Fonte A..."
                  className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
                />
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded space-y-2">
                <span className="font-bold text-slate-700 block">Fonte B:</span>
                <input
                  type="text"
                  value={divSourceBName}
                  onChange={e => setDivSourceBName(e.target.value)}
                  placeholder="Nome e cargo da Fonte B"
                  className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs mb-1"
                />
                <textarea
                  rows={2}
                  value={divSourceBStmt}
                  onChange={e => setDivSourceBStmt(e.target.value)}
                  placeholder="Fala literal da Fonte B..."
                  className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddDivergenceModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveDivergence}
                disabled={!divTitle.trim() || !divDesc.trim()}
                className="px-4 py-1.5 font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded disabled:opacity-50"
              >
                Salvar Divergência em Análise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
