import { useEffect } from 'react'
import { ScrollTrigger } from './gsap'
import { FinalCta } from './FinalCta'
import { Features } from './Features'
import { Hero } from './Hero'
import { HowItWorks } from './HowItWorks'
import { LandingNav } from './LandingNav'
import { Problem } from './Problem'
import { Security } from './Security'

export default function LandingPage() {
  useEffect(() => {
    // Recalculate trigger positions once fonts and images settle.
    const t = setTimeout(() => ScrollTrigger.refresh(), 400)
    return () => clearTimeout(t)
  }, [])

  return (
    <main className="w-full max-w-full overflow-x-clip">
      <LandingNav />
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <Security />
      <FinalCta />
    </main>
  )
}
