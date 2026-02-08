import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createConfig, EVM } from '@lifi/sdk'
import { PanopliaSwapContext } from './context'
import type { PanopliaSwapConfig } from './types'

export interface PanopliaSwapProviderProps extends PanopliaSwapConfig {
  children: ReactNode
}

export function PanopliaSwapProvider({
  children,
  integrator,
  wagmiConfig,
  apiKey,
  rpcUrls,
  fee,
}: PanopliaSwapProviderProps) {
  const [initialized, setInitialized] = useState(false)
  const initRef = useRef(false)

  const config = useMemo<PanopliaSwapConfig>(
    () => ({ integrator, wagmiConfig, apiKey, rpcUrls, fee }),
    [integrator, wagmiConfig, apiKey, rpcUrls, fee],
  )

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    createConfig({
      integrator,
      apiKey,
      rpcUrls,
      providers: [
        EVM({ getWalletClient: () => Promise.resolve(wagmiConfig.getClient()) }),
      ],
    })

    setInitialized(true)
  }, [integrator, apiKey, rpcUrls, wagmiConfig])

  const value = useMemo(
    () => ({ initialized, config }),
    [initialized, config],
  )

  return (
    <PanopliaSwapContext.Provider value={value}>
      {children}
    </PanopliaSwapContext.Provider>
  )
}
