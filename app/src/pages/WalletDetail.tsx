import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Wallet,
  Copy,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Shield,
  Download,
  Trash2,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import * as mpc from '@/api/mpc';
import StatusBadge from '@/components/StatusBadge';

export default function WalletDetail() {
  const { id } = useParams<{ id: string }>();
  const [vault, setVault] = useState<mpc.VaultDetail | null>(null);
  const [transactions, setTransactions] = useState<mpc.Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    mpc.getVault(id).then(setVault).finally(() => setLoading(false));
    setTxLoading(true);
    mpc
      .listTransactions(id)
      .then((r) => setTransactions(r.transactions))
      .finally(() => setTxLoading(false));
  }, [id]);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-400">Wallet not found</p>
        <Link to="/wallets" className="text-indigo-400 text-sm mt-2 inline-block">
          Back to wallets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
            <Wallet className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{vault.name}</h1>
              <StatusBadge status={vault.status} />
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {vault.threshold}-of-{vault.total_parties} MPC Threshold Signature
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/recovery?vault=${vault.id}`} className="btn-secondary flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" />
            Recovery
          </Link>
        </div>
      </div>

      {/* Balance */}
      <div className="card bg-gradient-to-br from-indigo-600/10 to-transparent border-indigo-500/20">
        <p className="text-sm text-slate-400 mb-1">Total Balance</p>
        <p className="text-3xl font-bold text-white">$0.00</p>
        <div className="flex gap-3 mt-4">
          <Link to={`/send?vault=${vault.id}`} className="btn-primary flex items-center gap-2 text-sm">
            <ArrowUpRight className="w-4 h-4" />
            Send
          </Link>
          <button className="btn-secondary flex items-center gap-2 text-sm">
            <ArrowDownLeft className="w-4 h-4" />
            Receive
          </button>
          <Link to="/swap" className="btn-secondary flex items-center gap-2 text-sm">
            <ArrowLeftRight className="w-4 h-4" />
            Swap
          </Link>
        </div>
      </div>

      {/* Addresses */}
      <div>
        <h2 className="text-sm font-medium text-slate-400 mb-3">Addresses</h2>
        {vault.addresses.length === 0 ? (
          <div className="card text-center py-6">
            <p className="text-sm text-slate-500">
              {vault.status === 'pending'
                ? 'Addresses will appear after keygen completes'
                : 'No addresses available'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {vault.addresses.map((addr) => (
              <div
                key={`${addr.chain}-${addr.address}`}
                className="card flex items-center justify-between py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-300">
                      {addr.chain.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{addr.chain}</p>
                    <p className="text-xs text-slate-500 font-mono">
                      {addr.address.slice(0, 10)}...{addr.address.slice(-8)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => copyAddress(addr.address)}
                  className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {copied === addr.address ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions */}
      <div>
        <h2 className="text-sm font-medium text-slate-400 mb-3">Transactions</h2>
        {txLoading ? (
          <div className="card flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-sm text-slate-500">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="card flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Send {tx.amount} on {tx.chain}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      To: {tx.to_address.slice(0, 10)}...{tx.to_address.slice(-6)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={tx.status} />
                  {tx.tx_hash && (
                    <a
                      href={`https://etherscan.io/tx/${tx.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-slate-300"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div>
        <h2 className="text-sm font-medium text-slate-400 mb-3">Danger Zone</h2>
        <div className="card border-red-900/30 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Archive Wallet</p>
            <p className="text-xs text-slate-500">
              This will deactivate the wallet. Make sure to backup first.
            </p>
          </div>
          <button
            onClick={async () => {
              if (!confirm('Are you sure? This action cannot be undone.')) return;
              await mpc.archiveVault(vault.id);
              window.location.href = '/wallets';
            }}
            className="btn-danger flex items-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}
