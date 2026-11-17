import { HeartRateParseError, parseHeartRateMeasurement, rmssd, viewFromHex } from './heartRate'

describe('parseHeartRateMeasurement', () => {
  it('parses an 8-bit heart rate without extras', () => {
    const m = parseHeartRateMeasurement(viewFromHex('00 48'))
    expect(m.heartRate).toBe(72)
    expect(m.sensorContact).toBe('unsupported')
    expect(m.rrIntervalsMs).toEqual([])
    expect(m.energyExpendedKj).toBeNull()
  })

  it('parses a 16-bit heart rate (little endian)', () => {
    const m = parseHeartRateMeasurement(viewFromHex('01 2c 01'))
    expect(m.heartRate).toBe(300)
  })

  it('reads sensor contact states', () => {
    expect(parseHeartRateMeasurement(viewFromHex('06 50')).sensorContact).toBe('contact')
    expect(parseHeartRateMeasurement(viewFromHex('04 50')).sensorContact).toBe('no_contact')
  })

  it('converts RR intervals from 1/1024 s to milliseconds', () => {
    const m = parseHeartRateMeasurement(viewFromHex('10 3c 00 04 00 04'))
    expect(m.heartRate).toBe(60)
    expect(m.rrIntervalsMs).toEqual([1000, 1000])
  })

  it('handles energy expended plus several RR intervals', () => {
    // flags 0x1E: contact + supported + energy + RR, HR 8-bit
    const m = parseHeartRateMeasurement(viewFromHex('1e 55 10 00 00 03 80 02'))
    expect(m.heartRate).toBe(85)
    expect(m.energyExpendedKj).toBe(16)
    expect(m.rrIntervalsMs).toHaveLength(2)
    expect(m.rrIntervalsMs[0]).toBeCloseTo(750, 0)
    expect(m.rrIntervalsMs[1]).toBeCloseTo(625, 0)
  })

  it('handles 16-bit heart rate combined with RR (flags 0x11)', () => {
    const m = parseHeartRateMeasurement(viewFromHex('11 5a 00 00 02'))
    expect(m.heartRate).toBe(90)
    expect(m.rrIntervalsMs).toEqual([500])
  })

  it('rejects short or truncated frames', () => {
    expect(() => parseHeartRateMeasurement(viewFromHex('00'))).toThrow(HeartRateParseError)
    expect(() => parseHeartRateMeasurement(viewFromHex('01 5a'))).toThrow(/truncada/)
    expect(() => parseHeartRateMeasurement(viewFromHex('08 5a 01'))).toThrow(/truncada/)
  })

  it('rejects invalid hex', () => {
    expect(() => viewFromHex('zz')).toThrow(/Hex/)
  })
})

describe('rmssd', () => {
  it('returns null with fewer than two intervals', () => {
    expect(rmssd([800])).toBeNull()
  })
  it('computes the metric', () => {
    expect(rmssd([800, 810, 790])).toBeCloseTo(Math.sqrt((100 + 400) / 2), 5)
  })
})
