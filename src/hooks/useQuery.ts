import { useCallback, useEffect, useRef, useState } from 'react'

export interface QueryState<T> {
  data: T | undefined
  error: unknown
  loading: boolean
  reload: () => void
  setData: (updater: (prev: T | undefined) => T | undefined) => void
}

/** Minimal data-fetching hook: loading / error / data with manual reload and race protection. */
export function useQuery<T>(fetcher: () => Promise<T>, deps: readonly unknown[] = []): QueryState<T> {
  const [data, setDataState] = useState<T | undefined>(undefined)
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    let cancelled = false
    // Resetting status at the start of a fetch is the intended synchronization here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)
    fetcherRef
      .current()
      .then((d) => {
        if (!cancelled) setDataState(d)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  const setData = useCallback((updater: (prev: T | undefined) => T | undefined) => setDataState((p) => updater(p)), [])
  return { data, error, loading, reload, setData }
}
