import { useQuery } from '@tanstack/react-query'
import { getContractCallsQuote, convertQuoteToRoute } from '@lifi/sdk'
import type { ContractCall, Route } from '@lifi/sdk'
import { usePanopliaSwap } from '../../provider/context'

export type { ContractCall } from '@lifi/sdk'

export interface UseContractCallQuoteParams {
  fromChain?: number
  fromToken?: string
  fromAmount?: string
  fromAddress?: string
  toChain?: number
  toToken?: string
  contractCalls?: ContractCall[]
  slippage?: number
}

export interface UseContractCallQuoteResult {
  quote: Route | undefined
  isLoading: boolean
  error: Error | null
}

export function useContractCallQuote(
  params: UseContractCallQuoteParams,
): UseContractCallQuoteResult {
  const { initialized, config } = usePanopliaSwap()
  const {
    fromChain,
    fromToken,
    fromAmount,
    fromAddress,
    toChain,
    toToken,
    contractCalls,
    slippage,
  } = params

  const enabled =
    initialized &&
    !!fromChain &&
    !!fromToken &&
    !!fromAmount &&
    !!fromAddress &&
    !!toChain &&
    !!toToken &&
    !!contractCalls &&
    contractCalls.length > 0

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'panoplia',
      'contractCallQuote',
      fromChain,
      fromToken,
      fromAmount,
      fromAddress,
      toChain,
      toToken,
      contractCalls,
    ],
    queryFn: async () => {
      const step = await getContractCallsQuote({
        fromChain: fromChain!,
        fromToken: fromToken!,
        fromAmount: fromAmount!,
        fromAddress: fromAddress!,
        toChain: toChain!,
        toToken: toToken!,
        contractCalls: contractCalls!,
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
