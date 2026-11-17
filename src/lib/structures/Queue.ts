/**
 * FIFO queue implemented as a singly linked list so enqueue and dequeue are O(1).
 * Used by the toast system.
 */
interface QNode<T> {
  value: T
  next: QNode<T> | null
}

export class Queue<T> {
  private head: QNode<T> | null = null
  private tail: QNode<T> | null = null
  private count = 0

  get size(): number {
    return this.count
  }

  isEmpty(): boolean {
    return this.count === 0
  }

  enqueue(value: T): void {
    const node: QNode<T> = { value, next: null }
    if (this.tail) this.tail.next = node
    else this.head = node
    this.tail = node
    this.count++
  }

  dequeue(): T | undefined {
    const node = this.head
    if (!node) return undefined
    this.head = node.next
    if (!this.head) this.tail = null
    this.count--
    return node.value
  }

  peek(): T | undefined {
    return this.head?.value
  }

  /** Removes the first element matching the predicate. Returns true if removed. */
  remove(predicate: (value: T) => boolean): boolean {
    let prev: QNode<T> | null = null
    let cur = this.head
    while (cur) {
      if (predicate(cur.value)) {
        if (prev) prev.next = cur.next
        else this.head = cur.next
        if (cur === this.tail) this.tail = prev
        this.count--
        return true
      }
      prev = cur
      cur = cur.next
    }
    return false
  }

  toArray(): T[] {
    const out: T[] = []
    for (let cur = this.head; cur; cur = cur.next) out.push(cur.value)
    return out
  }
}
