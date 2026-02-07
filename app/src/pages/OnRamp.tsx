import { useState } from 'react';
import {
  DollarSign,
  CreditCard,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Info,
  ArrowRight,
  Shield,
} from 'lucide-react';

// Demonstrates integration with panoplia.peer onramp (ZKP2P)

const paymentMethods = [
  { id: 'venmo', name: 'Venmo', icon: '$', color: 'bg-blue-500/10 text-blue-400' },
  { id: 'cashapp', name: 'Cash App', icon: '$', color: 'bg-green-500/10 text-green-400' },
  { id: 'zelle', name: 'Zelle', icon: '$', color: 'bg-purple-500/10 text-purple-400' },
  { id: 'paypal', name: 'PayPal', icon: '$', color: 'bg-blue-500/10 text-blue-400' },
  { id: 'wise', name: 'Wise', icon: '$', color: 'bg-emerald-500/10 text-emerald-400' },
  { id: 'revolut', name: 'Revolut', icon: '$', color: 'bg-sky-500/10 text-sky-400' },
];

const currencies = ['USD', 'EUR', 'GBP'];

export default function OnRamp() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState('venmo');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'processing' | 'proving' | 'done'>('idle');
  const [extensionStatus] = useState<'needs_install' | 'needs_connection' | 'ready'>('ready');

  const handleBuy = async () => {
    setStatus('connecting');
    await new Promise((r) => setTimeout(r, 1500));
    setStatus('processing');
    await new Promise((r) => setTimeout(r, 3000));
    setStatus('proving');
    await new Promise((r) => setTimeout(r, 2000));
    setStatus('done');
  };

  const selectedMethod = paymentMethods.find((m) => m.id === paymentMethod);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">Buy Crypto</h1>
          <span className="badge-info text-xs">Powered by Peer</span>
        </div>
        <p className="text-slate-400 mt-1">
          On-ramp fiat to crypto using ZKP2P
        </p>
      </div>

      {/* Extension status */}
      <div className={`card py-3 flex items-center gap-3 ${
        extensionStatus === 'ready'
          ? 'border-emerald-500/20'
          : extensionStatus === 'needs_connection'
          ? 'border-amber-500/20'
          : 'border-red-500/20'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          extensionStatus === 'ready' ? 'bg-emerald-400' :
          extensionStatus === 'needs_connection' ? 'bg-amber-400' : 'bg-red-400'
        }`} />
        <span className="text-sm text-slate-300">
          {extensionStatus === 'ready' && 'Peer extension connected'}
          {extensionStatus === 'needs_connection' && 'Peer extension needs connection'}
          {extensionStatus === 'needs_install' && 'Peer extension not installed'}
        </span>
        {extensionStatus !== 'ready' && (
          <button className="text-xs text-indigo-400 hover:text-indigo-300 ml-auto">
            {extensionStatus === 'needs_install' ? 'Install' : 'Connect'}
          </button>
        )}
      </div>

      {status === 'done' ? (
        <div className="card text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Purchase Complete!</h3>
          <p className="text-sm text-slate-400 mt-2">
            Your crypto has been delivered to your wallet. ZK proof verified on-chain.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="btn-primary mt-6"
          >
            Buy More
          </button>
        </div>
      ) : (
        <div className="card space-y-4">
          {/* Amount + Currency */}
          <div>
            <label className="label">You pay</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  {currency === 'USD' ? '$' : currency === 'EUR' ? '\u20ac' : '\u00a3'}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  className="input pl-8"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <select
                className="input w-24"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* You receive */}
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">You receive</span>
              <span className="text-xs text-slate-500">on Base</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-white">
                {amount ? (parseFloat(amount) * 0.995).toFixed(2) : '0.00'}
              </span>
              <span className="text-lg font-medium text-slate-300">USDC</span>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <label className="label">Payment method</label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-colors ${
                    paymentMethod === method.id
                      ? 'bg-indigo-500/10 border-indigo-500/30'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${method.color}`}>
                    <span className="text-sm font-bold">{method.icon}</span>
                  </div>
                  <span className="text-xs text-slate-300">{method.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="label">Recipient address</label>
            <input
              className="input font-mono text-sm"
              placeholder="0x... (your wallet address)"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </div>

          {/* Flow preview */}
          {amount && (
            <div className="bg-slate-800/50 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Payment</span>
                <span className="text-slate-300">{selectedMethod?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Fee</span>
                <span className="text-slate-300">0.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Privacy</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  ZK proof verified
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleBuy}
            disabled={!amount || status !== 'idle'}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {status === 'idle' && <CreditCard className="w-4 h-4" />}
            {status !== 'idle' && <Loader2 className="w-4 h-4 animate-spin" />}
            {status === 'idle' && 'Buy USDC'}
            {status === 'connecting' && 'Connecting to Peer...'}
            {status === 'processing' && 'Processing payment...'}
            {status === 'proving' && 'Generating ZK proof...'}
          </button>
        </div>
      )}

      {/* How it works */}
      <div className="card">
        <h3 className="text-sm font-medium text-white mb-3">How it works</h3>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Choose amount and payment method' },
            { step: '2', text: 'Complete payment via your app (Venmo, etc.)' },
            { step: '3', text: 'ZK proof verifies payment without exposing details' },
            { step: '4', text: 'USDC is delivered to your wallet on-chain' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-6 h-6 bg-indigo-500/10 rounded-full flex items-center justify-center text-xs font-medium text-indigo-400 shrink-0">
                {step}
              </div>
              <p className="text-sm text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-slate-600">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <p>
          On-ramping is powered by ZKP2P via the Peer protocol. Payments are verified
          using zero-knowledge proofs, ensuring privacy and trustlessness.
        </p>
      </div>
    </div>
  );
}
