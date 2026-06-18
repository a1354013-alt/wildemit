import { describe, expect, it } from 'vitest'
import { createBus } from '../src'

type AppEvents = {
  'user:created': { id: string; name: string }
  'user:deleted': { id: string }
  'order:paid': { orderId: string; amount: number }
}

const bus = createBus<AppEvents>()

describe('type safety', () => {
  it('is checked by TypeScript during typecheck', () => {
    expect(true).toBe(true)
  })
})

if (false) {
  bus.emit('user:created', { id: 'u001', name: 'YangWen' })

  // @ts-expect-error - typo in event name should fail
  bus.emit('user:create', { id: 'u001', name: 'YangWen' })

  // @ts-expect-error - wrong payload shape should fail
  bus.emit('user:created', { id: 'u001', amount: 999 })

  // @ts-expect-error - unknown namespace wildcard should fail
  bus.on('payment:*', event => {
    console.log(event)
  })

  bus.on('user:*', event => {
    if (event.type === 'user:created') {
      event.payload.name
    }

    if (event.type === 'user:deleted') {
      event.payload.id
    }
  })
}
