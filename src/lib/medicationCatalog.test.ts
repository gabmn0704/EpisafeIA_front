import { medicationTrie } from './medicationCatalog'

describe('medicationTrie', () => {
  it('suggests antiseizure medications by prefix', () => {
    const r = medicationTrie().search('la')
    expect(r).toContain('Lamotrigina')
    expect(r).toContain('Lacosamida')
  })
  it('is accent-insensitive', () => {
    expect(medicationTrie().search('fenito')).toEqual(['Fenitoína'])
  })
})
