import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import * as mpc from '@/api/mpc';
import { useAuth } from './AuthContext';

interface WalletContextValue {
  vaults: mpc.Vault[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  activeVault: mpc.VaultDetail | null;
  setActiveVaultId: (id: string | null) => void;
  activeVaultLoading: boolean;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [vaults, setVaults] = useState<mpc.Vault[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeVaultId, setActiveVaultId] = useState<string | null>(null);
  const [activeVault, setActiveVault] = useState<mpc.VaultDetail | null>(null);
  const [activeVaultLoading, setActiveVaultLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const { vaults: list } = await mpc.listVaults();
      setVaults(list);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) refresh();
    else setVaults([]);
  }, [isAuthenticated, refresh]);

  useEffect(() => {
    if (!activeVaultId) {
      setActiveVault(null);
      return;
    }
    setActiveVaultLoading(true);
    mpc
      .getVault(activeVaultId)
      .then(setActiveVault)
      .catch(() => setActiveVault(null))
      .finally(() => setActiveVaultLoading(false));
  }, [activeVaultId]);

  return (
    <WalletContext.Provider
      value={{
        vaults,
        isLoading,
        error,
        refresh,
        activeVault,
        setActiveVaultId,
        activeVaultLoading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallets() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallets must be used within WalletProvider');
  return ctx;
}
