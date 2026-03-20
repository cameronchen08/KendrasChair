const AUTH_KEY = 'kendra_admin_auth';
const ADMIN_PASSWORD = 'Oliver';

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === '1';
}

export function authenticate(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, '1');
    return true;
  }
  return false;
}

export function signOut(): void {
  sessionStorage.removeItem(AUTH_KEY);
}
