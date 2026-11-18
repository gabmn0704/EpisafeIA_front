import { useCallback, useRef, useState } from 'react'
import { Stack } from '@/lib/structures'

/** State with an undo history backed by our own Stack (bounded). */
export function useUndoableState<T>(initial: T, limit = 50) {
  const [value, setValue] = useState<T>(initial)
  const history = useRef(new Stack<T>(limit))
  const [depth, setDepth] = useState(0)

  const set = useCallback((updater: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater
      if (next === prev) return prev
      history.current.push(prev)
      return next
    })
    setDepth(history.current.size)
  }, [])

  const undo = useCallback(() => {
    const previous = history.current.pop()
    if (previous === undefined) return false
    setValue(previous)
    setDepth(history.current.size)
    return true
  }, [])

  /** Replaces the value and forgets the history (used after loading from the server). */
  const reset = useCallback((next: T) => {
    history.current.clear()
    setValue(next)
    setDepth(0)
  }, [])

  return { value, set, undo, reset, canUndo: depth > 0, depth }
}
