import { createContext, useContext } from 'react'
import type { WebPhone } from '@/hooks/useWebPhone'

/** Teléfono compartido: una sola llamada para todo el panel (la página Teléfono y la barra del sidebar). */
export const PhoneContext = createContext<WebPhone | null>(null)

export function usePhone() {
  const phone = useContext(PhoneContext)
  if (!phone) throw new Error('usePhone requiere <PhoneProvider>')
  return phone
}
