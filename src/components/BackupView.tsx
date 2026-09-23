import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Copy, 
  Check, 
  BarChart, 
  ShieldCheck, 
  FileJson,
  Layers
} from 'lucide-react';

export const BackupView: React.FC = () => {
  const { 
    exportStructuredBackup, 
    importStructuredBackup, 
    resetToSimulationSeed, 
    telemetry, 
    currentOrg 
  } = usePilot();

  const [importJsonText, setImportJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [importSuccess, setImportSuccess] = useState<boolean | null>(null);

  const handleCopy = () => {
    const jsonStr = exportStructuredBackup();
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const jsonStr = exportStructuredBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_piloto_d1_${currentOrg?.id || 'export'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;

    const success = importStructuredBackup(importJsonText);
    setImportSuccess(success);
    if (success) {
      setImportJsonText('');
      alert('Dados importados com sucesso!');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Banner de Backup */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">Exportação, Backup e Telemetria Metodológica</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Exportação integral do ciclo em formato JSON auditável. Todos os registros (falas originais, 
            unidades fáticas, evidências, integrações e decisões) são estruturados e versionados para garantir persistência e interoperabilidade.
          </p>
        </div>

        <button
          onClick={resetToSimulationSeed}
          className="bg-rose-600/90 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Resetar para Cenário Padrão
        </button>
      </div>

      {/* Painel de Telemetria do Piloto */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
          <BarChart className="w-4 h-4 text-emerald-600" />
          Telemetria Metodológica do Ciclo ({currentOrg?.activeCycleName || 'Ciclo'})
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Sondagens Realizadas:</span>
            <span className="text-xl font-bold font-mono text-slate-800">{telemetry.totalProbes}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {telemetry.probesByOrigin.ia} via IA • {telemetry.probesByOrigin.adapted} adaptadas
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Registros de "Não Sei":</span>
            <span className="text-xl font-bold font-mono text-amber-700">{telemetry.dontKnowCount}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Categorizados e sem penalidade</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Intervenções Pedagógicas:</span>
            <span className="text-xl font-bold font-mono text-purple-700">{telemetry.pedagogicalInterventionsCount}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Conceito explicado sem induzir</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Divergências Detectadas:</span>
            <span className="text-xl font-bold font-mono text-rose-700">{telemetry.divergencesCount}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Sem fusão arbitrária</span>
          </div>
        </div>
      </div>

      {/* Ações de Exportação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Exportar */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <FileJson className="w-4 h-4 text-emerald-600" />
              Exportar Backup Estruturado (JSON)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gera o arquivo integral com metadados de versão D1 v1.0, todas as respostas gravadas, unidades fáticas e snapshot oficial.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleDownload}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Baixar Arquivo .json
            </button>
            <button
              onClick={handleCopy}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-300"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar JSON'}
            </button>
          </div>
        </div>

        {/* Importar */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-sky-600" />
            Restaurar Backup do Piloto
          </h3>
          <form onSubmit={handleImport} className="space-y-2 text-xs">
            <textarea
              rows={3}
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
              placeholder="Cole aqui o conteúdo JSON de um backup do Piloto D1 v1.0..."
              className="w-full p-2 border border-slate-300 rounded font-mono text-[11px]"
            />

            <div className="flex items-center justify-between">
              {importSuccess === false && (
                <span className="text-rose-600 text-[11px] font-semibold">Arquivo incompatível!</span>
              )}
              <button
                type="submit"
                disabled={!importJsonText.trim()}
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-50 ml-auto"
              >
                Importar e Substituir Estado
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
