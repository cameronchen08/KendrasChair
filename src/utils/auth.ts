const AUTH_KEY = 'kendra_admin_auth';
const AUTH_PWD_KEY = 'kendra_admin_pwd';

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === '1';
}

const EXPECTED = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined;

export function authenticate(password: string): boolean {
  if (!password.trim()) return false;
  if (EXPECTED && password !== EXPECTED) return false;
  try {
    sessionStorage.setItem(AUTH_KEY, '1');
    sessionStorage.setItem(AUTH_PWD_KEY, password);
  } catch {
    // sessionStorage unavailable — proceed without persisting (auth lasts this page only)
  }
  return true;
}

export function getStoredPassword(): string {
  return sessionStorage.getItem(AUTH_PWD_KEY) ?? '';
}

export function signOut(): void {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_PWD_KEY);
}
