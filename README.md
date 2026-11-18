# EpiSafe IA - Frontend

Aplicación web de **EpiSafe IA**, sistema inteligente de prevención y asistencia para personas con epilepsia. Está hecha con React, TypeScript estricto y Vite, y consume la API REST del backend (`/api/v1`).

## Qué incluye

- **Landing pública** con animaciones de scroll (GSAP): hero, problema, cómo funciona, funciones, seguridad y CTA. Respeta `prefers-reduced-motion`.
- **Autenticación**: login, registro y recuperación con validación (zod), guardas de ruta, refresh de token automático (una sola petición compartida) y cierre de sesión.
- **App autenticada** con sidebar, topbar, modo claro/oscuro y diseño móvil:
  - Resumen: riesgo de hoy con medidor animado y factores, adherencia, racha sin crisis, pulso en vivo y alertas.
  - Registro diario con **deshacer** (pila propia).
  - Medicamentos: agenda del día, marcar tomas, autocompletado con **Trie**.
  - Crisis: calendario tipo heatmap, historial, detalle y línea de tiempo anterior/siguiente (lista doblemente enlazada).
  - Emergencia: un toque, cuenta regresiva de 5 s para cancelar, geolocalización y estado de notificaciones.
  - Insights de IA con la evidencia (n, intervalo de Wilson, aumento de riesgo).
  - Contactos de emergencia, informe médico imprimible (Imprimir > Guardar como PDF) y dispositivos.
- **Reloj (próximamente)**: la pantalla muestra una tarjeta "Próximamente"; no se solicita Bluetooth. (Antes: **Web Bluetooth**): hook `useHeartRateMonitor` con el servicio estándar `heart_rate` (0x180D) y la característica `heart_rate_measurement` (0x2A37). Parsea banderas de 8/16 bits, gasto energético e intervalos RR, calcula RMSSD, reconecta con backoff, usa un buffer circular propio y envía lotes (máx. 200) a `POST /wearables/samples`. **Nunca simula datos**: sin dispositivo o sin soporte del navegador muestra mensajes claros. Fitbit, Google Health y Apple Health aparecen como "próximamente".

## Estructuras de datos propias (`src/lib/structures`)

| Estructura | Uso real |
| --- | --- |
| `Stack` | Deshacer cambios del registro diario |
| `Queue` (lista enlazada) | Cola de toasts con tope de 3 visibles |
| `Trie` | Autocompletado de medicamentos sin tildes |
| `CircularBuffer` | Ventana de la gráfica de pulso en vivo |
| `DoublyLinkedList` | Navegación anterior/siguiente en la línea de tiempo de crisis |

## Requisitos

- Node.js 20 o superior
- Backend de EpiSafe IA corriendo (por defecto `http://localhost:4000/api/v1`) o el modo mocks

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # ajusta VITE_API_URL si hace falta
npm run dev                  # http://localhost:5173
```

### Ver la app sin backend (solo desarrollo)

Crea `.env.local` con `VITE_USE_MOCKS=true` y ejecuta `npm run dev`. Se activa MSW con datos de demostración:

- Usuario: `demo@episafe.app`
- Contraseña: `Demo1234!`

Los mocks **solo** funcionan con `npm run dev` y también se usan en las pruebas. En un build de producción el código de mocks no se incluye ni se ejecuta, aunque la variable esté definida. Los datos del reloj nunca se inventan: el mock devuelve listas vacías.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Typecheck + build de producción en `dist/` |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript estricto |
| `npm test` | Vitest + Testing Library |

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | URL base de la API, incluyendo `/api/v1` |
| `VITE_USE_MOCKS` | `true` activa MSW solo en desarrollo |

## Despliegue en Vercel

1. Sube este repositorio a GitHub (ya lo está) y entra a [vercel.com/new](https://vercel.com/new).
2. Importa `EpisafeIA_front`. Vercel detecta Vite; `vercel.json` ya define el build (`npm run build`), el directorio de salida (`dist`), los **rewrites de SPA** y los **headers de seguridad** (CSP, HSTS, X-Frame-Options, Permissions-Policy, etc.).
3. En **Settings > Environment Variables** agrega `VITE_API_URL` con la URL pública de tu API, por ejemplo `https://tu-api.onrender.com/api/v1`. No definas `VITE_USE_MOCKS` en producción.
4. Pulsa **Deploy**.
5. En el backend, agrega el dominio de Vercel a `CORS_ORIGIN` para que el navegador pueda llamar a la API.

Notas:

- La CSP permite `connect-src https:` para que la web hable con tu API en otro dominio. Si quieres restringirla, reemplaza `https:` por el origen exacto de tu API en `vercel.json`.
- El flujo SSE de alertas usa `?token=` por limitación de `EventSource`; en producción usa siempre HTTPS.

## Estructura

```
src/
  components/   ui, layout, dashboard, crisis, medications, wearable...
  hooks/        useQuery, useForm, useUndoableState, useEmergencyFlow, useHeartRateMonitor...
  lib/          api (cliente tipado), structures, wearable (parser, batcher), schemas (zod)
  mocks/        MSW (solo dev y tests)
  pages/        landing, auth, app
  providers/    Auth, Theme, Toast
  routes/       rutas, guardas
```

## Aviso

EpiSafe IA es una herramienta de apoyo. No diagnostica ni cambia dosis, y no reemplaza la atención médica. Ante una emergencia, llama a tu número local de emergencias.


## Logo y marca

El logo (escudo con pulso) vive en `public/logo.svg` y es la fuente única; reutilízalo tal cual en la app móvil. Los iconos PWA (192, 512, maskable, apple-touch) se regeneran con `node scripts/generate-icons.mjs` a partir de `public/icon.svg` y `public/icon-maskable.svg` (requiere Chrome, Edge o Chromium instalado).

## Servidor dormido (arranque en frío)

Al cargar, la app hace ping a `/health` con reintentos hasta 90 s y muestra "Despertando el servidor…" con progreso; el login espera a que responda antes de enviar.
