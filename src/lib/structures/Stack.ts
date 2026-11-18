/** LIFO stack backed by an array. Used for undo history in the daily log. */
export class Stack<T> {
  private items: T[] = []

  constructor(private readonly limit = Infinity) {}

  get size(): number {
    return this.items.length
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  push(item: T): void {
    this.items.push(item)
    if (this.items.length > this.limit) this.items.shift()
  }

  pop(): T | undefined {
    return this.items.pop()
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1]
  }

  clear(): void {
    this.items = []
  }

  toArray(): T[] {
    return [...this.items]
  }
}
