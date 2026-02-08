import { useQuery } from '@tanstack/react-query'
import { ChainType, getTokens } from '@lifi/sdk'
import type { Token } from '@lifi/sdk'
import { usePanopliaSwap } from '../../provider/context'

export interface UseTokensParams {
  chains?: number[]
}

export interface UseTokensResult {
  tokensByChain: Record<number, Token[]>
  allTokens: Token[]
  isLoading: boolean
  error: Error | null
}

export function useTokens(params: UseTokensParams = {}): UseTokensResult {
  const { initialized } = usePanopliaSwap()
  const { chains } = params

  const { data, isLoading, error } = useQuery({
    queryKey: ['panoplia', 'tokens', chains],
    queryFn: async () => {
      const response = await getTokens({ chains, chainTypes: [ChainType.EVM] })
      return response.tokens
    },
    enabled: initialized,
    staleTime: 5 * 60 * 1000,
  })

  const tokensByChain = data ?? {}

  const allTokens = Object.values(tokensByChain).flat()

  return {
    tokensByChain,
    allTokens,
    isLoading,
    error: error as Error | null,
  }
}
