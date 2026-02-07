import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import * as mpc from '@/api/mpc';

interface AuthState {
  user: mpc.User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('panoplia_token'),
    isLoading: true,
    isAuthenticated: false,
  });

  const setAuth = useCallback((user: mpc.User, token: string) => {
    localStorage.setItem('panoplia_token', token);
    setState({ user, token, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('panoplia_token');
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  }, []);

  useEffect(() => {
    if (!state.token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    mpc
      .getMe()
      .then((user) => {
        setState({ user, token: state.token, isLoading: false, isAuthenticated: true });
      })
      .catch(() => {
        logout();
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loginFn = useCallback(
    async (email: string, password: string) => {
      const { token, user } = await mpc.login(email, password);
      setAuth(user, token);
    },
    [setAuth],
  );

  const registerFn = useCallback(
    async (email: string, password: string) => {
      const { token, user } = await mpc.register(email, password);
      setAuth(user, token);
    },
    [setAuth],
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login: loginFn,
        register: registerFn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
