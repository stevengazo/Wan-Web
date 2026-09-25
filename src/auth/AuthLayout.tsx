import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { ThemeToggle } from '../theme/ThemeToggle'
import { Logo } from '../ui/Logo'

interface Props {
  title: string
  subtitle: string
  footer: ReactNode
  children: ReactNode
}

/** Pantallas de acceso: el formulario vive en una barra lateral; en móvil ocupa toda la pantalla. */
export function AuthLayout({ title, subtitle, footer, children }: Props) {
  return (
    <div className="min-h-dvh bg-slate-100 lg:grid lg:grid-cols-[460px_1fr] dark:bg-black">
      <aside className="flex min-h-dvh flex-col bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-12 lg:border-r lg:border-slate-200 dark:bg-slate-950 lg:dark:border-white/10">
        <Logo />

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12 lg:max-w-none"
        >
          <h1 className="font-display text-[2.75rem] leading-none text-slate-900 dark:text-slate-50">{title}</h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          <div className="mt-10">{children}</div>
          <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">{footer}</p>
        </motion.main>

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-slate-400 dark:text-slate-500">© {new Date().getFullYear()} Mapache</p>
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
    <section className="relative isolate hidden overflow-hidden bg-slate-950 lg:flex lg:items-end" aria-hidden="true">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_70%_20%,rgb(99_102_241/0.28),transparent_70%)]" />
      <div className="p-16 xl:p-20">
        <p className="max-w-lg font-display text-6xl leading-[1.05] text-slate-100 xl:text-7xl">
          Cada llamada, <span className="italic text-slate-400">atendida.</span>
        </p>
        <p className="mt-6 text-sm tracking-wide text-slate-500">Cuentas SIP · OpenAI, Gemini o Claude · Voz de ElevenLabs</p>
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
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-wait disabled:opacity-80 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:outline-white"
    >
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />}
      {children}
    </button>
  )
}
