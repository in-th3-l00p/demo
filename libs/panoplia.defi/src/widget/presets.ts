import type { PanopliaWidgetProps } from './types'

/** Preset: Simple swap interface */
export const WIDGET_PRESET_SWAP: Partial<PanopliaWidgetProps> = {
  variant: 'compact',
  subvariant: 'split',
  hiddenUI: ['appearance', 'language', 'poweredBy'],
}

/** Preset: Bridge-focused interface */
export const WIDGET_PRESET_BRIDGE: Partial<PanopliaWidgetProps> = {
  variant: 'compact',
  subvariant: 'split',
  hiddenUI: ['appearance', 'language', 'poweredBy'],
  config: {
    subvariantOptions: { split: 'bridge' },
  },
}

/** Preset: Full swap + bridge with all features */
export const WIDGET_PRESET_FULL: Partial<PanopliaWidgetProps> = {
  variant: 'wide',
  subvariant: 'default',
}

/** Preset: Compact embedded widget */
export const WIDGET_PRESET_COMPACT: Partial<PanopliaWidgetProps> = {
  variant: 'compact',
  subvariant: 'default',
  hiddenUI: ['appearance', 'language', 'poweredBy', 'walletMenu'],
}
