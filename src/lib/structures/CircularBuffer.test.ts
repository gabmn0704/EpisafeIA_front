import { CircularBuffer } from './CircularBuffer'

describe('CircularBuffer', () => {
  it('keeps insertion order until full', () => {
    const b = new CircularBuffer<number>(3)
    b.push(1)
    b.push(2)
    expect(b.toArray()).toEqual([1, 2])
    expect(b.isFull()).toBe(false)
  })

  it('overwrites the oldest values when full', () => {
    const b = new CircularBuffer<number>(3)
    for (const n of [1, 2, 3, 4, 5]) b.push(n)
    expect(b.toArray()).toEqual([3, 4, 5])
    expect(b.last()).toBe(5)
    expect(b.size).toBe(3)
  })

  it('clears and rejects invalid capacity', () => {
    const b = new CircularBuffer<number>(2)
    b.push(1)
    b.clear()
    expect(b.toArray()).toEqual([])
    expect(b.last()).toBeUndefined()
    expect(() => new CircularBuffer(0)).toThrow(RangeError)
  })
})
