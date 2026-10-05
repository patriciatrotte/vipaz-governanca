import React, { useEffect, useRef, useState } from 'react';
import { ChangePasswordView, LoginView, VipazSession } from './components/LoginView';
import { PilotProvider, usePilot } from './context/PilotContext';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { DoorInvestigationView } from './components/DoorInvestigationView';
import { FacilitatorPanelView } from './components/FacilitatorPanelView';
import { DistributedInvestigationView } from './components/DistributedInvestigationView';
import { EvidencesView } from './components/EvidencesView';
import { PendingItemsView } from './components/PendingItemsView';
import { IntegrationView } from './components/IntegrationView';
import { SnapshotView } from './components/SnapshotView';
import { EvolutionPlanView } from './components/EvolutionPlanView';
import { ExperimentalIndicatorView } from './components/ExperimentalIndicatorView';
import { OutputsView } from './components/OutputsView';
import { MethodologicalDiaryView } from './components/MethodologicalDiaryView';
import { TestsHarnessView } from './components/TestsHarnessView';
import { BackupView } from './components/BackupView';
import { OrganizationsHubView } from './components/OrganizationsHubView';
import { ParticipantContributionView } from './components/ParticipantContributionView';
import { isViewAllowedForRole, getDefaultViewForRole } from './utils/rolePermissions';
import { 
  Compass, 
  ShieldCheck, 
  Sparkles, 
  FileCheck, 
  Layers,
  GitPullRequest,
  FileText,
  Clock,
  Award,
  Target,
  BarChart3,
  BookOpen,
  HelpCircle,
  Download
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView, currentOrg, currentUser, setCurrentView } = usePilot();
  const mainContentRef = useRef<HTMLElement>(null);
  const previousViewRef = useRef<string>(currentView);
  const isInitialMountRef = useRef<boolean>(true);

  // Salvaguarda de permissões: redireciona se a visualização não for permitida para o perfil ativo no Modo de Simulação
  useEffect(() => {
    if (currentOrg && currentView !== 'CENTRAL') {
      if (!isViewAllowedForRole(currentUser.role, currentView)) {
        setCurrentView(getDefaultViewForRole(currentUser.role));
      }
    }
  }, [currentUser.role, currentView, currentOrg, setCurrentView]);

  // Informações contextuais da tela ativa para orientar o usuário e confirmar a navegação
  const getContextualViewInfo = () => {
    if (!currentOrg || currentView === 'CENTRAL') return null;

    const isInterlocutor = currentUser.role === 'INTERLOCUTOR_PRINCIPAL';
    const isGestor = currentUser.role === 'GESTOR_INSTITUCIONAL';
    const isParticipant = currentUser.role === 'PARTICIPANTE';

    switch (currentView) {
      case 'HOME':
        return {
          title: isParticipant ? 'Orientações da Câmara' : 'Visão Geral',
          subtitle: isParticipant 
            ? 'Guia prático para sua contribuição fática e fornecimento de evidências'
            : 'Painel situacional focado na sua função institucional no Ciclo D1',
          icon: <Compass className="w-4 h-4 text-emerald-600" />
        };
      case 'INTERVIEW':
        return {
          title: isInterlocutor ? 'Diagnóstico Institucional' : 'Entrevista • Dimensão D1',
          subtitle: 'Apuração e descoberta fática das rotinas de governança e privacidade',
          icon: <Layers className="w-4 h-4 text-emerald-600" />
        };
      case 'DISTRIBUTED':
        return {
          title: isParticipant ? 'Minhas Contribuições' : 'Verificações com outras áreas',
          subtitle: isParticipant
            ? 'Informações solicitadas ao seu setor para complementar a investigação'
            : 'Informações que precisam ser confirmadas ou complementadas por outra pessoa ou área',
          icon: <GitPullRequest className="w-4 h-4 text-sky-600" />
        };
      case 'EVIDENCES':
        return {
          title: isParticipant ? 'Evidências do Setor' : 'Repositório de Evidências',
          subtitle: 'Comprovação documental, rastreabilidade e limites probatórios',
          icon: <FileText className="w-4 h-4 text-purple-600" />
        };
      case 'PENDING':
        return {
          title: 'Pendências & Bloqueios Metodológicos',
          subtitle: 'Gestão de lacunas probatórias e impedimentos de classificação',
          icon: <Clock className="w-4 h-4 text-rose-600" />
        };
      case 'FACILITATOR_PANEL':
        return {
          title: 'Painel Metodológico da Facilitação',
          subtitle: 'Controle de suficiência probatória e conciliação de divergências fáticas',
          icon: <ShieldCheck className="w-4 h-4 text-amber-600" />
        };
      case 'INTEGRATION':
        return {
          title: 'Síntese das Capacidades Institucionais',
          subtitle: 'Interpretação assistida, aplicação das regras e confirmação humana',
          icon: <Sparkles className="w-4 h-4 text-sky-600" />
        };
      case 'SNAPSHOT':
        return {
          title: 'Retrato D1 (Registro Imutável)',
          subtitle: 'Marco temporal auditável e histórico formal do ciclo de privacidade',
          icon: <Award className="w-4 h-4 text-emerald-600" />
        };
      case 'ACTION_PLAN':
        return {
          title: isGestor ? 'Prioridades da Gestão' : 'Plano de Evolução D1',
          subtitle: 'Espaço de evolução institucional — habilitado conforme conclusões reconhecidas',
          icon: <Target className="w-4 h-4 text-teal-600" />
        };
      case 'INDICATOR':
        return {
          title: 'Acompanhamento Institucional',
          subtitle: 'Acompanhamento de estados reconhecidos e mudanças institucionais relevantes',
          icon: <BarChart3 className="w-4 h-4 text-indigo-600" />
        };
      case 'OUTPUTS':
        return {
          title: 'Relatórios & Saídas Metodológicas',
          subtitle: 'Retrato Executivo da Governança e Rastreabilidade Técnica',
          icon: <FileText className="w-4 h-4 text-emerald-600" />
        };
      case 'DIARY':
        return {
          title: 'Diário Metodológico',
          subtitle: 'Memória fática e notas de campo da equipe de facilitação',
          icon: <BookOpen className="w-4 h-4 text-amber-600" />
        };
      case 'TESTS_HARNESS':
        return {
          title: '12 Testes Obrigatórios do Sistema',
          subtitle: 'Bateria de validação técnica, regras de negócio e integridade do piloto',
          icon: <HelpCircle className="w-4 h-4 text-indigo-600" />
        };
      case 'BACKUP':
        return {
          title: 'Backup & Exportação',
          subtitle: 'Exportação completa dos dados do ciclo e salvaguarda',
          icon: <Download className="w-4 h-4 text-slate-600" />
        };
      default:
        return null;
    }
  };

  const contextInfo = getContextualViewInfo();

  // Reposicionamento suave no início do conteúdo principal ao trocar de view
  useEffect(() => {
    // Ignorar montagem inicial para preservar a posição inicial natural
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      previousViewRef.current = currentView;
      return;
    }

    // Se o usuário clicou na view que já está aberta, não provocar novo scroll
    if (previousViewRef.current === currentView) {
      return;
    }
    previousViewRef.current = currentView;

    // Calcular o offset do cabeçalho fixo para que o conteúdo nunca fique oculto atrás do header
    const mainEl = mainContentRef.current;
    if (mainEl) {
      const headerEl = document.querySelector('header');
      const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 100;
      const elementPosition = mainEl.getBoundingClientRect().top + window.pageYOffset;
      const targetPosition = Math.max(0, elementPosition - headerHeight - 12);

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }, [currentView]);

  const renderActiveView = () => {
    if (!currentOrg || currentView === 'CENTRAL') {
      return <OrganizationsHubView />;
    }

    // Salvaguarda: impede renderização de tela não autorizada para o perfil simulado
    if (!isViewAllowedForRole(currentUser.role, currentView)) {
      return currentUser.role === 'PARTICIPANTE' 
        ? <ParticipantContributionView /> 
        : <HomeView />;
    }

    switch (currentView) {
      case 'HOME':
        return <HomeView />;
      case 'INTERVIEW':
        return <DoorInvestigationView />;
      case 'FACILITATOR_PANEL':
        return <FacilitatorPanelView />;
      case 'DISTRIBUTED':
        return currentUser.role === 'PARTICIPANTE' 
          ? <ParticipantContributionView /> 
          : <DistributedInvestigationView />;
      case 'EVIDENCES':
        return <EvidencesView />;
      case 'PENDING':
        return <PendingItemsView />;
      case 'INTEGRATION':
        return <IntegrationView />;
      case 'SNAPSHOT':
        return <SnapshotView />;
      case 'ACTION_PLAN':
        return <EvolutionPlanView />;
      case 'INDICATOR':
        return <ExperimentalIndicatorView />;
      case 'OUTPUTS':
        return <OutputsView />;
      case 'DIARY':
        return <MethodologicalDiaryView />;
      case 'TESTS_HARNESS':
        return <TestsHarnessView />;
      case 'BACKUP':
        return <BackupView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      <Navbar />

      <main 
        id="main-content"
        ref={mainContentRef} 
        tabIndex={-1}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-12 outline-none"
      >
        {/* Barra de Localização e Confirmação de Navegação (Feedback de Transição de View) */}
        {contextInfo && (
          <div 
            key={`context-header-${currentView}`}
            className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-2 sm:py-2.5 px-3.5 sm:px-4 bg-white/95 border border-slate-200/90 rounded-xl shadow-xs transition-all duration-150 animate-in fade-in"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                {contextInfo.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate">
                    {contextInfo.title}
                  </h1>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span className="hidden sm:inline text-[11px] text-slate-500 truncate">
                    {contextInfo.subtitle}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 sm:hidden truncate">
                  {contextInfo.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0 text-[10px]">
              {currentOrg && (
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 font-mono font-medium">
                  {currentOrg.name}
                </span>
              )}
              <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 font-bold uppercase tracking-wider">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        {/* View com transição perceptível e feedback visual */}
        <div key={currentView} className="transition-opacity duration-150 animate-in fade-in">
          {renderActiveView()}
        </div>
      </main>

      {/* Rodapé Institucional e Metodológico */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white">VIPAZ • Governança de Privacidade</span>
            <span>• D1 — Governança Institucional ({currentOrg?.methodologyVersion || 'VIPAZ-D1 / 2.0'})</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-sky-400">
              <Sparkles className="w-3 h-3" /> IA Interpreta
            </span>
            <span className="flex items-center gap-1 text-purple-400">
              <FileCheck className="w-3 h-3" /> Evidência Sustenta
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" /> Humano Confirma
            </span>
          </div>

          <div className="text-slate-500 text-[11px]">
            O nível localiza; o gap explica; o próximo estado orienta.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  const [session, setSession] = useState<VipazSession | null>(() => {
    try { const raw=sessionStorage.getItem('VIPAZ_SESSION'); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  const [mustChangePassword,setMustChangePassword]=useState(()=>sessionStorage.getItem('VIPAZ_MUST_CHANGE_PASSWORD')==='true');
  const logout=()=>{ sessionStorage.removeItem('VIPAZ_SESSION'); sessionStorage.removeItem('VIPAZ_MUST_CHANGE_PASSWORD'); setSession(null); setMustChangePassword(false); };
  if(!session) return <LoginView onAuthenticated={(s)=>{setSession(s);setMustChangePassword(sessionStorage.getItem('VIPAZ_MUST_CHANGE_PASSWORD')==='true');}}/>;
  if(mustChangePassword) return <ChangePasswordView session={session} onDone={()=>setMustChangePassword(false)} onLogout={logout}/>;
  return <PilotProvider><AppContent /></PilotProvider>;
}
