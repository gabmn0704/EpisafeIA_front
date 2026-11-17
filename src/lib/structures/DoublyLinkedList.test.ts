import { DoublyLinkedList } from './DoublyLinkedList'

describe('DoublyLinkedList', () => {
  it('navigates with a cursor in both directions', () => {
    const l = DoublyLinkedList.from(['a', 'b', 'c'])
    expect(l.current()).toBe('a')
    expect(l.hasPrev()).toBe(false)
    expect(l.next()).toBe('b')
    expect(l.next()).toBe('c')
    expect(l.hasNext()).toBe(false)
    expect(l.next()).toBe('c')
    expect(l.prev()).toBe('b')
  })

  it('peeks neighbours without moving the cursor', () => {
    const l = DoublyLinkedList.from([1, 2, 3])
    l.seek((n) => n === 2)
    expect(l.peekPrev()).toBe(1)
    expect(l.peekNext()).toBe(3)
    expect(l.current()).toBe(2)
  })

  it('seeks a node by predicate', () => {
    const l = DoublyLinkedList.from([1, 2, 3, 4])
    expect(l.seek((n) => n === 3)).toBe(true)
    expect(l.current()).toBe(3)
    expect(l.hasNext()).toBe(true)
    expect(l.seek((n) => n === 99)).toBe(false)
    expect(l.current()).toBe(3)
  })

  it('is safe when empty', () => {
    const l = new DoublyLinkedList<number>()
    expect(l.current()).toBeUndefined()
    expect(l.prev()).toBeUndefined()
    expect(l.toArray()).toEqual([])
    expect(l.size).toBe(0)
  })
})
