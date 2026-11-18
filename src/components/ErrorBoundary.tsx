import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="grid min-h-dvh place-items-center bg-bg p-6 text-center text-ink">
        <div className="max-w-md">
          <p className="font-display text-3xl font-semibold">Algo salió mal</p>
          <p className="mt-3 text-muted">La aplicación tuvo un problema inesperado. Tus datos están a salvo.</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-6 h-12 rounded-full bg-brand px-8 font-semibold text-brand-ink">
            Recargar
          </button>
        </div>
      </div>
    )
  }
}
