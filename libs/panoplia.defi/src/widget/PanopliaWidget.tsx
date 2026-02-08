import { useMemo } from 'react'
import { LiFiWidget } from '@lifi/widget'
import type { WidgetConfig } from '@lifi/widget'
import { usePanopliaSwap } from '../provider/context'
import type { PanopliaWidgetProps } from './types'

export function PanopliaWidget({
  variant = 'compact',
  subvariant = 'default',
  appearance,
  theme,
  fromChain,
  toChain,
  fromToken,
  toToken,
  fromAmount,
  chains,
  bridges,
  exchanges,
  hiddenUI,
  config: configOverrides,
}: PanopliaWidgetProps) {
  const { config: panopliaConfig } = usePanopliaSwap()

  const widgetConfig = useMemo<WidgetConfig>(() => {
    const base: WidgetConfig = {
      integrator: panopliaConfig.integrator,
      variant,
      subvariant,
      appearance,
      ...(theme && { theme }),
      ...(fromChain && { fromChain }),
      ...(toChain && { toChain }),
      ...(fromToken && { fromToken }),
      ...(toToken && { toToken }),
      ...(fromAmount !== undefined && { fromAmount }),
      ...(chains && { chains }),
      ...(bridges && { bridges }),
      ...(exchanges && { exchanges }),
      ...(hiddenUI && { hiddenUI }),
      ...(panopliaConfig.apiKey && { apiKey: panopliaConfig.apiKey }),
      ...(panopliaConfig.fee !== undefined && { fee: panopliaConfig.fee }),
    }

    // Merge overrides
    if (configOverrides) {
      return { ...base, ...configOverrides }
    }

    return base
  }, [
    panopliaConfig,
    variant,
    subvariant,
    appearance,
    theme,
    fromChain,
    toChain,
    fromToken,
    toToken,
    fromAmount,
    chains,
    bridges,
    exchanges,
    hiddenUI,
    configOverrides,
  ])

  return (
    <LiFiWidget
      integrator={panopliaConfig.integrator}
      config={widgetConfig}
    />
  )
}
