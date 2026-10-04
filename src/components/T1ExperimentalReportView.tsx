import React, { useEffect, useState } from 'react';
import { FileText, ShieldCheck, AlertTriangle, CheckCircle2, Printer } from 'lucide-react';

type ReportData = any;

const stateLabel: Record<string, string> = {
  STRUCTURED_INFORMATION_AVAILABLE: 'Informação estruturada disponível',
  RESPONSE_WITHOUT_STRUCTURED_INFORMATION: 'Resposta registrada • estruturação pendente',
  INSUFFICIENT_INFORMATION: 'Informação insuficiente'
};

export const T1ExperimentalReportView: React.FC<{ cycleId: string }> = ({ cycleId }) => {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/data/cycle-report?cycleId=${encodeURIComponent(cycleId)}`)
      .then(async r => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : String(e)));
  }, [cycleId]);

  if (error) return <div className="max-w-4xl mx-auto p-8 text-rose-700">Não foi possível carregar o relatório experimental: {error}</div>;
  if (!data) return <div className="max-w-4xl mx-auto p-8 text-slate-600">Carregando relatório experimental…</div>;

  const portrait = data.executivePortrait;
  const inputs = portrait?.interpretation?.inputs || [];
  const coverage = portrait?.investigationCoverage || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 print:p-0">
      <header className="border-b border-slate-300 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-[0.18em] uppercase text-emerald-700">VIPAZ • Marco T1</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 mt-1">Retrato Institucional Experimental</h1>
            <p className="text-sm text-slate-600 mt-2">{data.organization?.name}</p>
          </div>
          <button onClick={() => window.print()} className="no-print inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
          <span>Ciclo: <strong className="text-slate-700">{data.cycle?.name}</strong></span>
          <span>Metodologia histórica: <strong className="text-slate-700">{data.cycle?.methodologyCode} {data.cycle?.methodologyVersion}</strong></span>
          <span>Modelo do relatório: <strong className="text-slate-700">{data.reportModelVersion}</strong></span>
        </div>
      </header>

      <section className="grid sm:grid-cols-4 gap-3">
        {[
          ['Portas investigadas', coverage.questionsInvestigated ?? 0],
          ['Com informação estruturada', coverage.questionsWithStructuredInformation ?? 0],
          ['Aguardando estruturação', coverage.questionsAwaitingStructuring ?? 0],
          ['Unidades validadas', coverage.validatedInformationUnits ?? 0]
        ].map(([label,value]) => (
          <div key={String(label)} className="border border-slate-200 rounded-xl p-4 bg-white">
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </section>

      <section className="border border-amber-200 bg-amber-50 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-amber-950">Estado metodológico do retrato</h2>
            <p className="text-sm text-amber-900 mt-1 leading-relaxed">
              A investigação foi recuperada e organizada, mas a interpretação assistida ainda não foi executada.
              Por isso, maturidade, gaps e próximo estado permanecem não concluídos. Informação validada não equivale,
              isoladamente, a capacidade institucional demonstrada.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-900">Leitura da investigação</h2>
        </div>
        <div className="border-y border-slate-200 divide-y divide-slate-200 bg-white">
          {inputs.map((item: any) => (
            <article key={item.questionInstanceId} className="py-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-emerald-700">{item.questionCode}</div>
                  <h3 className="font-semibold text-slate-900 mt-1">{item.questionTextSnapshot}</h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1 whitespace-nowrap">
                  {stateLabel[item.sourceState] || item.sourceState}
                </span>
              </div>
              {item.responses?.map((r: any) => (
                <div key={r.id} className="mt-3 pl-4 border-l-2 border-slate-200">
                  <div className="text-xs text-slate-500">Manifestação registrada</div>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed">{r.responseText}</p>
                </div>
              ))}
              <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
                {item.validatedInformationUnits?.length > 0
                  ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {item.validatedInformationUnits.length} unidade(s) de informação validada(s) disponível(is) como insumo interpretativo.</>
                  : <><AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Há resposta registrada, mas nenhuma unidade estruturada persistida para esta porta.</>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border border-slate-200 rounded-xl p-5 bg-slate-50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <h2 className="font-bold text-slate-900">Conclusões protegidas</h2>
        </div>
        <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
          <div><span className="font-semibold">Maturidade:</span> não concluída</div>
          <div><span className="font-semibold">Gaps:</span> não concluídos</div>
          <div><span className="font-semibold">Próximo estado:</span> não concluído</div>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Este relatório experimental preserva o ciclo histórico e não aplica retroativamente regras da metodologia de trabalho atual.
        </p>
      </section>

      <footer className="text-[11px] text-slate-400 pt-2 border-t border-slate-200">
        VIPAZ • Relatório experimental do Marco T1 • dados recuperados do ciclo persistido
      </footer>
    </div>
  );
};
