import { describe, expect, it } from 'vitest'
import { moreItems, navItems, tabItems } from './nav'

describe('mobile navigation', () => {
  it('keeps every section reachable from the tab bar or the "Más" sheet', () => {
    const reachable = new Set([...tabItems, ...moreItems].map((i) => i.to))
    for (const item of navItems) expect(reachable.has(item.to)).toBe(true)
  })
})
