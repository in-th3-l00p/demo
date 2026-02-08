import { useState } from 'react';
import { ArrowLeftRight, ArrowDown, Loader2, Info, Zap, ChevronDown } from 'lucide-react';

// This page demonstrates integration with panoplia.swap (LiFi SDK)
// In production, you'd wrap this in PanopliaSwapProvider and use the hooks

const popularTokens = [
  { symbol: 'ETH', name: 'Ethereum', chain: 'Ethereum', logo: '~' },
  { symbol: 'USDC', name: 'USD Coin', chain: 'Ethereum', logo: '$' },
  { symbol: 'USDT', name: 'Tether', chain: 'Ethereum', logo: '$' },
  { symbol: 'WBTC', name: 'Wrapped BTC', chain: 'Ethereum', logo: '~' },
  { symbol: 'DAI', name: 'Dai', chain: 'Ethereum', logo: '$' },
  { symbol: 'MATIC', name: 'Polygon', chain: 'Polygon', logo: '~' },
  { symbol: 'ARB', name: 'Arbitrum', chain: 'Arbitrum', logo: '~' },
];

const chains = [
  { id: 1, name: 'Ethereum' },
  { id: 137, name: 'Polygon' },
  { id: 42161, name: 'Arbitrum' },
  { id: 10, name: 'Optimism' },
  { id: 8453, name: 'Base' },
  { id: 56, name: 'BNB Chain' },
];

export default function Swap() {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [fromChain, setFromChain] = useState(1);
  const [toChain, setToChain] = useState(1);
  const [status, setStatus] = useState<'idle' | 'quoting' | 'swapping' | 'done'>('idle');

  const handleSwap = async () => {
    setStatus('quoting');
    // Simulate quote fetching
    await new Promise((r) => setTimeout(r, 1500));
    setStatus('swapping');
    // Simulate swap execution
    await new Promise((r) => setTimeout(r, 3000));
    setStatus('done');
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">Swap</h1>
          <span className="badge-info text-xs">Powered by LiFi</span>
        </div>
        <p className="text-slate-400 mt-1">
          Swap tokens across chains with the best rates
        </p>
      </div>

      <div className="card space-y-3">
        {/* From */}
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-slate-500">You pay</label>
            <select
              className="text-xs bg-transparent text-slate-400 border-none focus:outline-none cursor-pointer"
              value={fromChain}
              onChange={(e) => setFromChain(Number(e.target.value))}
            >
              {chains.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              inputMode="decimal"
              className="flex-1 bg-transparent text-2xl text-white placeholder-slate-600 focus:outline-none"
              placeholder="0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
            />
            <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors">
              <span className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-xs text-purple-300">
                {popularTokens.find((t) => t.symbol === fromToken)?.logo}
              </span>
              <span className="text-sm font-medium text-white">{fromToken}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>Balance: 0.00</span>
            <button className="text-purple-400 hover:text-purple-300">MAX</button>
          </div>
        </div>

        {/* Swap direction button */}
        <div className="flex justify-center -my-1 relative z-10">
          <button
            onClick={() => {
              setFromToken(toToken);
              setToToken(fromToken);
              const tmpChain = fromChain;
              setFromChain(toChain);
              setToChain(tmpChain);
            }}
            className="w-10 h-10 bg-slate-800 border-2 border-slate-900 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <ArrowDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* To */}
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-slate-500">You receive</label>
            <select
              className="text-xs bg-transparent text-slate-400 border-none focus:outline-none cursor-pointer"
              value={toChain}
              onChange={(e) => setToChain(Number(e.target.value))}
            >
              {chains.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              className="flex-1 bg-transparent text-2xl text-white placeholder-slate-600 focus:outline-none"
              placeholder="0"
              readOnly
              value={fromAmount ? (parseFloat(fromAmount) * 2450.32).toFixed(2) : ''}
            />
            <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors">
              <span className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center text-xs text-emerald-300">
                {popularTokens.find((t) => t.symbol === toToken)?.logo}
              </span>
              <span className="text-sm font-medium text-white">{toToken}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Route info */}
        {fromAmount && (
          <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Rate</span>
              <span className="text-slate-300">1 {fromToken} = 2,450.32 {toToken}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Route</span>
              <span className="text-slate-300 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Best route via Uniswap V3
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Slippage</span>
              <span className="text-slate-300">0.5%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Estimated time</span>
              <span className="text-slate-300">~15 seconds</span>
            </div>
          </div>
        )}

        <button
          onClick={handleSwap}
          disabled={!fromAmount || status !== 'idle'}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {status === 'quoting' && <Loader2 className="w-4 h-4 animate-spin" />}
          {status === 'swapping' && <Loader2 className="w-4 h-4 animate-spin" />}
          {status === 'idle' && <ArrowLeftRight className="w-4 h-4" />}
          {status === 'idle' && 'Swap'}
          {status === 'quoting' && 'Finding best route...'}
          {status === 'swapping' && 'Executing swap...'}
          {status === 'done' && 'Swap completed!'}
        </button>
      </div>

      {/* Popular tokens */}
      <div>
        <h2 className="text-sm font-medium text-slate-400 mb-3">Popular Tokens</h2>
        <div className="flex flex-wrap gap-2">
          {popularTokens.map((token) => (
            <button
              key={token.symbol}
              onClick={() => setToToken(token.symbol)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                toToken === token.symbol
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {token.symbol}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-slate-600">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <p>
          Swaps are executed via LiFi SDK which aggregates DEXs and bridges to find
          the best rates across chains. Connect the MPC server to enable real swaps.
        </p>
      </div>
    </div>
  );
}
