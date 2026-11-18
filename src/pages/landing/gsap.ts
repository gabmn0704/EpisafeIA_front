import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export interface MotionContext {
  /** Full motion allowed. */
  full: boolean
  /** Desktop width where pinning is comfortable. */
  desktop: boolean
}

/**
 * Runs `setup` inside gsap.matchMedia so every animation honours prefers-reduced-motion.
 * Under reduced motion `full` is false and callers must leave the static end state in place.
 */
export function useScrollScene(scope: RefObject<HTMLElement | null>, setup: (ctx: MotionContext) => void | (() => void)) {
  useLayoutEffect(() => {
    if (!scope.current) return
    const mm = gsap.matchMedia()
    mm.add(
      {
        full: '(prefers-reduced-motion: no-preference)',
        reduced: '(prefers-reduced-motion: reduce)',
        desktop: '(min-width: 1024px)',
      },
      (context) => {
        const c = context.conditions as { full?: boolean; reduced?: boolean; desktop?: boolean }
        return setup({ full: !!c.full && !c.reduced, desktop: !!c.desktop })
      },
      scope.current,
    )
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
