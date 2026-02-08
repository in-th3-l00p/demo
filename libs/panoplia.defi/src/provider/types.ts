import type { Config as WagmiConfig } from 'wagmi'

export interface PanopliaSwapConfig {
  /** Required — your LiFi integrator identifier */
  integrator: string
  /** Required — wagmi config from the consuming app */
  wagmiConfig: WagmiConfig
  /** Optional API key for higher rate limits */
  apiKey?: string
  /** Custom RPC URLs keyed by chain ID */
  rpcUrls?: Record<number, string[]>
  /** Integrator fee as a decimal (e.g. 0.03 = 3%) */
  fee?: number
}

export interface PanopliaSwapContextValue {
  /** Whether the LiFi SDK has been initialized */
  initialized: boolean
  /** The config passed to the provider */
  config: PanopliaSwapConfig
}
