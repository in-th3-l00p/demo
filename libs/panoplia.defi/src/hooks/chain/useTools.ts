import { useQuery } from '@tanstack/react-query'
import { getTools } from '@lifi/sdk'
import type { ToolsResponse } from '@lifi/sdk'
import { usePanopliaSwap } from '../../provider/context'

export type ToolBridge = ToolsResponse['bridges'][number]
export type ToolExchange = ToolsResponse['exchanges'][number]

export interface UseToolsResult {
  bridges: ToolBridge[]
  exchanges: ToolExchange[]
  isLoading: boolean
  error: Error | null
}

export function useTools(): UseToolsResult {
  const { initialized } = usePanopliaSwap()

  const { data, isLoading, error } = useQuery({
    queryKey: ['panoplia', 'tools'],
    queryFn: () => getTools(),
    enabled: initialized,
    staleTime: 10 * 60 * 1000,
  })

  return {
    bridges: data?.bridges ?? [],
    exchanges: data?.exchanges ?? [],
    isLoading,
    error: error as Error | null,
  }
}
