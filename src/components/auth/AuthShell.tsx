import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

function PulseLine() {
  return (
    <svg viewBox="0 0 600 120" className="w-full" fill="none" aria-hidden>
      <motion.path
        d="M0 70h120l24-46 36 92 30-62 24 16h90l22-40 30 70 26-30h198"
        stroke="#C6FF3D"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse', repeatDelay: 0.6 }}
      />
    </svg>
  )
}

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-bg lg:grid-cols-[1.05fr_1fr]">
      <aside className="grain relative hidden overflow-hidden bg-[radial-gradient(90%_70%_at_20%_10%,#6a3cff_0%,#2a14a3_45%,#0b0630_100%)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 top-1/3 size-96 rounded-full bg-lime/25 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 size-80 rounded-full bg-coral/30 blur-[100px]" />
        <Link to="/" className="relative z-10 w-fit" aria-label="Volver al inicio">
          <Logo tone="light" />
        </Link>
        <div className="relative z-10 max-w-xl">
          <PulseLine />
          <h2 className="mt-8 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-balance">
            Anticípate a la crisis. <span className="text-lime">Vive con más calma.</span>
          </h2>
          <p className="mt-5 max-w-md text-lg text-white/75">
            Tu sueño, tu medicación y tu pulso hablan antes que tu cuerpo. EpiSafe IA los escucha por ti.
          </p>
        </div>
        <p className="relative z-10 flex items-center gap-2 text-sm text-white/70">
          <ShieldCheck className="size-4 text-lime" aria-hidden /> Tus datos de salud viajan cifrados y nunca se venden.
        </p>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-12">
        <div className="mb-10 flex items-center justify-between">
          <Link to="/" className="lg:hidden" aria-label="Volver al inicio">
            <Logo />
          </Link>
          <Link to="/" className="ml-auto inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
            <ArrowLeft className="size-4" aria-hidden /> Volver al inicio
          </Link>
        </div>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="m-auto w-full max-w-md py-6">
          <h1 className="font-display text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-8 text-center text-sm text-muted">{footer}</div>
        </motion.div>
      </main>
    </div>
  )
}
