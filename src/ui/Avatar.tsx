/** Iniciales del usuario en un círculo monocromo. */
export function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-slate-900 font-medium text-white dark:bg-white dark:text-slate-900 ${
        size === 'lg' ? 'size-14 text-lg' : 'size-9 text-xs'
      }`}
    >
      {initials || '?'}
    </span>
  )
}
