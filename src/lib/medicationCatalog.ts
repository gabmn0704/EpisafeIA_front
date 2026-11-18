import { Trie } from '@/lib/structures'

/** Common antiseizure medications, used for instant local autocomplete before the API answers. */
export const ANTISEIZURE_MEDICATIONS = [
  'Ácido valproico',
  'Brivaracetam',
  'Carbamazepina',
  'Clobazam',
  'Clonazepam',
  'Diazepam',
  'Etosuximida',
  'Fenitoína',
  'Fenobarbital',
  'Gabapentina',
  'Lacosamida',
  'Lamotrigina',
  'Levetiracetam',
  'Oxcarbazepina',
  'Perampanel',
  'Pregabalina',
  'Primidona',
  'Topiramato',
  'Vigabatrina',
  'Zonisamida',
] as const

let shared: Trie | null = null

export function medicationTrie(): Trie {
  if (!shared) {
    shared = new Trie()
    for (const name of ANTISEIZURE_MEDICATIONS) shared.insert(name)
  }
  return shared
}
