/**
 * VIPAZ institutional session — separate from simulated PilotContext.currentUser.
 * Access token is memory-only; reload and expiry require a new login.
 * Never put a Supabase secret/service-role key in VITE_* variables.
 */
let institutionalAccessToken: string | null = null;
let institutionalExpiresAt = 0;
let institutionalEmail: string | null = null;
export const getInstitutionalSignedInEmail = () => getInstitutionalAccessToken() ? institutionalEmail : null;

export const getInstitutionalAccessToken = () => {
  if (institutionalAccessToken && Date.now() >= institutionalExpiresAt) clearInstitutionalSession();
  return institutionalAccessToken;
};
const institutionalSessionListeners = new Set<() => void>();
export const subscribeInstitutionalSession = (listener: () => void) => {
  institutionalSessionListeners.add(listener);
  return () => { institutionalSessionListeners.delete(listener); };
};
const notifyInstitutionalSession = () => {
  institutionalSessionListeners.forEach(listener => listener());
};
export const clearInstitutionalSession = () => {
  const wasSignedIn = Boolean(institutionalAccessToken);
  institutionalAccessToken = null;
  institutionalExpiresAt = 0;
  institutionalEmail = null;
  if (wasSignedIn) notifyInstitutionalSession();
};

function config() {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  if (!url || !key) throw new Error('Autenticação institucional não configurada.');
  return { url: url.replace(/\/$/, ''), key };
}

export async function signInInstitutional(email: string, password: string): Promise<string> {
  clearInstitutionalSession();
  const { url, key } = config();
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) throw new Error('Não foi possível autenticar. Verifique as credenciais.');
  const data = await response.json();
  if (typeof data.access_token !== 'string') throw new Error('Sessão inválida.');
  // Verify identity with Auth; do not derive identity from the simulated profile.
  const verified = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${data.access_token}` }
  });
  if (!verified.ok) throw new Error('Não foi possível confirmar a identidade.');
  const user = await verified.json();
  if (!user?.id || !user?.email) throw new Error('Identidade não confirmada.');
  const expiresIn = Number(data.expires_in);
  if (!Number.isFinite(expiresIn) || expiresIn <= 30) throw new Error('Validade da sessão inválida.');
  institutionalExpiresAt = Date.now() + (expiresIn - 30) * 1000;
  institutionalAccessToken = data.access_token;
  institutionalEmail = user.email;
  notifyInstitutionalSession();
  return user.email;
}

export async function getDeliberationEffectiveState(deliberationId: string) {
  const token = getInstitutionalAccessToken();
  if (!token) throw new Error('Autenticação institucional necessária.');
  const response = await fetch(
    `/api/data/deliberation-state?deliberationId=${encodeURIComponent(deliberationId)}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  );
  if (response.status === 401) {
    clearInstitutionalSession();
    throw new Error('Sessão expirada. Entre novamente.');
  }
  if (!response.ok) throw new Error('Consulta institucional indisponível ou não autorizada.');
  return response.json();
}

export interface InstitutionalScope {
  isGlobalAdmin: boolean;
  visibleCycleCount: number;
  organizations: Array<{ id: string; name: string }>;
}

export async function getInstitutionalScope(): Promise<InstitutionalScope> {
  const token = getInstitutionalAccessToken();
  if (!token) throw new Error('Autenticação institucional necessária.');
  const response = await fetch('/api/data/institutionalScope', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  if (response.status === 401) {
    clearInstitutionalSession();
    throw new Error('Sessão expirada. Entre novamente.');
  }
  if (!response.ok) throw new Error('Não foi possível verificar o escopo de acesso.');
  const result = await response.json();
  if (typeof result?.isGlobalAdmin !== 'boolean' || typeof result?.visibleCycleCount !== 'number' || !Array.isArray(result.organizations)) {
    throw new Error('Resposta de autorização inválida.');
  }
  return result as InstitutionalScope;
}
