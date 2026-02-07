import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/lib/wagmi';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { WalletProvider } from '@/contexts/WalletContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Wallets from '@/pages/Wallets';
import WalletDetail from '@/pages/WalletDetail';
import CreateWallet from '@/pages/CreateWallet';
import Send from '@/pages/Send';
import Swap from '@/pages/Swap';
import Bridge from '@/pages/Bridge';
import OnRamp from '@/pages/OnRamp';
import OffRamp from '@/pages/OffRamp';
import Recovery from '@/pages/Recovery';
import GuardianSubmit from '@/pages/GuardianSubmit';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/recovery/guardian" element={<GuardianSubmit />} />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="wallets" element={<Wallets />} />
        <Route path="wallets/:id" element={<WalletDetail />} />
        <Route path="create-wallet" element={<CreateWallet />} />
        <Route path="send" element={<Send />} />
        <Route path="swap" element={<Swap />} />
        <Route path="bridge" element={<Bridge />} />
        <Route path="buy" element={<OnRamp />} />
        <Route path="sell" element={<OffRamp />} />
        <Route path="recovery" element={<Recovery />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <WalletProvider>
              <AppRoutes />
            </WalletProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
