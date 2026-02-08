import { useCallback, useReducer, useRef } from 'react'
import { executeRoute, updateRouteExecution } from '@lifi/sdk'
import type { Route } from '@lifi/sdk'

export type ZapStatus = 'idle' | 'pending' | 'executing' | 'completed' | 'failed' | 'stopped'

interface ZapExecutionState {
  status: ZapStatus
  route: Route | undefined
  error: Error | undefined
  txHash: string | undefined
}

type ZapAction =
  | { type: 'START'; route: Route }
  | { type: 'UPDATE'; route: Route }
  | { type: 'TX_HASH'; txHash: string }
  | { type: 'COMPLETE'; route: Route }
  | { type: 'FAIL'; error: Error }
  | { type: 'STOP' }
  | { type: 'RESET' }

const initialState: ZapExecutionState = {
  status: 'idle',
  route: undefined,
  error: undefined,
  txHash: undefined,
}

function zapReducer(state: ZapExecutionState, action: ZapAction): ZapExecutionState {
  switch (action.type) {
    case 'START':
      return { ...state, status: 'pending', route: action.route, error: undefined, txHash: undefined }
    case 'UPDATE':
      return { ...state, status: 'executing', route: action.route }
    case 'TX_HASH':
      return { ...state, txHash: action.txHash }
    case 'COMPLETE':
      return { ...state, status: 'completed', route: action.route }
    case 'FAIL':
      return { ...state, status: 'failed', error: action.error }
    case 'STOP':
      return { ...state, status: 'stopped' }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export interface UseZapExecutionCallbacks {
  onSuccess?: (route: Route) => void
  onError?: (error: Error, route?: Route) => void
  onRouteUpdate?: (route: Route) => void
}

export interface UseZapExecutionResult {
  execute: (route: Route) => Promise<Route | undefined>
  stop: () => void
  status: ZapStatus
  route: Route | undefined
  error: Error | undefined
  txHash: string | undefined
  reset: () => void
}

export function useZapExecution(
  callbacks?: UseZapExecutionCallbacks,
): UseZapExecutionResult {
  const [state, dispatch] = useReducer(zapReducer, initialState)
  const callbacksRef = useRef(callbacks)
  callbacksRef.current = callbacks

  const execute = useCallback(async (route: Route): Promise<Route | undefined> => {
    dispatch({ type: 'START', route })

    try {
      const result = await executeRoute(route, {
        updateRouteHook(updatedRoute) {
          dispatch({ type: 'UPDATE', route: updatedRoute })
          callbacksRef.current?.onRouteUpdate?.(updatedRoute)

          const lastStep = updatedRoute.steps[updatedRoute.steps.length - 1]
          const lastProcess = lastStep?.execution?.process?.[lastStep.execution.process.length - 1]
          if (lastProcess?.txHash) {
            dispatch({ type: 'TX_HASH', txHash: lastProcess.txHash })
          }
        },
      })

      dispatch({ type: 'COMPLETE', route: result })
      callbacksRef.current?.onSuccess?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      dispatch({ type: 'FAIL', error })
      callbacksRef.current?.onError?.(error, route)
      return undefined
    }
  }, [])

  const stop = useCallback(() => {
    if (state.route) {
      updateRouteExecution(state.route, { executeInBackground: true })
    }
    dispatch({ type: 'STOP' })
  }, [state.route])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return {
    execute,
    stop,
    status: state.status,
    route: state.route,
    error: state.error,
    txHash: state.txHash,
    reset,
  }
}
