import type { UserRole } from '@/services/api'

/** Nombre y alcance de cada rol, para el panel. */
export const roleLabels: Record<UserRole, { label: string; description: string }> = {
  Admin: { label: 'Administrador', description: 'Configura todo: extensiones, IA, herramientas, usuarios.' },
  Operator: { label: 'Operador', description: 'Ve el panel y atiende recados, respuestas y grabaciones.' },
}
