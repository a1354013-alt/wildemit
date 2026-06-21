import { describe, expect, it, vi } from 'vitest'
import { createBus } from '../src'

type AppEvents = {
  'user:created': { id: string; name: string }
  'task:done': { taskId: string }
}

describe('emitAsync', () => {
  it('waits for async exact listeners', async () => {
    const bus = createBus<AppEvents>()
    const calls: string[] = []

    bus.on('user:created', async payload => {
      await Promise.resolve()
      calls.push(payload.id)
    })

    await bus.emitAsync('user:created', { id: 'u001', name: 'YangWen' })

    expect(calls).toEqual(['u001'])
  })

  it('waits for async wildcard listeners', async () => {
    const bus = createBus<AppEvents>()
    const handler = vi.fn(async () => Promise.resolve())

    bus.on('*', handler)
    await bus.emitAsync('task:done', { taskId: 't001' })

    expect(handler).toHaveBeenCalledWith({
      type: 'task:done',
      payload: { taskId: 't001' },
    })
  })

  it('rejects when a listener throws', async () => {
    const bus = createBus<AppEvents>()

    bus.on('task:done', async () => {
      throw new Error('async boom')
    })

    await expect(bus.emitAsync('task:done', { taskId: 't001' })).rejects.toThrow('async boom')
  })
})

describe('emitSerial', () => {
  it('runs async handlers in sequence', async () => {
    const bus = createBus<AppEvents>()
    const calls: string[] = []

    bus.on('user:created', async () => {
      calls.push('first:start')
      await Promise.resolve()
      calls.push('first:end')
    })

    bus.on('user:created', async () => {
      calls.push('second:start')
      await Promise.resolve()
      calls.push('second:end')
    })

    await bus.emitSerial('user:created', { id: 'u001', name: 'YangWen' })

    expect(calls).toEqual(['first:start', 'first:end', 'second:start', 'second:end'])
  })

  it('stops on the first async listener error and rethrows it', async () => {
    const bus = createBus<AppEvents>()
    const calls: string[] = []

    bus.on('task:done', async () => {
      calls.push('first')
    })

    bus.on('task:done', async () => {
      calls.push('second')
      throw new Error('serial boom')
    })

    bus.on('task:done', async () => {
      calls.push('third')
    })

    await expect(bus.emitSerial('task:done', { taskId: 't001' })).rejects.toThrow('serial boom')
    expect(calls).toEqual(['first', 'second'])
  })
})
