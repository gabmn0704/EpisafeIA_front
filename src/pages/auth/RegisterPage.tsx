import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import clsx from 'clsx'
import { AuthShell } from '@/components/auth/AuthShell'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { useForm } from '@/hooks/useForm'
import { ApiError } from '@/lib/api/client'
import { passwordStrength } from '@/lib/passwordStrength'
import { registerSchema } from '@/lib/schemas'
import { useServerWake } from '@/hooks/useServerWake'
import { ensureAwake } from '@/lib/api/wake'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/providers/ToastProvider'

const meterColors = ['bg-line', 'bg-coral', 'bg-amber', 'bg-cyan', 'bg-ok']

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const form = useForm(registerSchema, {
    fullName: '',
    email: '',
    birthDate: '',
    password: '',
    confirm: '',
    terms: false,
  })
  const wake = useServerWake()
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const strength = passwordStrength(form.values.password)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const data = form.validate()
    if (!data) return
    setSubmitting(true)
    try {
      // Si el servidor estaba dormido, esperamos a que despierte (con aviso) antes de enviar.
      if (!(await ensureAwake())) throw new ApiError(0, 'NETWORK_ERROR', 'El servidor no respondió todavía. Inténtalo de nuevo en un momento.')
      await register({ email: data.email, password: data.password, fullName: data.fullName, birthDate: data.birthDate || undefined })
      toast.success('Cuenta creada', 'Bienvenido a EpiSafe IA.')
      navigate('/app', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.code === 'EMAIL_TAKEN') form.setErrors({ email: err.message })
      else setFormError(err instanceof ApiError ? err.message : 'No pudimos crear tu cuenta. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Un minuto para empezar a entender qué influye en tus crisis."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/iniciar-sesion" className="font-semibold text-brand hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {formError && (
          <div role="alert" className="flex items-start gap-3 rounded-2xl bg-coral-soft p-4 text-sm font-medium text-ink">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-coral" aria-hidden />
            {formError}
          </div>
        )}
        <Input label="Nombre completo" autoComplete="name" value={form.values.fullName} error={form.errors.fullName} onChange={(e) => form.set('fullName', e.target.value)} />
        <Input label="Correo electrónico" type="email" autoComplete="email" inputMode="email" value={form.values.email} error={form.errors.email} onChange={(e) => form.set('email', e.target.value)} />
        <Input label="Fecha de nacimiento (opcional)" type="date" autoComplete="bday" value={form.values.birthDate ?? ''} onChange={(e) => form.set('birthDate', e.target.value)} />
        <div>
          <PasswordInput label="Contraseña" autoComplete="new-password" value={form.values.password} error={form.errors.password} onChange={(e) => form.set('password', e.target.value)} />
          {form.values.password && (
            <div className="mt-2" aria-live="polite">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <span key={i} className={clsx('h-1.5 flex-1 rounded-full transition-colors', i <= strength.score ? meterColors[strength.score] : 'bg-line')} />
                ))}
              </div>
              <p className="mt-1 text-xs text-muted">Seguridad: {strength.label}</p>
            </div>
          )}
        </div>
        <PasswordInput label="Confirma tu contraseña" autoComplete="new-password" value={form.values.confirm} error={form.errors.confirm} onChange={(e) => form.set('confirm', e.target.value)} />
        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
            <input type="checkbox" checked={form.values.terms} onChange={(e) => form.set('terms', e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[var(--brand)]" aria-describedby={form.errors.terms ? 'terms-err' : undefined} />
            <span>Acepto que mis datos de salud se traten de forma confidencial y entiendo que EpiSafe IA no reemplaza a mi neurólogo.</span>
          </label>
          {form.errors.terms && (
            <p id="terms-err" role="alert" className="mt-1.5 text-sm font-medium text-coral">
              {form.errors.terms}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          {submitting && wake.status === "waking" ? "Despertando el servidor…" : "Crear cuenta"}
        </Button>
      </form>
    </AuthShell>
  )
}
