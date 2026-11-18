import { Stack } from './Stack'

describe('Stack', () => {
  it('pops in LIFO order', () => {
    const s = new Stack<number>()
    s.push(1)
    s.push(2)
    s.push(3)
    expect(s.pop()).toBe(3)
    expect(s.peek()).toBe(2)
    expect(s.size).toBe(2)
  })

  it('returns undefined when empty', () => {
    const s = new Stack<string>()
    expect(s.isEmpty()).toBe(true)
    expect(s.pop()).toBeUndefined()
    expect(s.peek()).toBeUndefined()
  })

  it('drops the oldest entry when the limit is exceeded', () => {
    const s = new Stack<number>(2)
    s.push(1)
    s.push(2)
    s.push(3)
    expect(s.toArray()).toEqual([2, 3])
  })

  it('clears all items', () => {
    const s = new Stack<number>()
    s.push(1)
    s.clear()
    expect(s.size).toBe(0)
  })
})
