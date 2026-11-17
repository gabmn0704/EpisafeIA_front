import { act, renderHook } from '@testing-library/react'
import { useUndoableState } from './useUndoableState'

describe('useUndoableState', () => {
  it('undoes changes in reverse order', () => {
    const { result } = renderHook(() => useUndoableState({ sleep: 7 }))
    act(() => result.current.set({ sleep: 5 }))
    act(() => result.current.set({ sleep: 4 }))
    expect(result.current.canUndo).toBe(true)
    act(() => {
      result.current.undo()
    })
    expect(result.current.value.sleep).toBe(5)
    act(() => {
      result.current.undo()
    })
    expect(result.current.value.sleep).toBe(7)
    expect(result.current.canUndo).toBe(false)
  })

  it('reset clears the history', () => {
    const { result } = renderHook(() => useUndoableState(1))
    act(() => result.current.set(2))
    act(() => result.current.reset(10))
    expect(result.current.value).toBe(10)
    expect(result.current.canUndo).toBe(false)
  })

  it('ignores identical updates', () => {
    const { result } = renderHook(() => useUndoableState(1))
    act(() => result.current.set(1))
    expect(result.current.canUndo).toBe(false)
  })
})
