const API_BASE = '/api';

type VaultStatus = 'pending' | 'active' | 'archived';
type TxStatus = 'pending' | 'signed' | 'broadcast' | 'confirmed' | 'failed';

export interface User {
  id: string;
  email: string;
  createdAt?: string;
}

export interface Vault {
  id: string;
  user_id: string;
  name: string;
  threshold: number;
  total_parties: number;
  status: VaultStatus;
  ecdsa_pubkey: string | null;
  eddsa_pubkey: string | null;
  created_at: string;
}

export interface VaultAddress {
  vault_id: string;
  chain: string;
  address: string;
}

export interface VaultDetail extends Vault {
  addresses: VaultAddress[];
}

export interface Transaction {
  id: string;
  vault_id: string;
  chain: string;
  to_address: string;
  amount: string;
  tx_hash: string | null;
  status: TxStatus;
  created_at: string;
}

export interface Guardian {
  identifier: string;
  name?: string;
}

export interface RecoveryConfig {
  id: string;
  vault_id: string;
  threshold: number;
  total_guardians: number;
  status: string;
  guardians: Array<{
    id: string;
    identifier: string;
    name: string | null;
    status: string;
  }>;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  return localStorage.getItem('panoplia_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message || body.error || res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// --- Auth ---

export async function register(
  email: string,
  password: string,
): Promise<{ token: string; user: User }> {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: User }> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(): Promise<User> {
  return request('/auth/me');
}

// --- Vaults ---

export async function createVault(
  name: string,
): Promise<{ vaultId: string; sessionId: string; qrPayload: string; status: string }> {
  return request('/vaults', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function listVaults(): Promise<{ vaults: Vault[] }> {
  return request('/vaults');
}

export async function getVault(id: string): Promise<VaultDetail> {
  return request(`/vaults/${id}`);
}

export async function archiveVault(id: string): Promise<void> {
  return request(`/vaults/${id}`, { method: 'DELETE' });
}

export async function exportVault(
  id: string,
  password?: string,
): Promise<{ vaultContent: string }> {
  const query = password ? `?password=${encodeURIComponent(password)}` : '';
  return request(`/vaults/${id}/export${query}`);
}

export async function importVault(
  fileContent: string,
  password?: string,
): Promise<{ vaultId: string }> {
  return request('/vaults/import', {
    method: 'POST',
    body: JSON.stringify({ fileContent, password }),
  });
}

export async function addDevice(
  vaultId: string,
  newTotal: number,
  newThreshold: number,
): Promise<{ sessionId: string; qrPayload: string }> {
  return request(`/vaults/${vaultId}/add-device`, {
    method: 'POST',
    body: JSON.stringify({ newTotal, newThreshold }),
  });
}

// --- Transactions ---

export async function signTransaction(
  vaultId: string,
  params: { chain: string; to: string; amount: string; memo?: string },
): Promise<{ sessionId: string; signingPayload: string }> {
  return request(`/vaults/${vaultId}/transactions/sign`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function listTransactions(
  vaultId: string,
): Promise<{ transactions: Transaction[] }> {
  return request(`/vaults/${vaultId}/transactions`);
}

// --- Recovery ---

export async function setupRecovery(
  vaultId: string,
  guardians: Guardian[],
  threshold: number,
): Promise<{ recoveryId: string; guardianIds: string[] }> {
  return request(`/vaults/${vaultId}/recovery/setup`, {
    method: 'POST',
    body: JSON.stringify({ guardians, threshold }),
  });
}

export async function getRecoveryConfig(
  vaultId: string,
): Promise<RecoveryConfig | null> {
  try {
    return await request(`/vaults/${vaultId}/recovery`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function revokeRecovery(vaultId: string): Promise<void> {
  return request(`/vaults/${vaultId}/recovery`, { method: 'DELETE' });
}

export async function initiateRecovery(
  vaultId: string,
  email: string,
): Promise<{ attemptId: string; sharesNeeded: number }> {
  return request('/recovery/initiate', {
    method: 'POST',
    body: JSON.stringify({ vaultId, email }),
  });
}

export async function submitShare(
  attemptId: string,
  guardianId: string,
  shareData: string,
): Promise<{ collected: number; needed: number }> {
  return request(`/recovery/submit-share?attemptId=${attemptId}`, {
    method: 'POST',
    body: JSON.stringify({ guardianId, shareData }),
  });
}

export async function completeRecovery(
  attemptId: string,
): Promise<{ vaultContent: string }> {
  return request(`/recovery/${attemptId}/complete`, { method: 'POST' });
}

// --- Health ---

export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  return request('/health');
}
