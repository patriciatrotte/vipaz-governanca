import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { Organization, CycleStatus } from '../types';
import { 
  Building2, 
  Plus, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Info,
  X,
  FileCheck,
  ChevronRight,
  Layers,
  UserCheck
} from 'lucide-react';
import { CycleStatusBadge } from './MethodologyBadges';
import { SimulationExperienceModal } from './SimulationExperienceModal';

export const OrganizationsHubView: React.FC = () => {
  const { 
    organizations, 
    selectOrganization, 
    createOrganization, 
    startD1Cycle, 
    getOrganizationSummary 
  } = usePilot();

  // Estados de navegação interna do Hub
  const [modalMode, setModalMode] = useState<'NONE' | 'CREATE_ORG' | 'START_CYCLE'>('NONE');
  const [createdOrgTemp, setCreatedOrgTemp] = useState<Organization | null>(null);
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [pendingOrgIdForSimulation, setPendingOrgIdForSimulation] = useState<string | null>(null);

  // Formulário de Nova Organização (Tela 2)
  const [orgName, setOrgName] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [stateUf, setStateUf] = useState('');
  const [interlocutorName, setInterlocutorName] = useState('');
  const [interlocutorRole, setInterlocutorRole] = useState('');
  const [interlocutorEmail, setInterlocutorEmail] = useState('');
  const [formError, setFormError] = useState('');

  // Abrir modal de criação
  const handleOpenCreate = () => {
    setOrgName('');
    setMunicipality('');
    setStateUf('');
    setInterlocutorName('');
    setInterlocutorRole('');
    setInterlocutorEmail('');
    setFormError('');
    setModalMode('CREATE_ORG');
  };

  // Salvar Organização (Tela 2 -> Tela 3)
  const handleSaveOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      setFormError('Informe o nome oficial da organização.');
      return;
    }

    const newOrg = createOrganization({
      name: orgName.trim(),
      vertical: 'Poder Público Municipal — Câmara Municipal',
      municipality: municipality.trim() || undefined,
      state: stateUf.trim().toUpperCase() || undefined,
      mainInterlocutorName: interlocutorName.trim() || undefined,
      mainInterlocutorRole: interlocutorRole.trim() || undefined,
      mainInterlocutorEmail: interlocutorEmail.trim() || undefined
    });

    setCreatedOrgTemp(newOrg);
    setModalMode('START_CYCLE');
  };

  // Iniciar Ciclo D1 (Tela 3)
  const handleConfirmStartCycle = () => {
    if (!createdOrgTemp) return;
    startD1Cycle(createdOrgTemp.id);
    setModalMode('NONE');
    setCreatedOrgTemp(null);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* CABEÇALHO DA CENTRAL (TELA 1) - HERO AZUL-MARINHO */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            Metodologia de Maturidade e Evolução em Governança de Privacidade · D1 v1.0
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Piloto Dimensional — Governança de Privacidade
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed font-serif">
            Selecione uma organização para continuar sua jornada ou inicie uma nova aplicação.
          </p>

          <div className="pt-2">
            <button
              onClick={handleOpenCreate}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-white" />
              Nova organização
            </button>
          </div>
        </div>

        {/* Princípio Central D1 */}
        <div className="bg-slate-950/80 border border-slate-700 rounded-xl p-5 flex flex-col justify-center space-y-2.5 lg:min-w-[280px] shrink-0">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Princípio Fundamental:</span>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-sky-300">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="font-semibold">IA RECOMENDA</span>
            </div>
            <div className="flex items-center gap-2 text-purple-300">
              <FileCheck className="w-4 h-4 text-purple-400" />
              <span className="font-semibold">EVIDÊNCIA COMPROVA</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">HUMANO VALIDA</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODO DE SIMULAÇÃO — AMBIENTE DE TESTE */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 text-lg shrink-0">
            🧪
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                Modo de Simulação
              </span>
              <span className="text-xs font-semibold text-slate-700">
                Ambiente de Demonstração e Teste
              </span>
            </div>
            <p className="text-xs text-slate-600 font-serif leading-relaxed">
              Ambiente de teste — a troca de perfil simula experiências de usuários com diferentes responsabilidades. Na versão de produção, o usuário será autenticado e terá acesso exclusivo ao seu papel.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setPendingOrgIdForSimulation('org-camara-vila-esperanca-01');
            setSimulationModalOpen(true);
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          <span>Escolha a experiência que deseja simular</span>
        </button>
      </div>

      {/* SEÇÃO: ORGANIZAÇÕES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Organizações</h2>
            <p className="text-xs text-slate-500">
              Selecione uma organização para acessar seu ciclo de avaliação e evolução.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {organizations.length} {organizations.length === 1 ? 'organização' : 'organizações'}
          </span>
        </div>

        {/* Grid de Cards de Organizações (2 colunas desktop, 1 coluna telas menores) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {organizations.map(org => {
            const summary = getOrganizationSummary(org.id);
            const isCompleted = summary.cycleStatus === 'CONCLUIDO_VALIDADO';
            const actionLabel = isCompleted ? 'Consultar' : 'Continuar';

            return (
              <div 
                key={org.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 relative"
              >
                {/* Linha Superior: Nome e Badges */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        org.isDemo 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-base leading-snug">
                            {org.name}
                          </h3>
                          {org.isDemo && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.2 rounded">
                              Demonstração / Teste
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 block">
                          {summary.vertical}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <CycleStatusBadge status={summary.cycleStatus} />
                    </div>
                  </div>

                  {/* Informações Metodológicas do Ciclo */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Dimensão / Ciclo Atual
                      </span>
                      <span className="font-medium text-slate-800 block truncate" title={summary.cycleName}>
                        {summary.cycleName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Versão {summary.methodologyVersion}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Última Atividade
                      </span>
                      <span className="font-medium text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {summary.lastActivityDate || 'Em aberto'}
                      </span>
                    </div>
                  </div>

                  {/* Pendências Bloqueantes (quando houver) */}
                  <div className="pt-2">
                    {summary.blockingPendingCount > 0 ? (
                      <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="font-semibold">
                          {summary.blockingPendingCount} {summary.blockingPendingCount === 1 ? 'pendência bloqueante ativa' : 'pendências bloqueantes ativas'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Nenhuma pendência bloqueante no momento</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rodapé do Card com Ação */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingOrgIdForSimulation(org.id);
                      setSimulationModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 transition-colors cursor-pointer"
                    title="Simular com um perfil específico (Encarregado, Gestor, Facilitador, Participante)"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                    <span>Simular experiência</span>
                  </button>

                  <button
                    onClick={() => selectOrganization(org.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isCompleted 
                        ? 'bg-slate-800 hover:bg-slate-900 text-white' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    }`}
                  >
                    <span>{actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TELA 2 — MODAL: NOVA ORGANIZAÇÃO */}
      {modalMode === 'CREATE_ORG' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Cadastrar Nova Organização
                </h3>
              </div>
              <button
                onClick={() => setModalMode('NONE')}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aviso Metodológico Essencial */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-xs text-sky-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-sky-950">
                <Info className="w-4 h-4 text-sky-600 shrink-0" />
                Salvaguarda Metodológica do Diagnóstico Fático
              </div>
              <p className="leading-relaxed font-serif">
                A metodologia D1 <strong>não exige</strong> organograma prévio completo, relação exaustiva de todas as áreas ou desenho ideal de governança. As práticas e interlocuções reais da Câmara serão descobertas progressivamente através das 6 portas de investigação.
              </p>
            </div>

            <form onSubmit={handleSaveOrganization} className="space-y-4 text-xs">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                </div>
              )}

              {/* Nome da Organização */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">
                  Nome da Organização <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Câmara Municipal de Nova Esperança"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 text-xs"
                />
              </div>

              {/* Vertical Fixa no Piloto */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Tipo / Vertical</label>
                <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center justify-between">
                  <span>Poder Público Municipal — Câmara Municipal</span>
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono">Fixo no Piloto D1</span>
                </div>
              </div>

              {/* Município e Estado (Opcionais) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">Município (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Nova Esperança"
                    value={municipality}
                    onChange={e => setMunicipality(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">UF (opcional)</label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="Ex: SP"
                    value={stateUf}
                    onChange={e => setStateUf(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg uppercase focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>

              {/* Interlocutor Principal Inicial (Opcional) */}
              <div className="border-t border-slate-200 pt-3 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">
                  Interlocutor Principal Inicial (opcional)
                </span>
                <p className="text-[11px] text-slate-500">
                  Identifique a pessoa que acompanhará a recepção das primeiras perguntas da investigação.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nome completo do interlocutor"
                    value={interlocutorName}
                    onChange={e => setInterlocutorName(e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Cargo ou área (ex: Procuradoria / Encarregado)"
                    value={interlocutorRole}
                    onChange={e => setInterlocutorRole(e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <input
                  type="email"
                  placeholder="E-mail institucional de contato"
                  value={interlocutorEmail}
                  onChange={e => setInterlocutorEmail(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Botões do Formulário */}
              <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode('NONE')}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Salvar e Continuar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TELA 3 — MODAL: INICIAR CICLO D1 */}
      {modalMode === 'START_CYCLE' && createdOrgTemp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Organização Cadastrada com Sucesso
              </h3>
              <p className="text-xs text-slate-600">
                Identificador estável gerado:{' '}
                <strong className="font-mono text-slate-900">{createdOrgTemp.id}</strong>
              </p>
            </div>

            {/* Detalhes do Ciclo que será criado */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                <span>Parâmetros do Primeiro Ciclo</span>
                <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                  INITIAL_ASSESSMENT
                </span>
              </div>

              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Organização:</span>
                  <span className="font-bold text-slate-900">{createdOrgTemp.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dimensão:</span>
                  <span className="font-bold text-slate-900">D1 — Governança e Responsabilidades</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Versão Metodológica:</span>
                  <span className="font-mono font-bold text-slate-900">D1 v1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Inicial:</span>
                  <span className="font-bold text-slate-700">NÃO INICIADO</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
                O ciclo será iniciado com todas as 6 portas limpas para investigação fática sem presunção de conformidade.
              </p>
            </div>

            {/* Ação de Iniciar Ciclo D1 */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setModalMode('NONE');
                  setCreatedOrgTemp(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold"
              >
                Voltar à Central
              </button>
              <button
                type="button"
                onClick={handleConfirmStartCycle}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Layers className="w-4 h-4" />
                Iniciar avaliação D1
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Escolha de Experiência no Modo de Simulação */}
      <SimulationExperienceModal 
        isOpen={simulationModalOpen} 
        onClose={() => {
          setSimulationModalOpen(false);
          setPendingOrgIdForSimulation(null);
        }}
        onSelectExperience={(_role, _user) => {
          if (pendingOrgIdForSimulation) {
            selectOrganization(pendingOrgIdForSimulation);
            setPendingOrgIdForSimulation(null);
          }
        }}
      />
    </div>
  );
};
