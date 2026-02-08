import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Key,
  Lock,
  Copy,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  Download,
  Wallet,
} from 'lucide-react';
import * as mpc from '@/api/mpc';
import { useWallets } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';
import StatusBadge from '@/components/StatusBadge';

interface GuardianInput {
  identifier: string;
  name: string;
}

type RecoveryStep = 'setup' | 'initiate' | 'collect' | 'complete' | 'import' | 'restored';

export default function Recovery() {
  const [searchParams] = useSearchParams();
  const { vaults, refresh: refreshWallets } = useWallets();
  const { user } = useAuth();
  const activeVaults = vaults.filter((v) => v.status === 'active');

  // --- Setup state ---
  const [selectedVault, setSelectedVault] = useState(searchParams.get('vault') || '');
  const [recoveryConfig, setRecoveryConfig] = useState<mpc.RecoveryConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [guardians, setGuardians] = useState<GuardianInput[]>([
    { identifier: '', name: '' },
    { identifier: '', name: '' },
    { identifier: '', name: '' },
  ]);
  const [threshold, setThreshold] = useState(2);
  const [setupStatus, setSetupStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [setupError, setSetupError] = useState('');
  const [setupResult, setSetupResult] = useState<{ recoveryId: string; guardianIds: string[] } | null>(null);

  // --- Recovery flow state ---
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>('initiate');
  const [recoverVaultId, setRecoverVaultId] = useState('');
  const [recoverEmail, setRecoverEmail] = useState(user?.email || '');
  const [attemptId, setAttemptId] = useState('');
  const [sharesNeeded, setSharesNeeded] = useState(0);
  const [sharesCollected, setSharesCollected] = useState(0);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [restoredVaultContent, setRestoredVaultContent] = useState('');
  const [importedVaultId, setImportedVaultId] = useState('');

  // --- Clipboard ---
  const [copied, setCopied] = useState<string | null>(null);
  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // --- Load recovery config for selected vault ---
  useEffect(() => {
    if (!selectedVault) {
      setRecoveryConfig(null);
      return;
    }
    setConfigLoading(true);
    mpc
      .getRecoveryConfig(selectedVault)
      .then(setRecoveryConfig)
      .catch(() => setRecoveryConfig(null))
      .finally(() => setConfigLoading(false));
  }, [selectedVault]);

  useEffect(() => {
    if (!selectedVault && activeVaults.length > 0) {
      setSelectedVault(activeVaults[0].id);
    }
  }, [activeVaults, selectedVault]);

  // --- Poll share collection progress ---
  const pollProgress = useCallback(async () => {
    if (!attemptId || recoveryStep !== 'collect') return;
    try {
      // Try submitting a dummy to get current count — or we rely on the last known state
      // For polling, we'll try to complete and check the error
      const result = await mpc.completeRecovery(attemptId).catch(() => null);
      if (result) {
        setRestoredVaultContent(result.vaultContent);
        setRecoveryStep('complete');
      }
    } catch {
      // not enough shares yet
    }
  }, [attemptId, recoveryStep]);

  useEffect(() => {
    if (recoveryStep !== 'collect') return;
    const interval = setInterval(pollProgress, 3000);
    return () => clearInterval(interval);
  }, [recoveryStep, pollProgress]);

  // --- Setup handlers ---
  const addGuardian = () => setGuardians([...guardians, { identifier: '', name: '' }]);
  const removeGuardian = (i: number) => {
    if (guardians.length <= 2) return;
    setGuardians(guardians.filter((_, idx) => idx !== i));
  };
  const updateGuardian = (i: number, field: 'identifier' | 'name', value: string) => {
    setGuardians(guardians.map((g, idx) => (idx === i ? { ...g, [field]: value } : g)));
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVault) return;
    const validGuardians = guardians.filter((g) => g.identifier.trim());
    if (validGuardians.length < 2) {
      setSetupError('At least 2 guardians required');
      return;
    }
    if (threshold > validGuardians.length) {
      setSetupError('Threshold cannot exceed number of guardians');
      return;
    }
    setSetupError('');
    setSetupStatus('saving');
    try {
      const result = await mpc.setupRecovery(selectedVault, validGuardians, threshold);
      setSetupResult(result);
      setSetupStatus('done');
      const config = await mpc.getRecoveryConfig(selectedVault);
      setRecoveryConfig(config);
    } catch (err: any) {
      setSetupError(err.message || 'Setup failed');
      setSetupStatus('error');
    }
  };

  const handleRevoke = async () => {
    if (!selectedVault) return;
    if (!confirm('Are you sure you want to revoke recovery? Guardian shares will be invalidated.')) return;
    await mpc.revokeRecovery(selectedVault);
    setRecoveryConfig(null);
    setSetupResult(null);
    setSetupStatus('idle');
  };

  // --- Recovery flow handlers ---
  const handleInitiateRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoveryLoading(true);
    try {
      const result = await mpc.initiateRecovery(recoverVaultId, recoverEmail);
      setAttemptId(result.attemptId);
      setSharesNeeded(result.sharesNeeded);
      setSharesCollected(0);
      setRecoveryStep('collect');
    } catch (err: any) {
      setRecoveryError(err.message || 'Failed to initiate recovery');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleCompleteRecovery = async () => {
    setRecoveryLoading(true);
    setRecoveryError('');
    try {
      const result = await mpc.completeRecovery(attemptId);
      setRestoredVaultContent(result.vaultContent);
      setRecoveryStep('complete');
    } catch (err: any) {
      setRecoveryError(err.message || 'Not enough shares yet');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleImportVault = async () => {
    setRecoveryLoading(true);
    setRecoveryError('');
    try {
      const result = await mpc.importVault(restoredVaultContent);
      setImportedVaultId(result.vaultId);
      setRecoveryStep('restored');
      await refreshWallets();
    } catch (err: any) {
      setRecoveryError(err.message || 'Import failed');
    } finally {
      setRecoveryLoading(false);
    }
  };

  // --- Guardian info for generating links ---
  const guardianPageUrl = (gId?: string) => {
    const base = `${window.location.origin}/recovery/guardian`;
    const params = new URLSearchParams();
    if (attemptId) params.set('attempt', attemptId);
    if (gId) params.set('guardian', gId);
    return params.toString() ? `${base}?${params}` : base;
  };

  const validGuardianCount = guardians.filter((g) => g.identifier.trim()).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Social Recovery</h1>
        <p className="text-slate-400 mt-1">
          Protect your wallet with Shamir Secret Sharing &mdash; trusted guardians can help you recover
        </p>
      </div>

      {/* How it works */}
      <div className="card bg-gradient-to-br from-purple-600/10 to-transparent border-purple-500/20">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Key, color: 'text-purple-400 bg-purple-500/10', label: 'Split', desc: 'Vault key split via Shamir' },
            { icon: Users, color: 'text-purple-400 bg-purple-500/10', label: 'Distribute', desc: 'Shares go to guardians' },
            { icon: Shield, color: 'text-amber-400 bg-amber-500/10', label: 'Collect', desc: 'K guardians approve' },
            { icon: Lock, color: 'text-emerald-400 bg-emerald-500/10', label: 'Restore', desc: 'Vault reconstructed' },
          ].map(({ icon: Icon, color, label, desc }) => (
            <div key={label} className="text-center">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-1.5 ${color}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <p className="text-xs font-medium text-white">{label}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════ SECTION 1: SETUP ═══════════ */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-xs font-bold text-purple-400">1</span>
          Setup Recovery
        </h2>

        {/* Vault selector */}
        <div>
          <label className="label">Select Wallet</label>
          <select className="input" value={selectedVault} onChange={(e) => { setSelectedVault(e.target.value); setSetupStatus('idle'); setSetupResult(null); }}>
            <option value="">Select a wallet...</option>
            {activeVaults.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        {selectedVault && configLoading && (
          <div className="card flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        )}

        {/* Existing config */}
        {selectedVault && !configLoading && recoveryConfig && (
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Recovery Active
              </h3>
              <StatusBadge status="active" />
            </div>

            <div className="bg-slate-800 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Threshold</span>
                <span className="text-white">{recoveryConfig.threshold} of {recoveryConfig.total_guardians}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Vault ID</span>
                <button onClick={() => copyText(selectedVault, 'vault')} className="flex items-center gap-1 text-slate-300 hover:text-white font-mono text-xs">
                  {selectedVault.slice(0, 12)}...
                  {copied === 'vault' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2">Guardians</h4>
              <div className="space-y-2">
                {recoveryConfig.guardians.map((g) => (
                  <div key={g.id} className="flex items-center gap-3 bg-slate-800 rounded-lg px-3 py-2.5">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{g.name || 'Guardian'}</p>
                      <p className="text-xs text-slate-500">{g.identifier}</p>
                    </div>
                    <button
                      onClick={() => copyText(g.id, g.id)}
                      className="text-xs font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 shrink-0"
                      title="Copy guardian ID"
                    >
                      {g.id.slice(0, 8)}...
                      {copied === g.id ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
              <p className="text-xs text-amber-400 font-medium mb-1">Save these for recovery</p>
              <p className="text-xs text-slate-400">
                Share each guardian's ID with them privately. They'll need it to submit
                their share if you ever lose access.
              </p>
            </div>

            <button onClick={handleRevoke} className="btn-danger w-full flex items-center justify-center gap-2 text-sm">
              <Trash2 className="w-4 h-4" />
              Revoke Recovery
            </button>
          </div>
        )}

        {/* Setup form */}
        {selectedVault && !configLoading && !recoveryConfig && (
          <form onSubmit={handleSetup} className="card space-y-4">
            {setupError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">{setupError}</div>
            )}

            {setupStatus === 'done' && setupResult ? (
              <div className="space-y-4">
                <div className="text-center py-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <p className="text-white font-medium">Recovery configured!</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {threshold} of {validGuardianCount} guardians can recover your wallet.
                  </p>
                </div>

                {/* Show guardian IDs */}
                <div className="bg-slate-800 rounded-lg divide-y divide-slate-700">
                  {setupResult.guardianIds.map((gId, i) => {
                    const g = guardians.filter((g) => g.identifier.trim())[i];
                    return (
                      <div key={gId} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm text-white">{g?.name || g?.identifier || `Guardian ${i + 1}`}</p>
                          <p className="text-xs text-slate-500">{g?.identifier}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyText(gId, gId)}
                          className="font-mono text-xs bg-slate-700 hover:bg-slate-600 px-2.5 py-1.5 rounded flex items-center gap-1.5 text-slate-300 transition-colors"
                        >
                          {copied === gId ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {gId.slice(0, 12)}...
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-xs text-amber-400 font-medium mb-1">Important: Save guardian IDs</p>
                  <p className="text-xs text-slate-400">
                    Send each guardian their unique ID. They will need it to approve recovery
                    if you ever lose your device. Also save your Vault ID:
                  </p>
                  <button
                    type="button"
                    onClick={() => copyText(selectedVault, 'vault-setup')}
                    className="mt-2 font-mono text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded flex items-center gap-1.5 text-purple-400 transition-colors"
                  >
                    {copied === 'vault-setup' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Vault: {selectedVault.slice(0, 20)}...
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="label">Guardians</label>
                  <div className="space-y-2">
                    {guardians.map((g, i) => (
                      <div key={i} className="flex gap-2">
                        <input className="input flex-1" placeholder="Email or identifier" value={g.identifier} onChange={(e) => updateGuardian(i, 'identifier', e.target.value)} />
                        <input className="input w-32" placeholder="Name" value={g.name} onChange={(e) => updateGuardian(i, 'name', e.target.value)} />
                        <button type="button" onClick={() => removeGuardian(i)} className="p-2.5 text-slate-600 hover:text-red-400 transition-colors" disabled={guardians.length <= 2}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addGuardian} className="mt-2 text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add guardian
                  </button>
                </div>

                <div>
                  <label className="label">Recovery threshold</label>
                  <select className="input" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}>
                    {Array.from({ length: Math.max(validGuardianCount - 1, 0) }, (_, i) => i + 2).map((n) => (
                      <option key={n} value={n}>{n} of {validGuardianCount} guardians</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={setupStatus === 'saving'}>
                  {setupStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  {setupStatus === 'saving' ? 'Setting up...' : 'Setup Recovery'}
                </button>
              </>
            )}
          </form>
        )}
      </div>

      {/* ═══════════ SECTION 2: RECOVER ═══════════ */}
      <div className="border-t border-slate-800 pt-6 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-xs font-bold text-purple-400">2</span>
          Recover Wallet
          <span className="text-xs font-normal text-slate-500 ml-1">(no auth needed)</span>
        </h2>

        {recoveryError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">{recoveryError}</div>
        )}

        {/* Step: Initiate */}
        {recoveryStep === 'initiate' && (
          <form onSubmit={handleInitiateRecovery} className="card space-y-4">
            <p className="text-sm text-slate-400">
              Lost your device? Start the recovery process. Your guardians will approve,
              and your vault will be reconstructed.
            </p>

            <div>
              <label className="label">Vault ID</label>
              <input
                className="input font-mono text-sm"
                placeholder="Paste your vault ID"
                value={recoverVaultId}
                onChange={(e) => setRecoverVaultId(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Your registered email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={recoverEmail}
                onChange={(e) => setRecoverEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={recoveryLoading}>
              {recoveryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              {recoveryLoading ? 'Initiating...' : 'Start Recovery'}
            </button>
          </form>
        )}

        {/* Step: Collect shares */}
        {recoveryStep === 'collect' && (
          <div className="card space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Waiting for Guardian Approvals</h3>
                <p className="text-sm text-slate-400">
                  {sharesCollected} of {sharesNeeded} shares collected
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-violet-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${sharesNeeded > 0 ? (sharesCollected / sharesNeeded) * 100 : 0}%` }}
              />
            </div>

            {/* Attempt info */}
            <div className="bg-slate-800 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Recovery Attempt ID</p>
                <button
                  onClick={() => copyText(attemptId, 'attempt')}
                  className="font-mono text-sm bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg flex items-center gap-2 text-white w-full transition-colors"
                >
                  {copied === 'attempt' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span className="truncate">{attemptId}</span>
                </button>
              </div>

              <div className="border-t border-slate-700 pt-3">
                <p className="text-xs text-slate-500 mb-2">Send this link to your guardians:</p>
                <button
                  onClick={() => copyText(guardianPageUrl(), 'guardian-link')}
                  className="font-mono text-xs bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg flex items-center gap-2 text-purple-400 w-full transition-colors break-all text-left"
                >
                  {copied === 'guardian-link' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <ExternalLink className="w-4 h-4 shrink-0" />}
                  <span className="truncate">{guardianPageUrl()}</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCompleteRecovery}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={recoveryLoading}
              >
                {recoveryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {recoveryLoading ? 'Checking...' : 'Complete Recovery'}
              </button>
              <button
                onClick={async () => {
                  try {
                    await mpc.completeRecovery(attemptId);
                  } catch (err: any) {
                    // Parse the shares count from error if possible
                    const match = err.message?.match(/have (\d+)/);
                    if (match) setSharesCollected(Number(match[1]));
                  }
                }}
                className="btn-secondary px-3"
                title="Refresh progress"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 text-center">
              Open the guardian link in another tab to simulate guardian approvals
            </p>
          </div>
        )}

        {/* Step: Complete — vault content ready */}
        {recoveryStep === 'complete' && (
          <div className="card space-y-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-white">Vault Reconstructed!</h3>
              <p className="text-sm text-slate-400 mt-1">
                Your guardians provided enough shares. The vault data has been recovered via Shamir's Secret Sharing.
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-3 text-left">
              <p className="text-xs text-slate-500 mb-1">Recovered vault content (base64)</p>
              <p className="font-mono text-xs text-slate-400 break-all line-clamp-3">
                {restoredVaultContent.slice(0, 120)}...
              </p>
            </div>

            <button
              onClick={handleImportVault}
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={recoveryLoading}
            >
              {recoveryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {recoveryLoading ? 'Importing...' : 'Import Vault to This Device'}
            </button>
          </div>
        )}

        {/* Step: Restored */}
        {recoveryStep === 'restored' && (
          <div className="card space-y-4 text-center">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
              <div className="relative w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <Wallet className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Wallet Restored!</h3>
              <p className="text-sm text-slate-400 mt-1">
                Your wallet has been successfully recovered and imported. All addresses and keys are intact.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Link to={`/wallets/${importedVaultId}`} className="btn-primary flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                View Wallet
              </Link>
              <Link to="/" className="btn-secondary">
                Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
