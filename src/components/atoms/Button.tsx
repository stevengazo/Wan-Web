import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger'

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-500 disabled:bg-zinc-200 disabled:text-zinc-400 dark:bg-brand-600 dark:hover:bg-brand-500 dark:disabled:bg-white/10 dark:disabled:text-zinc-500',
  secondary:
    'disabled:opacity-60 border border-zinc-300 text-zinc-900 hover:border-zinc-900 dark:border-white/15 dark:text-zinc-100 dark:hover:border-white/40',
  danger: 'disabled:opacity-60 bg-red-600 text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
}

export function Button({ variant = 'primary', loading = false, disabled, className = '', children, ...props }: Props) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex min-h-11 items-center justify-center gap-2 px-5 text-xs font-semibold uppercase tracking-[0.2em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      )}
      {children}
    </button>
  )
}
