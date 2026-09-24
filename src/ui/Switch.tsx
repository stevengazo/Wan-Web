import { motion } from 'motion/react'

interface Props {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Switch({ label, description, checked, onChange }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 w-full items-center justify-between gap-4 text-left"
    >
      <span>
        <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        {description && <span className="block text-sm text-slate-500 dark:text-slate-400">{description}</span>}
      </span>
      <span
        className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${
          checked ? 'justify-end bg-indigo-600 dark:bg-indigo-500' : 'justify-start bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 35 }} className="size-5 rounded-full bg-white shadow" />
      </span>
    </button>
  )
}
