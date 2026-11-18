import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { useForm } from '@/hooks/useForm'
import { authApi } from '@/lib/api/endpoints'
import { forgotSchema } from '@/lib/schemas'

export default function ForgotPage() {
  const form = useForm(forgotSchema, { email: '' })
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const data = form.validate()
    if (!data) return
    setSubmitting(true)
    try {
      await authApi.forgot(data.email)
    } catch {
      /* The response is intentionally identical to avoid revealing which emails exist. */
    } finally {
      setSubmitting(false)
      setSent(true)
    }
  }

  return (
    <AuthShell
      title="Recupera tu acceso"
      subtitle="Te enviaremos instrucciones para crear una nueva contraseña."
      footer={
        <Link to="/iniciar-sesion" className="font-semibold text-brand hover:underline">
          Volver a iniciar sesión
        </Link>
      }
    >
      {sent ? (
        <div role="status" className="rounded-3xl bg-brand-soft p-6 text-center">
          <MailCheck className="mx-auto size-10 text-brand" aria-hidden />
          <p className="mt-3 font-display text-lg font-semibold">Revisa tu correo</p>
          <p className="mt-1 text-sm text-muted">Si {form.values.email} tiene una cuenta, recibirás un enlace en unos minutos.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Input label="Correo electrónico" type="email" autoComplete="email" value={form.values.email} error={form.errors.email} onChange={(e) => form.set('email', e.target.value)} />
          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            Enviar instrucciones
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
