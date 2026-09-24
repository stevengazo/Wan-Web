import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { Suspense, type ReactNode } from 'react'
import { NavLink, useLocation, useOutlet } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { RealtimeIndicator } from '../realtime/RealtimeIndicator'
import { useRealtime } from '../realtime/useRealtime'
import { ThemeToggle } from '../theme/ThemeToggle'
import { HomeIcon, LogOutIcon, PhoneIcon } from '../ui/icons'

const nav: { to: string; label: string; icon: ReactNode; end?: boolean }[] = [
  { to: '/', label: 'Inicio', icon: <HomeIcon />, end: true },
  { to: '/extensiones', label: 'Extensiones', icon: <PhoneIcon /> },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const location = useLocation()
  // useOutlet y no <Outlet />: el elemento queda fijo en la página que sale y la animación de salida
  // no muestra el contenido nuevo.
  const outlet = useOutlet()
  const realtime = useRealtime()

  const handleLogout = () => {
    logout()
    // Que el próximo usuario no vea datos cacheados del anterior.
    queryClient.clear()
  }

  // Animar solo al cambiar de sección, no entre lista y formulario de la misma sección.
  const section = location.pathname.split('/')[1] ?? ''

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar solo en pantallas medianas en adelante. */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-slate-200 p-4 md:flex dark:border-slate-800">
        <div className="flex flex-col px-3 py-2">
          <span className="text-lg font-semibold tracking-tight">Mapache</span>
          <RealtimeIndicator status={realtime} />
        </div>
        <nav className="mt-4 flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <ThemeToggle />
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="truncate text-sm text-slate-600 dark:text-slate-400">{user?.email}</span>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              className="flex size-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <LogOutIcon />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-950/80">
          <div className="flex flex-col">
            <span className="text-lg font-semibold leading-tight tracking-tight">Mapache</span>
            <RealtimeIndicator status={realtime} />
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              className="flex size-11 items-center justify-center rounded-full text-slate-500 dark:text-slate-400"
            >
              <LogOutIcon />
            </button>
          </div>
        </header>

        {/* pb extra en móvil para que la barra inferior no tape el contenido. */}
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-10 md:pt-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Suspense fallback={null}>{outlet}</Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Barra de navegación inferior en móvil, al alcance del pulgar. */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-slate-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-950/90">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-xs font-medium ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-indicator"
                    className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                  />
                )}
                {item.icon}
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
