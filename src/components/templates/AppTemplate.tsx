import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { Suspense, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useOutlet } from 'react-router'
import { useMessages } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { RealtimeIndicator } from '@/components/molecules/RealtimeIndicator'
import { useRealtime } from '@/hooks/useRealtime'
import {
  BookIcon,
  ClipboardIcon,
  DatabaseIcon,
  HomeIcon,
  InboxIcon,
  LogOutIcon,
  MicIcon,
  MoreIcon,
  PanelLeftIcon,
  PhoneCallIcon,
  PhoneIcon,
  SettingsIcon,
  UsersIcon,
  WrenchIcon,
} from '@/components/atoms/icons'
import { Avatar } from '@/components/atoms/Avatar'
import { Logo } from '@/components/atoms/Logo'
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed'
import { useWebPhone } from '@/hooks/useWebPhone'
import { PhoneContext } from '@/hooks/usePhone'
import { ActiveCallBar } from '@/components/organisms/phone/ActiveCallBar'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
  end?: boolean
  admin?: boolean
  /** Va en la barra inferior en móvil; el resto queda bajo "Más". */
  primary?: boolean
}

const allNav: NavItem[] = [
  { to: '/', label: 'Inicio', icon: <HomeIcon />, end: true, primary: true },
  { to: '/recados', label: 'Recados', icon: <InboxIcon />, primary: true },
  { to: '/formularios', label: 'Formularios', icon: <ClipboardIcon />, primary: true },
  { to: '/grabaciones', label: 'Grabaciones', icon: <MicIcon /> },
  { to: '/conocimiento', label: 'Conocimiento', icon: <DatabaseIcon /> },
  { to: '/herramientas', label: 'Herramientas', icon: <WrenchIcon />, admin: true },
  { to: '/extensiones', label: 'Extensiones', icon: <PhoneIcon /> },
  { to: '/directorio', label: 'Directorio', icon: <BookIcon /> },
  { to: '/usuarios', label: 'Usuarios', icon: <UsersIcon />, admin: true },
  { to: '/configuracion', label: 'Configuración', icon: <SettingsIcon />, admin: true },
]

