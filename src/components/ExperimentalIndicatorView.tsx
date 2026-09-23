import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { 
  BarChart3, 
  CheckCircle2, 
  HelpCircle, 
  Info, 
  Save, 
  TrendingUp, 
  Calculator 
} from 'lucide-react';
import { ExperimentalIndicatorFeedback } from '../types';

export const ExperimentalIndicatorView: React.FC = () => {
  const { experimentalIndicator, updateIndicatorFeedback } = usePilot();

  const [actionsTotal, setActionsTotal] = useState(experimentalIndicator.actionsTotal);
  const [actionsTracked, setActionsTracked] = useState(experimentalIndicator.actionsTracked);
  const [perceivedUtility, setPerceivedUtility] = useState(experimentalIndicator.perceivedUtility);
  const [feasibilityAssessment, setFeasibilityAssessment] = useState(experimentalIndicator.feasibilityAssessment);
  const [probableResponsibleSource, setProbableResponsibleSource] = useState(experimentalIndicator.probableResponsibleSource);
  const [proposedPeriodicity, setProposedPeriodicity] = useState(experimentalIndicator.proposedPeriodicity);
  const [identifiedDifficulties, setIdentifiedDifficulties] = useState(experimentalIndicator.identifiedDifficulties);
  const [isSaved, setIsSaved] = useState(false);

  const calculatedPercentage = actionsTotal > 0 ? Math.round((actionsTracked / actionsTotal) * 1000) / 10 : 0;

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    updateIndicatorFeedback({
      actionsTotal,
      actionsTracked,
      calculatedValue: calculatedPercentage,
      perceivedUtility,
      feasibilityAssessment,
      probableResponsibleSource,
      proposedPeriodicity,
      identifiedDifficulties
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Banner do Indicador Experimental */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">Indicador Experimental D1</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Para testar empiricamente a sustentação das medidas pactuadas sem criar métricas de vaidade, 
            o piloto D1 introduz o <strong>{experimentalIndicator.indicatorName}</strong>. 
            Após a Porta D1.6, o Facilitador aplica esta pesquisa com o interlocutor para verificar utilidade e viabilidade.
          </p>
        </div>

        <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-lg text-right shrink-0">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
            Valor Calculado no Ciclo:
          </span>
          <span className="text-2xl font-bold text-emerald-400 font-mono">
            {calculatedPercentage}%
          </span>
        </div>
      </div>

      {/* Cartão da Fórmula e Racional Metodológico */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600" />
            Definição Operacional da Métrica
          </h3>
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
            Experimental v1.0
          </span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <span className="text-xs font-bold text-slate-700">Fórmula Matemática:</span>
          <code className="text-xs font-mono text-slate-800 block bg-white p-2 rounded border border-slate-200">
            {experimentalIndicator.formula}
          </code>
          <p className="text-[11px] text-slate-500 pt-1">
            Mede a proporção de compromissos que contam com acompanhamento formal periódico, 
            evitando que o plano de governança se torne um documento morto arquivado em gabinete.
          </p>
        </div>

        {/* Simulador de Cálculo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Total de Ações Previstas (Denominador):</label>
            <input
              type="number"
              min={1}
              value={actionsTotal}
              onChange={e => setActionsTotal(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full p-2 border border-slate-300 rounded font-semibold text-sm"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Ações Efetivamente Acompanhadas (Numerador):</label>
            <input
              type="number"
              min={0}
              max={actionsTotal}
              value={actionsTracked}
              onChange={e => setActionsTracked(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full p-2 border border-slate-300 rounded font-semibold text-sm"
            />
          </div>

          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 flex flex-col justify-center text-center">
            <span className="text-[11px] font-bold text-indigo-900">Resultado Proporcional:</span>
            <span className="text-xl font-bold font-mono text-indigo-700">
              {calculatedPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Pesquisa de Validação Empírica (Pós D1.6) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            Pesquisa de Utilidade e Viabilidade com o Interlocutor (Pós-D1.6)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ao final da exploração da porta D1.6, o Facilitador aplica estas 5 perguntas de campo para avaliar se o indicador é viável na realidade municipal.
          </p>
        </div>

        <form onSubmit={handleSaveFeedback} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                1. Utilidade Percebida pelo Encarregado / Gestão:
              </label>
              <select
                value={perceivedUtility}
                onChange={e => setPerceivedUtility(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded font-medium"
              >
                <option value="MUITO_UTIL">MUITO ÚTIL (Ajuda a manter tração e cobrar setores)</option>
                <option value="UTIL">ÚTIL (Importante para acompanhamento gerencial)</option>
                <option value="POUCO_UTIL">POUCO ÚTIL (Exige esforço sem tanto benefício imediato)</option>
                <option value="INVIAVEL">INVIÁVEL (Gera sobrecarga e resistência)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                2. Avaliação de Viabilidade Real de Coleta:
              </label>
              <input
                type="text"
                value={feasibilityAssessment}
                onChange={e => setFeasibilityAssessment(e.target.value)}
                placeholder="Ex: Totalmente viável para Câmaras porque mede acompanhamento..."
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                3. Fonte Responsável Mais Provável de Informação:
              </label>
              <input
                type="text"
                value={probableResponsibleSource}
                onChange={e => setProbableResponsibleSource(e.target.value)}
                placeholder="Ex: Diretoria Geral Administrativa com o Encarregado"
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                4. Periodicidade Proposta Mais Realista:
              </label>
              <select
                value={proposedPeriodicity}
                onChange={e => setProposedPeriodicity(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded font-medium"
              >
                <option value="QUINZENAL">QUINZENAL</option>
                <option value="MENSAL">MENSAL</option>
                <option value="BIMESTRAL">BIMESTRAL (Recomendada para Câmaras)</option>
                <option value="TRIMESTRAL">TRIMESTRAL</option>
                <option value="POR_CICLO">POR CICLO</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              5. Principais Dificuldades Previstas na Instituição:
            </label>
            <textarea
              rows={2}
              value={identifiedDifficulties}
              onChange={e => setIdentifiedDifficulties(e.target.value)}
              placeholder="Ex: Sobrecarga do servidor designado, descontinuidade em ano eleitoral, baixa priorização pelos setores..."
              className="w-full p-2 border border-slate-300 rounded font-serif"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            {isSaved ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Avaliação salva no baseline do ciclo!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Save className="w-4 h-4 text-emerald-200" />
              <span>Salvar Avaliação do Indicador</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
