import type { WidgetConfig, WidgetTheme, Appearance, RouteExecutionUpdate, HiddenUIType } from '@lifi/widget'
import type { Route } from '@lifi/sdk'

export type { Appearance, RouteExecutionUpdate, HiddenUIType }

export type WidgetVariant = 'compact' | 'wide' | 'drawer'
export type WidgetSubvariant = 'default' | 'split' | 'custom' | 'refuel'

export interface PanopliaWidgetProps {
  /** Widget variant layout */
  variant?: WidgetVariant
  /** Subvariant (default, split, custom, refuel) */
  subvariant?: WidgetSubvariant
  /** Color scheme */
  appearance?: Appearance
  /** Custom LiFi widget theme */
  theme?: WidgetTheme
  /** Pre-selected source chain */
  fromChain?: number
  /** Pre-selected destination chain */
  toChain?: number
  /** Pre-selected source token address */
  fromToken?: string
  /** Pre-selected destination token address */
  toToken?: string
  /** Pre-filled source amount */
  fromAmount?: string | number
  /** Restrict available chains */
  chains?: { allow?: number[]; deny?: number[] }
  /** Restrict available bridges */
  bridges?: { allow?: string[]; deny?: string[] }
  /** Restrict available exchanges */
  exchanges?: { allow?: string[]; deny?: string[] }
  /** Hide specific UI elements */
  hiddenUI?: HiddenUIType[]
  /** Additional raw WidgetConfig overrides */
  config?: Partial<WidgetConfig>
}

export interface WidgetEventCallbacks {
  onRouteExecutionStarted?: (route: Route) => void
  onRouteExecutionUpdated?: (update: RouteExecutionUpdate) => void
  onRouteExecutionCompleted?: (route: Route) => void
  onRouteExecutionFailed?: (update: RouteExecutionUpdate) => void
}
