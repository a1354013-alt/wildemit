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

  it('detects exact event listeners with hasListeners', () => {
    const bus = createBus<AppEvents>()

    expect(bus.hasListeners('user:created')).toBe(false)

    bus.on('user:created', () => undefined)

    expect(bus.hasListeners('user:created')).toBe(true)
  })

  it('detects wildcard listeners with hasListeners', () => {
    const bus = createBus<AppEvents>()

    expect(bus.hasListeners('user:*')).toBe(false)

    bus.on('user:*', () => undefined)

    expect(bus.hasListeners('user:*')).toBe(true)
  })

  it('detects whether any listeners exist when hasListeners has no argument', () => {
    const bus = createBus<AppEvents>()

    expect(bus.hasListeners()).toBe(false)

    bus.on('order:paid', () => undefined)

    expect(bus.hasListeners()).toBe(true)
  })

  it('removes all listeners for one exact event with offAll', () => {
    const bus = createBus<AppEvents>()
    const createdHandler = vi.fn()
    const deletedHandler = vi.fn()

    bus.on('user:created', createdHandler)
    bus.on('user:created', () => undefined)
    bus.on('user:deleted', deletedHandler)

    bus.offAll('user:created')
    bus.emit('user:created', { id: 'u001', name: 'YangWen' })
    bus.emit('user:deleted', { id: 'u001' })

    expect(bus.listenerCount('user:created')).toBe(0)
    expect(createdHandler).not.toHaveBeenCalled()
    expect(deletedHandler).toHaveBeenCalledTimes(1)
  })

  it('removes all listeners for one wildcard pattern with offAll', () => {
    const bus = createBus<AppEvents>()
    const userWildcardHandler = vi.fn()
    const globalWildcardHandler = vi.fn()

    bus.on('user:*', userWildcardHandler)
    bus.on('*', globalWildcardHandler)

    bus.offAll('user:*')
    bus.emit('user:created', { id: 'u001', name: 'YangWen' })

    expect(bus.listenerCount('user:*')).toBe(0)
    expect(userWildcardHandler).not.toHaveBeenCalled()
    expect(globalWildcardHandler).toHaveBeenCalledTimes(1)
  })

  it('treats offAll with no argument the same as clear', () => {
    const bus = createBus<AppEvents>()
    const createdHandler = vi.fn()
    const wildcardHandler = vi.fn()

    bus.on('user:created', createdHandler)
    bus.on('*', wildcardHandler)

    bus.offAll()
    bus.emit('user:created', { id: 'u001', name: 'YangWen' })

    expect(bus.listenerCount()).toBe(0)
    expect(createdHandler).not.toHaveBeenCalled()
    expect(wildcardHandler).not.toHaveBeenCalled()
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
