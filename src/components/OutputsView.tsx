import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { 
  Building2, 
  ShieldCheck, 
  FileText, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  EyeOff, 
  ArrowRight,
  ArrowLeft,
  Printer,
  Compass,
  Award,
  GitCommit,
  Lock,
  Clock,
  ExternalLink,
  Target,
  BarChart3,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { CAPACITIES_DEFINITIONS, MATURITY_LEVELS_INFO } from '../data/methodologyConstants';
import { formatMaturityLevel, cleanPresentationText, formatCapacityStatus } from '../utils/formatters';

interface OutputsViewProps {
  initialTab?: 'EXECUTIVE' | 'TECHNICAL' | 'SNAPSHOT_VIEW' | 'UPCOMING';
  onBackToHub?: () => void;
}

export const OutputsView: React.FC<OutputsViewProps> = ({ initialTab, onBackToHub }) => {
  const { 
    currentOrg, 
    integration, 
    snapshot, 
    informationUnits, 
    originalResponses, 
    questionInstances, 
    evidences, 
    pendingItems,
    actions,
    currentUser,
    investigationProvenance,
    setCurrentView
  } = usePilot();

  // Matriz de Acesso do Piloto D1
  const isFacilitator = currentUser.role === 'FACILITADOR';
  const isGestor = currentUser.role === 'GESTOR_INSTITUCIONAL';
  const isInterlocutor = currentUser.role === 'INTERLOCUTOR_PRINCIPAL';
  const isParticipant = currentUser.role === 'PARTICIPANTE';
  const isAdmin = currentUser.role === 'ADMINISTRADOR';

  // Permissões por Saída
  // 1. Retrato Executivo: Facilitador, Gestor Institucional, Interlocutor Principal.
  // Participante e Admin técnico NÃO possuem acesso ao conteúdo por padrão (Privilégio Técnico ≠ Privilégio de Conteúdo).
  const canViewExecutive = isFacilitator || isGestor || isInterlocutor;

  // 2. Rastreabilidade Técnica: Equipe Metodológica Autorizada (Facilitador).
  const canViewTechnical = isFacilitator;

  // 3. Snapshot D1: Facilitador, Gestor (institucional) e Interlocutor (institucional).
  const canViewSnapshot = isFacilitator || isGestor || isInterlocutor;

  // Determinar aba ativa padrão permitida para o perfil
  const defaultTab = initialTab || (canViewExecutive ? 'EXECUTIVE' : canViewTechnical ? 'TECHNICAL' : 'UNAUTHORIZED');
  const [activeTab, setActiveTab] = useState<'EXECUTIVE' | 'TECHNICAL' | 'SNAPSHOT_VIEW' | 'UPCOMING'>(
    defaultTab === 'UNAUTHORIZED' ? 'UPCOMING' : defaultTab
  );

  if (!currentOrg) return null;

  // Caso o usuário não tenha permissão para nenhuma saída gerencial/técnica (ex: Participante ou Admin Técnico isolado)
  if (!canViewExecutive && !canViewTechnical && !canViewSnapshot) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto border border-slate-200 shadow-xs">
          <Lock className="w-8 h-8 text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Acesso Restrito a Relatórios e Sínteses</h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          {isParticipant && (
            <>
              O perfil <strong>Participante Convidado / Operacional</strong> acessa estritamente os artefatos de sua contribuição específica (sondagens e evidências setoriais). Relatórios consolidados e rastreabilidade global são reservados à governança e facilitação.
            </>
          )}
          {isAdmin && (
            <>
              Em conformidade com a governança do Piloto D1 (<strong>Privilégio Técnico ≠ Privilégio de Conteúdo</strong>), o Administrador da infraestrutura não possui acesso automático ao conteúdo analítico das avaliações institucionais.
            </>
          )}
        </p>
        <div className="pt-2">
          <button
            onClick={() => setCurrentView('HOME')}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            Voltar para Visão Geral
          </button>
        </div>
      </div>
    );
  }

  // O endpoint central entrega apenas a investigação. Sem reconciliação explícita,
  // a integração e o snapshot locais não podem ser publicados como resultados do ciclo.
  if (investigationProvenance.source === 'CENTRAL' && investigationProvenance.reconciliation === 'PENDING' && activeTab !== 'TECHNICAL') {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-4 print:hidden">
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 space-y-3">
          <h2 className="text-lg font-bold text-amber-950">Relatório aguardando conciliação dos dados</h2>
          <p className="text-sm text-amber-900">
            A investigação foi carregada da base central, mas as avaliações de capacidades,
            ações e snapshots disponíveis neste ambiente ainda não possuem correspondência
            confirmada com o mesmo ciclo. Para evitar conclusões indevidas, a apresentação
            executiva e a emissão do snapshot estão temporariamente indisponíveis.
          </p>
          <p className="text-xs text-amber-900">
            Os registros da investigação permanecem preservados. Não é necessário repetir entrevistas.
          </p>
          {originalResponses.some(response => response.doorId === 'D1.2') && (
            <section className="rounded-lg border border-slate-200 bg-white p-4 space-y-3" aria-label="Síntese preliminar da escuta D1.2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">O que já podemos apresentar — escuta D1.2</h3>
                <p className="text-xs text-slate-600 mt-1">Registro preliminar de entrevista, não avaliação concluída de capacidade ou maturidade.</p>
              </div>
              {(() => {
                const responses = originalResponses.filter(response => response.doorId === 'D1.2');
                const linkedUpdates = responses.filter(response =>
                  response.isRetificationOfResponseId || response.isComplementOfResponseId
                );
                const originalRecords = responses.filter(response =>
                  !response.isRetificationOfResponseId && !response.isComplementOfResponseId
                );
                // Alguns registros legados trazem a complementação como novo relato
                // integral, sem vínculo explícito. Preservamos ambas as fontes e
                // evitamos apenas a repetição literal na leitura institucional.
                const isExpandedCopy = (original: string, later: string) =>
                  later.trim().startsWith(original.trim()) && later.trim() !== original.trim();
                const updates = [...linkedUpdates];
                const originals = originalRecords.filter(response => {
                  const expanded = originalRecords.find(candidate =>
                    candidate.id !== response.id &&
                    isExpandedCopy(response.originalText, candidate.originalText)
                  );
                  if (expanded && !updates.some(item => item.id === expanded.id)) {
                    updates.push(expanded);
                  }
                  return !updates.some(item => item.id === response.id);
                });
                const orderedUpdates = updates.sort((a, b) =>
                  a.timestamp.localeCompare(b.timestamp)
                );
                return (
                  <div className="space-y-3">
                    {originals.map(response => (
                      <div key={response.id} className="space-y-1">
                        <p className="text-xs font-semibold text-slate-700">Relato registrado na entrevista</p>
                        <p className="text-sm text-slate-800 whitespace-pre-wrap">{response.originalText}</p>
                      </div>
                    ))}
                    {orderedUpdates.map(response => {
                      const source = responses.find(item =>
                        item.id === response.isRetificationOfResponseId ||
                        item.id === response.isComplementOfResponseId
                      ) || originals.find(item =>
                        isExpandedCopy(item.originalText, response.originalText)
                      );
                      const sourceText = source?.originalText.trim() || '';
                      const updatedText = response.originalText.trim();
                      const addedText = sourceText && updatedText.startsWith(sourceText)
                        ? updatedText.slice(sourceText.length).trim()
                        : updatedText;
                      return (
                        <div key={response.id} className="border-l-2 border-sky-300 pl-3 space-y-1">
                          <p className="text-xs font-semibold text-slate-700">
                            {response.isRetificationOfResponseId ? 'Retificação posterior' : 'Complementação registrada posteriormente'}
                          </p>
                          <p className="text-sm text-slate-800 whitespace-pre-wrap">{addedText || updatedText}</p>
                          <p className="text-xs text-slate-500">Registro integral preservado na rastreabilidade técnica.</p>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              <p className="text-xs text-slate-600 border-t border-slate-100 pt-3">
                Próximo passo possível: confirmar, em momento oportuno, como os encaminhamentos entre áreas são realizados e acompanhados. Esta sugestão não representa obrigação, pendência formal ou conclusão de insuficiência.
              </p>
            </section>
          )}
          {canViewTechnical && (
            <button type="button" onClick={() => setActiveTab('TECHNICAL')}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
              Conferir fontes na Rastreabilidade Técnica
            </button>
          )}
          <button type="button" onClick={() => setCurrentView('HOME')}
            className="ml-2 rounded-lg border border-amber-400 px-4 py-2 text-xs font-semibold text-amber-950">
            Voltar à Visão Geral
          </button>
        </div>
      </div>
    );
  }

  // Dados validados metodologicamente
  const isValidated = integration.humanValidation.isValidated;
  const validatedLevelKey = isValidated ? integration.humanValidation.validatedLevel : null;
  const validatedLevelInfo = validatedLevelKey ? MATURITY_LEVELS_INFO[validatedLevelKey] : null;
  const hasNextLevelUnderAnalysis = isValidated && (
    validatedLevelKey !== 'N5_OTIMIZADO' && (
      pendingItems.some(p => p.status !== 'RESOLVIDA') ||
      Object.values(integration.capacities).some(c => c.status !== 'DEMONSTRADA')
    )
  );

  // Capacidades estritamente validadas como DEMONSTRADA
  const demonstratedCapacities = isValidated
    ? Object.values(integration.capacities).filter(cap => cap.status === 'DEMONSTRADA')
    : [];

  // Capacidades em estruturação
  const structuringCapacities = Object.values(integration.capacities).filter(
    cap => cap.status === 'EM_ESTRUTURACAO'
  );

  // Próxima conquista baseada na integração validada
  const nextAchievementText = isValidated ? integration.nextInstitutionalAchievement : null;

  // Entrevista identificada apenas para sinalizar a etapa de revisão.
  // Unidades validadas na escuta não autorizam publicação automática.
  const hasD12Interview = originalResponses.some(response => response.doorId === 'D1.2');

  // Ações pactuadas (no máximo 3 para o Retrato Executivo, apenas se o ciclo possuir validação ou ações formalizadas)
  const priorityActions = isValidated ? actions.slice(0, 3) : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 print:p-0">
      {/* HUB HEADER & SELETOR DE SAÍDAS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight">Relatórios &amp; Saídas Metodológicas</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            Representações derivadas da base metodológica dimensional. A profundidade técnica pertence à plataforma, a síntese pertence à entrega gerencial e a rastreabilidade conecta ambas.
          </p>
          <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
            <span>Organização: <strong className="text-slate-200">{currentOrg.name}</strong></span>
            <span>•</span>
            <span>Perfil: <strong className="text-slate-200 font-mono">{currentUser.role}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Voltar ao Hub</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* NAVEGAÇÃO INTERNA DO HUB (ABAS POR PERFIL) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 no-print gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          {/* Aba 1: Retrato Executivo */}
          {canViewExecutive && (
            <button
              onClick={() => setActiveTab('EXECUTIVE')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer select-none active:scale-[0.98] flex items-center gap-1.5 ${
                activeTab === 'EXECUTIVE'
                  ? 'bg-white text-slate-900 font-bold shadow-xs ring-1 ring-slate-300/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Retrato Executivo</span>
            </button>
          )}

          {/* Aba 2: Rastreabilidade Técnica */}
          {canViewTechnical && (
            <button
              onClick={() => setActiveTab('TECHNICAL')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer select-none active:scale-[0.98] flex items-center gap-1.5 ${
                activeTab === 'TECHNICAL'
                  ? 'bg-white text-slate-900 font-bold shadow-xs ring-1 ring-slate-300/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5 text-sky-600" />
              <span>Rastreabilidade Técnica</span>
            </button>
          )}

          {/* Aba 3: Registro Imutável (Snapshot) */}
          {canViewSnapshot && (
            <button
              onClick={() => setActiveTab('SNAPSHOT_VIEW')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer select-none active:scale-[0.98] flex items-center gap-1.5 ${
                activeTab === 'SNAPSHOT_VIEW'
                  ? 'bg-white text-slate-900 font-bold shadow-xs ring-1 ring-slate-300/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>Registro Snapshot D1</span>
            </button>
          )}

          {/* Aba 4: Saídas em Desenvolvimento */}
          <button
            onClick={() => setActiveTab('UPCOMING')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer select-none active:scale-[0.98] flex items-center gap-1.5 ${
              activeTab === 'UPCOMING'
                ? 'bg-white text-slate-900 font-bold shadow-xs ring-1 ring-slate-300/80'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Futuras Saídas (v1.1)</span>
          </button>
        </div>

        {/* Indicador de Coerência para o Facilitador */}
        {isFacilitator && (
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Alternância autorizada: conferência entre base técnica e síntese gerencial</span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. RETRATO EXECUTIVO DA GOVERNANÇA                       */}
      {/* ======================================================== */}
      {activeTab === 'EXECUTIVE' && canViewExecutive && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 shadow-xs space-y-6 print:border-none print:p-0 print:shadow-none">
          {/* Banner de Proteção Institucional */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 flex items-center gap-2.5 no-print">
            <EyeOff className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong>Finalidade Gerencial:</strong> Síntese de governança orientada à Presidência e Mesa Diretora. Não expõe falas individuais, identidades de servidores ou controvérsias operacionais, distinguindo informações levantadas, resultados formalmente validados e pontos ainda em avaliação.
            </span>
          </div>

          {/* Esclarecimento quando acessado pelo Interlocutor Principal */}
          {currentUser.role === 'INTERLOCUTOR_PRINCIPAL' && (
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-900 flex items-center gap-2.5 no-print">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                <strong>Acesso do Encarregado:</strong> Síntese destinada à gestão institucional. Você possui acesso para acompanhamento da evolução da governança.
              </span>
            </div>
          )}

          {/* Cabeçalho do Documento */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase block">
                METODOLOGIA DE GOVERNANÇA DE PRIVACIDADE · PILOTO D1 V1.0
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
                Retrato Executivo da Governança
              </h1>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                {currentOrg.name} ({currentOrg.municipality} - {currentOrg.state}) • Ciclo: {currentOrg.activeCycleName}
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500 font-mono shrink-0">
              <span className="block">Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</span>
              <span className="block text-[11px] text-slate-400">Dimensão D1 — Governança e Responsabilidades</span>
            </div>
          </div>

          {/* BLOCO 1: ONDE ESTAMOS (Dimensão e Nível Validado) */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              1. Onde Estamos (Diagnóstico de Maturidade)
            </span>

            <div className={`p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isValidated 
                ? 'bg-emerald-50/70 border-emerald-200' 
                : 'bg-amber-50/80 border-amber-200'
            }`}>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider block text-slate-600">
                  {isValidated ? 'Classificação de Maturidade Validada:' : 'Estado da Avaliação:'}
                </span>
                <div className={`text-xl sm:text-2xl font-black font-mono ${
                  isValidated ? 'text-emerald-950' : 'text-amber-900'
                }`}>
                  {isValidated ? (
                    <div className="space-y-0.5">
                      <div>Nível consolidado: {formatMaturityLevel(validatedLevelKey)}</div>
                      {hasNextLevelUnderAnalysis && (
                        <div className="text-xs sm:text-sm font-semibold text-emerald-800 font-sans">
                          Próximo nível: em análise
                        </div>
                      )}
                    </div>
                  ) : (
                    'Em avaliação'
                  )}
                </div>
                <p className="text-xs text-slate-700 font-serif leading-relaxed max-w-2xl mt-1">
                  {isValidated 
                    ? (validatedLevelInfo?.shortDesc || integration.humanValidation.validationNotes || validatedLevelInfo?.criteriaText)
                    : 'A avaliação está em andamento. O estágio de maturidade será apresentado após a validação metodológica.'}
                </p>
              </div>

              {isValidated && (
                <div className="bg-white/90 p-2.5 sm:p-3 rounded-lg border border-emerald-200 text-left sm:text-center shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Validação Metodológica</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">{cleanPresentationText(integration.humanValidation.facilitatorName)}</span>
                  <span className="text-[10px] text-emerald-700 font-semibold block flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" /> Concluída formalmente
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* BLOCO 2: O QUE JÁ ESTÁ DEMONSTRADO */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              2. O que já está Demonstrado na Instituição
            </span>

            {demonstratedCapacities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {demonstratedCapacities.map(cap => {
                  const def = CAPACITIES_DEFINITIONS.find(d => d.id === cap.capacityId);
                  return (
                    <div key={cap.capacityId} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 font-mono">{cap.capacityId} — {def?.name}</span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          DEMONSTRADA
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] font-serif leading-relaxed">
                        {cap.rationale}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-serif">
                Ainda não há capacidades com demonstração prática sustentada formalmente validada no ciclo.
              </div>
            )}
          </div>

          {/* A publicação da síntese individualizada exige revisão humana específica. */}
          {!isValidated && hasD12Interview && (
            <section className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Encaminhamentos entre áreas (D1.2)
              </h2>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs text-slate-700">
                <p>A instituição participou da escuta sobre como são encaminhadas demandas relacionadas à proteção de dados.</p>
                <p>A síntese individualizada desse relato está em revisão e será apresentada após confirmação humana. A entrevista, por si só, não determina o estágio de maturidade nem comprova a execução das práticas relatadas.</p>
              </div>
            </section>
          )}

          {/* BLOCO 3: PRÓXIMA CONQUISTA INSTITUCIONAL */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              3. Próxima Conquista Institucional Almejada
            </span>

            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                Meta Estruturante do Ciclo:
              </span>
              <p className="text-slate-200 text-xs sm:text-sm font-serif leading-relaxed">
                {nextAchievementText || 'Próximo avanço a definir com a instituição, a partir das informações levantadas.'}
              </p>
            </div>
          </div>

          {/* BLOCO 4: PRIORIDADES DO CICLO (Máximo 3 Ações Validadas) */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                4. Prioridades Pactuadas para o Ciclo
              </span>
              {priorityActions.length > 0 && (
                <span className="text-[11px] text-slate-500 font-medium">
                  {priorityActions.length} ações prioritárias pactuadas
                </span>
              )}
            </div>

            {priorityActions.length > 0 ? (
              <div className="space-y-2.5">
                {priorityActions.map(act => (
                  <div key={act.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                    <div className="space-y-1 flex-1">
                      <div className="font-bold text-slate-900">{act.actionTitle}</div>
                      <div className="text-slate-600 text-[11px] font-serif">
                        <strong>Resultado Pretendido:</strong> {act.expectedResult}
                      </div>
                    </div>
                    <div className="sm:text-right shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                      <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded inline-block">
                        Prazo: {act.deadlineOrPhase}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Responsáveis: {act.actors.join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-serif">
                {isValidated
                  ? 'Nenhuma ação prioritária foi cadastrada no Plano de Evolução deste ciclo.'
                  : 'Ainda não há ações pactuadas. As orientações preliminares podem ser examinadas pela instituição, sem constituir compromissos ou exigências de registro.'}
                {!isValidated && (
                  <div className="mt-3 space-y-2 text-slate-700">
                    <p><strong>Como avançar:</strong> a instituição pode examinar uma situação real relacionada à governança e verificar se os registros existentes já permitem compreender o encaminhamento e seu resultado. Não é necessário criar controles apenas para atender ao relatório.</p>
                    <p><strong>Como demonstrar:</strong> se decidir realizar essa atividade, poderá registrar um resumo na VIPAZ e associar uma evidência já existente, quando disponível. Esse registro serve ao acompanhamento institucional; não é prestação de contas a órgão fiscalizador.</p>
                    <p><strong>Como acompanhar:</strong> em uma próxima interação, a instituição poderá informar o que realizou ou retomar a orientação posteriormente. A ausência desse registro não constitui, por si só, descumprimento.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BLOCO 5: COMO ACOMPANHAREMOS & PRÓXIMA REVISÃO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                5. Como Acompanharemos (Métrica e Indicador)
              </span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  {isValidated && snapshot?.experimentalIndicatorBaseline?.name || 'Indicador de Continuidade das Ações'}
                </span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {isValidated && snapshot?.experimentalIndicatorBaseline 
                    ? `${snapshot.experimentalIndicatorBaseline.trackedPercentage}% (Baseline)`
                    : 'Em Aferição'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Acompanhamento periódico da tração das ações pactuadas, evitando planos formais desprovidos de execução continuada.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                6. Próxima Revisão Institucional
              </span>
              <div className="font-bold text-slate-800">
                {isValidated && snapshot?.scheduledNextReview 
                  ? (snapshot.scheduledNextReview.includes('-') ? new Date(snapshot.scheduledNextReview).toLocaleDateString('pt-BR') : snapshot.scheduledNextReview)
                  : 'A definir conforme pactuação institucional'}
              </div>
              <p className="text-[11px] text-slate-500">
                Ciclo ordinário de revisão da maturidade dimensional e verificação dos critérios de avanço para os níveis subsequentes.
              </p>
            </div>
          </div>

          {/* Rodapé e Autenticação */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2">
            <span>
              {isValidated ? (
                <>Validação metodológica concluída em {integration.humanValidation.validatedAt ? new Date(integration.humanValidation.validatedAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')} — responsável: {integration.humanValidation.facilitatorName}.</>
              ) : (
                <>Síntese preliminar do ciclo, sujeita à validação metodológica. Não constitui classificação definitiva de maturidade.</>
              )}
            </span>
            <span className="font-mono">
              Ciclo: {currentOrg.activeCycleName}
            </span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. RASTREABILIDADE TÉCNICA DE AUDITORIA                  */}
      {/* ======================================================== */}
      {activeTab === 'TECHNICAL' && canViewTechnical && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6 print:border-none print:p-0 print:shadow-none">
          {/* Cabeçalho da Rastreabilidade */}
          <div className="border-b-2 border-slate-900 pb-4">
            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase block">
              CADEIA DE CUSTÓDIA METODOLÓGICA · AUDITORIA ANALÍTICA
            </span>
            <h1 className="text-xl font-bold text-slate-950 mt-1">
              Rastreabilidade Técnica das Capacidades (C1 a C6)
            </h1>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Estruturação ponta a ponta que conecta cada <strong>conclusão validada</strong> aos seus <strong>dados derivados</strong> (racional e suficiência) e <strong>dados primários</strong> (unidades de informação e evidências documentais).
            </p>
          </div>

          {investigationProvenance.source === 'CENTRAL' && investigationProvenance.reconciliation === 'PENDING' && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 print:hidden" role="status">
              <strong>Proveniência: investigação central — ciclo {investigationProvenance.cycleId}.</strong>
              <p className="mt-1">As avaliações de capacidades e o snapshot abaixo podem pertencer a um estado local anterior e não estão reconciliados com este ciclo. Não utilizar essas classificações como conclusão institucional até conferência específica.</p>
            </div>
          )}
          {/* Conferência das fontes antes de qualquer síntese institucional. Não publica respostas individuais. */}
          <section className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 space-y-3 print:hidden">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Conferência da investigação para o relatório</h2>
              <p className="text-xs text-slate-600 mt-1">
                Área restrita à facilitação. Os registros abaixo são fontes para revisão humana,
                não conclusões de maturidade nem texto autorizado para publicação.
              </p>
            </div>
            {(['D1.1', 'D1.2', 'D1.3', 'D1.4', 'D1.5', 'D1.6'] as const).map(doorId => {
              const doorResponses = originalResponses.filter(response => response.doorId === doorId);
              const doorUnits = informationUnits.filter(unit => unit.doorId === doorId && unit.validationStatus === 'VALIDADO');
              // Preservar resposta original e retificações na trilha de auditoria.
              const orderedResponses = [...doorResponses].sort((left, right) =>
                left.timestamp.localeCompare(right.timestamp)
              );
              return (
                <details key={doorId} className="rounded-lg border border-slate-200 bg-white p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-slate-800">
                    {doorId} · {doorResponses.length} relato(s) · {doorUnits.length} informação(ões) validada(s) na escuta
                  </summary>
                  {orderedResponses.length === 0 ? (
                    <p className="text-xs text-slate-500 mt-3">Ainda não há relatos registrados nesta porta.</p>
                  ) : (
                    <div className="space-y-3 mt-3">
                      {orderedResponses.map(response => (
                        <div key={response.id} className="border-l-2 border-slate-300 pl-3">
                          <p className="text-[11px] font-semibold text-slate-600">
                            Fonte registrada · {response.isRetificationOfResponseId ? 'retificação' : response.isComplementOfResponseId ? 'complementação' : 'resposta original'}
                          </p>
                          <p className="text-xs text-slate-700 whitespace-pre-wrap mt-1">{response.originalText}</p>
                        </div>
                      ))}
                      <p className="text-[11px] text-slate-500">
                        Antes de elaborar a síntese, confirmar o sentido do relato, as limitações das fontes e
                        a eventual existência de evidências. Não inferir ausência de prática a partir de ausência de anexo.
                      </p>
                    </div>
                  )}
                </details>
              );
            })}
          </section>

          {/* Legenda de Tipologia da Informação */}
          <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <span className="font-bold text-slate-700">Tipologia Metodológica:</span>
            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-semibold">
              CONCLUSÃO VALIDADA
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-mono font-semibold">
              DADO DERIVADO (Racional / Análise)
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono font-semibold">
              DADO PRIMÁRIO (Fatos / Evidências)
            </span>
          </div>

          {/* Lista de Capacidades C1 a C6 com Tripla Diferenciação */}
          <div className="space-y-5">
            {CAPACITIES_DEFINITIONS.map(cap => {
              const capAssessment = integration.capacities[cap.id];
              const relatedUnits = informationUnits.filter(u => u.relatedCapacity === cap.id);
              const relatedEvidences = evidences.filter(e => e.relatedCapacities.includes(cap.id));
              const isDem = capAssessment?.status === 'DEMONSTRADA';
              const isStruct = capAssessment?.status === 'EM_ESTRUTURACAO';

              return (
                <div key={cap.id} className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs space-y-4">
                  {/* CAMADA 1: CONCLUSÃO VALIDADA */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2.5 py-1 rounded">
                        {cap.id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{cap.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Classificação:</span>
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                        isDem ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        isStruct ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {capAssessment?.status?.replace(/_/g, ' ') || 'NÃO APURADA'}
                      </span>
                    </div>
                  </div>

                  {/* CAMADA 2: DADO DERIVADO (Racional Metodológico e Limitações) */}
                  <div className="bg-sky-50/60 border border-sky-200 rounded-lg p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-950 uppercase tracking-wider text-[10px]">
                        Dado Derivado • Racional Metodológico da Avaliação
                      </span>
                      <span className="text-[10px] text-sky-700 font-mono">Análise de Suficiência</span>
                    </div>
                    <p className="text-slate-800 font-serif leading-relaxed">
                      {capAssessment?.rationale || 'Nenhum racional fático registrado para esta capacidade.'}
                    </p>

                    {/* Insuficiências ou Limitações Registradas */}
                    {capAssessment?.insufficiencies && capAssessment.insufficiencies.length > 0 && (
                      <div className="pt-2 border-t border-sky-200/80 text-[11px] text-amber-900">
                        <strong>Limitações e Insuficiências:</strong>
                        <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                          {capAssessment.insufficiencies.map((ins, idx) => (
                            <li key={idx}>{ins}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* CAMADA 3: DADOS PRIMÁRIOS (Unidades de Informação e Evidências) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                    {/* Unidades de Informação Suportantes */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                          Dado Primário • Unidades Fáticas ({relatedUnits.length})
                        </span>
                        <span className="text-[10px] text-slate-400">Declarações Registradas</span>
                      </div>

                      {relatedUnits.length === 0 ? (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 italic text-[11px]">
                          Nenhuma unidade fática associada diretamente.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {relatedUnits.map(u => (
                            <div key={u.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <span>Fonte: <strong>{u.sourceName}</strong> ({u.sourceRole})</span>
                                <span className="font-mono text-slate-700 bg-slate-200 px-1.5 py-0.2 rounded text-[9px]">
                                  {u.scope}
                                </span>
                              </div>
                              <p className="text-slate-800 text-[11px] font-medium leading-relaxed">
                                “{u.statement}”
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Evidências Documentais Analisadas */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900 uppercase tracking-wider text-[10px]">
                          Dado Primário • Evidências Documentais ({relatedEvidences.length})
                        </span>
                        <span className="text-[10px] text-purple-600 font-mono">Comprovação Fática</span>
                      </div>

                      {relatedEvidences.length === 0 ? (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 italic text-[11px]">
                          Nenhum documento formal vinculado a esta capacidade.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {relatedEvidences.map(e => (
                            <div key={e.id} className="p-2.5 bg-purple-50/70 rounded-lg border border-purple-200 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-purple-950 text-[11px]">{e.title}</span>
                                <span className="text-[9px] font-mono bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded font-bold">
                                  {e.status}
                                </span>
                              </div>
                              <p className="text-purple-900 text-[11px]">
                                <strong>Suficiência:</strong> {e.sufficiencyNotes || 'Em análise técnica.'}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. REGISTRO SNAPSHOT D1 (LINK / ATALHO DENTRO DO HUB)   */}
      {/* ======================================================== */}
      {activeTab === 'SNAPSHOT_VIEW' && canViewSnapshot && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-purple-700 uppercase block">
                REGISTRO TÉCNICO IMUTÁVEL DA DIMENSÃO D1
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                Snapshot Metodológico do Ciclo
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Congelamento de baseline que registra o estado validado para rastreabilidade histórica e comparação entre ciclos.
              </p>
            </div>

            <button
              onClick={() => setCurrentView('SNAPSHOT')}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Award className="w-4 h-4 text-purple-200" />
              <span>Abrir Documento Integral do Snapshot</span>
            </button>
          </div>

          {snapshot ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">ID do Registro:</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{snapshot.snapshotId}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Nível Validado:</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {formatMaturityLevel(snapshot.validatedLevel)}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 block text-xs">Enquadramento Metodológico:</span>
                <p className="text-slate-600 leading-relaxed font-serif text-xs">
                  O Snapshot constitui um registro técnico de baseline do estado validado da Dimensão D1 neste ciclo. Ele preserva o histórico e permite a rastreabilidade interna, sem configurar certificação oficial de conformidade ou garantia prévia perante órgãos de controle externos.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
              <Lock className="w-6 h-6 text-slate-400 mx-auto" />
              <div className="font-bold text-slate-800 text-xs">Snapshot ainda não lacrado</div>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                O registro técnico imutável requer validação metodológica formal na aba de Integração C1–C6.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. FUTURAS SAÍDAS (EM DESENVOLVIMENTO)                   */}
      {/* ======================================================== */}
      {activeTab === 'UPCOMING' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Saídas do Piloto D1 em Desenvolvimento (v1.1)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Módulos documentais previstos para as próximas etapas do piloto metodológico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800">Relatório de Diagnóstico e Evolução</h3>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                  Em Desenvolvimento
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Documento técnico-institucional unificado que consolida o diagnóstico da Dimensão D1, a árvore de gaps e o plano de evolução com seus respectivos marcos temporais.
              </p>
            </div>

            <div className="p-5 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800">Versão Publicável (Transparência Ativa)</h3>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                  Em Desenvolvimento
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Minuta institucional higienizada de dados pessoais e operacionais sensíveis, formatada especificamente para publicação em Diário Oficial ou Portal de Transparência da Câmara.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
