import { createBus } from '../src'

type Events = {
  'user:created': { id: string; name: string }
  'user:deleted': { id: string }
  'order:paid': { orderId: string; amount: number }
}

const bus = createBus<Events>()

bus.on('user:*', event => {
  console.log('user event:', event.type, event.payload)
})

bus.on('*', event => {
  console.log('all events:', event.type, event.payload)
})

bus.emit('user:created', { id: 'u001', name: 'YangWen' })
bus.emit('order:paid', { orderId: 'o001', amount: 1200 })
