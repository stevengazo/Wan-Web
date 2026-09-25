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

/** Pantallas de acceso: formulario a pantalla completa en móvil; panel de marca a la izquierda desde lg:. */
export function AuthLayout({ title, subtitle, footer, children }: Props) {
  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[1.05fr_1fr] dark:bg-slate-950">
      <BrandPanel />

      <div className="relative isolate flex flex-col overflow-hidden px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-8">
        {/* Halo suave detrás del formulario para que no quede plano. */}
        <div
          className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgb(99_102_241/0.12),transparent)] dark:bg-[radial-gradient(60%_100%_at_50%_0%,rgb(99_102_241/0.18),transparent)]"
          aria-hidden="true"
        />

        <div className="flex items-center justify-between lg:justify-end">
          <span className="lg:hidden">
            <Logo />
          </span>
          <ThemeToggle />
        </div>

        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12"
        >
          <h1 className="font-display text-5xl leading-none tracking-tight text-slate-900 dark:text-white">{title}</h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400">{subtitle}</p>
          <div className="mt-10">{children}</div>
          <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</p>
        </motion.main>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600">© {new Date().getFullYear()} Mapache</p>
      </div>
    </div>
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
      className="rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20"
    >
      {message}
    </motion.p>
  )
}

/** Botón principal de los formularios de acceso, con degradado y flecha que avanza al pasar el cursor. */
export function SubmitButton({ loading, disabled, children }: { loading: boolean; disabled: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="group relative flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-linear-to-b from-indigo-500 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 ring-1 ring-inset ring-white/15 transition hover:from-indigo-400 hover:to-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
    >
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      ) : null}
      {children}
      {!loading && (
        <svg viewBox="0 0 24 24" className="size-4 transition-transform group-enabled:group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )}
    </button>
  )
}

const features = ['Cualquier servidor SIP', 'OpenAI · Gemini · Claude', 'Voz de ElevenLabs']

/** Siempre oscuro, en los dos temas: es la cara de la marca. */
function BrandPanel() {
  return (
    <aside className="relative isolate hidden overflow-hidden border-r border-white/5 bg-slate-950 p-12 text-white lg:flex lg:flex-col xl:p-16">
      <div className="absolute -left-40 -top-40 -z-10 size-[36rem] rounded-full bg-indigo-600/40 blur-[120px]" aria-hidden="true" />
      <div className="absolute -bottom-48 right-0 -z-10 size-[32rem] rounded-full bg-violet-600/35 blur-[120px]" aria-hidden="true" />
      <div className="absolute right-1/4 top-1/3 -z-10 size-72 rounded-full bg-fuchsia-500/15 blur-[100px]" aria-hidden="true" />
      {/* Rejilla que se desvanece hacia los bordes. */}
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.04)_1px,transparent_1px)] bg-size-[48px_48px] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        aria-hidden="true"
      />

      <Logo inverted />

      <div className="my-auto max-w-xl py-12">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-indigo-200 ring-1 ring-white/10">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Bot telefónico con IA
        </p>
        <h2 className="mt-6 text-[2.75rem] font-semibold leading-[1.08] tracking-tight xl:text-[3.25rem]">
          Tu central telefónica, atendida por{' '}
          <span className="bg-linear-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text pr-1 font-display text-[1.08em] font-normal whitespace-nowrap italic text-transparent">
            inteligencia artificial.
          </span>
        </h2>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-400">
          Registra tus cuentas SIP y deja que el bot conteste, resuelva y transfiera cada llamada.
        </p>

        <CallPreview />
      </div>

      <ul className="flex flex-wrap gap-2 text-xs text-slate-300">
        {features.map((feature) => (
          <li key={feature} className="rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
            {feature}
          </li>
        ))}
      </ul>
    </aside>
  )
}

// Alturas fijas para que la onda se vea igual en cada render.
const bars = [0.3, 0.5, 0.8, 0.45, 0.7, 1, 0.6, 0.85, 0.4, 0.65, 0.9, 0.5, 0.75, 0.35, 0.8, 0.55, 0.95, 0.45, 0.7, 0.3, 0.6, 0.85, 0.4, 0.25]

/** Tarjeta ilustrativa de una llamada en curso. */
function CallPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
      className="mt-12 rounded-3xl bg-white/[0.04] p-6 shadow-2xl shadow-black/40 ring-1 ring-white/10 backdrop-blur-xl"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-linear-to-br from-indigo-400 to-violet-500 text-sm font-semibold">
          R
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Recepción</p>
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
            </span>
            En llamada · <span className="tabular-nums">01:24</span>
          </p>
        </div>
        <div className="flex h-8 items-center gap-[3px]">
          {bars.map((height, index) => (
            <motion.span
              key={index}
              className="w-[3px] rounded-full bg-linear-to-t from-indigo-400 to-fuchsia-300"
              style={{ height: `${height * 100}%` }}
              animate={{ scaleY: [1, 0.3, 1] }}
              transition={{ duration: 1 + (index % 5) * 0.18, repeat: Infinity, ease: 'easeInOut', delay: index * 0.04 }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm">
        <p className="w-fit max-w-[85%] rounded-2xl rounded-tl-md bg-white/[0.06] px-4 py-2.5 text-slate-200">
          Hola, necesito hablar con ventas.
        </p>
        <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-md bg-indigo-500/90 px-4 py-2.5 text-white">
          Claro, te comunico ahora mismo con el equipo de ventas.
        </p>
      </div>
    </motion.div>
  )
}
