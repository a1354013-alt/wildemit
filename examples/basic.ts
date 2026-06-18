import { createBus } from '../src'

type Events = {
  'user:created': { id: string; name: string }
  'user:deleted': { id: string }
}

const bus = createBus<Events>()

const unsubscribe = bus.on('user:created', payload => {
  console.log('created:', payload.name)
})

bus.emit('user:created', {
  id: 'u001',
  name: 'YangWen',
})

unsubscribe()
