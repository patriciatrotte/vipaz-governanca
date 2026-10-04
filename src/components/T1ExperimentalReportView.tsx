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
  const [activeOutput, setActiveOutput] = useState<'EXECUTIVE' | 'TRACEABILITY'>('EXECUTIVE');

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

  // T1: primeira interpretação assistida do ciclo real de Nilo, produzida a partir dos
  // dados recuperados acima. É uma síntese interpretativa pendente de confirmação humana;
  // não aplica regra de maturidade e não converte informação validada em conclusão automática.
  const niloT1Interpretation = data.cycle?.id === '1eef9712-a6ef-4a63-8612-79b1b5431a9f' ? {
    status: 'PENDING_HUMAN_CONFIRMATION',
    synthesis: 'A investigação indica uma governança de privacidade em processo de institucionalização. Há atuação prática atribuída à Encarregada e percepção de proximidade com áreas de gestão, além de práticas relatadas de acompanhamento e recuperação de informações. Ao mesmo tempo, parte relevante dessa atuação ainda parece depender de experiências pontuais, conhecimento pessoal e caminhos que nem sempre estão previamente estabelecidos.',
    demonstratedSignals: [
      'A Encarregada relata atuação em orientação, encaminhamento e tratamento de questões de proteção de dados.',
      'Há percepção de apoio e proximidade com Presidência, RH, TI e Procuradoria para temas que dependem de outras áreas.',
      'Foi relatada facilidade para recuperar informações anteriormente tratadas e uma cultura favorável ao compartilhamento de conhecimento.',
      'Existem práticas de acompanhamento envolvendo autorizações, inventários, dados e reuniões com diferentes áreas.'
    ],
    attentionPoints: [
      'A experiência prática da Encarregada ainda é insuficiente para avaliar com segurança como providências dependentes de outras pessoas ou áreas fluem na rotina.',
      'Alguns caminhos institucionais ainda precisam ser descobertos caso a caso, o que pode indicar dependência de articulação informal.',
      'As manifestações sobre apoio da gestão, recuperação de conhecimento e reação a mudanças ainda não possuem unidades estruturadas persistidas neste ciclo; por isso devem ser tratadas como informações relatadas, não como capacidades demonstradas.',
      'Não há evidências documentais vinculadas neste ciclo que permitam elevar os relatos a comprovação institucional.'
    ],
    nextState: 'Tornar mais explícitos e recuperáveis os caminhos de atuação, decisão, articulação e acompanhamento da governança de privacidade, reduzindo dependência de conhecimento pessoal ou de respostas pontuais e produzindo evidências institucionais das práticas já relatadas.',
    suggestedActions: [
      {
        title: 'Explicitar os fluxos de atuação e escalonamento',
        rationale: 'Reduzir a necessidade de descobrir caso a caso quem deve atuar, decidir ou apoiar as providências de privacidade.',
        expectedResult: 'Caminhos de atuação, decisão e articulação identificáveis e recuperáveis pela instituição.',
        expectedEvidence: 'Fluxo, procedimento, matriz de responsabilidades ou registro institucional equivalente.',
        priority: 'Prioridade sugerida: alta'
      },
      {
        title: 'Organizar a memória institucional da governança de privacidade',
        rationale: 'Transformar conhecimento hoje recuperável principalmente pela experiência das pessoas em conhecimento institucional preservado.',
        expectedResult: 'Registros de decisões, orientações e providências localizáveis e reutilizáveis.',
        expectedEvidence: 'Repositório, registros de decisões, atas, orientações ou mecanismo institucional equivalente.',
        priority: 'Prioridade sugerida: alta'
      },
      {
        title: 'Estruturar o acompanhamento das providências e mudanças',
        rationale: 'Dar continuidade e visibilidade às práticas de acompanhamento já relatadas no ciclo.',
        expectedResult: 'Providências, mudanças e necessidades de evolução acompanhadas de forma recorrente e verificável.',
        expectedEvidence: 'Registro de acompanhamento, pauta periódica, controle de providências ou mecanismo institucional equivalente.',
        priority: 'Prioridade sugerida: média'
      }
    ],
    limitations: 'Esta interpretação é experimental e utiliza exclusivamente as respostas e unidades de informação disponíveis no ciclo histórico. Ela ainda requer confirmação humana e não determina, por si só, nível de maturidade ou gap validado.'
  } : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 print:p-0">
      <header className="border-b border-slate-300 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-[0.18em] uppercase text-emerald-700">VIPAZ</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 mt-1">Retrato Institucional</h1>
            <p className="text-sm text-slate-600 mt-2">{data.organization?.name}</p>
          </div>
          <button onClick={() => window.print()} className="no-print inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
        </div>
        <div className="mt-4 text-xs text-slate-500">
          <span>Ciclo: <strong className="text-slate-700">{data.cycle?.name}</strong></span>
        </div>
      </header>

      <div className="no-print flex items-center gap-2 border-b border-slate-200">
        <button onClick={() => setActiveOutput('EXECUTIVE')} className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeOutput === 'EXECUTIVE' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Retrato Executivo</button>
        <button onClick={() => setActiveOutput('TRACEABILITY')} className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${activeOutput === 'TRACEABILITY' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Rastreabilidade Técnica</button>
      </div>

      {activeOutput === 'EXECUTIVE' && (
      <>
      {niloT1Interpretation && (
        <section className="border border-emerald-200 bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
          <div>
            <div className="text-xs font-bold tracking-[0.16em] uppercase text-emerald-700">Leitura institucional</div>
            <h2 className="text-xl font-bold text-slate-950 mt-1">Como a governança se apresenta hoje</h2>
          </div>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed mt-4">{niloT1Interpretation.synthesis}</p>

          <div className="grid md:grid-cols-2 gap-5 mt-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sinais institucionais identificados</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                {niloT1Interpretation.demonstratedSignals.map((x: string) => <li key={x} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><span>{x}</span></li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pontos de atenção</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                {niloT1Interpretation.attentionPoints.map((x: string) => <li key={x} className="flex gap-2"><AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /><span>{x}</span></li>)}
              </ul>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Próximo estado</div>
            <p className="text-sm text-slate-800 leading-relaxed mt-1">{niloT1Interpretation.nextState}</p>
          </div>
          <div className="mt-6 border-t border-slate-200 pt-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Direcionamento para evolução</div>
              <h3 className="text-base font-bold text-slate-950 mt-1">Possibilidades de avanço</h3>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Estes caminhos traduzem o próximo estado em movimentos possíveis para fortalecer a governança institucional.
            </p>
            <div className="mt-4 grid gap-3">
              {niloT1Interpretation.suggestedActions.map((action: any, index: number) => (
                <article key={action.title} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{action.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{action.rationale}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-full px-2.5 py-1 whitespace-nowrap">{action.priority}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 mt-3 pl-9">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Resultado esperado</div>
                      <p className="text-xs text-slate-700 mt-1">{action.expectedResult}</p>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Evidência esperada</div>
                      <p className="text-xs text-slate-700 mt-1">{action.expectedEvidence}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      </>
      )}

      {activeOutput === 'TRACEABILITY' && (
      <section>
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Controle técnico do ciclo</div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
            <span>Metodologia histórica: <strong>{data.cycle?.methodologyCode} {data.cycle?.methodologyVersion}</strong></span>
            <span>Modelo: <strong>{data.reportModelVersion}</strong></span>
            <span>Interpretação: <strong>pendente de confirmação humana</strong></span>
          </div>
          <div className="mt-3 grid sm:grid-cols-4 gap-2 text-xs text-slate-600">
            <span>{coverage.questionsInvestigated ?? 0} portas investigadas</span>
            <span>{coverage.questionsWithStructuredInformation ?? 0} com informação estruturada</span>
            <span>{coverage.questionsAwaitingStructuring ?? 0} aguardando estruturação</span>
            <span>{coverage.validatedInformationUnits ?? 0} unidades validadas</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">{niloT1Interpretation?.limitations}</p>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-slate-700" />
          <div><h2 className="text-lg font-bold text-slate-900">Rastreabilidade Técnica da Investigação</h2><p className="text-xs text-slate-500 mt-1">Camada técnica que preserva perguntas, manifestações registradas e unidades estruturadas utilizadas como insumos da interpretação.</p></div>
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
      )}

      {activeOutput === 'TRACEABILITY' && (
      <section className="border border-slate-200 rounded-xl p-5 bg-slate-50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <h2 className="font-bold text-slate-900">Conclusões protegidas</h2>
        </div>
        <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
          <div><span className="font-semibold">Maturidade:</span> não concluída</div>
          <div><span className="font-semibold">Gaps:</span> não concluídos</div>
          <div><span className="font-semibold">Próximo estado validado:</span> não concluído</div>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          O ciclo histórico permanece preservado. Informação validada não equivale, isoladamente, a capacidade institucional demonstrada, e regras metodológicas atuais não são aplicadas retroativamente.
        </p>
      </section>
      )}

      <footer className="text-[11px] text-slate-400 pt-2 border-t border-slate-200">
        VIPAZ • Retrato institucional do ciclo
      </footer>
    </div>
  );
};
