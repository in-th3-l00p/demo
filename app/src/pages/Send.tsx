import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowUpRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import * as mpc from '@/api/mpc';
import { useWallets } from '@/contexts/WalletContext';

const chains = ['Ethereum', 'Bitcoin', 'Solana', 'Base', 'Polygon', 'Arbitrum'];

export default function Send() {
  const [searchParams] = useSearchParams();
  const { vaults } = useWallets();
  const activeVaults = vaults.filter((v) => v.status === 'active');

  const [vaultId, setVaultId] = useState(searchParams.get('vault') || '');
  const [chain, setChain] = useState('Ethereum');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [status, setStatus] = useState<'idle' | 'signing' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    if (!vaultId && activeVaults.length > 0) {
      setVaultId(activeVaults[0].id);
    }
  }, [activeVaults, vaultId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultId || !to || !amount) return;
    setError('');
    setStatus('signing');

    try {
      const result = await mpc.signTransaction(vaultId, {
        chain,
        to,
        amount,
        memo: memo || undefined,
      });
      setSessionId(result.sessionId);
      setStatus('done');
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Send Transaction</h1>
        <p className="text-slate-400 mt-1">
          Sign a transaction with MPC co-signing
        </p>
      </div>

      {activeVaults.length === 0 ? (
        <div className="card text-center py-12">
          <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-300">No active wallets</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            Create a wallet first to send transactions
          </p>
          <Link to="/create-wallet" className="btn-primary">
            Create Wallet
          </Link>
        </div>
      ) : status === 'done' ? (
        <div className="card text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Transaction Signed!</h3>
          <p className="text-sm text-slate-400 mt-2">
            The MPC co-signing ceremony completed successfully.
          </p>
          <p className="text-xs text-slate-600 mt-2">Session: {sessionId.slice(0, 20)}...</p>
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={() => {
                setStatus('idle');
                setTo('');
                setAmount('');
                setMemo('');
              }}
              className="btn-primary"
            >
              Send Another
            </button>
            <Link to={`/wallets/${vaultId}`} className="btn-secondary">
              View Wallet
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSend} className="card space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="label">From Wallet</label>
            <select
              className="input"
              value={vaultId}
              onChange={(e) => setVaultId(e.target.value)}
            >
              {activeVaults.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Chain</label>
            <select
              className="input"
              value={chain}
              onChange={(e) => setChain(e.target.value)}
            >
              {chains.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Recipient Address</label>
            <input
              className="input font-mono text-sm"
              placeholder="0x... or recipient address"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Amount</label>
            <input
              className="input"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Memo (optional)</label>
            <input
              className="input"
              placeholder="Add a note"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={status === 'signing'}
          >
            {status === 'signing' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Co-signing...
              </>
            ) : (
              <>
                <ArrowUpRight className="w-4 h-4" />
                Sign & Send
              </>
            )}
          </button>

          {status === 'signing' && (
            <p className="text-xs text-center text-slate-500">
              Both parties are computing the signature...
            </p>
          )}
        </form>
      )}
    </div>
  );
}
