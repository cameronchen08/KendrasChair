import type { Client } from '../types';

export async function loadClients(): Promise<Client[]> {
  try {
    const res = await fetch('/clients.json');
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
