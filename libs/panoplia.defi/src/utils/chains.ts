/** Common EVM chain IDs */
export const CHAIN_ID = {
  ETHEREUM: 1,
  OPTIMISM: 10,
  BSC: 56,
  GNOSIS: 100,
  POLYGON: 137,
  FANTOM: 250,
  ZKSYNC: 324,
  POLYGON_ZKEVM: 1101,
  BASE: 8453,
  ARBITRUM: 42161,
  AVALANCHE: 43114,
  LINEA: 59144,
  SCROLL: 534352,
  AURORA: 1313161554,
} as const

export type SupportedChainId = (typeof CHAIN_ID)[keyof typeof CHAIN_ID]

const EXPLORER_URLS: Record<number, string> = {
  [CHAIN_ID.ETHEREUM]: 'https://etherscan.io',
  [CHAIN_ID.OPTIMISM]: 'https://optimistic.etherscan.io',
  [CHAIN_ID.BSC]: 'https://bscscan.com',
  [CHAIN_ID.GNOSIS]: 'https://gnosisscan.io',
  [CHAIN_ID.POLYGON]: 'https://polygonscan.com',
  [CHAIN_ID.FANTOM]: 'https://ftmscan.com',
  [CHAIN_ID.ZKSYNC]: 'https://explorer.zksync.io',
  [CHAIN_ID.BASE]: 'https://basescan.org',
  [CHAIN_ID.ARBITRUM]: 'https://arbiscan.io',
  [CHAIN_ID.AVALANCHE]: 'https://snowtrace.io',
  [CHAIN_ID.LINEA]: 'https://lineascan.build',
  [CHAIN_ID.SCROLL]: 'https://scrollscan.com',
}

/**
 * Get the block explorer URL for a chain.
 */
export function getExplorerUrl(chainId: number): string | undefined {
  return EXPLORER_URLS[chainId]
}

/**
 * Get a transaction URL on the block explorer.
 */
export function getExplorerTxUrl(chainId: number, txHash: string): string | undefined {
  const base = EXPLORER_URLS[chainId]
  if (!base) return undefined
  return `${base}/tx/${txHash}`
}

/**
 * Get an address URL on the block explorer.
 */
export function getExplorerAddressUrl(chainId: number, address: string): string | undefined {
  const base = EXPLORER_URLS[chainId]
  if (!base) return undefined
  return `${base}/address/${address}`
}

/**
 * Get a token URL on the block explorer.
 */
export function getExplorerTokenUrl(chainId: number, tokenAddress: string): string | undefined {
  const base = EXPLORER_URLS[chainId]
  if (!base) return undefined
  return `${base}/token/${tokenAddress}`
}
