import { Trie } from './Trie'

describe('Trie', () => {
  const build = () => {
    const t = new Trie()
    for (const w of ['Levetiracetam', 'Lamotrigina', 'Lacosamida', 'Carbamazepina', 'Ácido valproico']) t.insert(w)
    return t
  }

  it('finds words by prefix ignoring case and accents', () => {
    const t = build()
    expect(t.search('la')).toEqual(['Lacosamida', 'Lamotrigina'])
    expect(t.search('ACIDO')).toEqual(['Ácido valproico'])
  })

  it('respects the limit and returns empty on miss', () => {
    const t = build()
    expect(t.search('l', 2)).toHaveLength(2)
    expect(t.search('zzz')).toEqual([])
  })

  it('tracks size without double counting', () => {
    const t = build()
    t.insert('Lamotrigina')
    expect(t.size).toBe(5)
    expect(t.has('carbamazepina')).toBe(true)
    expect(t.has('carba')).toBe(false)
  })
})
