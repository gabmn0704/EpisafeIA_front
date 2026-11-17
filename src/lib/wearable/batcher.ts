import type { WearableSampleInput } from '@/lib/api/types'

export const MAX_BATCH = 200

export interface BatcherOptions {
  /** Sends a batch; must reject on failure so the batch is retained. */
  send: (samples: WearableSampleInput[]) => Promise<unknown>
  intervalMs?: number
  maxBatch?: number
  /** Cap on retained unsent samples while offline. */
  maxPending?: number
}

/**
 * Collects samples and ships them to POST /wearables/samples in batches (max 200).
 * Failed batches are kept and retried on the next flush, dropping the oldest above maxPending.
 */
export class SampleBatcher {
  private pending: WearableSampleInput[] = []
  private timer: ReturnType<typeof setInterval> | null = null
  private inflight: Promise<number> | null = null
  private readonly intervalMs: number
  private readonly maxBatch: number
  private readonly maxPending: number

  constructor(private readonly opts: BatcherOptions) {
    this.intervalMs = opts.intervalMs ?? 10_000
    this.maxBatch = Math.min(opts.maxBatch ?? MAX_BATCH, MAX_BATCH)
    this.maxPending = opts.maxPending ?? 2000
  }

  get queued(): number {
    return this.pending.length
  }

  add(sample: WearableSampleInput): void {
    this.pending.push(sample)
    if (this.pending.length > this.maxPending) this.pending.splice(0, this.pending.length - this.maxPending)
    if (this.pending.length >= this.maxBatch) void this.flush()
  }

  start(): void {
    if (this.timer) return
    this.timer = setInterval(() => void this.flush(), this.intervalMs)
  }

  async stop(): Promise<void> {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    await this.flush()
  }

  /** Returns number of samples delivered. Concurrent callers wait for the in-flight run. */
  async flush(): Promise<number> {
    while (this.inflight) await this.inflight
    if (this.pending.length === 0) return 0
    this.inflight = this.run()
    try {
      return await this.inflight
    } finally {
      this.inflight = null
    }
  }

  private async run(): Promise<number> {
    let delivered = 0
    try {
      while (this.pending.length > 0) {
        const batch = this.pending.slice(0, this.maxBatch)
        await this.opts.send(batch)
        this.pending.splice(0, batch.length)
        delivered += batch.length
      }
    } catch {
      /* keep the remaining samples for the next attempt */
    }
    return delivered
  }
}
