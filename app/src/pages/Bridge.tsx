import { useState } from 'react';
import { Globe2, ArrowRight, Loader2, Info, Clock, Shield, Zap } from 'lucide-react';

// Bridge page demonstrating panoplia.swap (LiFi) cross-chain bridging

const chains = [
  { id: 1, name: 'Ethereum', color: 'bg-blue-500/20 text-blue-300' },
  { id: 137, name: 'Polygon', color: 'bg-purple-500/20 text-purple-300' },
  { id: 42161, name: 'Arbitrum', color: 'bg-sky-500/20 text-sky-300' },
  { id: 10, name: 'Optimism', color: 'bg-red-500/20 text-red-300' },
  { id: 8453, name: 'Base', color: 'bg-blue-500/20 text-blue-300' },
  { id: 56, name: 'BNB Chain', color: 'bg-amber-500/20 text-amber-300' },
  { id: 534352, name: 'Scroll', color: 'bg-orange-500/20 text-orange-300' },
];

const bridges = [
  { name: 'Stargate', time: '~2 min', fee: '$0.50' },
  { name: 'Hop Protocol', time: '~5 min', fee: '$0.35' },
  { name: 'Across', time: '~3 min', fee: '$0.45' },
];

export default function Bridge() {
  const [fromChain, setFromChain] = useState(1);
  const [toChain, setToChain] = useState(137);
  const [amount, setAmount] = useState('');
  const [token] = useState('USDC');
  const [status, setStatus] = useState<'idle' | 'routing' | 'bridging' | 'done'>('idle');
  const [selectedBridge, setSelectedBridge] = useState(0);

  const handleBridge = async () => {
    setStatus('routing');
    await new Promise((r) => setTimeout(r, 2000));
    setStatus('bridging');
    await new Promise((r) => setTimeout(r, 4000));
    setStatus('done');
    setTimeout(() => setStatus('idle'), 3000);
  };

  const fromChainInfo = chains.find((c) => c.id === fromChain);
  const toChainInfo = chains.find((c) => c.id === toChain);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">Bridge</h1>
          <span className="badge-info text-xs">Powered by LiFi</span>
        </div>
        <p className="text-slate-400 mt-1">
          Transfer tokens across blockchains
        </p>
      </div>

      <div className="card space-y-4">
        {/* Chain selection */}
        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3">
          <div>
            <label className="label">From</label>
            <select
              className="input"
              value={fromChain}
              onChange={(e) => setFromChain(Number(e.target.value))}
            >
              {chains.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setFromChain(toChain);
              setToChain(fromChain);
            }}
            className="mt-6 w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

          <div>
            <label className="label">To</label>
            <select
              className="input"
              value={toChain}
              onChange={(e) => setToChain(Number(e.target.value))}
            >
              {chains.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="label">Amount</label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              className="input pr-20"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
              {token}
            </div>
          </div>
        </div>

        {/* Bridge routes */}
        {amount && (
          <div>
            <label className="label">Select Bridge</label>
            <div className="space-y-2">
              {bridges.map((bridge, i) => (
                <button
                  key={bridge.name}
                  onClick={() => setSelectedBridge(i)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
                    selectedBridge === i
                      ? 'bg-indigo-500/10 border-indigo-500/30'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                      <Globe2 className="w-4 h-4 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{bridge.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {bridge.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{amount} {token}</p>
                    <p className="text-xs text-slate-500">Fee: {bridge.fee}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Route visualization */}
        {amount && (
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className={`px-2 py-0.5 rounded ${fromChainInfo?.color}`}>
                {fromChainInfo?.name}
              </span>
              <div className="flex-1 border-t border-dashed border-slate-700 relative">
                <Zap className="w-3 h-3 text-amber-400 absolute -top-1.5 left-1/2 -translate-x-1/2 bg-slate-800" />
              </div>
              <span className={`px-2 py-0.5 rounded ${toChainInfo?.color}`}>
                {toChainInfo?.name}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleBridge}
          disabled={!amount || status !== 'idle'}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {status === 'routing' && <Loader2 className="w-4 h-4 animate-spin" />}
          {status === 'bridging' && <Loader2 className="w-4 h-4 animate-spin" />}
          {status === 'idle' && <Globe2 className="w-4 h-4" />}
          {status === 'idle' && 'Bridge Tokens'}
          {status === 'routing' && 'Finding route...'}
          {status === 'bridging' && 'Bridging...'}
          {status === 'done' && 'Bridge complete!'}
        </button>
      </div>

      <div className="flex items-start gap-2 text-xs text-slate-600">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <p>
          Bridging is powered by LiFi SDK, which aggregates bridge protocols (Stargate, Hop,
          Across, etc.) to find optimal routes across chains.
        </p>
      </div>
    </div>
  );
}
