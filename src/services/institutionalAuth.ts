/**
 * Sessão de autenticação para acesso institucional.
 * O perfil simulado do piloto não é uma credencial de autorização.
 * Tokens permanecem apenas na sessão desta aba; não usar localStorage.
 */
const TOKEN_KEY = 'vipaz.auth.access_token';

export const getInstitutionalToken = (): string | null => {
  try { return sessionStorage.getItem(TOKEN_KEY); }
  catch { return null; }
};

export const clearInstitutionalToken = (): void => {
  try { sessionStorage.removeItem(TOKEN_KEY); }
  catch { /* sessão indisponível */ }
};

export const signInInstitutionalUser = async (email: string, password: string): Promise<void> => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anonKey) throw new Error('Login institucional ainda não configurado neste ambiente.');
  const response = await fetch(`${String(url).replace(/\/$/, '')}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) throw new Error('Não foi possível autenticar. Confira suas credenciais.');
  const payload = await response.json();
  if (typeof payload.access_token !== 'string') throw new Error('Resposta de autenticação inválida.');
  // Verifica identidade e vínculos antes de aceitar a sessão.
  const verified = await fetch('/api/auth/session', {
    headers: { Authorization: `Bearer ${payload.access_token}` }
  });
  if (!verified.ok) throw new Error(verified.status >= 500 ? 'Serviço de autorização indisponível (HTTP ' + verified.status + '). Sua senha foi aceita.' : 'Sessão institucional não autorizada (HTTP ' + verified.status + ').');
  const session = await verified.json();
  if ((!Array.isArray(session.memberships) || session.memberships.length === 0) && session.isGlobalAdmin !== true) {
    throw new Error('Usuário sem vínculo institucional ativo nem papel administrativo global. Solicite habilitação ao administrador.');
  }
  sessionStorage.setItem(TOKEN_KEY, payload.access_token);
};

const authSettings = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Autenticação não configurada neste ambiente.');
  return { base: String(url).replace(/\/$/, ''), key: String(key) };
};

/** Envia instruções sem revelar se o endereço possui cadastro. */
export const requestPasswordRecovery = async (email: string): Promise<void> => {
  const { base, key } = authSettings();
  const redirectTo = new URL(window.location.pathname, window.location.origin);
  const response = await fetch(`${base}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo.toString())}`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() })
  });
  if (!response.ok) throw new Error('Não foi possível solicitar a recuperação agora. Tente novamente mais tarde.');
};

/** Tokens de recuperação são usados somente para trocar a senha, nunca para conceder acesso institucional. */
export const readRecoveryToken = (): string | null => {
  const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const token = fragment.get('access_token');
  const type = fragment.get('type');
  if (type !== 'recovery' || !token) return null;
  // Remove imediatamente credenciais da barra de endereços e do histórico visível.
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  return token;
};

export const updateRecoveredPassword = async (recoveryToken: string, password: string): Promise<void> => {
  const { base, key } = authSettings();
  const response = await fetch(`${base}/auth/v1/user`, {
    method: 'PUT',
    headers: { apikey: key, Authorization: `Bearer ${recoveryToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (!response.ok) throw new Error('O link expirou ou não pôde ser validado. Solicite outro e-mail de recuperação.');
  clearInstitutionalToken();
};
