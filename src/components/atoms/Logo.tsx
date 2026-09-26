import { WaveIcon } from './icons'

/** Marca de Wan: onda de voz en un cuadrado y el nombre en serif, como la marca de Savegre. */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white dark:bg-brand-600 dark:text-white">
        <WaveIcon className="size-4.5" strokeWidth={2.2} />
      </span>
      <span className="font-display text-2xl leading-none">
        Wan<span className="text-brand-500">.</span>
      </span>
    </span>
  )
}
