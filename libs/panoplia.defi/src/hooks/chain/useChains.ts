import { useQuery } from '@tanstack/react-query'
import { ChainType, getChains } from '@lifi/sdk'
import type { ExtendedChain } from '@lifi/sdk'
import { usePanopliaSwap } from '../../provider/context'

export interface UseChainsResult {
  chains: ExtendedChain[]
  getChain: (chainId: number) => ExtendedChain | undefined
  isLoading: boolean
  error: Error | null
}

export function useChains(): UseChainsResult {
  const { initialized } = usePanopliaSwap()

  const { data, isLoading, error } = useQuery({
    queryKey: ['panoplia', 'chains'],
    queryFn: () => getChains({ chainTypes: [ChainType.EVM] }),
    enabled: initialized,
    staleTime: 5 * 60 * 1000,
  })

  const chains = data ?? []

  const getChain = (chainId: number) =>
    chains.find((c) => c.id === chainId)

  return {
    chains,
    getChain,
    isLoading,
    error: error as Error | null,
  }
}
