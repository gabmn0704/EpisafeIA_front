import { useCallback, useState } from 'react'
import type { ZodType } from 'zod'
import { fieldErrors } from '@/lib/schemas'

export interface FormApi<T> {
  values: T
  errors: Record<string, string | undefined>
  set: <K extends keyof T>(key: K, value: T[K]) => void
  /** Returns parsed data when valid, otherwise null and fills errors. */
  validate: () => T | null
  setErrors: (e: Record<string, string>) => void
  reset: (next?: T) => void
}

/** Small zod-backed form state: errors clear per field as the user edits. */
export function useForm<T extends Record<string, unknown>>(schema: ZodType<T>, initial: T): FormApi<T> {
  const [values, setValues] = useState<T>(initial)
  const [errors, setErrorsState] = useState<Record<string, string>>({})

  const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrorsState((e) => {
      if (!(key as string in e)) return e
      const next = { ...e }
      delete next[key as string]
      return next
    })
  }, [])

  const validate = useCallback((): T | null => {
    const r = schema.safeParse(values)
    if (r.success) {
      setErrorsState({})
      return r.data
    }
    setErrorsState(fieldErrors(r.error))
    return null
  }, [schema, values])

  const reset = useCallback((next?: T) => {
    setValues(next ?? initial)
    setErrorsState({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { values, errors, set, validate, setErrors: setErrorsState, reset }
}
