# Mapache — Frontend

Panel de administración del bot telefónico: extensiones, llamadas en vivo, transferencias, formularios y base de conocimiento. Ver [PLAN.md](../PLAN.md) para fases.

## Stack

- Vite + React 19 + TypeScript, mobile first
- Tailwind CSS v4 con tema claro / oscuro / sistema (`src/theme/`)
- Motion para animaciones (respeta "reducir movimiento" del sistema)
- React Router (rutas) y TanStack Query (datos del servidor)
- Oxlint para linting
- SignalR para eventos en vivo (`src/realtime/`)

## Estructura

| Carpeta | Contenido |
|---------|-----------|
| `src/api/` | Cliente `fetch` con JWT (`client.ts`), tipos de los DTOs (`types.ts`) y hooks de TanStack Query (`queries.ts`) |
| `src/auth/` | Sesión en localStorage, `useAuth` y guarda de rutas `RequireAuth` (con `admin` para rutas de administrador) |
| `src/layout/` | Layout: barra inferior en móvil, sidebar desde `md:` |
| `src/pages/` | Login, Dashboard, lista y formulario de extensiones |
| `src/ui/` | Componentes base: botón, campos, switch, íconos |
| `src/theme/` | Preferencia de tema claro / oscuro / sistema |
| `src/realtime/` | Conexión al hub de eventos: invalida queries cuando el servidor avisa cambios, e indicador de conexión |
| `src/*` (carga diferida) | Layout y páginas se cargan con `lazy()`: el login no descarga SignalR |

Reglas de UI en [CLAUDE.md](CLAUDE.md).

## Requisitos

- Node.js 20.19+ o 22.12+ (lo que exige Vite 8)

## Comandos

```bash
npm install
npm run dev       # servidor de desarrollo en http://localhost:5173
npm run build     # chequeo de tipos + build de producción en dist/
npm run preview   # sirve el build localmente
npm run lint      # oxlint
```

## Docker

Desde la raíz del repo (requiere `.env`, ver `.env.example`) levanta Postgres, la API y el panel. nginx sirve la app en http://localhost:8080 y redirige `/api` a la API:

```bash
docker compose up -d --build
docker compose down
```

## Backend

En `npm run dev`, Vite redirige `/api` y `/hubs` a la API (`API_PROXY_TARGET`), así que la API debe estar corriendo (ver [backend/README.md](../backend/README.md)). El login usa el admin inicial de `Auth:BootstrapAdmin`.

## Configuración

Copiar [.env.example](.env.example) a `.env` (fuera de git):

| Variable | Uso |
|----------|-----|
| `API_PROXY_TARGET` | Adónde redirige `npm run dev` las rutas `/api` y `/hubs` (por defecto `http://localhost:5238`) |

Solo las variables con prefijo `VITE_` llegan al navegador, así que ahí nunca van secretos. En Docker no hace falta `.env`: nginx hace el proxy ([nginx.conf](nginx.conf)).
