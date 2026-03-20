import type { Client } from '../types';

const STORAGE_KEY = 'kendra_clients';

export function loadClients(): Client[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') || [];
  } catch {
    return [];
  }
}

export function saveClients(clients: Client[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    return true;
  } catch {
    return false;
  }
}
