import type { BusinessHours, DayOfWeek } from '@/services/api'

export const week: { day: DayOfWeek; label: string }[] = [
  { day: 'Monday', label: 'Lunes' },
  { day: 'Tuesday', label: 'Martes' },
  { day: 'Wednesday', label: 'Miércoles' },
  { day: 'Thursday', label: 'Jueves' },
  { day: 'Friday', label: 'Viernes' },
  { day: 'Saturday', label: 'Sábado' },
  { day: 'Sunday', label: 'Domingo' },
]

/** Horario por defecto al activar: lunes a viernes de 8 a 17 con almuerzo de 12 a 13. */
export const defaultBusinessHours = (): BusinessHours => ({
  enabled: false,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Costa_Rica',
  days: week.slice(0, 5).map(({ day }) => ({ day, opens: '08:00:00', closes: '17:00:00', breakStarts: '12:00:00', breakEnds: '13:00:00' })),
  closedMessage: 'En este momento estamos fuera del horario de atención. Atendemos de lunes a viernes de 8 de la mañana a 5 de la tarde.',
  breakMessage: null,
})
