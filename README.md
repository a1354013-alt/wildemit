# wildemit

A tiny type-safe event bus with wildcard subscriptions for TypeScript apps.

## Installation

```bash
npm install wildemit
```

## Basic usage

```ts
import { createBus } from 'wildemit'

type Events = {
  'user:created': { id: string; name: string }
  'user:deleted': { id: string }
}

const bus = createBus<Events>()

const unsubscribe = bus.on('user:created', payload => {
  console.log(payload.name)
})

bus.emit('user:created', {
  id: 'u001',
  name: 'YangWen',
})

unsubscribe()
```

## Type-safe event names

```ts
type Events = {
  'user:created': { id: string; name: string }
}

const bus = createBus<Events>()

bus.emit('user:created', { id: 'u001', name: 'YangWen' })

// @ts-expect-error
bus.emit('user:create', { id: 'u001', name: 'YangWen' })
```

## Type-safe payloads

```ts
type Events = {
  'user:created': { id: string; name: string }
  'user:deleted': { id: string }
}

const bus = createBus<Events>()

bus.emit('user:deleted', { id: 'u001' })

// @ts-expect-error
bus.emit('user:created', { amount: 999 })
```

## Wildcard subscriptions

Global wildcard:

```ts
bus.on('*', event => {
  console.log(event.type, event.payload)
})
```

Prefix wildcard:

```ts
type Events = {
  'user:created': { id: string; name: string }
  'user:deleted': { id: string }
  'order:paid': { orderId: string; amount: number }
}

const bus = createBus<Events>()

bus.on('user:*', event => {
  if (event.type === 'user:created') {
    event.payload.name
  }

  if (event.type === 'user:deleted') {
    event.payload.id
  }
})
```

`user:*` only matches event names that start with `user:`.

## API reference

### `createBus<TEvents>()`

Creates a new typed event bus.

### `on(event, handler)`

Subscribes to an exact event name, `*`, or `prefix:*`. Returns an unsubscribe function.

### `off(event, handler)`

Removes a previously registered handler.

### `once(event, handler)`

Subscribes to a handler that runs only once.

### `emit(event, payload)`

Synchronously emits an event. Listener errors are not swallowed.

### `emitAsync(event, payload)`

Emits an event and waits for all listeners, including async listeners.

### `clear()`

Removes all listeners from the bus.

### `listenerCount(pattern?)`

Returns the number of listeners for one event or pattern, or the total when omitted.

## Design limits

`wildemit` intentionally supports only these wildcard patterns:

- `*`
- `prefix:*`

It does not support complex glob styles such as `*:created`, `user:**`, `user:*:created`, or `user:{created,deleted}`. Keeping the rules narrow makes the runtime small and the type system predictable.

## Zero dependencies

`wildemit` has zero runtime dependencies.

## Node.js and browser support

The published package ships both ESM and CJS builds and has no platform-specific runtime dependencies, so it works in Node.js and browser-based TypeScript builds.

## License

MIT
