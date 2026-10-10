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
  if (!verified.ok) throw new Error('Identidade ou vínculos institucionais não verificados.');
  const session = await verified.json();
  if ((!Array.isArray(session.memberships) || session.memberships.length === 0) && session.isGlobalAdmin !== true) {
    throw new Error('Usuário sem vínculo institucional ativo nem papel administrativo global. Solicite habilitação ao administrador.');
  }
  sessionStorage.setItem(TOKEN_KEY, payload.access_token);
};
