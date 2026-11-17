import { contactSchema, fieldErrors, loginSchema, medicationSchema, registerSchema } from './schemas'

describe('schemas', () => {
  it('rejects an invalid login with readable messages', () => {
    const r = loginSchema.safeParse({ email: 'nope', password: '' })
    expect(r.success).toBe(false)
    if (!r.success) {
      const e = fieldErrors(r.error)
      expect(e.email).toMatch(/válido/)
      expect(e.password).toBeDefined()
    }
  })

  it('enforces password strength and confirmation on register', () => {
    const base = { fullName: 'Ana Gómez', email: 'ana@mail.com', password: 'Demo1234!', confirm: 'Demo1234!', terms: true as const }
    expect(registerSchema.safeParse(base).success).toBe(true)
    const weak = registerSchema.safeParse({ ...base, password: 'abc', confirm: 'abc' })
    expect(weak.success).toBe(false)
    const mismatch = registerSchema.safeParse({ ...base, confirm: 'Otra1234' })
    expect(mismatch.success).toBe(false)
    if (!mismatch.success) expect(fieldErrors(mismatch.error).confirm).toMatch(/coinciden/)
  })

  it('validates medication schedule format', () => {
    expect(medicationSchema.safeParse({ name: 'Lamotrigina', dose: '100', unit: 'mg', scheduleTimes: ['08:00'] }).success).toBe(true)
    expect(medicationSchema.safeParse({ name: 'Lamotrigina', dose: '100', unit: 'mg', scheduleTimes: ['8am'] }).success).toBe(false)
  })

  it('requires at least one notification channel for contacts', () => {
    const r = contactSchema.safeParse({ name: 'Mamá', relationship: 'Madre', phone: '+57 300 123 4567', priority: 1, notifySms: false, notifyEmail: false })
    expect(r.success).toBe(false)
  })
})
