import React, { useState } from 'react';
import { getInstitutionalAccessToken } from '../services/institutionalAuth';
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
  initialTab?: 'EXECUTIVE' | 'TECHNICAL' | 'INVESTIGATION' | 'SNAPSHOT_VIEW' | 'UPCOMING';
  onBackToHub?: () => void;
}

export const OutputsView: React.FC<OutputsViewProps> = ({ initialTab, onBackToHub }) => {
  const { 
    currentOrg,
    currentCycle,
    integration, 
    snapshot, 
    informationUnits, 
    originalResponses, 
    questionInstances, 
    evidences, 
    pendingItems,
    actions,
    currentUser,
    setCurrentView,
    isLoadingCentral,
    isCentralAvailable
  } = usePilot();

  const [snapshotLookup, setSnapshotLookup] = useState<{ cycleId: string; message: string } | null>(null);
  const [snapshotLookupBusy, setSnapshotLookupBusy] = useState(false);
  async function checkCentralSnapshot() {
    const cycleId = currentCycle?.id || '';
    const token = getInstitutionalAccessToken();
    if (!cycleId || !token) {
      setSnapshotLookup({ cycleId, message: !cycleId ? 'Nenhum ciclo selecionado.' : 'Autenticação institucional necessária.' });
      return;
    }
    setSnapshotLookupBusy(true);
    setSnapshotLookup(null);
    try {
      const response = await fetch('/api/data/verifiedSnapshot?cycleId=' + encodeURIComponent(cycleId), {
        headers: { Authorization: 'Bearer ' + token }, cache: 'no-store'
      });
      if (!response.ok) throw new Error(response.status === 403 ? 'Acesso não autorizado.' : response.status === 401 ? 'Sessão institucional inválida.' : 'Consulta central indisponível.');
      const data = await response.json();
      const record = data?.snapshot;
      const centralContextMatches = Boolean(record && currentOrg &&
        record.organization_id === currentOrg.id && record.cycle_id === cycleId);
      const localContextMatches = Boolean(snapshot && currentOrg &&
        snapshot.organizationId === currentOrg.id && snapshot.cycleId === cycleId);
      const methodologyMatches = Boolean(record && snapshot &&
        record.methodology_version === snapshot.methodologyVersion);
      const contentComparison = !record || !localContextMatches || !methodologyMatches
        ? 'Conteúdo não comparável nas condições atuais.'
        : record.payload && typeof record.payload === 'object' && !Array.isArray(record.payload)
          ? JSON.stringify(record.payload) === JSON.stringify(snapshot)
            ? 'Conteúdo JSON idêntico na ordem serializada; autenticidade e aprovação institucional não verificadas.'
            : 'Conteúdo JSON não idêntico ou estruturado de modo diferente; revisão necessária.'
          : 'Payload central ausente ou incompatível; comparação indisponível.';
      const comparison = !record ? '' : !centralContextMatches
        ? ' ALERTA: o registro retornado não corresponde à Câmara e ao ciclo selecionados.'
        : !localContextMatches
          ? ' Não há snapshot local correspondente para comparar.'
          : !methodologyMatches
            ? ' Divergência de versão metodológica entre registro central e snapshot local.'
            : ' Identificadores e versão metodológica compatíveis. ' + contentComparison;
      setSnapshotLookup({ cycleId, message: record
        ? 'Snapshot central localizado. Tipo: ' + String(record.snapshot_kind || 'não informado') + '; data: ' + String(record.captured_at || 'não informada') + '; versão: ' + String(record.methodology_version || 'não informada') + '.' + comparison
        : 'Nenhum snapshot central encontrado para este ciclo. A versão apresentada pode ser apenas local.' });
    } catch (error) {
      setSnapshotLookup({ cycleId, message: error instanceof Error ? error.message : 'Erro de consulta.' });
    } finally {
      setSnapshotLookupBusy(false);
    }
  }

  const [preflight, setPreflight] = useState<{ cycleId: string; message: string } | null>(null);
  const [preflightBusy, setPreflightBusy] = useState(false);
  async function checkSnapshotEligibility() {
    const cycleId = currentCycle?.id || '';
    const token = getInstitutionalAccessToken();
    if (!cycleId || !token) {
      setPreflight({ cycleId, message: !cycleId ? 'Selecione um ciclo.' : 'Entre com sua conta institucional.' });
      return;
    }
    setPreflightBusy(true);
    setPreflight(null);
    try {
      const response = await fetch('/api/data/snapshotPreflight?cycleId=' + encodeURIComponent(cycleId), {
        headers: { Authorization: 'Bearer ' + token }, cache: 'no-store'
      });
      const data = await response.json();
      if (!response.ok) {
        const reasons: Record<string, string> = {
          invalid_cycle_id: 'Identificador do ciclo incompatível com o registro central.',
          authentication_required: 'Sessão institucional ausente ou inválida.',
          cycle_not_visible: 'O ciclo não está disponível para sua identidade institucional.',
          access_denied: 'Acesso ao ciclo não autorizado.',
          institutional_auth_not_configured: 'Autenticação institucional indisponível.',
          cycle_scope_unavailable: 'Não foi possível verificar o ciclo no Supabase.',
          preflight_unavailable: 'Serviço de verificação temporariamente indisponível.'
        };
        setPreflight({ cycleId, message: reasons[data?.error] || 'Não foi possível concluir a pré-verificação.' });
        return;
      }
      const sameOrg = Boolean(currentOrg && data.organizationId === currentOrg.id);
      const sameMethodology = Boolean(snapshot && data.methodologyVersion === snapshot.methodologyVersion);
      setPreflight({ cycleId, message: !sameOrg
        ? 'Impedimento: a Câmara selecionada não corresponde à organização do ciclo central.'
        : !sameMethodology
          ? 'Impedimento: versão metodológica do snapshot local não confirmada para o ciclo central.'
          : 'Identidade e ciclo visíveis no Supabase. Emissão ainda bloqueada: falta autorização de escrita e validação metodológica central.' });
    } catch {
      setPreflight({ cycleId, message: 'Não foi possível acessar a pré-verificação.' });
    } finally {
      setPreflightBusy(false);
    }
  }

  // Integridade mínima do contexto: nunca apresentar snapshot de outro ciclo como documento deste ciclo.
  const snapshotContextMismatch = Boolean(snapshot && (
    !currentOrg || !currentCycle ||
    snapshot.organizationId !== currentOrg.id ||
    snapshot.cycleId !== currentCycle.id
  ));

  const localValidationConfirmed = integration?.humanValidation?.isValidated === true;
  const centralSnapshotChecked = snapshotLookup?.cycleId === (currentCycle?.id || '') && Boolean(currentCycle?.id);
  const centralSnapshotFound = centralSnapshotChecked && snapshotLookup?.message.startsWith('Snapshot central localizado.') === true;

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

  // Relatório factual da investigação: contém respostas e fontes, restrito ao facilitador.
  const canViewInvestigation = isFacilitator;

  // 3. Snapshot D1: Facilitador, Gestor (institucional) e Interlocutor (institucional).
  const canViewSnapshot = isFacilitator || isGestor || isInterlocutor;

  // Determinar aba ativa padrão permitida para o perfil
  const defaultTab = initialTab || (canViewExecutive ? 'EXECUTIVE' : canViewTechnical ? 'TECHNICAL' : 'UNAUTHORIZED');
  const [activeTab, setActiveTab] = useState<'EXECUTIVE' | 'TECHNICAL' | 'INVESTIGATION' | 'SNAPSHOT_VIEW' | 'UPCOMING'>(
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
  const demonstratedCapacities = Object.values(integration.capacities).filter(
    cap => cap.status === 'DEMONSTRADA'
  );

  // Capacidades em estruturação
  const structuringCapacities = Object.values(integration.capacities).filter(
    cap => cap.status === 'EM_ESTRUTURACAO'
  );

  // Próxima conquista baseada na integração validada
  const nextAchievementText = integration.nextInstitutionalAchievement;

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
            disabled={isLoadingCentral || (snapshotContextMismatch && activeTab !== 'INVESTIGATION')}
            title={isLoadingCentral ? 'Aguarde a recuperação do ciclo' : 'Imprimir o relatório apresentado'}
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {snapshotContextMismatch && (
        <div role="alert" className="rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900 print:border print:bg-white">
          Atenção: o snapshot disponível não corresponde à organização e ao ciclo selecionados. A impressão foi bloqueada até a correção da origem dos dados. Não utilize esta consolidação como documento institucional.
        </div>
      )}

      {/* Transparência de proveniência: recuperação central não garante consolidação metodológica central. */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950 print:border print:bg-white" role="status">
        {isLoadingCentral
          ? 'Recuperando dados do ciclo. Aguarde antes de imprimir.'
          : isCentralAvailable
            ? 'Dados investigativos recuperados da base central. A integração metodológica, o snapshot e as ações deste relatório ainda podem depender do estado local; confira sua validação antes de usar como documento institucional.'
            : 'Base central não confirmada para este ciclo. O relatório pode estar utilizando dados locais de contingência; não o trate como emissão oficial do Supabase sem conferência.'}
      </div>

      <section aria-label="Situação dos dados do ciclo" className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-slate-800 space-y-1 print:border print:bg-white">
        <p className="font-bold">Situação da investigação e consolidação</p>
        <p>Investigação: {isLoadingCentral ? 'carregando dados do ciclo' : isCentralAvailable ? 'dados investigativos recuperados do Supabase' : 'origem central não confirmada; pode haver cache local'}.</p>
        <p>Registros disponíveis nesta visualização: {informationUnits.length} unidades de informação, {originalResponses.length} respostas, {evidences.length} evidências.</p>
        <p>Consolidação metodológica: {integration.humanValidation.isValidated ? 'marcada como validada no estado da aplicação; conferir origem e autoridade' : 'não validada no estado carregado; isso não significa ausência de investigação'}.</p>
        <p>Emissão institucional: não comprovada nesta visualização. Consulte o registro central e a pré-verificação SNAP-01.</p>
      </section>

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700 space-y-2 print:hidden">
        <p className="font-semibold">Conferência do snapshot no Supabase</p>
        <div className="border-b border-slate-200 pb-3 space-y-2">
          <p className="font-semibold">SNAP-01 · Pré-verificação para emissão institucional</p>
          <p>Esta consulta não grava, aprova ou emite documentos.</p>
          <button type="button" disabled={preflightBusy || isLoadingCentral} onClick={checkSnapshotEligibility} className="rounded-lg bg-slate-700 px-3 py-2 font-semibold text-white disabled:opacity-50">
            {preflightBusy ? 'Verificando…' : 'Verificar condições para emissão'}
          </button>
          {preflight?.cycleId === (currentCycle?.id || '') && <p role="status">{preflight.message}</p>}
        </div>
        <div className="space-y-1 text-xs" role="status">
          <p>Contexto: {snapshotContextMismatch ? 'Incompatível — impressão bloqueada' : snapshot ? 'Identificadores de Câmara e ciclo compatíveis' : 'Sem snapshot local disponível'}</p>
          <p>Validação humana: {localValidationConfirmed ? 'Marcada no estado local; sem confirmação central' : 'Não confirmada no estado local'}</p>
          <p>Persistência central: {centralSnapshotFound ? 'Registro encontrado; conteúdo ainda não comparado' : centralSnapshotChecked ? 'Registro não confirmado nesta consulta' : 'Ainda não consultada para este ciclo'}</p>
        </div>

        <p>Consulta somente leitura. Não altera os dados nem a versão impressa deste relatório.</p>
        <button type="button" disabled={snapshotLookupBusy || isLoadingCentral} onClick={checkCentralSnapshot} className="rounded-lg bg-slate-800 px-3 py-2 font-semibold text-white disabled:opacity-50">
          {snapshotLookupBusy ? 'Consultando…' : 'Consultar snapshot do ciclo'}
        </button>
        {snapshotLookup?.cycleId === (currentCycle?.id || '') && <p role="status">{snapshotLookup.message}</p>}
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

          {canViewInvestigation && (
            <button type="button" onClick={() => setActiveTab('INVESTIGATION')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold ${activeTab === 'INVESTIGATION' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'}`}>
              Relatório da investigação
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

      {snapshotContextMismatch && activeTab !== 'UPCOMING' && (
        <section role="alert" className="rounded-xl border border-red-300 bg-white px-5 py-5 space-y-2 print:hidden">
          <h3 className="font-bold text-red-900">Consolidação indisponível para este ciclo</h3>
          <p className="text-sm text-slate-700">O snapshot carregado pertence a outro contexto. Para evitar atribuir resultados, validações e ações à Câmara incorreta, a apresentação das saídas consolidadas foi suspensa. Os registros originais não foram apagados ou alterados.</p>
          <p className="text-xs text-slate-600">Consulte o snapshot central e a pré-verificação SNAP-01 acima. Uma nova consolidação só poderá ser apresentada após confirmação de origem e validação.</p>
        </section>
      )}

      {activeTab === 'INVESTIGATION' && canViewInvestigation && (
        <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 space-y-5 print:border-none print:shadow-none">
          <header className="border-b-2 border-slate-900 pb-4">
            <p className="text-xs uppercase tracking-wider text-slate-600">VIPAZ · Piloto D1 · Registro investigativo</p>
            <h1 className="text-xl font-bold text-slate-950">Relatório da investigação em andamento</h1>
            <p className="text-sm text-slate-700">{currentOrg.name} · {currentCycle?.name || 'Ciclo não identificado'}</p>
            <p className="text-xs text-amber-900 mt-2">Documento de trabalho, não constitui relatório institucional validado nem conclusão de maturidade.</p>
          </header>
          {isLoadingCentral ? (
            <p>Recuperando registros do ciclo. Aguarde para imprimir.</p>
          ) : !isCentralAvailable ? (
            <p className="text-amber-900">A origem central dos dados não foi confirmada. Verifique a procedência dos registros antes de utilizar este documento.</p>
          ) : null}
          <p className="text-sm text-slate-700">
            {questionInstances.length} perguntas registradas · {originalResponses.length} respostas · {informationUnits.length} unidades de informação.
          </p>
          {questionInstances.length === 0 && originalResponses.length === 0 ? (
            <p>Não há perguntas ou respostas carregadas para este ciclo.</p>
          ) : (
            <div className="space-y-6">
              {questionInstances.map(question => {
                const answers = originalResponses.filter(answer => answer.questionInstanceId === question.id);
                return (
                  <article key={question.id} className="border-b border-slate-200 pb-4 break-inside-avoid">
                    <p className="text-xs font-bold text-slate-600">{question.doorId}</p>
                    <h2 className="font-semibold text-slate-950">{question.text}</h2>
                    {answers.length === 0 ? <p className="text-sm text-slate-500">Sem resposta registrada.</p> :
                      answers.map(answer => (
                        <div key={answer.id} className="mt-2 text-sm">
                          <p className="text-xs text-slate-600">Resposta registrada · {answer.respondentRole}</p>
                          <p className="whitespace-pre-wrap text-slate-900">{answer.originalText}</p>
                          {informationUnits.filter(unit => unit.responseId === answer.id).map(unit => (
                            <p key={unit.id} className="ml-3 mt-1 border-l-2 border-slate-300 pl-2 text-xs text-slate-700">
                              Unidade de informação ({unit.validationStatus}): {unit.statement}
                            </p>
                          ))}
                        </div>
                      ))}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ======================================================== */}
      {/* 1. RETRATO EXECUTIVO DA GOVERNANÇA                       */}
      {/* ======================================================== */}
      {!snapshotContextMismatch && activeTab === 'EXECUTIVE' && canViewExecutive && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 shadow-xs space-y-6 print:border-none print:p-0 print:shadow-none">
          {/* Banner de Proteção Institucional */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 flex items-center gap-2.5 no-print">
            <EyeOff className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong>Finalidade Gerencial:</strong> Síntese de governança orientada à Presidência e Mesa Diretora. Não expõe falas individuais, identidades de servidores ou controvérsias operacionais, consolidando estritamente os resultados validados do ciclo.
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
                    'Maturidade não consolidada neste relatório'
                  )}
                </div>
                <p className="text-xs text-slate-700 font-serif leading-relaxed max-w-2xl mt-1">
                  {isValidated 
                    ? (validatedLevelInfo?.shortDesc || integration.humanValidation.validationNotes || validatedLevelInfo?.criteriaText)
                    : 'O estado carregado não contém validação metodológica confirmada para este ciclo. A investigação pode conter registros e evidências já coletados; a ausência de consolidação aqui não significa ausência de avaliação.'}
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
                {nextAchievementText || 'Padronização dos fluxos formais de governança e consolidação das evidências operacionais.'}
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
                  : 'As prioridades do ciclo serão consolidadas na pactuação do Plano de Evolução após a validação metodológica.'}
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
                  {snapshot?.experimentalIndicatorBaseline?.name || 'Indicador de Continuidade das Ações'}
                </span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {snapshot?.experimentalIndicatorBaseline 
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
                {snapshot?.scheduledNextReview 
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
                <>Retrato Executivo derivado da base validada do Piloto Dimensional D1 v1.0.</>
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
      {!snapshotContextMismatch && activeTab === 'TECHNICAL' && canViewTechnical && (
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

          {/* Inventário das unidades ainda sem associação explícita às capacidades.
              Não inferir vínculos nem classificar capacidades automaticamente. */}
          {informationUnits.some(unit => !CAPACITIES_DEFINITIONS.some(cap => cap.id === unit.relatedCapacity)) && (
            <section className="border border-amber-200 bg-amber-50/40 rounded-xl p-4 space-y-3">
              <h2 className="font-bold text-sm text-slate-900">Unidades de informação sem vínculo explícito a C1–C6</h2>
              <p className="text-xs text-slate-700">
                Registros recuperados da investigação, ainda não associados a uma capacidade nesta base.
                A ausência de associação não significa ausência de informação, nem autoriza conclusão de maturidade.
              </p>
              <div className="space-y-2">
                {informationUnits.filter(unit => !CAPACITIES_DEFINITIONS.some(cap => cap.id === unit.relatedCapacity)).map(unit => (
                  <div key={unit.id} className="bg-white border border-slate-200 rounded-lg p-3 text-xs break-inside-avoid">
                    <p className="font-semibold text-slate-800">{unit.doorId} · {unit.validationStatus} · {unit.sourceRole}</p>
                    <p className="mt-1 whitespace-pre-wrap text-slate-800">{unit.statement}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

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
      {!snapshotContextMismatch && activeTab === 'SNAPSHOT_VIEW' && canViewSnapshot && (
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
