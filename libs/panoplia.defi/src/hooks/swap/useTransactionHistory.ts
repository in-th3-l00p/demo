import { useQueries } from '@tanstack/react-query'
import { getStatus } from '@lifi/sdk'
import type { GetStatusRequest, StatusResponse } from '@lifi/sdk'
import { usePanopliaSwap } from '../../provider/context'

export interface TransactionRef {
  txHash: string
  fromChain: number
  toChain: number
  bridge?: string
}

export interface UseTransactionHistoryParams {
  transactions: TransactionRef[]
}

export interface UseTransactionHistoryResult {
  history: (StatusResponse | undefined)[]
  isLoading: boolean
}

export function useTransactionHistory({
  transactions,
}: UseTransactionHistoryParams): UseTransactionHistoryResult {
  const { initialized } = usePanopliaSwap()

  const queries = useQueries({
    queries: transactions.map((tx) => ({
      queryKey: ['panoplia', 'txStatus', tx.txHash, tx.fromChain, tx.toChain],
      queryFn: async (): Promise<StatusResponse> => {
        const request: GetStatusRequest = {
          txHash: tx.txHash,
          fromChain: tx.fromChain,
          toChain: tx.toChain,
          ...(tx.bridge && { bridge: tx.bridge }),
        }
        return getStatus(request)
      },
      enabled: initialized && !!tx.txHash,
      staleTime: 30 * 1000,
      refetchInterval: 60 * 1000,
    })),
  })

  const history = queries.map((q) => q.data)
  const isLoading = queries.some((q) => q.isLoading)

  return { history, isLoading }
}
