/**
 * Parser for the Bluetooth SIG Heart Rate Measurement characteristic (0x2A37).
 *
 * Layout (little endian):
 *   byte 0   flags
 *              bit 0   heart rate value format (0 = uint8, 1 = uint16)
 *              bit 1   sensor contact detected
 *              bit 2   sensor contact feature supported
 *              bit 3   energy expended field present (uint16, kJ)
 *              bit 4   one or more RR intervals present (uint16 each, 1/1024 s)
 *   next     heart rate value (1 or 2 bytes)
 *   optional energy expended (2 bytes)
 *   optional RR intervals until the end of the frame (2 bytes each)
 */

export const HEART_RATE_SERVICE = 0x180d
export const HEART_RATE_MEASUREMENT = 0x2a37

export type SensorContact = 'unsupported' | 'no_contact' | 'contact'

export interface HeartRateMeasurement {
  heartRate: number
  sensorContact: SensorContact
  energyExpendedKj: number | null
  /** RR intervals converted to milliseconds. */
  rrIntervalsMs: number[]
}

export class HeartRateParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'HeartRateParseError'
  }
}

export function parseHeartRateMeasurement(view: DataView): HeartRateMeasurement {
  if (view.byteLength < 2) throw new HeartRateParseError('Trama demasiado corta')

  const flags = view.getUint8(0)
  const is16bit = (flags & 0x01) !== 0
  const contactDetected = (flags & 0x02) !== 0
  const contactSupported = (flags & 0x04) !== 0
  const hasEnergy = (flags & 0x08) !== 0
  const hasRr = (flags & 0x10) !== 0

  let offset = 1
  const need = (bytes: number) => {
    if (offset + bytes > view.byteLength) throw new HeartRateParseError('Trama truncada')
  }

  need(is16bit ? 2 : 1)
  const heartRate = is16bit ? view.getUint16(offset, true) : view.getUint8(offset)
  offset += is16bit ? 2 : 1

  let energyExpendedKj: number | null = null
  if (hasEnergy) {
    need(2)
    energyExpendedKj = view.getUint16(offset, true)
    offset += 2
  }

  const rrIntervalsMs: number[] = []
  if (hasRr) {
    while (offset + 2 <= view.byteLength) {
      const raw = view.getUint16(offset, true)
      rrIntervalsMs.push(Math.round((raw / 1024) * 1000 * 10) / 10)
      offset += 2
    }
  }

  const sensorContact: SensorContact = !contactSupported ? 'unsupported' : contactDetected ? 'contact' : 'no_contact'
  return { heartRate, sensorContact, energyExpendedKj, rrIntervalsMs }
}

/** Convenience helper used by tests and tooling: "10 3c 00 04" -> DataView. */
export function viewFromHex(hex: string): DataView {
  const bytes = hex
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((b) => parseInt(b, 16))
  if (bytes.some((n) => Number.isNaN(n) || n < 0 || n > 255)) throw new HeartRateParseError('Hex inválido')
  return new DataView(new Uint8Array(bytes).buffer)
}

/** Root mean square of successive differences, the standard short-term HRV metric. */
export function rmssd(rrMs: readonly number[]): number | null {
  if (rrMs.length < 2) return null
  let sum = 0
  for (let i = 1; i < rrMs.length; i++) {
    const a = rrMs[i]
    const b = rrMs[i - 1]
    if (a === undefined || b === undefined) continue
    sum += (a - b) ** 2
  }
  return Math.sqrt(sum / (rrMs.length - 1))
}
