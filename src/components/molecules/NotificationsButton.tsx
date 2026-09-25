import { BellIcon, BellOffIcon } from '@/components/atoms/icons'
import { Button } from '@/components/atoms/Button'
import { useDeviceNotifications } from '@/hooks/useDeviceNotifications'

/** Pide permiso para avisar en el dispositivo (llamadas, recados, formularios) o muestra si ya está activo. */
export function NotificationsButton() {
  const { permission, request } = useDeviceNotifications()

  if (permission === 'unsupported') return null
  if (permission === 'default') {
    return (
      <Button onClick={() => void request()}>
        <BellIcon className="size-4" />
        Habilitar notificaciones
      </Button>
    )
  }

  const granted = permission === 'granted'
  return (
    <p
      className="flex min-h-11 items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400"
      title={granted ? undefined : 'Se desbloquean desde la configuración del sitio en el navegador (ícono del candado).'}
    >
      {granted ? <BellIcon className="size-4 text-emerald-500" /> : <BellOffIcon className="size-4 text-red-500" />}
      {granted ? 'Notificaciones activas' : 'Notificaciones bloqueadas'}
    </p>
  )
}
