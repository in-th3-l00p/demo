# panoplia.defi

React hooks and widget wrapper for LiFi SDK v3 — token discovery, swaps, bridges, and DeFi zaps for EVM wallet apps.

## Install

```bash
npm install panoplia.swap
```

**Peer dependencies** (your app must provide):

```bash
npm install react react-dom wagmi viem @tanstack/react-query
```

## Setup

Wrap your app with `<PanopliaSwapProvider>` inside your existing Wagmi + React Query providers:

```tsx
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider } from '@tanstack/react-query'
import { PanopliaSwapProvider } from 'panoplia.swap'

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <PanopliaSwapProvider
          integrator="your-app-name"
          wagmiConfig={wagmiConfig}
          apiKey="optional-lifi-api-key"
          fee={0.03} // optional 3% integrator fee
        >
          {/* your app */}
        </PanopliaSwapProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

## Hooks

### Token Hooks

#### `useTokens({ chains? })`

Fetch tokens across EVM chains.

```tsx
const { tokensByChain, allTokens, isLoading } = useTokens({ chains: [1, 137] })
```

#### `useTokenSearch({ tokens, query, chainId?, limit? })`

Client-side search/filter — no API calls, pure `useMemo`.

```tsx
const { results, hasResults } = useTokenSearch({
  tokens: allTokens,
  query: 'USDC',
  chainId: 1,
})
```

#### `useTokenBalances({ walletAddress?, tokensByChain? })`

Cross-chain balances with USD portfolio value.

```tsx
const { nonZeroBalances, totalValueUsd, isLoading } = useTokenBalances({
  walletAddress: '0x...',
  tokensByChain,
})
```

#### `useTrendingTokens({ chains?, limit? })`

Popular tokens heuristic from LiFi token list ordering.

```tsx
const { topTrending, trendingByChain } = useTrendingTokens({ limit: 10 })
```

### Swap Hooks

#### `useQuote({ fromChain, toChain, fromToken, toToken, fromAmount, fromAddress })`

Get a single best quote.

```tsx
const { quote, isLoading, error } = useQuote({
  fromChain: 1,
  toChain: 137,
  fromToken: '0x0000000000000000000000000000000000000000',
  toToken: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
  fromAmount: '1000000000000000000',
  fromAddress: '0x...',
})
```

#### `useRoutes({ fromChainId, toChainId, fromTokenAddress, toTokenAddress, fromAmount })`

Get multiple routes with best/cheapest/fastest.

```tsx
const { routes, bestRoute, cheapestRoute, fastestRoute } = useRoutes({
  fromChainId: 1,
  toChainId: 137,
  fromTokenAddress: '0x...',
  toTokenAddress: '0x...',
  fromAmount: '1000000000000000000',
})
```

#### `useSwapExecution({ onSuccess?, onError?, onRouteUpdate? })`

Execute a route with full status tracking via `useReducer` state machine.

```tsx
const { execute, stop, resume, status, route, error, txHash, reset } =
  useSwapExecution({
    onSuccess: (route) => console.log('Done!', route),
    onError: (err) => console.error(err),
  })

