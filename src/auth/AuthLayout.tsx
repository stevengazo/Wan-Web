import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { ThemeToggle } from '../theme/ThemeToggle'
import { CheckIcon } from '../ui/icons'
import { Logo } from '../ui/Logo'

interface Props {
  title: string
  subtitle: string
  footer: ReactNode
  children: ReactNode
}

/** Pantallas de acceso: formulario a pantalla completa en móvil; panel de marca a la izquierda desde md:. */
export function AuthLayout({ title, subtitle, footer, children }: Props) {
  return (
    <div className="grid min-h-dvh md:grid-cols-2 lg:grid-cols-[1.1fr_1fr]">
      <BrandPanel />

      <div className="flex flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-8">
        <div className="flex items-center justify-between md:justify-end">
          <span className="md:hidden">
            <Logo />
          </span>
          <ThemeToggle />
        </div>

        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10"
        >
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">{footer}</p>
        </motion.main>
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
      className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20"
    >
      {message}
    </motion.p>
  )
}

const features = ['Cualquier servidor SIP, como MicroSIP', 'OpenAI, Gemini o Claude por cuenta', 'Voz natural con ElevenLabs']

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-800 p-10 text-white md:flex md:flex-col lg:p-14 dark:from-indigo-950 dark:via-slate-900 dark:to-violet-950">
      {/* Fondo: rejilla de puntos y dos halos difuminados. */}
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.35) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
        aria-hidden="true"
      />
      <div className="absolute -left-24 -top-24 size-96 rounded-full bg-violet-400/30 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-32 -right-16 size-112 rounded-full bg-indigo-400/25 blur-3xl" aria-hidden="true" />

      <div className="relative">
        <Logo inverted />
      </div>

      <div className="relative my-auto max-w-md py-12">
        <h2 className="text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
          Tu central telefónica, atendida por inteligencia artificial.
        </h2>
        <p className="mt-4 text-lg text-indigo-100/80">
          Registra tus cuentas SIP y deja que el bot conteste, resuelva y transfiera.
        </p>

        <CallPreview />
      </div>

      <ul className="relative space-y-2.5 text-sm text-indigo-100/90">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5">
            <span className="flex size-5 items-center justify-center rounded-full bg-white/15 [&_svg]:size-3.5">
              <CheckIcon />
            </span>
            {feature}
          </li>
        ))}
      </ul>
    </aside>
  )
}

// Alturas fijas para que la onda se vea igual en cada render.
const bars = [0.35, 0.6, 0.9, 0.5, 0.75, 1, 0.55, 0.8, 0.4, 0.65, 0.95, 0.5, 0.7, 0.45, 0.85, 0.6, 0.3, 0.55]

/** Tarjeta ilustrativa de una llamada en curso. */
function CallPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
      className="mt-10 rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur-md"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
          </span>
          Llamada en curso · Recepción
        </span>
        <span className="tabular-nums text-indigo-100/70">01:24</span>
      </div>

      <div className="mt-4 flex h-10 items-center gap-1">
        {bars.map((height, index) => (
          <motion.span
            key={index}
            className="w-1.5 origin-center rounded-full bg-white/80"
            style={{ height: `${height * 100}%` }}
            animate={{ scaleY: [1, 0.35, 1] }}
            transition={{ duration: 1.1 + (index % 4) * 0.2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.05 }}
          />
        ))}
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <p className="text-indigo-100/70">
          <span className="font-medium text-white">Cliente:</span> Necesito hablar con ventas.
        </p>
        <p className="text-indigo-100/70">
          <span className="font-medium text-white">Mapache:</span> Claro, te comunico ahora mismo.
        </p>
      </div>
    </motion.div>
  )
}
