import { createContext, useContext } from 'react'
import type { PanopliaSwapContextValue } from './types'

export const PanopliaSwapContext = createContext<PanopliaSwapContextValue | null>(null)

export function usePanopliaSwap(): PanopliaSwapContextValue {
  const ctx = useContext(PanopliaSwapContext)
  if (!ctx) {
    throw new Error('usePanopliaSwap must be used within a <PanopliaSwapProvider>')
  }
  return ctx
}
