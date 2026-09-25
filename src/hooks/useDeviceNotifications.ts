import { useCallback, useSyncExternalStore } from 'react'

export type NotificationPermissionState = NotificationPermission | 'unsupported'

const supported = typeof window !== 'undefined' && 'Notification' in window
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getPermission = (): NotificationPermissionState => (supported ? Notification.permission : 'unsupported')

/**
 * Notificaciones del sistema operativo mientras el panel está abierto (aunque la pestaña esté en segundo
 * plano). El navegador solo deja pedir el permiso tras un clic, por eso hay un botón y no se pide solo.
 */
export function useDeviceNotifications() {
  const permission = useSyncExternalStore(subscribe, getPermission)

  const request = useCallback(async () => {
    if (!supported) return
    await Notification.requestPermission()
    listeners.forEach((listener) => listener())
  }, [])

  /** Muestra el aviso; al tocarlo enfoca el panel y llama a onClick (por ejemplo, navegar). */
  const notify = useCallback((title: string, options: { body?: string; tag?: string; onClick?: () => void; requireInteraction?: boolean }) => {
    if (getPermission() !== 'granted') return
    const notification = new Notification(title, {
      body: options.body,
      tag: options.tag,
      icon: '/favicon.svg',
      requireInteraction: options.requireInteraction,
    })
    notification.onclick = () => {
      window.focus()
      options.onClick?.()
      notification.close()
    }
  }, [])

  return { permission, request, notify }
}
