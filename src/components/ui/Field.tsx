import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import clsx from 'clsx'

interface FieldShellProps {
  label: string
  error?: string
  hint?: string
  id: string
  children: ReactNode
}

function FieldShell({ label, error, hint, id, children }: FieldShellProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} role="alert" className="text-sm font-medium text-coral">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-sm text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

const control =
  'w-full rounded-2xl border bg-surface px-4 text-base text-ink placeholder:text-muted/70 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/20'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  trailing?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, hint, trailing, className, id, ...rest }, ref) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <FieldShell label={label} error={error} hint={hint} id={fid}>
      <div className="relative">
        <input
          ref={ref}
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
          className={clsx(control, 'h-12', error ? 'border-coral' : 'border-line', trailing && 'pr-12', className)}
          {...rest}
        />
        {trailing && <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div>}
      </div>
    </FieldShell>
  )
})

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea({ label, error, hint, className, id, ...rest }, ref) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <FieldShell label={label} error={error} hint={hint} id={fid}>
      <textarea
        ref={ref}
        id={fid}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
        className={clsx(control, 'py-3', error ? 'border-coral' : 'border-line', className)}
        {...rest}
      />
    </FieldShell>
  )
})
