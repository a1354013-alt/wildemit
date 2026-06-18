import { createBus } from '../src'

type AppEvents = {
  'toast:show': { severity: 'success' | 'error'; message: string }
  'auth:logout': { reason: 'manual' | 'expired' }
}

export const appBus = createBus<AppEvents>()

// Component A
appBus.emit('toast:show', {
  severity: 'success',
  message: 'Saved successfully',
})

// Component B
appBus.on('toast:show', payload => {
  console.log(`[${payload.severity}] ${payload.message}`)
})
