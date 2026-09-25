import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { Suspense, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useOutlet } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { RealtimeIndicator } from '../realtime/RealtimeIndicator'
import { useRealtime } from '../realtime/useRealtime'
import { HomeIcon, LogOutIcon, PanelLeftIcon, PhoneIcon, SettingsIcon } from '../ui/icons'
import { Avatar } from '../ui/Avatar'
import { Logo } from '../ui/Logo'
import { useSidebarCollapsed } from './useSidebarCollapsed'

const allNav: { to: string; label: string; icon: ReactNode; end?: boolean; admin?: boolean }[] = [
  { to: '/', label: 'Inicio', icon: <HomeIcon />, end: true },
  { to: '/extensiones', label: 'Extensiones', icon: <PhoneIcon /> },
  { to: '/configuracion', label: 'Configuración', icon: <SettingsIcon />, admin: true },
]

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth()
  const nav = allNav.filter((item) => !item.admin || isAdmin)
  const queryClient = useQueryClient()
  const location = useLocation()
  // useOutlet y no <Outlet />: el elemento queda fijo en la página que sale y la animación de salida
  // no muestra el contenido nuevo.
  const outlet = useOutlet()
  const realtime = useRealtime()
  const { collapsed, toggle } = useSidebarCollapsed()

  const handleLogout = () => {
    logout()
    // Que el próximo usuario no vea datos cacheados del anterior.
    queryClient.clear()
  }

  // Animar solo al cambiar de sección, no entre lista y formulario de la misma sección.
  const section = location.pathname.split('/')[1] ?? ''

  return (
    <div className="flex min-h-dvh bg-white dark:bg-slate-950">
      {/* Sidebar desde md:. El ancho se anima con CSS: es un solo elemento y el contenido solo se reacomoda. */}
      <aside
        className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-slate-200 bg-slate-50/60 transition-[width] duration-200 ease-out md:flex dark:border-white/10 dark:bg-white/2 ${
          collapsed ? 'w-18' : 'w-64'
        }`}
      >
        <div className={`flex h-16 items-center ${collapsed ? 'justify-center' : 'justify-between px-4'}`}>
          {!collapsed && (
            <Link to="/" className="rounded-lg">
              <Logo />
            </Link>
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            aria-expanded={!collapsed}
            title={`${collapsed ? 'Expandir' : 'Colapsar'} (Ctrl+B)`}
            className="flex size-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <PanelLeftIcon />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 pt-2">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              aria-label={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `group relative flex min-h-11 items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
                  collapsed ? 'justify-center' : 'px-3'
                } ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:shadow-none dark:ring-white/10'
                    : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
                }`
              }
            >
              {item.icon}
              {collapsed ? <Tooltip>{item.label}</Tooltip> : item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-white/10">
          <div className={`mb-2 ${collapsed ? 'flex justify-center' : 'px-3'}`}>
            <RealtimeIndicator status={realtime} compact={collapsed} />
          </div>
          <div className={`flex items-center gap-1 ${collapsed ? 'flex-col' : ''}`}>
            <NavLink
              to="/perfil"
              aria-label={collapsed ? 'Mi perfil' : undefined}
              title={collapsed ? 'Mi perfil' : undefined}
              className={({ isActive }) =>
                `flex min-w-0 items-center gap-3 rounded-lg p-1.5 transition-colors ${collapsed ? '' : 'flex-1'} ${
                  isActive ? 'bg-slate-200/60 dark:bg-white/10' : 'hover:bg-slate-200/50 dark:hover:bg-white/5'
                }`
              }
            >
              <Avatar name={user?.displayName ?? ''} />
              {!collapsed && (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{user?.displayName}</span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</span>
                </span>
              )}
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <LogOutIcon />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur md:hidden dark:border-white/10 dark:bg-slate-950/80">
          <Logo />
          <div className="flex items-center gap-2">
            <RealtimeIndicator status={realtime} />
            <Link to="/perfil" aria-label="Mi perfil" className="flex size-11 items-center justify-center rounded-full">
              <Avatar name={user?.displayName ?? ''} />
            </Link>
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
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 md:px-10 md:pb-12 md:pt-12">
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
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-slate-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-white/10 dark:bg-slate-950/90">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-xs font-medium ${
                isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-indicator"
                    className="absolute inset-x-8 top-0 h-0.5 rounded-full bg-slate-900 dark:bg-white"
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

/** Etiqueta que aparece a la derecha del ícono cuando el sidebar está colapsado. */
function Tooltip({ children }: { children: ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-full z-20 ml-3 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-white dark:text-slate-900">
      {children}
    </span>
  )
}
