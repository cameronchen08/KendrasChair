import type { Client } from '../types';

const CACHE_KEY = 'kendra_clients';

export function cacheClients(clients: Client[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(clients));
  } catch {}
}

export async function loadClients(): Promise<Client[]> {
  // Return cached data immediately so saves are visible before Vercel redeploys
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached) as Client[];
  } catch {}
  // Fall back to the deployed file
  try {
    const res = await fetch('/clients.json');
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
