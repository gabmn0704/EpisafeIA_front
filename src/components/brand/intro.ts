export const INTRO_KEY = 'episafe.intro'

/** ¿Corresponde mostrar la intro? Solo la primera carga de la sesión y sin reduced motion. */
export function shouldPlayIntro(): boolean {
  if (typeof window === 'undefined' || import.meta.env.MODE === 'test') return false
  try {
    if (sessionStorage.getItem(INTRO_KEY)) return false
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  } catch {
    return false
  }
  return true
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_KEY, '1')
  } catch {
    /* sin sessionStorage */
  }
  delete document.documentElement.dataset.intro
}