// Execute a route from useRoutes or useQuote
await execute(bestRoute)
```

**Status flow:** `idle` → `pending` → `executing` → `completed` | `failed` | `stopped`

#### `useActiveRoutes()`

Poll currently executing routes.

```tsx
const { activeRoutes, count, hasActive } = useActiveRoutes()
```

#### `useTransactionHistory({ transactions })`

Check status of past transactions.

```tsx
const { history, isLoading } = useTransactionHistory({
  transactions: [{ txHash: '0x...', fromChain: 1, toChain: 137 }],
})
```

### Zap Hooks

#### `useContractCallQuote({ fromChain, fromToken, fromAmount, fromAddress, toChain, toToken, contractCalls })`

Get quotes for LP/staking/yield contract call zaps.

```tsx
const { quote, isLoading } = useContractCallQuote({
  fromChain: 1,
  fromToken: '0x...',
  fromAmount: '1000000000000000000',
  fromAddress: '0x...',
  toChain: 1,
  toToken: '0x...',
  contractCalls: [{
    fromAmount: '1000000',
    fromTokenAddress: '0x...',
    toContractAddress: '0x...',
    toContractCallData: '0x...',
    toContractGasLimit: '200000',
  }],
})
```

#### `useZapExecution(callbacks?)`

Execute a zap (same state machine as swap execution).

```tsx
const { execute, stop, status, error } = useZapExecution({
  onSuccess: (route) => console.log('Zap complete!', route),
})
```

### Chain Hooks

#### `useChains()`

```tsx
const { chains, getChain, isLoading } = useChains()
const ethereum = getChain(1)
```

#### `useTools()`

```tsx
const { bridges, exchanges, isLoading } = useTools()
```

#### `useConnections({ fromChain?, fromToken?, toChain?, toToken? })`

```tsx
const { connections, isLoading } = useConnections({ fromChain: 1 })
```

## Widget

Pre-built swap/bridge UI powered by the LiFi widget.

### `<PanopliaWidget>`

```tsx
import { PanopliaWidget, WIDGET_PRESET_SWAP } from 'panoplia.swap'

<PanopliaWidget
  {...WIDGET_PRESET_SWAP}
  fromChain={1}
  toChain={137}
  appearance="dark"
/>
```

**Props:** `variant`, `subvariant`, `appearance`, `theme`, `fromChain`, `toChain`, `fromToken`, `toToken`, `fromAmount`, `chains`, `bridges`, `exchanges`, `hiddenUI`, `config`

### `<WidgetEventListener>`

Renderless component that forwards widget events to callbacks.

```tsx
<PanopliaWidget />
<WidgetEventListener
  onRouteExecutionStarted={(route) => console.log('Started', route)}
  onRouteExecutionCompleted={(route) => console.log('Done', route)}
  onRouteExecutionFailed={(update) => console.error('Failed', update)}
/>
```

### Presets

| Preset | Description |
|--------|-------------|
| `WIDGET_PRESET_SWAP` | Compact split swap interface |
| `WIDGET_PRESET_BRIDGE` | Bridge-only interface |
| `WIDGET_PRESET_FULL` | Wide layout with all features |
| `WIDGET_PRESET_COMPACT` | Minimal embedded widget |

## Utilities

### Formatting

```ts
import { formatTokenAmount, formatUsd, truncateAddress, formatCompactNumber, formatDuration } from 'panoplia.swap'

formatTokenAmount(1500000000000000000n, 18)    // "1.5"
formatUsd(1234.56)                               // "$1,234.56"
truncateAddress('0x1234...abcdef12345678')       // "0x1234...5678"
formatCompactNumber(2_300_000)                   // "2.3M"
formatDuration(125)                              // "2m 5s"
```

### Amount Conversion

```ts
import { toSmallestUnit, fromSmallestUnit, parseAmountInput, applySlippage } from 'panoplia.swap'

toSmallestUnit('1.5', 18)                        // 1500000000000000000n
fromSmallestUnit(1500000000000000000n, 18)       // "1.5"
parseAmountInput('1,000.50')                     // "1000.50"
applySlippage('1000', 0.005)                     // "995" (0.5% slippage)
```

### Chain Helpers

```ts
import { CHAIN_ID, getExplorerTxUrl } from 'panoplia.swap'

CHAIN_ID.ETHEREUM   // 1
CHAIN_ID.ARBITRUM   // 42161
CHAIN_ID.BASE       // 8453

getExplorerTxUrl(1, '0xabc...')  // "https://etherscan.io/tx/0xabc..."
```

## Development

```bash
npm install
npm run build       # tsup → dist/
npm run typecheck   # tsc --noEmit
npm run test        # vitest
npm run dev         # tsup --watch
```

## License

MIT
