import { describeBluetoothError, detectBluetoothSupport } from './support'

describe('detectBluetoothSupport', () => {
  it('reports unsupported browsers', () => {
    const r = detectBluetoothSupport({ navigator: {} as Navigator, isSecureContext: true })
    expect(r.supported).toBe(false)
    if (!r.supported) expect(r.reason).toBe('no-api')
  })

  it('reports insecure contexts first', () => {
    const r = detectBluetoothSupport({ navigator: { bluetooth: {} } as unknown as Navigator, isSecureContext: false })
    expect(r.supported).toBe(false)
    if (!r.supported) expect(r.reason).toBe('insecure-context')
  })

  it('accepts a secure context with the API', () => {
    expect(detectBluetoothSupport({ navigator: { bluetooth: {} } as unknown as Navigator, isSecureContext: true }).supported).toBe(true)
  })
})

describe('describeBluetoothError', () => {
  it('distinguishes cancellation from missing service', () => {
    expect(describeBluetoothError(new DOMException('User cancelled the requestDevice() chooser.', 'NotFoundError')).kind).toBe('cancelled')
    expect(describeBluetoothError(new DOMException('No services matching', 'NotFoundError')).kind).toBe('no-service')
  })
  it('maps denial and connection loss', () => {
    expect(describeBluetoothError(new DOMException('x', 'NotAllowedError')).kind).toBe('denied')
    expect(describeBluetoothError(new DOMException('x', 'NetworkError')).kind).toBe('lost')
    expect(describeBluetoothError(new Error('x')).kind).toBe('unknown')
  })
})
