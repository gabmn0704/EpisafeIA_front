import { Queue } from './Queue'

describe('Queue', () => {
  it('dequeues in FIFO order', () => {
    const q = new Queue<number>()
    q.enqueue(1)
    q.enqueue(2)
    q.enqueue(3)
    expect(q.dequeue()).toBe(1)
    expect(q.peek()).toBe(2)
    expect(q.size).toBe(2)
  })

  it('handles emptying and refilling', () => {
    const q = new Queue<string>()
    q.enqueue('a')
    expect(q.dequeue()).toBe('a')
    expect(q.isEmpty()).toBe(true)
    expect(q.dequeue()).toBeUndefined()
    q.enqueue('b')
    expect(q.toArray()).toEqual(['b'])
  })

  it('removes elements from the middle, head and tail', () => {
    const q = new Queue<number>()
    for (const n of [1, 2, 3, 4]) q.enqueue(n)
    expect(q.remove((n) => n === 2)).toBe(true)
    expect(q.remove((n) => n === 4)).toBe(true)
    expect(q.remove((n) => n === 1)).toBe(true)
    expect(q.remove((n) => n === 99)).toBe(false)
    expect(q.toArray()).toEqual([3])
    q.enqueue(5)
    expect(q.toArray()).toEqual([3, 5])
  })
})
