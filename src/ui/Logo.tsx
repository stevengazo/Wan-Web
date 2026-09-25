/** Marca de Mapache: onda de voz dentro de un cuadrado redondeado. */
export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`flex size-9 items-center justify-center rounded-xl ${
          inverted
            ? 'bg-white/15 text-white ring-1 ring-white/25'
            : 'bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30'
        }`}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
          <path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2" />
        </svg>
      </span>
      <span className={`text-lg font-semibold tracking-tight ${inverted ? 'text-white' : ''}`}>Mapache</span>
    </span>
  )
}
