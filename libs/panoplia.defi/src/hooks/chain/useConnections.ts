import { useQuery } from '@tanstack/react-query'
import { ChainType, getConnections } from '@lifi/sdk'
import type { ConnectionsRequest, ConnectionsResponse } from '@lifi/sdk'
import { usePanopliaSwap } from '../../provider/context'

export interface UseConnectionsParams {
  fromChain?: number
  fromToken?: string
  toChain?: number
  toToken?: string
}

export interface UseConnectionsResult {
  connections: ConnectionsResponse['connections']
  isLoading: boolean
  error: Error | null
}

export function useConnections(params: UseConnectionsParams = {}): UseConnectionsResult {
  const { initialized } = usePanopliaSwap()
  const { fromChain, fromToken, toChain, toToken } = params

  const request: ConnectionsRequest = {
    ...(fromChain && { fromChain }),
    ...(fromToken && { fromToken }),
    ...(toChain && { toChain }),
    ...(toToken && { toToken }),
    chainTypes: [ChainType.EVM],
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['panoplia', 'connections', fromChain, fromToken, toChain, toToken],
    queryFn: () => getConnections(request),
    enabled: initialized,
    staleTime: 5 * 60 * 1000,
  })

  return {
    connections: data?.connections ?? [],
    isLoading,
    error: error as Error | null,
  }
}
