import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { useForm } from '@/hooks/useForm'
import { ApiError } from '@/lib/api/client'
import { loginSchema } from '@/lib/schemas'
import { useServerWake } from '@/hooks/useServerWake'
import { ensureAwake } from '@/lib/api/wake'
import { useAuth } from '@/providers/AuthProvider'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/app'
  const form = useForm(loginSchema, { email: '', password: '' })
  const wake = useServerWake()
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const data = form.validate()
    if (!data) return
    setSubmitting(true)
    try {
      // Si el servidor estaba dormido, esperamos a que despierte (con aviso) antes de enviar.
      if (!(await ensureAwake())) throw new ApiError(0, 'NETWORK_ERROR', 'El servidor no respondió todavía. Inténtalo de nuevo en un momento.')
      await login(data.email, data.password)
      navigate(from, { replace: true })
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No pudimos iniciar sesión. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Qué bueno verte de nuevo"
      subtitle="Entra para revisar tu riesgo de hoy y tus últimos registros."
      footer={
        <>
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" className="font-semibold text-brand hover:underline">
            Crea una gratis
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
        <Input label="Correo electrónico" type="email" autoComplete="email" inputMode="email" placeholder="tu@correo.com" value={form.values.email} error={form.errors.email} onChange={(e) => form.set('email', e.target.value)} />
        <PasswordInput label="Contraseña" autoComplete="current-password" placeholder="Tu contraseña" value={form.values.password} error={form.errors.password} onChange={(e) => form.set('password', e.target.value)} />
        <div className="flex justify-end">
          <Link to="/recuperar" className="text-sm font-semibold text-brand hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          {submitting && wake.status === "waking" ? "Despertando el servidor…" : "Iniciar sesión"}
        </Button>
      </form>
    </AuthShell>
  )
}
