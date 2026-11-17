/**
 * Starts the MSW service worker ONLY in development when VITE_USE_MOCKS=true.
 * In production builds `import.meta.env.DEV` is statically false, so the mock
 * bundle is never included or executed.
 */
export async function enableMocks(): Promise<boolean> {
  if (!import.meta.env.DEV || import.meta.env.VITE_USE_MOCKS !== 'true') return false
  const { worker } = await import('./browser')
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
  console.info('[EpiSafe] Modo mocks activo (solo desarrollo): los datos no son reales.')
  return true
}
