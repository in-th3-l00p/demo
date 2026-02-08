import { useQuery } from '@tanstack/react-query'
import { getQuote, convertQuoteToRoute } from '@lifi/sdk'
import type { Route } from '@lifi/sdk'
import { usePanopliaSwap } from '../../provider/context'

export interface UseQuoteParams {
  fromChain?: number
  toChain?: number
  fromToken?: string
  toToken?: string
  fromAmount?: string
  fromAddress?: string
  slippage?: number
}

export interface UseQuoteResult {
  quote: Route | undefined
  isLoading: boolean
  error: Error | null
}

export function useQuote(params: UseQuoteParams): UseQuoteResult {
  const { initialized, config } = usePanopliaSwap()
  const { fromChain, toChain, fromToken, toToken, fromAmount, fromAddress, slippage } = params

  const enabled =
    initialized &&
    !!fromChain &&
    !!toChain &&
    !!fromToken &&
    !!toToken &&
    !!fromAmount &&
    !!fromAddress &&
    fromAmount !== '0'

  const { data, isLoading, error } = useQuery({
    queryKey: ['panoplia', 'quote', fromChain, toChain, fromToken, toToken, fromAmount, fromAddress],
    queryFn: async () => {
      const step = await getQuote({
        fromChain: fromChain!,
        toChain: toChain!,
        fromToken: fromToken!,
        toToken: toToken!,
        fromAmount: fromAmount!,
        fromAddress: fromAddress!,
        ...(slippage !== undefined && { slippage }),
        ...(config.fee !== undefined && { fee: config.fee }),
        ...(config.integrator && { integrator: config.integrator }),
      })
      return convertQuoteToRoute(step)
    },
    enabled,
    staleTime: 30 * 1000,
    retry: 1,
  })

  return {
    quote: data,
    isLoading: enabled && isLoading,
    error: error as Error | null,
  }
}
