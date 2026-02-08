import { useEffect, useRef } from 'react'
import { useWidgetEvents, WidgetEvent } from '@lifi/widget'
import type { Route } from '@lifi/sdk'
import type { RouteExecutionUpdate } from '@lifi/widget'
import type { WidgetEventCallbacks } from './types'

/**
 * Renderless component that subscribes to LiFi widget events
 * and forwards them to callback props.
 *
 * Place as a sibling to <PanopliaWidget>:
 * ```tsx
 * <PanopliaSwapProvider ...>
 *   <PanopliaWidget />
 *   <WidgetEventListener onRouteExecutionCompleted={handleComplete} />
 * </PanopliaSwapProvider>
 * ```
 */
export function WidgetEventListener({
  onRouteExecutionStarted,
  onRouteExecutionUpdated,
  onRouteExecutionCompleted,
  onRouteExecutionFailed,
}: WidgetEventCallbacks) {
  const widgetEvents = useWidgetEvents()
  const callbacksRef = useRef<WidgetEventCallbacks>({
    onRouteExecutionStarted,
    onRouteExecutionUpdated,
    onRouteExecutionCompleted,
    onRouteExecutionFailed,
  })

  callbacksRef.current = {
    onRouteExecutionStarted,
    onRouteExecutionUpdated,
    onRouteExecutionCompleted,
    onRouteExecutionFailed,
  }

  useEffect(() => {
    const handleStarted = (route: Route) => {
      callbacksRef.current.onRouteExecutionStarted?.(route)
    }
    const handleUpdated = (update: RouteExecutionUpdate) => {
      callbacksRef.current.onRouteExecutionUpdated?.(update)
    }
    const handleCompleted = (route: Route) => {
      callbacksRef.current.onRouteExecutionCompleted?.(route)
    }
    const handleFailed = (update: RouteExecutionUpdate) => {
      callbacksRef.current.onRouteExecutionFailed?.(update)
    }

    widgetEvents.on(WidgetEvent.RouteExecutionStarted, handleStarted)
    widgetEvents.on(WidgetEvent.RouteExecutionUpdated, handleUpdated)
    widgetEvents.on(WidgetEvent.RouteExecutionCompleted, handleCompleted)
    widgetEvents.on(WidgetEvent.RouteExecutionFailed, handleFailed)

    return () => {
      widgetEvents.all.clear()
    }
  }, [widgetEvents])

  return null
}
