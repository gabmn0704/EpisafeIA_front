export type BluetoothSupport =
  | { supported: true }
  | { supported: false; reason: 'no-api' | 'insecure-context' | 'blocked-by-policy'; title: string; message: string }

/** Detects Web Bluetooth availability and explains clearly why it may be missing. */
export function detectBluetoothSupport(env: { navigator?: Navigator; isSecureContext?: boolean } = {
  navigator: typeof navigator === 'undefined' ? undefined : navigator,
  isSecureContext: typeof window === 'undefined' ? undefined : window.isSecureContext,
}): BluetoothSupport {
  const nav = env.navigator
  if (env.isSecureContext === false) {
    return {
      supported: false,
      reason: 'insecure-context',
      title: 'Se necesita una conexión segura',
      message: 'Web Bluetooth solo funciona en páginas HTTPS (o en localhost). Abre EpiSafe desde su dirección segura.',
    }
  }
  if (!nav || !('bluetooth' in nav) || !nav.bluetooth) {
    return {
      supported: false,
      reason: 'no-api',
      title: 'Este navegador no soporta Bluetooth web',
      message:
        'Usa Google Chrome, Microsoft Edge u Opera en computador o Android. Safari y Firefox no incluyen Web Bluetooth, y en iPhone no está disponible.',
    }
  }
  return { supported: true }
}

/** Translates Web Bluetooth DOMExceptions into messages a person can act on. */
export function describeBluetoothError(error: unknown): { kind: 'cancelled' | 'no-service' | 'denied' | 'lost' | 'unknown'; message: string } {
  const e = (error ?? {}) as { name?: string; message?: string }
  const name = e.name ?? ''
  const text = e.message ?? ''
  if (name === 'NotFoundError' && /cancel/i.test(text)) {
    return { kind: 'cancelled', message: 'Cancelaste la selección. Cuando quieras, vuelve a intentarlo.' }
  }
  if (name === 'NotFoundError') {
    return {
      kind: 'no-service',
      message: 'No encontramos un reloj o banda con pulso cardíaco (servicio estándar 0x180D). Activa la transmisión de pulso en tu reloj e inténtalo otra vez.',
    }
  }
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return { kind: 'denied', message: 'El navegador no permitió el acceso a Bluetooth. Revisa los permisos del sitio.' }
  }
  if (name === 'NetworkError') {
    return { kind: 'lost', message: 'Se perdió la conexión con el dispositivo. Acércalo e intenta reconectar.' }
  }
  return { kind: 'unknown', message: 'No pudimos conectar con el dispositivo. Inténtalo de nuevo.' }
}
