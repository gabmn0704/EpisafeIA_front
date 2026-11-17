import clsx from 'clsx'

export type Variant = 'primary' | 'lime' | 'ghost' | 'outline' | 'danger' | 'dark'
export type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-brand-ink hover:brightness-110 shadow-[0_10px_30px_-10px_var(--brand)]',
  lime: 'bg-lime text-lime-ink hover:brightness-95 shadow-[0_10px_30px_-12px_var(--lime)]',
  dark: 'bg-ink text-bg hover:opacity-90',
  ghost: 'bg-transparent text-ink hover:bg-surface-2',
  outline: 'border border-line bg-surface text-ink hover:border-brand hover:text-brand',
  danger: 'bg-coral text-white hover:brightness-110 shadow-[0_10px_30px_-10px_var(--coral)]',
}
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-14 px-7 text-base gap-2.5',
}

export const buttonClasses = (variant: Variant = 'primary', size: Size = 'md', extra?: string) =>
  clsx(
    'inline-flex select-none items-center justify-center rounded-full font-semibold transition duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    extra,
  )
