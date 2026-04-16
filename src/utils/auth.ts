const AUTH_KEY = 'kendra_admin_auth';
const AUTH_PWD_KEY = 'kendra_admin_pwd';

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === '1';
}

// Accepts any non-empty password — real validation happens server-side in the API.
export function authenticate(password: string): boolean {
  if (!password.trim()) return false;
  sessionStorage.setItem(AUTH_KEY, '1');
  sessionStorage.setItem(AUTH_PWD_KEY, password);
  return true;
}

export function getStoredPassword(): string {
  return sessionStorage.getItem(AUTH_PWD_KEY) ?? '';
}

export function signOut(): void {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_PWD_KEY);
}
