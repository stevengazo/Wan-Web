# 🧑‍💻 Desarrollo

## Requisitos

- Node.js 20.19+ o 22.12+ (lo que exige Vite 8). El CI usa Node 24.
- La API corriendo (local con `dotnet run` o en Docker).

## Comandos

```bash
npm install
npm run dev       # http://localhost:5173 con HMR
npm run build     # tsc -b + vite build → dist/
npm run preview   # sirve dist/
npm run lint      # oxlint
```

## Variables

Copia [.env.example](../.env.example) a `.env` (fuera de git):

| Variable | Uso |
|----------|-----|
| `API_PROXY_TARGET` | A dónde redirige `npm run dev` las rutas `/api` y `/hubs`. Por defecto `http://localhost:5238` (API con `dotnet run`); usa `http://localhost:8080` para la API en Docker. |

Solo las variables con prefijo `VITE_` llegan al navegador: **nunca pongas secretos ahí**. `API_PROXY_TARGET` solo la lee Vite.

## Alias

`@/` apunta a `src/` (en `vite.config.ts` y `tsconfig.app.json`):

```ts
import { Button } from '@/components/atoms/Button'
import { useUsers } from '@/services/api'
```

## Convenciones

| Tema | Regla |
|------|-------|
| Idioma | Código en inglés; textos de la UI, comentarios y commits en español |
| Componentes | Funciones con nombre (`export function UserList`), una por archivo, sin `export default` (salvo `App`) |
| Estructura | Atomic design ([arquitectura.md](arquitectura.md)); los organismos no llaman a la API |
| Datos | Solo por hooks de `services/api`; claves en `keys.ts` |
| Alertas | `meta.success` en la mutación; nada de `toast()` sueltos |
| Estilos | Tailwind, mobile first, variante `dark:` en todo color ([estilos.md](estilos.md)) |
| Accesibilidad | `label` en cada campo, `aria-label` en botones de solo ícono, foco visible |
| Comentarios | Solo cuando explican un porqué no obvio |

## Agregar una pantalla

Ejemplo: una lista de "Campañas".

1. **Tipos y hooks:** `services/api/campaigns.ts` con `useCampaigns`, `useCreateCampaign` (con `meta.success`), y la clave en `keys.ts`. Reexporta desde `index.ts`.
2. **Organismos:** `components/organisms/campaigns/CampaignList.tsx`, presentacional (datos y callbacks por props).
3. **Página:** `pages/CampaignsPage.tsx`, que usa los hooks y compone `PageHeader` y los organismos.
4. **Ruta:** en `app/App.tsx`, con `lazy()` y `<RequireAuth admin>` si corresponde.
5. **Menú:** un ítem en `allNav` de `components/templates/AppTemplate.tsx` (con `admin: true` si es solo para admins) y su ícono en `atoms/icons.tsx`.
6. **Tiempo real** (opcional): el evento en `hooks/useRealtime.ts`.
7. `npm run lint && npm run build`.

## Íconos

Los íconos son SVG inline en `atoms/icons.tsx`, con trazo de 2 y `currentColor`, así heredan el color del texto y el tema. No hay librería de íconos: agrega uno nuevo con el componente `Icon` base.
