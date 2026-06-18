import { createBus } from '../src'

type CliEvents = {
  'task:start': { name: string }
  'task:done': { name: string; durationMs: number }
  'task:error': { name: string; error: Error }
}

const bus = createBus<CliEvents>()

bus.on('task:*', event => {
  console.log('task event:', event.type)
})

bus.emit('task:start', { name: 'build' })
bus.emit('task:done', { name: 'build', durationMs: 345 })
