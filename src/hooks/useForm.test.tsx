import { act, renderHook } from '@testing-library/react'
import { loginSchema } from '@/lib/schemas'
import { useForm } from './useForm'

describe('useForm', () => {
  it('collects zod errors and clears them while editing', () => {
    const { result } = renderHook(() => useForm(loginSchema, { email: '', password: '' }))
    let out: unknown
    act(() => {
      out = result.current.validate()
    })
    expect(out).toBeNull()
    expect(result.current.errors.email).toBeDefined()

    act(() => result.current.set('email', 'a@b.co'))
    expect(result.current.errors.email).toBeUndefined()
    expect(result.current.errors.password).toBeDefined()
  })

  it('returns parsed data when valid', () => {
    const { result } = renderHook(() => useForm(loginSchema, { email: ' ana@mail.com ', password: 'x' }))
    let out: { email: string } | null = null
    act(() => {
      out = result.current.validate()
    })
    expect(out).toEqual({ email: 'ana@mail.com', password: 'x' })
  })
})
