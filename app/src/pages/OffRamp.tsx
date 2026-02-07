import { useState } from 'react';
import {
  Banknote,
  Loader2,
  CheckCircle2,
  Info,
  Plus,
  Minus,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react';

// Demonstrates integration with panoplia.peer offramp (ZKP2P)

interface Deposit {
  id: string;
  amount: string;
  accepting: boolean;
  minAmount: string;
  maxAmount: string;
}

const paymentMethods = [
  { id: 'venmo', name: 'Venmo' },
  { id: 'cashapp', name: 'Cash App' },
  { id: 'zelle', name: 'Zelle' },
  { id: 'paypal', name: 'PayPal' },
  { id: 'wise', name: 'Wise' },
];

export default function OffRamp() {
  const [amount, setAmount] = useState('');
  const [minAmount, setMinAmount] = useState('100');
  const [maxAmount, setMaxAmount] = useState('5000');
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['venmo']);
  const [status, setStatus] = useState<'idle' | 'creating' | 'done'>('idle');
  const [deposits, setDeposits] = useState<Deposit[]>([
    { id: '1', amount: '2500.00', accepting: true, minAmount: '100', maxAmount: '2500' },
  ]);

  const toggleMethod = (id: string) => {
    setSelectedMethods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const handleCreateDeposit = async () => {
    if (!amount) return;
    setStatus('creating');
    await new Promise((r) => setTimeout(r, 2000));
    setDeposits((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        amount,
        accepting: true,
        minAmount,
        maxAmount,
      },
    ]);
    setAmount('');
    setStatus('done');
    setTimeout(() => setStatus('idle'), 2000);
  };

  const toggleAccepting = (id: string) => {
    setDeposits((prev) =>
      prev.map((d) => (d.id === id ? { ...d, accepting: !d.accepting } : d)),
    );
  };

  const removeDeposit = (id: string) => {
    setDeposits((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">Sell Crypto</h1>
          <span className="badge-info text-xs">Powered by Peer</span>
        </div>
        <p className="text-slate-400 mt-1">
          Off-ramp crypto to fiat via P2P deposits
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create deposit */}
        <div className="card space-y-4">
          <h2 className="text-lg font-medium text-white">Create Deposit</h2>
          <p className="text-sm text-slate-500">
            Lock USDC into a smart contract. Peers will match with you to buy your crypto.
          </p>

          <div>
            <label className="label">USDC Amount</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                className="input pr-16"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                USDC
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Min Trade</label>
              <input
                className="input"
                placeholder="100"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Max Trade</label>
              <input
                className="input"
                placeholder="5000"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Accepted Payment Methods</label>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => toggleMethod(method.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    selectedMethods.includes(method.id)
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                      : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  {method.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateDeposit}
            disabled={!amount || status === 'creating'}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {status === 'creating' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : status === 'done' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Banknote className="w-4 h-4" />
            )}
            {status === 'idle' && 'Create Deposit'}
            {status === 'creating' && 'Creating deposit...'}
            {status === 'done' && 'Deposit created!'}
          </button>
        </div>

        {/* Active deposits */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-white">Your Deposits</h2>
          {deposits.length === 0 ? (
            <div className="card text-center py-8">
              <Banknote className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No active deposits</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deposits.map((deposit) => (
                <div key={deposit.id} className="card space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-medium text-white">
                        {deposit.amount} USDC
                      </p>
                      <p className="text-xs text-slate-500">
                        Range: ${deposit.minAmount} - ${deposit.maxAmount}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleAccepting(deposit.id)}
                      className="flex items-center gap-2"
                    >
                      {deposit.accepting ? (
                        <ToggleRight className="w-8 h-8 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-600" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={deposit.accepting ? 'text-emerald-400' : 'text-slate-500'}>
                      {deposit.accepting ? 'Accepting trades' : 'Paused'}
                    </span>
                    <div className="flex gap-1">
                      <button className="p-1.5 bg-slate-800 rounded hover:bg-slate-700 transition-colors text-slate-400">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 bg-slate-800 rounded hover:bg-slate-700 transition-colors text-slate-400">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeDeposit(deposit.id)}
                        className="p-1.5 bg-slate-800 rounded hover:bg-red-900/30 transition-colors text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-slate-600">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <p>
          Off-ramping uses ZKP2P smart contracts on Base. Your USDC is escrowed and
          released when a peer completes a fiat payment, verified by zero-knowledge proofs.
        </p>
      </div>
    </div>
  );
}
