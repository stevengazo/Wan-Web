import { motion } from 'motion/react'
import { useEffect, useId, useState, type ReactNode } from 'react'
import { MonitorIcon, MoonIcon, SunIcon } from '@/components/atoms/icons'
import {
  getThemePreference,
  setThemePreference,
  subscribeToSystemTheme,
  type ThemePreference,
} from '@/lib/theme'

const options: { value: ThemePreference; label: string; icon: ReactNode }[] = [
  { value: 'light', label: 'Claro', icon: <SunIcon /> },
  { value: 'system', label: 'Sistema', icon: <MonitorIcon /> },
  { value: 'dark', label: 'Oscuro', icon: <MoonIcon /> },
]

export function ThemeToggle() {
  const [preference, setPreference] = useState(getThemePreference)
  // layoutId único por instancia: el layout monta dos (sidebar y header) y Motion animaría entre ellas.
  const indicatorId = useId()

  useEffect(() => subscribeToSystemTheme(() => setPreference(getThemePreference())), [])

  const select = (value: ThemePreference) => {
    setThemePreference(value)
    setPreference(value)
  }

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="inline-flex rounded-full bg-zinc-100 p-1 dark:bg-zinc-800"
    >
      {options.map((option) => {
        const active = option.value === preference
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            onClick={() => select(option.value)}
            className="relative flex size-11 items-center justify-center rounded-full text-zinc-500 transition-colors aria-checked:text-zinc-900 dark:text-zinc-400 dark:aria-checked:text-white"
          >
            {active && (
              <motion.span
                layoutId={indicatorId}
                className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-zinc-700"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative">
              {option.icon}
            </span>
          </button>
        )
      })}
    </div>
  )
}
