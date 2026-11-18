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

describe('catalog coverage', () => {
  it('suggests the common antiseizure drugs', async () => {
    const { ANTISEIZURE_MEDICATIONS } = await import('./medicationCatalog')
    const all = ANTISEIZURE_MEDICATIONS.join(' ').toLowerCase()
    for (const n of ['levetiracetam', 'valproato', 'lamotrigina', 'carbamazepina']) expect(all).toContain(n)
  })
})
