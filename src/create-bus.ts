import type {
  EventBus,
  EventMap,
  EventName,
  EventPattern,
  Handler,
  Unsubscribe,
  WildcardEvent,
  WildcardPattern,
} from './types'
import { isWildcardPattern, matchesWildcard } from './wildcard'

type AnyHandler = (value: any) => void | Promise<void>

function toHandlerSet(map: Map<string, Set<AnyHandler>>, pattern: string): Set<AnyHandler> {
  const existing = map.get(pattern)

  if (existing) {
    return existing
  }

  const next = new Set<AnyHandler>()
  map.set(pattern, next)
  return next
}

function removeHandler(
  map: Map<string, Set<AnyHandler>>,
  pattern: string,
  handler: AnyHandler,
): void {
  const handlers = map.get(pattern)

  if (!handlers) {
    return
  }

  handlers.delete(handler)

  if (handlers.size === 0) {
    map.delete(pattern)
  }
}

export function createBus<TEvents extends EventMap>(): EventBus<TEvents> {
  const listeners = new Map<string, Set<AnyHandler>>()

  function subscribe(pattern: string, handler: AnyHandler): Unsubscribe {
    const handlers = toHandlerSet(listeners, pattern)
    handlers.add(handler)

    return () => {
      removeHandler(listeners, pattern, handler)
    }
  }

  function unsubscribe(pattern: string, handler: AnyHandler): void {
    removeHandler(listeners, pattern, handler)
  }

  function subscribeOnce(pattern: string, handler: AnyHandler): Unsubscribe {
    const wrapped: AnyHandler = value => {
      unsubscribe(pattern, wrapped)
      return handler(value)
    }

    return subscribe(pattern, wrapped)
  }

  function getExactHandlers(eventName: string): AnyHandler[] {
    return Array.from(listeners.get(eventName) ?? [])
  }

  function getWildcardHandlers(eventName: string): AnyHandler[] {
    const handlers: AnyHandler[] = []

    for (const [pattern, patternHandlers] of listeners) {
      if (!isWildcardPattern(pattern)) {
        continue
      }

      if (matchesWildcard(pattern, eventName)) {
        handlers.push(...patternHandlers)
      }
    }

    return handlers
  }

  function emitEvent(eventName: string, payload: unknown): void {
    const exactHandlers = getExactHandlers(eventName)
    const wildcardHandlers = getWildcardHandlers(eventName)

    for (const handler of exactHandlers) {
      handler(payload)
    }

    const wildcardEvent = {
      type: eventName,
      payload,
    }

    for (const handler of wildcardHandlers) {
      handler(wildcardEvent)
    }
  }

  async function emitEventAsync(eventName: string, payload: unknown): Promise<void> {
    const exactHandlers = getExactHandlers(eventName)
    const wildcardHandlers = getWildcardHandlers(eventName)
    const wildcardEvent = {
      type: eventName,
      payload,
    }

    await Promise.all([
      ...exactHandlers.map(handler => handler(payload)),
      ...wildcardHandlers.map(handler => handler(wildcardEvent)),
    ])
  }

  function clear(): void {
    listeners.clear()
  }

  function countListeners(pattern?: string): number {
    if (pattern) {
      return listeners.get(pattern)?.size ?? 0
    }

    let count = 0

    for (const handlers of listeners.values()) {
      count += handlers.size
    }

    return count
  }

  function publicOn<TName extends EventName<TEvents>>(
    event: TName,
    handler: Handler<TEvents[TName]>,
  ): Unsubscribe
  function publicOn<TPattern extends WildcardPattern<TEvents>>(
    pattern: TPattern,
    handler: Handler<WildcardEvent<TEvents, TPattern>>,
  ): Unsubscribe
  function publicOn(pattern: string, handler: AnyHandler): Unsubscribe {
    return subscribe(pattern, handler)
  }

  function publicOnce<TName extends EventName<TEvents>>(
    event: TName,
    handler: Handler<TEvents[TName]>,
  ): Unsubscribe
  function publicOnce<TPattern extends WildcardPattern<TEvents>>(
    pattern: TPattern,
    handler: Handler<WildcardEvent<TEvents, TPattern>>,
  ): Unsubscribe
  function publicOnce(pattern: string, handler: AnyHandler): Unsubscribe {
    return subscribeOnce(pattern, handler)
  }

  function publicOff<TName extends EventName<TEvents>>(
    event: TName,
    handler: Handler<TEvents[TName]>,
  ): void
  function publicOff<TPattern extends WildcardPattern<TEvents>>(
    pattern: TPattern,
    handler: Handler<WildcardEvent<TEvents, TPattern>>,
  ): void
  function publicOff(pattern: string, handler: AnyHandler): void {
    unsubscribe(pattern, handler)
  }

  function publicEmit<TName extends EventName<TEvents>>(
    event: TName,
    payload: TEvents[TName],
  ): void {
    emitEvent(event, payload)
  }

  async function publicEmitAsync<TName extends EventName<TEvents>>(
    event: TName,
    payload: TEvents[TName],
  ): Promise<void> {
    await emitEventAsync(event, payload)
  }

  function publicListenerCount(pattern?: EventPattern<TEvents>): number {
    return countListeners(pattern)
  }

  return {
    on: publicOn,
    once: publicOnce,
    off: publicOff,
    emit: publicEmit,
    emitAsync: publicEmitAsync,
    clear,
    listenerCount: publicListenerCount,
  }
}
