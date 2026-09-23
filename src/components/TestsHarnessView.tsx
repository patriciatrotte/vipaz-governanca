import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Play, 
  ShieldCheck, 
  FileCheck, 
  AlertCircle 
} from 'lucide-react';

export const TestsHarnessView: React.FC = () => {
  const { runMandatoryTests } = usePilot();
  const [testResults, setTestResults] = useState<Record<string, { passed: boolean; message: string }>>(() => {
    return runMandatoryTests();
  });

  const handleRerun = () => {
    setTestResults(runMandatoryTests());
  };

  const totalTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter(t => t.passed).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Banner dos 12 Testes Obrigatórios */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">Verificação dos 12 Testes Metodológicos Obrigatórios</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Validador automatizado baseado estritamente na <strong>Seção 34 do Documento Metodológico D1 v1.0</strong>. 
            Nenhuma implementação da D1 é considerada aderente se falhar em qualquer uma destas 12 salvaguardas de campo.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Conformidade:</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {passedTests} / {totalTests} Aprovados
            </span>
          </div>

          <button
            onClick={handleRerun}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Play className="w-3.5 h-3.5 text-white" />
            <span>Reexecutar Testes</span>
          </button>
        </div>
      </div>

      {/* Lista dos 12 Testes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(testResults).map(([testName, result], index) => (
          <div
            key={testName}
            className={`p-4 rounded-xl border flex flex-col justify-between space-y-2.5 transition-all ${
              result.passed
                ? 'bg-white border-emerald-200 shadow-xs'
                : 'bg-rose-50/50 border-rose-300'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-800">
                  {testName}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                  result.passed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {result.passed ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PASSOU
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-rose-600" /> REPROVOU
                    </>
                  )}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-serif">
                {result.message}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Seção 34 • Salvaguarda #{index + 1}</span>
              <span className="text-emerald-700 font-medium">Critério Verificado</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
