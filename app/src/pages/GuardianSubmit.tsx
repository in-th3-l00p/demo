import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Lock,
  Copy,
  ArrowLeft,
} from 'lucide-react';
import * as mpc from '@/api/mpc';

type Step = 'form' | 'submitting' | 'success' | 'error';

export default function GuardianSubmit() {
  const [searchParams] = useSearchParams();
  const [attemptId, setAttemptId] = useState(searchParams.get('attempt') || '');
  const [guardianId, setGuardianId] = useState(searchParams.get('guardian') || '');
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ collected: number; needed: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attemptId.trim() || !guardianId.trim()) {
      setError('Both fields are required');
      return;
    }

    setStep('submitting');
    setError('');

    try {
      // The shareData is the guardian's approval token.
      // The server already stores the encrypted Shamir shares —
      // it just needs to know which guardian is approving.
      const shareData = btoa(JSON.stringify({
        guardianId,
        timestamp: new Date().toISOString(),
        approval: true,
      }));

      const res = await mpc.submitShare(attemptId, guardianId, shareData);
      setResult(res);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to submit share');
      setStep('error');
    }
  };

  const copyAttemptId = () => {
    navigator.clipboard.writeText(attemptId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Guardian Recovery</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Someone you trust is recovering their wallet. Approve their recovery
            by submitting your guardian share.
          </p>
        </div>

        {/* Form step */}
        {(step === 'form' || step === 'error') && (
          <form onSubmit={handleSubmit} className="card space-y-5">
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-purple-300">How this works</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Your share is one piece of the wallet's recovery key, split using Shamir's Secret Sharing.
                    Once enough guardians approve, the wallet owner can reconstruct their vault.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label className="label">Recovery Attempt ID</label>
              <input
                className="input font-mono text-sm"
                placeholder="Paste the attempt ID shared with you"
                value={attemptId}
                onChange={(e) => setAttemptId(e.target.value)}
                required
              />
              <p className="text-xs text-slate-600 mt-1">
                The wallet owner should have sent you this ID
              </p>
            </div>

            <div>
              <label className="label">Your Guardian ID</label>
              <input
                className="input font-mono text-sm"
                placeholder="Paste your guardian ID"
                value={guardianId}
                onChange={(e) => setGuardianId(e.target.value)}
                required
              />
              <p className="text-xs text-slate-600 mt-1">
                This was given to you when recovery was set up
              </p>
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              <UserCheck className="w-4 h-4" />
              Approve Recovery
            </button>
          </form>
        )}

        {/* Submitting step */}
        {step === 'submitting' && (
          <div className="card text-center py-10">
            <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white font-medium">Submitting your share...</p>
            <p className="text-sm text-slate-400 mt-1">Verifying guardian identity and recording approval</p>
          </div>
        )}

        {/* Success step */}
        {step === 'success' && result && (
          <div className="card space-y-5">
            <div className="text-center">
              <div className="relative w-14 h-14 mx-auto mb-4">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                <div className="relative w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
              </div>
              <h2 className="text-lg font-medium text-white">Share Submitted!</h2>
              <p className="text-sm text-slate-400 mt-1">
                Thank you for approving this recovery request.
              </p>
            </div>

            {/* Progress indicator */}
            <div className="bg-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Shares collected</span>
                <span className="text-white font-medium">{result.collected} of {result.needed}</span>
              </div>
              <div className="bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(result.collected / result.needed) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 text-center">
                {result.collected >= result.needed
                  ? 'Enough shares collected! The wallet owner can now complete recovery.'
                  : `${result.needed - result.collected} more guardian${result.needed - result.collected === 1 ? '' : 's'} needed to complete recovery.`}
              </p>
            </div>

            {/* Attempt ID for reference */}
            <div className="bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1.5">Recovery Attempt</p>
              <button
                onClick={copyAttemptId}
                className="font-mono text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {attemptId.slice(0, 24)}...
              </button>
            </div>

            <p className="text-xs text-slate-600 text-center">
              You can close this page. No further action is needed from you.
            </p>
          </div>
        )}

        {/* Footer link */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-sm text-slate-600 hover:text-slate-400 inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go to Panoplia Wallet
          </Link>
        </div>
      </div>
    </div>
  );
}
