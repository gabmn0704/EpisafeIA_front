import { Apple, Cloud, Footprints } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

const providers = [
  { name: 'Fitbit', description: 'Pulso, sueño y pasos desde tu cuenta Fitbit.', icon: Footprints },
  { name: 'Google Health', description: 'Datos de Wear OS y Health Connect.', icon: Cloud },
  { name: 'Apple Health', description: 'Salud de Apple Watch mediante la app para iPhone.', icon: Apple },
]

/** Cloud integrations are prepared but intentionally disabled until the OAuth flows exist. */
export function CloudProviders() {
  return (
    <section aria-labelledby="cloud-title">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 id="cloud-title" className="font-display text-xl font-semibold">
            Proveedores en la nube
          </h2>
          <p className="text-sm text-muted">Conexión sin Bluetooth, directo desde tu cuenta.</p>
        </div>
      </div>
      <ul className="grid gap-4 md:grid-cols-3">
        {providers.map(({ name, description, icon: Icon }) => (
          <li key={name} className="relative rounded-3xl border border-dashed border-line bg-surface p-5 opacity-90">
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-2xl bg-surface-2 text-muted">
                <Icon className="size-5" />
              </span>
              <Badge tone="amber">Próximamente</Badge>
            </div>
            <p className="mt-4 font-display text-lg font-semibold">{name}</p>
            <p className="mt-1 text-sm text-muted">{description}</p>
            <button type="button" disabled className="mt-4 h-10 w-full cursor-not-allowed rounded-full border border-line text-sm font-semibold text-muted">
              No disponible aún
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
