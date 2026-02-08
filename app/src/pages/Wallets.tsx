import { Link } from 'react-router-dom';
import { Wallet, Plus, Loader2 } from 'lucide-react';
import { useWallets } from '@/contexts/WalletContext';
import StatusBadge from '@/components/StatusBadge';

export default function Wallets() {
  const { vaults, isLoading } = useWallets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Wallets</h1>
          <p className="text-slate-400 mt-1">Manage your MPC wallets</p>
        </div>
        <Link to="/create-wallet" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Wallet
        </Link>
      </div>

      {isLoading ? (
        <div className="card flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : vaults.length === 0 ? (
        <div className="card text-center py-16">
          <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300">No wallets yet</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Create your first MPC-secured wallet
          </p>
          <Link to="/create-wallet" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Wallet
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {vaults.map((vault) => (
            <Link
              key={vault.id}
              to={`/wallets/${vault.id}`}
              className="card flex items-center gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white">{vault.name}</h3>
                  <StatusBadge status={vault.status} />
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                  <span>{vault.threshold}-of-{vault.total_parties} MPC</span>
                  <span>Created {new Date(vault.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-white">$0.00</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
