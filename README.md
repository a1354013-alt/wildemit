# wildemit

A tiny type-safe event bus with wildcard subscriptions for TypeScript apps.

## Features

- Type-safe event names
- Type-safe payloads
- Wildcard subscriptions: `*` and `user:*`
- Sync and async emit
- Tiny runtime and zero runtime dependencies
- Works in Node.js and browsers

## Install

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

bus.on('user:created', payload => {
  console.log(payload.name)
})

bus.emit('user:created', {
  id: 'u001',
  name: 'YangWen',
})
```

## TypeScript catches event mistakes

```ts
bus.emit('user:created', {
  id: 'u001',
  amount: 999,
})
// TypeScript error: payload shape does not match 'user:created'

bus.emit('user:create', {
  id: 'u001',
  name: 'YangWen',
})
// TypeScript error: event name should be 'user:created'
```

## Namespace wildcard

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

`user:*` receives only events that start with `user:`.

## Global wildcard

```ts
bus.on('*', event => {
  console.log(`[${event.type}]`, event.payload)
})
```

This is useful for debug logs, analytics, test reports, and plugin-style systems.

## API

### `createBus<TEvents>()`

Creates a new typed event bus.

```ts
const bus = createBus<Events>()
```

### `on(event, handler)`

Subscribes to an exact event or wildcard pattern. It returns an unsubscribe function.

```ts
const off = bus.on('user:created', payload => {
  console.log(payload.id)
})

off()
```

### `once(event, handler)`

Runs the listener once and then removes it.

```ts
bus.once('user:created', payload => {
  console.log('only once:', payload.id)
})
```

### `off(event, handler)`

Removes a listener manually.

```ts
const handler = (payload: Events['user:created']) => {
  console.log(payload.id)
}

bus.on('user:created', handler)
bus.off('user:created', handler)
```

### `emit(event, payload)`

Synchronously emits an event. If a listener throws, the error is not swallowed.

```ts
bus.emit('user:created', {
  id: 'u001',
  name: 'YangWen',
})
```

### `emitAsync(event, payload)`

Emits an event and waits for all async listeners in parallel.

```ts
await bus.emitAsync('user:created', {
  id: 'u001',
  name: 'YangWen',
})
```

### `clear()`

Removes all listeners.

```ts
bus.clear()
```

### `listenerCount(event?)`

Counts listeners for one event/pattern, or all listeners when no argument is passed.

```ts
bus.listenerCount('user:created')
bus.listenerCount()
```

## Wildcard rules

MVP intentionally supports only two wildcard forms:

| Pattern | Meaning |
|---|---|
| `*` | Listen to all events |
| `prefix:*` | Listen to events that start with `prefix:` |

Examples:

```ts
bus.on('*', event => {})
bus.on('user:*', event => {})
bus.on('order:*', event => {})
```

Not supported in v0.1:

```ts
bus.on('user:*:created', () => {})
bus.on('*:created', () => {})
bus.on('user:**', () => {})
```

This keeps the package small, predictable, and easy to understand.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
npm run ci
```

## Project structure

```txt
wildemit/
├─ src/
│  ├─ index.ts
│  ├─ create-bus.ts
│  ├─ types.ts
│  └─ wildcard.ts
├─ tests/
│  ├─ create-bus.test.ts
│  ├─ wildcard.test.ts
│  ├─ async.test.ts
│  └─ type-safety.test.ts
├─ examples/
│  ├─ basic.ts
│  ├─ wildcard.ts
│  ├─ vue-like.ts
│  └─ node-cli.ts
├─ .github/workflows/ci.yml
├─ package.json
├─ tsconfig.json
├─ vitest.config.ts
├─ README.md
├─ LICENSE
└─ .gitignore
```

## Roadmap

### v0.2 ideas

- `emitSerial()` for ordered async listeners
- `hasListeners()` helper
- `onMany()` for subscribing to multiple events
- `offAll(event)` for clearing one event/pattern
- Debug logger example

### v1.0 ideas

- Vue composable example package
- React hook example package
- AbortSignal support
- Async iterator support
- Event history for debugging

## License

MIT
