// Provider
export { PanopliaSwapProvider } from './provider/PanopliaSwapProvider'
export type { PanopliaSwapProviderProps } from './provider/PanopliaSwapProvider'
export { usePanopliaSwap } from './provider/context'
export type { PanopliaSwapConfig, PanopliaSwapContextValue } from './provider/types'

// Hooks — Tokens
export { useTokens } from './hooks/tokens/useTokens'
export type { UseTokensParams, UseTokensResult } from './hooks/tokens/useTokens'
export { useTokenSearch } from './hooks/tokens/useTokenSearch'
export type { UseTokenSearchParams, UseTokenSearchResult } from './hooks/tokens/useTokenSearch'
export { useTokenBalances } from './hooks/tokens/useTokenBalances'
export type { UseTokenBalancesParams, UseTokenBalancesResult } from './hooks/tokens/useTokenBalances'
export { useTrendingTokens } from './hooks/tokens/useTrendingTokens'
export type { UseTrendingTokensParams, UseTrendingTokensResult } from './hooks/tokens/useTrendingTokens'

// Hooks — Swap
export { useQuote } from './hooks/swap/useQuote'
export type { UseQuoteParams, UseQuoteResult } from './hooks/swap/useQuote'
export { useRoutes } from './hooks/swap/useRoutes'
export type { UseRoutesParams, UseRoutesResult } from './hooks/swap/useRoutes'
export { useSwapExecution } from './hooks/swap/useSwapExecution'
export type {
  SwapStatus,
  SwapExecutionState,
  UseSwapExecutionCallbacks,
  UseSwapExecutionResult,
} from './hooks/swap/useSwapExecution'
export { useActiveRoutes } from './hooks/swap/useActiveRoutes'
export type { UseActiveRoutesResult } from './hooks/swap/useActiveRoutes'
export { useTransactionHistory } from './hooks/swap/useTransactionHistory'
export type {
  TransactionRef,
  UseTransactionHistoryParams,
  UseTransactionHistoryResult,
} from './hooks/swap/useTransactionHistory'

// Hooks — Zap
export { useContractCallQuote } from './hooks/zap/useContractCallQuote'
export type {
  ContractCall,
  UseContractCallQuoteParams,
  UseContractCallQuoteResult,
} from './hooks/zap/useContractCallQuote'
export { useZapExecution } from './hooks/zap/useZapExecution'
export type {
  ZapStatus,
  UseZapExecutionCallbacks,
  UseZapExecutionResult,
} from './hooks/zap/useZapExecution'

// Hooks — Chain
export { useChains } from './hooks/chain/useChains'
export type { UseChainsResult } from './hooks/chain/useChains'
export { useTools } from './hooks/chain/useTools'
export type { UseToolsResult, ToolBridge, ToolExchange } from './hooks/chain/useTools'
export { useConnections } from './hooks/chain/useConnections'
export type { UseConnectionsParams, UseConnectionsResult } from './hooks/chain/useConnections'

// Widget
export { PanopliaWidget } from './widget/PanopliaWidget'
export { WidgetEventListener } from './widget/WidgetEventListener'
export {
  WIDGET_PRESET_SWAP,
  WIDGET_PRESET_BRIDGE,
  WIDGET_PRESET_FULL,
  WIDGET_PRESET_COMPACT,
} from './widget/presets'
export type {
  PanopliaWidgetProps,
  WidgetEventCallbacks,
  WidgetVariant,
  WidgetSubvariant,
  Appearance,
} from './widget/types'

// Utils
export {
  formatTokenAmount,
  formatUsd,
  truncateAddress,
  formatCompactNumber,
  formatDuration,
} from './utils/format'
export {
  toSmallestUnit,
  fromSmallestUnit,
  parseAmountInput,
  applySlippage,
} from './utils/amounts'
export {
  CHAIN_ID,
  getExplorerUrl,
  getExplorerTxUrl,
  getExplorerAddressUrl,
  getExplorerTokenUrl,
} from './utils/chains'
export type { SupportedChainId } from './utils/chains'

// Re-export common LiFi types
export type {
  Token,
  TokenAmount,
  ExtendedChain,
  Route,
  Step,
  Process,
  StatusResponse,
  ChainId,
  ChainType,
  Execution,
  Bridge,
  Exchange,
} from './utils/types'
