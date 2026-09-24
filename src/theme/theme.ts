export type ThemePreference = 'light' | 'dark' | 'system'

// La misma clave la lee el script inline de index.html.
const STORAGE_KEY = 'mapache.theme'
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

export function getThemePreference(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

export function setThemePreference(preference: ThemePreference) {
  try {
    if (preference === 'system') {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, preference)
    }
  } catch {
    // Sin storage (modo privado) el tema igual se aplica en esta sesión.
  }
  applyTheme(preference)
}

export function applyTheme(preference: ThemePreference) {
  const dark = preference === 'dark' || (preference === 'system' && darkQuery.matches)
  document.documentElement.classList.toggle('dark', dark)
}

/** Reaplica el tema cuando cambia el del sistema, solo si el usuario no fijó uno. */
export function subscribeToSystemTheme(onChange: () => void) {
  const listener = () => {
    if (getThemePreference() === 'system') {
      applyTheme('system')
      onChange()
    }
  }
  darkQuery.addEventListener('change', listener)
  return () => darkQuery.removeEventListener('change', listener)
}
