import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'wan.sidebar-collapsed'

function read() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/** Sidebar colapsado o no, recordado por navegador. Ctrl/⌘ + B lo alterna. */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(read)

  const toggle = useCallback(() => {
    setCollapsed((current) => {
      const next = !current
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {
        // Sin storage el estado dura hasta recargar.
      }
      return next
    })
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggle])

  return { collapsed, toggle }
}
