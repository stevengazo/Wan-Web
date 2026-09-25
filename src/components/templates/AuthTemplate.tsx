import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { ThemeToggle } from '@/components/molecules/ThemeToggle'
import { Logo } from '@/components/atoms/Logo'

interface Props {
  title: string
  subtitle: string
  footer: ReactNode
  children: ReactNode
}

/** Pantallas de acceso: el formulario vive en una barra lateral; en móvil ocupa toda la pantalla. */
export function AuthTemplate({ title, subtitle, footer, children }: Props) {
  return (
    <div className="min-h-dvh bg-zinc-100 lg:grid lg:grid-cols-[460px_1fr] dark:bg-black">
      <aside className="flex min-h-dvh flex-col bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-12 lg:border-r lg:border-zinc-200 dark:bg-zinc-950 lg:dark:border-white/10">
        <Logo />

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12 lg:max-w-none"
        >
          <h1 className="font-display text-[2.75rem] leading-none text-zinc-900 dark:text-zinc-50">{title}</h1>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          <div className="mt-10">{children}</div>
          <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">{footer}</p>
        </motion.main>

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">© {new Date().getFullYear()} Mapache</p>
          <ThemeToggle />
        </div>
      </aside>

      <Backdrop />
    </div>
  )
}

/** Lado decorativo: un solo degradado y una frase. */
function Backdrop() {
  return (
    <section className="relative isolate hidden overflow-hidden bg-zinc-950 lg:flex lg:items-end" aria-hidden="true">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_75%_15%,rgb(168_85_247/0.30),transparent_70%),radial-gradient(50%_45%_at_15%_95%,rgb(236_72_153/0.16),transparent_70%)]" />
      <div className="p-16 xl:p-20">
        <p className="eyebrow flex items-center gap-4 text-zinc-400">
          <span className="h-px w-6 bg-brand-400" />
          Bot telefónico con IA
        </p>
        <p className="mt-8 max-w-lg font-display text-6xl leading-[1.05] text-zinc-50 xl:text-7xl">
          Cada llamada, <span className="italic text-zinc-500">atendida.</span>
        </p>
        <p className="mt-6 text-sm tracking-wide text-zinc-400">Cuentas SIP · OpenAI, Gemini o Claude · Voz de ElevenLabs</p>
      </div>
    </section>
  )
}

/** Error general del formulario, con una sacudida corta para que se note. */
export function FormAlert({ message }: { message: string }) {
  return (
    <motion.p
      role="alert"
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: [6, -4, 2, 0] }}
      transition={{ duration: 0.3 }}
      className="border-l-2 border-red-500 py-1 pl-3 text-sm text-red-600 dark:text-red-400"
    >
      {message}
    </motion.p>
  )
}

/** Siempre con su color: los datos faltantes se avisan al enviar, no con un botón apagado. */
export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-wait disabled:opacity-80 dark:bg-brand-600 dark:text-white dark:hover:bg-brand-500 dark:focus-visible:outline-brand-400"
    >
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />}
      {children}
    </button>
  )
}
