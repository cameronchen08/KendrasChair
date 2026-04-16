import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Client } from '../types';
import { loadClients } from '../utils/storage';

interface ClientsContextValue {
  clients: Client[];
  setClients: (clients: Client[]) => void;
  loading: boolean;
}

const ClientsContext = createContext<ClientsContextValue | null>(null);

export function ClientsProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClientsState] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients().then(data => {
      setClientsState(data);
      setLoading(false);
    });
  }, []);

  const setClients = useCallback((next: Client[]) => {
    setClientsState(next);
  }, []);

  return (
    <ClientsContext.Provider value={{ clients, setClients, loading }}>
      {children}
    </ClientsContext.Provider>
  );
}

export function useClients() {
  const ctx = useContext(ClientsContext);
  if (!ctx) throw new Error('useClients must be used within ClientsProvider');
  return ctx;
}
