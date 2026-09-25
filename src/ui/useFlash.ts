import { useState } from 'react'

/** Muestra <Saved> durante dos segundos. */
export function useFlash() {
  const [visible, setVisible] = useState(false)
  const flash = () => {
    setVisible(true)
    window.setTimeout(() => setVisible(false), 2000)
  }
  return [visible, flash] as const
}
