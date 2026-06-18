import { describe, expect, it, vi } from 'vitest'
import { createBus, matchesWildcard } from '../src'

type AppEvents = {
  'user:created': { id: string; name: string }
  'user:deleted': { id: string }
  'order:paid': { orderId: string; amount: number }
}

describe('wildcard subscriptions', () => {
  it('matches wildcard patterns at runtime', () => {
    expect(matchesWildcard('*', 'user:created')).toBe(true)
    expect(matchesWildcard('user:*', 'user:created')).toBe(true)
    expect(matchesWildcard('user:*', 'order:paid')).toBe(false)
    expect(matchesWildcard('user:created', 'user:created')).toBe(true)
  })

  it('emits all events to global wildcard listeners', () => {
    const bus = createBus<AppEvents>()
    const handler = vi.fn()

    bus.on('*', handler)
    bus.emit('user:created', { id: 'u001', name: 'YangWen' })
    bus.emit('order:paid', { orderId: 'o001', amount: 1200 })

    expect(handler).toHaveBeenNthCalledWith(1, {
      type: 'user:created',
      payload: { id: 'u001', name: 'YangWen' },
    })
    expect(handler).toHaveBeenNthCalledWith(2, {
      type: 'order:paid',
      payload: { orderId: 'o001', amount: 1200 },
    })
  })

  it('emits namespace events to prefix wildcard listeners only', () => {
    const bus = createBus<AppEvents>()
    const handler = vi.fn()

    bus.on('user:*', handler)
    bus.emit('user:created', { id: 'u001', name: 'YangWen' })
    bus.emit('user:deleted', { id: 'u001' })
    bus.emit('order:paid', { orderId: 'o001', amount: 1200 })

    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenNthCalledWith(1, {
      type: 'user:created',
      payload: { id: 'u001', name: 'YangWen' },
    })
    expect(handler).toHaveBeenNthCalledWith(2, {
      type: 'user:deleted',
      payload: { id: 'u001' },
    })
  })

  it('supports once with wildcard listeners', () => {
    const bus = createBus<AppEvents>()
    const handler = vi.fn()

    bus.once('user:*', handler)
    bus.emit('user:created', { id: 'u001', name: 'YangWen' })
    bus.emit('user:deleted', { id: 'u001' })

    expect(handler).toHaveBeenCalledTimes(1)
  })
})