export function AppTemplate() {
  const { user, isAdmin, logout } = useAuth()
  const nav = allNav.filter((item) => !item.admin || isAdmin)
  const queryClient = useQueryClient()
  const location = useLocation()
  // useOutlet y no <Outlet />: el elemento queda fijo en la página que sale y la animación de salida
  // no muestra el contenido nuevo.
  const outlet = useOutlet()
  const realtime = useRealtime()
  const { collapsed, toggle } = useSidebarCollapsed()
  const [moreOpen, setMoreOpen] = useState(false)
  // El teléfono vive en la plantilla: la llamada sigue al cambiar de página.
  const phone = useWebPhone()
  const inCall = phone.state !== 'idle' && phone.state !== 'ended'
  const showCallBar = inCall && !location.pathname.startsWith('/telefono')
  const { data: messages } = useMessages()
  const unreadMessages = messages?.filter((m) => m.status === 'New').length ?? 0
  const badgeFor = (item: NavItem) => (item.to === '/recados' ? unreadMessages : 0)
  const secondary = nav.filter((item) => !item.primary)
  const secondaryActive = secondary.some((item) => location.pathname.startsWith(item.to))

  const handleLogout = () => {
    logout()
    // Que el próximo usuario no vea datos cacheados del anterior.
    queryClient.clear()
  }

  // Animar solo al cambiar de sección, no entre lista y formulario de la misma sección.
  const section = location.pathname.split('/')[1] ?? ''

  return (
    <PhoneContext value={phone}>
    <div className="flex min-h-dvh bg-white dark:bg-zinc-950">
      {/* Sidebar desde md:. El ancho se anima con CSS: es un solo elemento y el contenido solo se reacomoda. */}
      <aside
        className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/60 transition-[width] duration-200 ease-out md:flex dark:border-white/10 dark:bg-white/2 ${
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
            className="flex size-10 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <PanelLeftIcon />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pt-2">
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
                    ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:bg-white/10 dark:text-white dark:shadow-none dark:ring-white/10'
                    : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white'
                }`
              }
            >
              <span className="relative">
                {item.icon}
                {collapsed && badgeFor(item) > 0 && <span className="absolute -right-1 -top-1 size-2 rounded-full bg-red-500" />}
              </span>
              {collapsed ? (
                <Tooltip>{item.label}</Tooltip>
              ) : (
                <>
                  <span className="flex-1">{item.label}</span>
                  {badgeFor(item) > 0 && <Badge count={badgeFor(item)} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Llamada en curso anclada abajo, visible desde cualquier página. */}
        {showCallBar && (
          <div className={`border-t border-zinc-200 p-3 dark:border-white/10 ${collapsed ? 'flex justify-center' : ''}`}>
            <ActiveCallBar phone={phone} compact={collapsed} />
          </div>
        )}

        <div className="border-t border-zinc-200 p-3 dark:border-white/10">
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
                  isActive ? 'bg-zinc-200/60 dark:bg-white/10' : 'hover:bg-zinc-200/50 dark:hover:bg-white/5'
                }`
              }
            >
              <Avatar name={user?.displayName ?? ''} />
              {!collapsed && (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{user?.displayName}</span>
                  <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">{user?.email}</span>
                </span>
              )}
            </NavLink>
            <PhoneLink inCall={inCall} size="size-10" />
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="flex size-10 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <LogOutIcon />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/80 px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur md:hidden dark:border-white/10 dark:bg-zinc-950/80">
          <Logo />
          <div className="flex items-center gap-2">
            <RealtimeIndicator status={realtime} />
            <PhoneLink inCall={inCall} size="size-11" />
            <Link to="/perfil" aria-label="Mi perfil" className="flex size-11 items-center justify-center rounded-full">
              <Avatar name={user?.displayName ?? ''} />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              className="flex size-11 items-center justify-center rounded-full text-zinc-500 dark:text-zinc-400"
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
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-zinc-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-white/10 dark:bg-zinc-950/90">
        {nav
          .filter((item) => item.primary)
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-xs font-medium ${
                  isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <BottomIndicator />}
                  <span className="relative">
                    {item.icon}
                    {badgeFor(item) > 0 && <span className="absolute -right-1 -top-1 size-2 rounded-full bg-red-500" />}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          className={`relative flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-xs font-medium ${
            secondaryActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
          }`}
        >
          {secondaryActive && <BottomIndicator />}
          <MoreIcon />
          Más
        </button>
      </nav>

      {showCallBar && (
        <div className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-10 md:hidden">
          <ActiveCallBar phone={phone} compact={false} />
        </div>
      )}

      <AnimatePresence>
        {moreOpen && (
          <motion.div
            className="fixed inset-0 z-30 flex items-end bg-zinc-950/50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMoreOpen(false)}
          >
            <motion.nav
              role="dialog"
              aria-modal="true"
              aria-label="Más secciones"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-t-3xl bg-white p-3 pb-[max(1rem,env(safe-area-inset-bottom))] dark:bg-zinc-900"
            >
              <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-zinc-300 dark:bg-white/20" />
              {secondary.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-12 items-center gap-3 rounded-xl px-4 font-medium ${
                      isActive ? 'bg-zinc-100 dark:bg-white/10' : 'text-zinc-600 dark:text-zinc-300'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </PhoneContext>
  )
}

/** Acceso al teléfono junto al perfil; en violeta y con punto verde mientras hay una llamada. */
function PhoneLink({ inCall, size }: { inCall: boolean; size: string }) {
  return (
    <NavLink
      to="/telefono"
      aria-label={inCall ? 'Teléfono: llamada en curso' : 'Teléfono'}
      title="Teléfono"
      className={({ isActive }) =>
        `relative flex ${size} shrink-0 items-center justify-center transition-colors ${
          inCall
            ? 'bg-brand-600 text-white'
            : isActive
              ? 'bg-zinc-200/60 text-zinc-900 dark:bg-white/10 dark:text-white'
              : 'text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white'
        }`
      }
    >
      <PhoneCallIcon />
      {inCall && <span className="absolute -right-0.5 -top-0.5 size-2 animate-pulse rounded-full bg-emerald-400" />}
    </NavLink>
  )
}

function Badge({ count }: { count: number }) {
  return (
    <span className="min-w-5 rounded-full bg-red-500 px-1.5 text-center text-xs font-medium leading-5 text-white tabular-nums">
      {count > 99 ? '99+' : count}
    </span>
  )
}

function BottomIndicator() {
  return <motion.span layoutId="bottom-nav-indicator" className="absolute inset-x-8 top-0 h-0.5 rounded-full bg-brand-600 dark:bg-brand-600" />
}

/** Etiqueta que aparece a la derecha del ícono cuando el sidebar está colapsado. */
function Tooltip({ children }: { children: ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-full z-20 ml-3 whitespace-nowrap rounded-md bg-brand-600 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-brand-600 dark:text-white">
      {children}
    </span>
  )
}
