import { useMemo } from 'react'
import type { Token } from '@lifi/sdk'

export interface UseTokenSearchParams {
  tokens: Token[]
  query: string
  chainId?: number
  limit?: number
}

export interface UseTokenSearchResult {
  results: Token[]
  hasResults: boolean
}

export function useTokenSearch({
  tokens,
  query,
  chainId,
  limit = 50,
}: UseTokenSearchParams): UseTokenSearchResult {
  const results = useMemo(() => {
    let filtered = tokens

    // Filter by chain if specified
    if (chainId !== undefined) {
      filtered = filtered.filter((t) => t.chainId === chainId)
    }

    // If no query, return first `limit` tokens
    if (!query.trim()) {
      return filtered.slice(0, limit)
    }

    const q = query.toLowerCase().trim()

    // Check if query looks like an address
    const isAddress = q.startsWith('0x') && q.length > 5

    if (isAddress) {
      return filtered
        .filter((t) => t.address.toLowerCase().includes(q))
        .slice(0, limit)
    }

    // Search by symbol first (exact prefix match ranks higher), then by name
    const exactSymbol: Token[] = []
    const prefixSymbol: Token[] = []
    const nameMatch: Token[] = []

    for (const token of filtered) {
      const symbol = token.symbol.toLowerCase()
      const name = (token.name ?? '').toLowerCase()

      if (symbol === q) {
        exactSymbol.push(token)
      } else if (symbol.startsWith(q)) {
        prefixSymbol.push(token)
      } else if (symbol.includes(q) || name.includes(q)) {
        nameMatch.push(token)
      }
    }

    return [...exactSymbol, ...prefixSymbol, ...nameMatch].slice(0, limit)
  }, [tokens, query, chainId, limit])

  return {
    results,
    hasResults: results.length > 0,
  }
}
