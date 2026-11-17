/**
 * Fixed-capacity ring buffer. Oldest entries are overwritten when full.
 * Backs the live heart-rate chart so memory use stays constant.
 */
export class CircularBuffer<T> {
  private data: (T | undefined)[]
  private start = 0
  private count = 0

  constructor(readonly capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new RangeError('capacity must be a positive integer')
    this.data = new Array<T | undefined>(capacity)
  }

  get size(): number {
    return this.count
  }

  isFull(): boolean {
    return this.count === this.capacity
  }

  push(item: T): void {
    const idx = (this.start + this.count) % this.capacity
    if (this.count < this.capacity) {
      this.count++
    } else {
      this.start = (this.start + 1) % this.capacity
    }
    this.data[idx] = item
  }

  /** Oldest to newest. */
  toArray(): T[] {
    const out: T[] = []
    for (let i = 0; i < this.count; i++) out.push(this.data[(this.start + i) % this.capacity] as T)
    return out
  }

  last(): T | undefined {
    if (this.count === 0) return undefined
    return this.data[(this.start + this.count - 1) % this.capacity]
  }

  clear(): void {
    this.data = new Array<T | undefined>(this.capacity)
    this.start = 0
    this.count = 0
  }
}
