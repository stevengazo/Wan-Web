const dateTime = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' })
const relative = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

/** "hace 5 minutos" para lo reciente; fecha y hora para lo de más de un día. */
export function formatWhen(iso: string) {
  const date = new Date(iso)
  const minutes = Math.round((date.getTime() - Date.now()) / 60_000)
  if (Math.abs(minutes) < 1) return 'ahora'
  if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute')
  if (Math.abs(minutes) < 60 * 24) return relative.format(Math.round(minutes / 60), 'hour')
  return dateTime.format(date)
}

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso))

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** Duración de una llamada: "2m 05s". */
export function formatDuration(seconds: number) {
  const s = Math.max(0, Math.round(seconds))
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`
}
