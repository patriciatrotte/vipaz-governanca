import React, { useEffect, useRef, useState } from 'react';
import { ChangePasswordView, LoginView, VipazSession } from './components/LoginView';
import { PilotProvider, usePilot } from './context/PilotContext';

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
  const { currentView, currentOrg, setCurrentView, returnToOrganizationsHub } = usePilot();
  const modules = [
    { label:'Visão Geral', view:'HOME', icon:Compass, enabled:true },
    { label:'Diagnóstico', view:'INTERVIEW', icon:Layers, enabled:true },
    { label:'Evidências', view:'EVIDENCES', icon:FileCheck, enabled:true },
    { label:'Jornada de Evolução', view:'ACTION_PLAN', icon:Target, enabled:false },
    { label:'Conhecimento', view:'DIARY', icon:BookOpen, enabled:false },
    { label:'Relatórios', view:'OUTPUTS', icon:FileText, enabled:true }
  ] as const;
  if(!currentOrg || currentView==='CENTRAL') return <OrganizationsHubView />;
  const active = modules.find(m=>m.view===currentView) || modules[0];
  const renderCurrent=()=> {
    switch(active.view){
      case 'INTERVIEW': return <DoorInvestigationView />;
      case 'EVIDENCES': return <EvidencesView />;
      case 'OUTPUTS': return <OutputsView />;
      default: return <HomeView />;
    }
  };
  return <div className="min-h-screen bg-slate-100 flex">
    <aside className="w-64 bg-slate-950 text-white min-h-screen sticky top-0 self-start p-4 flex flex-col gap-5 no-print">
      <div><div className="font-bold text-lg">VIPAZ</div><div className="text-xs text-slate-400">Governança Institucional</div></div>
      <button onClick={returnToOrganizationsHub} className="text-left text-xs text-slate-300 hover:text-white">← Central de Organizações</button>
      <nav className="space-y-1">
        {modules.map(m=>{const Icon=m.icon; const selected=active.label===m.label; return <button key={m.label} disabled={!m.enabled} onClick={()=>m.enabled&&setCurrentView(m.view as any)}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left ${selected?'bg-emerald-600 text-white':m.enabled?'text-slate-300 hover:bg-slate-800':'text-slate-600 cursor-not-allowed'}`}>
          <Icon className="w-4 h-4"/><span className="flex-1">{m.label}</span>{!m.enabled&&<span className="text-[9px] uppercase">em preparação</span>}
        </button>})}
      </nav>
      <div className="mt-auto text-[10px] text-slate-500">VIPAZ-D1 / 2.0 / DRAFT</div>
    </aside>
    <div className="flex-1 min-w-0">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div><h1 className="font-bold text-slate-900">{active.label}</h1><p className="text-xs text-slate-500">{currentOrg.name}</p></div>
        <span className="text-[10px] font-mono border rounded px-2 py-1 text-slate-500">T2 • ambiente de desenvolvimento</span>
      </header>
      <main className="max-w-6xl mx-auto p-6">{renderCurrent()}</main>
    </div>
  </div>;
};
export default function App() {
  const [session, setSession] = useState<VipazSession | null>(() => {
    try {
      const raw=sessionStorage.getItem('VIPAZ_SESSION');
      if(raw) return JSON.parse(raw);
      const hash=new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const accessToken=hash.get('access_token'), refreshToken=hash.get('refresh_token'), type=hash.get('type');
      if(accessToken && type==='recovery') {
        const recovered={accessToken,refreshToken:refreshToken||'',userId:''};
        sessionStorage.setItem('VIPAZ_SESSION',JSON.stringify(recovered));
        sessionStorage.setItem('VIPAZ_MUST_CHANGE_PASSWORD','true');
        history.replaceState(null,'',window.location.pathname);
        return recovered;
      }
      return null;
    } catch { return null; }
  });
  const [mustChangePassword,setMustChangePassword]=useState(()=>sessionStorage.getItem('VIPAZ_MUST_CHANGE_PASSWORD')==='true');
  const [checkingSession,setCheckingSession]=useState(!!session);
  const clearLocalSession=()=>{ sessionStorage.removeItem('VIPAZ_SESSION'); sessionStorage.removeItem('VIPAZ_MUST_CHANGE_PASSWORD'); setSession(null); setMustChangePassword(false); };
  useEffect(()=>{ if(!session){setCheckingSession(false);return;} let cancelled=false;
    const validate=async()=>{ try{
      const url=import.meta.env.VITE_SUPABASE_URL as string|undefined, key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string|undefined;
      if(!url||!key) throw new Error('auth config');
      let active=session;
      let r=await fetch(`${url}/auth/v1/user`,{headers:{apikey:key,Authorization:`Bearer ${active.accessToken}`}});
      if(!r.ok && active.refreshToken){
        const rr=await fetch(`${url}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:active.refreshToken})});
        const rd=await rr.json(); if(!rr.ok||!rd.access_token) throw new Error('expired');
        active={accessToken:rd.access_token,refreshToken:rd.refresh_token||active.refreshToken,userId:rd.user?.id||active.userId};
        sessionStorage.setItem('VIPAZ_SESSION',JSON.stringify(active)); if(!cancelled)setSession(active);
        r=await fetch(`${url}/auth/v1/user`,{headers:{apikey:key,Authorization:`Bearer ${active.accessToken}`}});
      }
      if(!r.ok) throw new Error('invalid');
    }catch{ if(!cancelled)clearLocalSession(); }finally{ if(!cancelled)setCheckingSession(false); }};
    validate(); return()=>{cancelled=true;};
  },[]);
  const logout=async()=>{ const current=session; clearLocalSession(); if(!current)return; try{const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;if(url&&key)await fetch(`${url}/auth/v1/logout`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${current.accessToken}`}});}catch{} };
  if(checkingSession) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm">Validando sessão VIPAZ...</div>;
  if(!session) return <LoginView onAuthenticated={(s)=>{setSession(s);setMustChangePassword(sessionStorage.getItem('VIPAZ_MUST_CHANGE_PASSWORD')==='true');}}/>;
  if(mustChangePassword) return <ChangePasswordView session={session} onDone={()=>setMustChangePassword(false)} onLogout={logout}/>;
  return <PilotProvider><AppContent /></PilotProvider>;
}
