import { useQuery } from '@tanstack/react-query'
import { getRoutes } from '@lifi/sdk'
import type { RoutesRequest, Route } from '@lifi/sdk'
import { usePanopliaSwap } from '../../provider/context'

export interface UseRoutesParams {
  fromChainId?: number
  toChainId?: number
  fromTokenAddress?: string
  toTokenAddress?: string
  fromAmount?: string
  fromAddress?: string
  slippage?: number
}

export interface UseRoutesResult {
  routes: Route[]
  bestRoute: Route | undefined
  cheapestRoute: Route | undefined
  fastestRoute: Route | undefined
  isLoading: boolean
  error: Error | null
}

export function useRoutes(params: UseRoutesParams): UseRoutesResult {
  const { initialized, config } = usePanopliaSwap()
  const {
    fromChainId,
    toChainId,
    fromTokenAddress,
    toTokenAddress,
    fromAmount,
    fromAddress,
    slippage,
  } = params

  const enabled =
    initialized &&
    !!fromChainId &&
    !!toChainId &&
    !!fromTokenAddress &&
    !!toTokenAddress &&
    !!fromAmount &&
    fromAmount !== '0'

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'panoplia',
      'routes',
      fromChainId,
      toChainId,
      fromTokenAddress,
      toTokenAddress,
      fromAmount,
      fromAddress,
    ],
    queryFn: async () => {
      const request: RoutesRequest = {
        fromChainId: fromChainId!,
        toChainId: toChainId!,
        fromTokenAddress: fromTokenAddress!,
        toTokenAddress: toTokenAddress!,
        fromAmount: fromAmount!,
        options: {
          ...(fromAddress && { fromAddress }),
          ...(slippage !== undefined && { slippage }),
          ...(config.fee !== undefined && { fee: config.fee }),
          ...(config.integrator && { integrator: config.integrator }),
        },
      }
      const response = await getRoutes(request)
      return response.routes
    },
    enabled,
    staleTime: 30 * 1000,
    retry: 1,
  })

  const routes = data ?? []

  // Best route = first (LiFi returns recommended first)
  const bestRoute = routes[0]

  // Cheapest = highest toAmount
  const cheapestRoute = routes.length > 0
    ? [...routes].sort((a, b) => {
        const aVal = BigInt(b.toAmount)
        const bVal = BigInt(a.toAmount)
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      })[0]
    : undefined

  // Fastest = lowest estimated execution time
  const fastestRoute = routes.length > 0
    ? [...routes].sort(
        (a, b) =>
          (a.steps.reduce((s, step) => s + (step.estimate?.executionDuration ?? 0), 0)) -
          (b.steps.reduce((s, step) => s + (step.estimate?.executionDuration ?? 0), 0)),
      )[0]
    : undefined

  return {
    routes,
    bestRoute,
    cheapestRoute,
    fastestRoute,
    isLoading: enabled && isLoading,
    error: error as Error | null,
  }
}
