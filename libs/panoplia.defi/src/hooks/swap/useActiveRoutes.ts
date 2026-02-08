import { useQuery } from '@tanstack/react-query'
import { getActiveRoute, getActiveRoutes } from '@lifi/sdk'
import type { Route } from '@lifi/sdk'
import { usePanopliaSwap } from '../../provider/context'

export interface UseActiveRoutesResult {
  activeRoutes: Route[]
  count: number
  hasActive: boolean
  isLoading: boolean
  getRoute: (routeId: string) => Promise<Route | undefined>
}

export function useActiveRoutes(): UseActiveRoutesResult {
  const { initialized } = usePanopliaSwap()

  const { data, isLoading } = useQuery({
    queryKey: ['panoplia', 'activeRoutes'],
    queryFn: () => getActiveRoutes(),
    enabled: initialized,
    refetchInterval: 15 * 1000,
    staleTime: 10 * 1000,
  })

  const activeRoutes = data ?? []

  const getRoute = async (routeId: string): Promise<Route | undefined> => {
    try {
      return await getActiveRoute(routeId) ?? undefined
    } catch {
      return undefined
    }
  }

  return {
    activeRoutes,
    count: activeRoutes.length,
    hasActive: activeRoutes.length > 0,
    isLoading,
    getRoute,
  }
}
