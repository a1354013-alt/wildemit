import { describe, expect, it, vi } from 'vitest'
import { createBus } from '../src'

type AppEvents = {
  'user:created': { id: string; name: string }
  'user:deleted': { id: string }
  'order:paid': { orderId: string; amount: number }
}

describe('createBus', () => {
  it('emits payloads to exact listeners', () => {
    const bus = createBus<AppEvents>()
    const handler = vi.fn()

    bus.on('user:created', handler)
    bus.emit('user:created', { id: 'u001', name: 'YangWen' })

    expect(handler).toHaveBeenCalledWith({ id: 'u001', name: 'YangWen' })
  })

  it('returns an unsubscribe function from on', () => {
    const bus = createBus<AppEvents>()
    const handler = vi.fn()
    const unsubscribe = bus.on('user:deleted', handler)

    unsubscribe()
    bus.emit('user:deleted', { id: 'u001' })

    expect(handler).not.toHaveBeenCalled()
  })

  it('removes listeners with off', () => {
    const bus = createBus<AppEvents>()
    const handler = vi.fn()

    bus.on('order:paid', handler)
    bus.off('order:paid', handler)
    bus.emit('order:paid', { orderId: 'o001', amount: 1200 })

    expect(handler).not.toHaveBeenCalled()
  })

  it('runs once listeners only one time', () => {
    const bus = createBus<AppEvents>()
    const handler = vi.fn()

    bus.once('user:deleted', handler)
    bus.emit('user:deleted', { id: 'u001' })
    bus.emit('user:deleted', { id: 'u002' })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({ id: 'u001' })
  })

  it('clears all listeners', () => {
    const bus = createBus<AppEvents>()
    const createdHandler = vi.fn()
    const deletedHandler = vi.fn()

    bus.on('user:created', createdHandler)
    bus.on('user:deleted', deletedHandler)
    bus.clear()

    bus.emit('user:created', { id: 'u001', name: 'YangWen' })
    bus.emit('user:deleted', { id: 'u001' })

    expect(createdHandler).not.toHaveBeenCalled()
    expect(deletedHandler).not.toHaveBeenCalled()
  })

  it('counts listeners', () => {
    const bus = createBus<AppEvents>()

    bus.on('user:created', () => undefined)
    bus.on('user:created', () => undefined)
    bus.on('user:deleted', () => undefined)

    expect(bus.listenerCount('user:created')).toBe(2)
    expect(bus.listenerCount()).toBe(3)
  })

  it('lets handler errors bubble up in emit', () => {
    const bus = createBus<AppEvents>()

    bus.on('user:created', () => {
      throw new Error('boom')
    })

    expect(() => {
      bus.emit('user:created', { id: 'u001', name: 'YangWen' })
    }).toThrow('boom')
  })
})
