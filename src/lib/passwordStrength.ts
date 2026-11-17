export function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score++
  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Excelente']
  return { score: score as 0 | 1 | 2 | 3 | 4, label: labels[score] ?? labels[0] ?? '' }
}
