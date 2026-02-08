import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Loader2, CheckCircle2, Shield, Key, Users } from 'lucide-react';
import * as mpc from '@/api/mpc';
import { useWallets } from '@/contexts/WalletContext';

type Step = 'name' | 'creating' | 'keygen' | 'done';

export default function CreateWallet() {
  const navigate = useNavigate();
  const { refresh } = useWallets();
  const [name, setName] = useState('');
  const [step, setStep] = useState<Step>('name');
  const [error, setError] = useState('');
  const [vaultId, setVaultId] = useState('');
  const [sessionId, setSessionId] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setStep('creating');

    try {
      const result = await mpc.createVault(name.trim());
      setVaultId(result.vaultId);
      setSessionId(result.sessionId);
      setStep('keygen');

      // Poll until vault becomes active
      const poll = async () => {
        for (let i = 0; i < 60; i++) {
          await new Promise((r) => setTimeout(r, 2000));
          try {
            const vault = await mpc.getVault(result.vaultId);
            if (vault.status === 'active') {
              setStep('done');
              await refresh();
              return;
            }
            if (vault.status === 'archived') {
              throw new Error('Vault creation failed');
            }
          } catch {
            // keep polling
          }
        }
        setError('Keygen timed out. Please try again.');
        setStep('name');
      };
      poll();
    } catch (err: any) {
      setError(err.message || 'Failed to create wallet');
      setStep('name');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Create New Wallet</h1>
      <p className="text-slate-400 mb-8">
        Set up a new MPC-secured wallet with threshold signatures
      </p>

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="card py-4 text-center">
          <Key className="w-5 h-5 text-purple-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Split Key</p>
          <p className="text-sm font-medium text-white mt-0.5">2-of-2</p>
        </div>
        <div className="card py-4 text-center">
          <Shield className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Security</p>
          <p className="text-sm font-medium text-white mt-0.5">Non-custodial</p>
        </div>
        <div className="card py-4 text-center">
          <Users className="w-5 h-5 text-amber-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Recovery</p>
          <p className="text-sm font-medium text-white mt-0.5">Social</p>
        </div>
      </div>

      {step === 'name' && (
        <form onSubmit={handleCreate} className="card space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          <div>
            <label className="label">Wallet Name</label>
            <input
              className="input"
              placeholder="e.g. Main Wallet, Savings, Trading"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Create Wallet
          </button>
        </form>
      )}

      {step === 'creating' && (
        <div className="card text-center py-12">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Initializing MPC ceremony...</h3>
          <p className="text-sm text-slate-400 mt-2">
            Setting up the key generation session
          </p>
        </div>
      )}

      {step === 'keygen' && (
        <div className="card text-center py-12">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-2 border-2 border-purple-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <Key className="w-6 h-6 text-purple-400 absolute inset-0 m-auto" />
          </div>
          <h3 className="text-lg font-medium text-white">Key Generation in Progress</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
            The MPC protocol is generating your key shares. The server holds one share,
            your device holds the other. Neither can sign alone.
          </p>
          <div className="mt-4 text-xs text-slate-600">
            Session: {sessionId.slice(0, 16)}...
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="card text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Wallet Created!</h3>
          <p className="text-sm text-slate-400 mt-2">
            Your MPC wallet is ready. Your key has been securely split.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={() => navigate(`/wallets/${vaultId}`)}
              className="btn-primary"
            >
              View Wallet
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary">
              Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
