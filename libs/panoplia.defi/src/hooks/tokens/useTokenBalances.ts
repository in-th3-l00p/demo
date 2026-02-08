import { useQuery } from '@tanstack/react-query'
import { getTokenBalances as fetchTokenBalances } from '@lifi/sdk'
import type { Token, TokenAmount } from '@lifi/sdk'
import { usePanopliaSwap } from '../../provider/context'

export interface UseTokenBalancesParams {
  walletAddress?: string
  tokensByChain?: Record<number, Token[]>
}

export interface UseTokenBalancesResult {
  balancesByChain: Record<number, TokenAmount[]>
  nonZeroBalances: TokenAmount[]
  totalValueUsd: number
  isLoading: boolean
  error: Error | null
}

export function useTokenBalances({
  walletAddress,
  tokensByChain,
}: UseTokenBalancesParams = {}): UseTokenBalancesResult {
  const { initialized } = usePanopliaSwap()

  const chainIds = tokensByChain ? Object.keys(tokensByChain).map(Number) : []

  const { data, isLoading, error } = useQuery({
    queryKey: ['panoplia', 'balances', walletAddress, chainIds],
    queryFn: async () => {
      if (!walletAddress || !tokensByChain) return {}

      const results: Record<number, TokenAmount[]> = {}

      // Fetch balances per chain in parallel
      const entries = Object.entries(tokensByChain)
      const balanceResults = await Promise.allSettled(
        entries.map(async ([chainId, tokens]) => {
          const balances = await fetchTokenBalances(walletAddress as `0x${string}`, tokens)
          return { chainId: Number(chainId), balances }
        }),
      )

      for (const result of balanceResults) {
        if (result.status === 'fulfilled') {
          results[result.value.chainId] = result.value.balances
        }
      }

      return results
    },
    enabled: initialized && !!walletAddress && !!tokensByChain && chainIds.length > 0,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })

  const balancesByChain = data ?? {}

  const nonZeroBalances = Object.values(balancesByChain)
    .flat()
    .filter((t) => t.amount && BigInt(t.amount) > 0n)

  const totalValueUsd = nonZeroBalances.reduce((sum, t) => {
    const usdValue = t.priceUSD
      ? parseFloat(t.priceUSD) * parseFloat(String(t.amount ?? '0')) / Math.pow(10, t.decimals)
      : 0
    return sum + usdValue
  }, 0)

  return {
    balancesByChain,
    nonZeroBalances,
    totalValueUsd,
    isLoading,
    error: error as Error | null,
  }
}
