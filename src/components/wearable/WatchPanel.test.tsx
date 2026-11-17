import { render, screen } from '@testing-library/react'
import type { HeartRateMonitor } from '@/hooks/useHeartRateMonitor'
import { WatchPanel } from './WatchPanel'

const base: HeartRateMonitor = {
  support: { supported: true },
  status: 'idle',
  deviceName: null,
  current: null,
  sensorContact: null,
  hrvMs: null,
  points: [],
  error: null,
  reconnectAttempt: 0,
  pendingSamples: 0,
  sentSamples: 0,
  connect: async () => undefined,
  disconnect: () => undefined,
}

describe('WatchPanel', () => {
  it('explains clearly when the browser lacks Web Bluetooth', () => {
    render(<WatchPanel monitor={{ ...base, support: { supported: false, reason: 'no-api', title: 'Este navegador no soporta Bluetooth web', message: 'Usa Chrome.' } }} />)
    expect(screen.getByText('Este navegador no soporta Bluetooth web')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /conectar/i })).not.toBeInTheDocument()
  })

  it('shows an honest empty state with no device and no fake numbers', () => {
    render(<WatchPanel monitor={base} />)
    expect(screen.getByText('Aún no hay un dispositivo conectado')).toBeInTheDocument()
    expect(screen.queryByText('lpm')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /conectar dispositivo/i })).toBeInTheDocument()
  })

  it('shows the error and a retry action', () => {
    render(<WatchPanel monitor={{ ...base, status: 'error', error: 'El navegador no permitió el acceso a Bluetooth.' }} />)
    expect(screen.getByRole('alert')).toHaveTextContent('no permitió')
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })

  it('waits for the first real measurement when connected', () => {
    render(<WatchPanel monitor={{ ...base, status: 'connected', deviceName: 'Mi banda' }} />)
    expect(screen.getByText(/Conectado a Mi banda/)).toBeInTheDocument()
    expect(screen.getByText(/Esperando la primera medición real/)).toBeInTheDocument()
  })
})
