import { useEffect, useId, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { Input } from '@/components/ui/Field'
import { medicationsApi } from '@/lib/api/endpoints'
import { medicationTrie } from '@/lib/medicationCatalog'

interface Props {
  value: string
  onChange: (v: string) => void
  error?: string
}

/** Combobox: instant local Trie suggestions, merged with server results (GET /medications/search). */
export function MedicationAutocomplete({ value, onChange, error }: Props) {
  const [open, setOpen] = useState(false)
  const [remote, setRemote] = useState<string[]>([])
  const [active, setActive] = useState(-1)
  const listId = useId()
  const reqId = useRef(0)

  const local = useMemo(() => (value.trim().length >= 1 ? medicationTrie().search(value, 6) : []), [value])

  useEffect(() => {
    const q = value.trim()
    if (q.length < 2) return
    const id = ++reqId.current
    const t = setTimeout(async () => {
      try {
        const res = await medicationsApi.search(q)
        if (id === reqId.current) setRemote(res.map((r) => (typeof r === 'string' ? r : r.name)))
      } catch {
        /* local suggestions still work offline */
      }
    }, 220)
    return () => clearTimeout(t)
  }, [value])

  const options = useMemo(() => {
    const seen = new Set<string>()
    const out: string[] = []
    for (const n of [...local, ...(value.trim().length >= 2 ? remote : [])]) {
      const k = n.toLowerCase()
      if (!seen.has(k) && k !== value.trim().toLowerCase()) {
        seen.add(k)
        out.push(n)
      }
    }
    return out.slice(0, 7)
  }, [local, remote, value])

  const choose = (n: string) => {
    onChange(n)
    setOpen(false)
    setActive(-1)
  }

  return (
    <div className="relative">
      <Input
        label="Nombre del medicamento"
        value={value}
        error={error}
        autoComplete="off"
        role="combobox"
        aria-expanded={open && options.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        placeholder="Empieza a escribir, ej. Lamo"
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setActive(-1)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (!options.length) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
            setActive((a) => (a + 1) % options.length)
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((a) => (a <= 0 ? options.length - 1 : a - 1))
          } else if (e.key === 'Enter' && active >= 0 && open) {
            e.preventDefault()
            const picked = options[active]
            if (picked) choose(picked)
          } else if (e.key === 'Escape') setOpen(false)
        }}
      />
      {open && options.length > 0 && (
        <ul id={listId} role="listbox" className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-card">
          {options.map((o, i) => (
            <li
              key={o}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault()
                choose(o)
              }}
              className={clsx('cursor-pointer rounded-xl px-3.5 py-2.5 text-sm font-medium', i === active ? 'bg-brand text-brand-ink' : 'hover:bg-surface-2')}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
