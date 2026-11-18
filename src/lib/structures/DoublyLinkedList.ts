interface DNode<T> {
  value: T
  prev: DNode<T> | null
  next: DNode<T> | null
}

/**
 * Doubly linked list with a movable cursor. Powers the seizure timeline:
 * "previous / next" navigation is O(1) from the current node.
 */
export class DoublyLinkedList<T> {
  private head: DNode<T> | null = null
  private tail: DNode<T> | null = null
  private cursor: DNode<T> | null = null
  private count = 0

  get size(): number {
    return this.count
  }

  static from<T>(items: Iterable<T>): DoublyLinkedList<T> {
    const list = new DoublyLinkedList<T>()
    for (const item of items) list.append(item)
    return list
  }

  append(value: T): void {
    const node: DNode<T> = { value, prev: this.tail, next: null }
    if (this.tail) this.tail.next = node
    else {
      this.head = node
      this.cursor = node
    }
    this.tail = node
    this.count++
  }

  current(): T | undefined {
    return this.cursor?.value
  }

  hasPrev(): boolean {
    return !!this.cursor?.prev
  }

  hasNext(): boolean {
    return !!this.cursor?.next
  }

  peekPrev(): T | undefined {
    return this.cursor?.prev?.value
  }

  peekNext(): T | undefined {
    return this.cursor?.next?.value
  }

  prev(): T | undefined {
    if (this.cursor?.prev) this.cursor = this.cursor.prev
    return this.cursor?.value
  }

  next(): T | undefined {
    if (this.cursor?.next) this.cursor = this.cursor.next
    return this.cursor?.value
  }

  /** Moves the cursor to the first node matching the predicate. */
  seek(predicate: (value: T) => boolean): boolean {
    for (let n = this.head; n; n = n.next) {
      if (predicate(n.value)) {
        this.cursor = n
        return true
      }
    }
    return false
  }

  toArray(): T[] {
    const out: T[] = []
    for (let n = this.head; n; n = n.next) out.push(n.value)
    return out
  }
}
