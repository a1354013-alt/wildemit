export type EventMap = Record<string, unknown>

export type EventName<TEvents extends EventMap> = Extract<keyof TEvents, string>

export type Handler<TPayload> = (payload: TPayload) => void | Promise<void>

export type Unsubscribe = () => void

export type NamespaceWildcard<TEvents extends EventMap> = EventName<TEvents> extends infer TName
  ? TName extends `${infer TNamespace}:${string}`
    ? `${TNamespace}:*`
    : never
  : never

export type WildcardPattern<TEvents extends EventMap> = '*' | NamespaceWildcard<TEvents>

export type EventPattern<TEvents extends EventMap> = EventName<TEvents> | WildcardPattern<TEvents>

export type MatchingEventNames<
  TEvents extends EventMap,
  TPattern extends string,
> = TPattern extends '*'
  ? EventName<TEvents>
  : TPattern extends `${infer TNamespace}:*`
    ? Extract<EventName<TEvents>, `${TNamespace}:${string}`>
    : Extract<EventName<TEvents>, TPattern>

export type WildcardEvent<
  TEvents extends EventMap,
  TPattern extends string,
> = {
  [TName in MatchingEventNames<TEvents, TPattern>]: {
    type: TName
    payload: TEvents[TName]
  }
}[MatchingEventNames<TEvents, TPattern>]

export interface EventBus<TEvents extends EventMap> {
  on<TName extends EventName<TEvents>>(
    event: TName,
    handler: Handler<TEvents[TName]>,
  ): Unsubscribe
  on<TPattern extends WildcardPattern<TEvents>>(
    pattern: TPattern,
    handler: Handler<WildcardEvent<TEvents, TPattern>>,
  ): Unsubscribe

  once<TName extends EventName<TEvents>>(
    event: TName,
    handler: Handler<TEvents[TName]>,
  ): Unsubscribe
  once<TPattern extends WildcardPattern<TEvents>>(
    pattern: TPattern,
    handler: Handler<WildcardEvent<TEvents, TPattern>>,
  ): Unsubscribe

  off<TName extends EventName<TEvents>>(
    event: TName,
    handler: Handler<TEvents[TName]>,
  ): void
  off<TPattern extends WildcardPattern<TEvents>>(
    pattern: TPattern,
    handler: Handler<WildcardEvent<TEvents, TPattern>>,
  ): void

  emit<TName extends EventName<TEvents>>(event: TName, payload: TEvents[TName]): void

  emitAsync<TName extends EventName<TEvents>>(
    event: TName,
    payload: TEvents[TName],
  ): Promise<void>

  clear(): void

  listenerCount(pattern?: EventPattern<TEvents>): number
}
