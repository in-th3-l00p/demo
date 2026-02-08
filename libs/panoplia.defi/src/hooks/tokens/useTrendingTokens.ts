import { useMemo } from 'react'
import type { Token } from '@lifi/sdk'
import { useTokens } from './useTokens'

export interface UseTrendingTokensParams {
  chains?: number[]
  limit?: number
}

export interface UseTrendingTokensResult {
  trendingByChain: Record<number, Token[]>
  topTrending: Token[]
  isLoading: boolean
  error: Error | null
}

/**
 * Returns "trending" tokens heuristic based on LiFi's token list ordering.
 * LiFi lists tokens roughly by popularity/volume, so the first N tokens
 * per chain serve as a reasonable trending proxy.
 */
export function useTrendingTokens({
  chains,
  limit = 10,
}: UseTrendingTokensParams = {}): UseTrendingTokensResult {
  const { tokensByChain, isLoading, error } = useTokens({ chains })

  const trendingByChain = useMemo(() => {
    const result: Record<number, Token[]> = {}
    for (const [chainId, tokens] of Object.entries(tokensByChain)) {
      // Take the first `limit` tokens per chain as the "trending" set
      result[Number(chainId)] = tokens.slice(0, limit)
    }
    return result
  }, [tokensByChain, limit])

  const topTrending = useMemo(() => {
    // Flatten and interleave from each chain to give cross-chain diversity
    const chains = Object.values(trendingByChain)
    const result: Token[] = []
    const maxLen = Math.max(...chains.map((c) => c.length), 0)

    for (let i = 0; i < maxLen && result.length < limit; i++) {
      for (const chainTokens of chains) {
        if (i < chainTokens.length && result.length < limit) {
          result.push(chainTokens[i])
        }
      }
    }
    return result
  }, [trendingByChain, limit])

  return {
    trendingByChain,
    topTrending,
    isLoading,
    error,
  }
}
