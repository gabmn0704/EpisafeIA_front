import { z } from 'zod'

const email = z.string().trim().min(1, 'Ingresa tu correo').email('Ese correo no parece válido')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Ingresa tu contraseña'),
})
export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Cuéntanos tu nombre'),
    email,
    birthDate: z.string().optional(),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Incluye una mayúscula')
      .regex(/[0-9]/, 'Incluye un número'),
    confirm: z.string(),
    terms: z.boolean().refine((v) => v, { message: 'Debes aceptar para continuar' }),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Las contraseñas no coinciden' })
export type RegisterValues = z.infer<typeof registerSchema>

export const forgotSchema = z.object({ email })
export type ForgotValues = z.infer<typeof forgotSchema>

export const dailyLogSchema = z.object({
  sleepHours: z.number().min(0, 'No puede ser negativo').max(24, 'Máximo 24 horas'),
  stressLevel: z.number().int().min(1).max(10),
  caffeineMg: z.number().int().min(0).max(1500, 'Parece demasiado alto'),
  exerciseMinutes: z.number().int().min(0).max(600),
  mood: z.number().int().min(1).max(5),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
})
export type DailyLogValues = z.infer<typeof dailyLogSchema>

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Usa el formato HH:MM')

export const medicationSchema = z.object({
  name: z.string().trim().min(2, 'Escribe el nombre del medicamento'),
  dose: z.string().trim().min(1, 'Indica la dosis'),
  unit: z.string().trim().min(1, 'Indica la unidad'),
  scheduleTimes: z.array(hhmm).min(1, 'Agrega al menos un horario'),
  notes: z.string().max(300).optional(),
})
export type MedicationValues = z.infer<typeof medicationSchema>

export const contactSchema = z
  .object({
    name: z.string().trim().min(2, 'Escribe el nombre'),
    relationship: z.string().trim().min(2, 'Indica el parentesco'),
    phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, 'Teléfono no válido'),
    email: z.string().trim().email('Correo no válido').or(z.literal('')).optional(),
    priority: z.number().int().min(1).max(9),
    notifySms: z.boolean(),
    notifyEmail: z.boolean(),
  })
  .refine((v) => v.notifySms || v.notifyEmail, { path: ['notifySms'], message: 'Activa al menos un canal' })
export type ContactValues = z.infer<typeof contactSchema>

export const seizureSchema = z.object({
  startedAt: z.string().min(1, 'Indica cuándo ocurrió'),
  durationSeconds: z.number().int().min(1, 'Mínimo 1 segundo').max(3600),
  severity: z.number().int().min(1).max(5),
  seizureType: z.string().max(80).optional(),
  notes: z.string().max(500).optional(),
})
export type SeizureValues = z.infer<typeof seizureSchema>

/** Flatten zod issues into { field: message } keeping the first message per field. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_'
    if (!(key in out)) out[key] = issue.message
  }
  return out
}
