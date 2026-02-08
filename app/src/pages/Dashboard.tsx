import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowUpRight,
  ArrowLeftRight,
  Globe2,
  DollarSign,
  Plus,
  ArrowDownLeft,
  TrendingUp,
  Shield,
  Loader2,
} from 'lucide-react';
import { useWallets } from '@/contexts/WalletContext';
import StatusBadge from '@/components/StatusBadge';

const quickActions = [
  { to: '/send', icon: ArrowUpRight, label: 'Send', color: 'bg-blue-500/10 text-blue-400' },
  { to: '/swap', icon: ArrowLeftRight, label: 'Swap', color: 'bg-purple-500/10 text-purple-400' },
  { to: '/bridge', icon: Globe2, label: 'Bridge', color: 'bg-emerald-500/10 text-emerald-400' },
  { to: '/buy', icon: DollarSign, label: 'Buy', color: 'bg-amber-500/10 text-amber-400' },
];

export default function Dashboard() {
  const { vaults, isLoading } = useWallets();
  const activeVaults = vaults.filter((v) => v.status === 'active');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Manage your MPC-secured wallets</p>
      </div>

      {/* Portfolio card */}
      <div className="card bg-gradient-to-br from-purple-600/20 via-slate-900 to-slate-900 border-purple-500/20">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-slate-400">Total Portfolio</span>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            {activeVaults.length > 0 ? '$0.00' : '--'}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Wallet className="w-3.5 h-3.5" />
            {activeVaults.length} active wallet{activeVaults.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3.5 h-3.5" />
            2-of-2 MPC secured
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-medium text-slate-400 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className="card hover:border-slate-700 transition-colors flex flex-col items-center gap-2 py-5"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-slate-300">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Wallets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-slate-400">Your Wallets</h2>
          <Link to="/create-wallet" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" />
            New
          </Link>
        </div>

        {isLoading ? (
          <div className="card flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : vaults.length === 0 ? (
          <div className="card text-center py-12">
            <Wallet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-300">No wallets yet</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Create your first MPC wallet to get started
            </p>
            <Link to="/create-wallet" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Wallet
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {vaults.map((vault) => (
              <Link
                key={vault.id}
                to={`/wallets/${vault.id}`}
                className="card flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{vault.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {vault.threshold}-of-{vault.total_parties} MPC
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={vault.status} />
                  <div className="text-right">
                    <p className="font-medium text-white">$0.00</p>
                    <p className="text-xs text-slate-500">
                      {new Date(vault.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-sm font-medium text-slate-400 mb-3">Recent Activity</h2>
        <div className="card text-center py-8">
          <ArrowDownLeft className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No recent transactions</p>
        </div>
      </div>
    </div>
  );
}
