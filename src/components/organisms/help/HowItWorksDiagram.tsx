import type { ReactNode } from 'react'

function Node({ title, detail, accent = false }: { title: string; detail: string; accent?: boolean }) {
  return (
    <div
      className={`border p-4 text-center ${
        accent ? 'border-brand-500 bg-brand-50 dark:border-brand-500/60 dark:bg-brand-500/10' : 'border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950'
      }`}
    >
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{detail}</p>
    </div>
  )
}

function Arrow({ label, vertical = false }: { label: string; vertical?: boolean }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 ${vertical ? 'flex-col py-2' : 'lg:flex-col'}`}>
      <span className={vertical ? 'h-6 w-px bg-brand-400' : 'h-6 w-px bg-brand-400 lg:h-px lg:w-10'} />
      <span className="text-center">{label}</span>
      <span className={vertical ? 'h-6 w-px bg-brand-400' : 'h-6 w-px bg-brand-400 lg:h-px lg:w-10'} />
    </div>
  )
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">{n}</span>
      <span className="text-sm text-zinc-600 dark:text-zinc-300">{children}</span>
    </li>
  )
}

/** Cómo viaja una llamada: central → Wan → proveedor de voz → IA, y las herramientas del bot. */
export function HowItWorksDiagram() {
  return (
    <figure className="space-y-8">
      <div className="grid items-center gap-2 lg:grid-cols-[1fr_auto_1.2fr_auto_1fr_auto_1fr]">
        <Node title="☎️ Central o proveedor SIP" detail="Asterisk, FreePBX, 3CX, troncal en la nube" />
        <Arrow label="SIP + audio" />
        <Node title="🦝 Wan" detail="Motor SIP, puente de audio, contexto y herramientas del bot" accent />
        <Arrow label="Audio en vivo" />
        <Node title="🗣️ Proveedor de voz" detail="ElevenLabs, OpenAI Realtime o Deepgram" />
        <Arrow label="¿Qué respondo?" />
        <Node title="🧠 Modelo de IA" detail="OpenAI, Gemini o Claude" />
      </div>

      <div className="mx-auto max-w-3xl">
        <Arrow label="El bot usa" vertical />
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {['📚 Conocimiento', '📒 Directorio y transferencias', '📋 Formularios', '✉️ Recados', '🔌 APIs y MCP', '🕘 Horario'].map((t) => (
            <div key={t} className="border border-dashed border-zinc-300 p-3 text-center text-xs dark:border-white/15">
              {t}
            </div>
          ))}
        </div>
      </div>

      <figcaption>
        <ol className="grid gap-3 md:grid-cols-2">
          <Step n={1}>Alguien llama a una extensión que Wan tiene registrada en la central, igual que un softphone.</Step>
          <Step n={2}>Wan contesta y pasa el audio al proveedor de voz, que escucha y habla con voz natural.</Step>
          <Step n={3}>En cada turno, Wan arma el contexto (instrucciones, directorio, horario, conocimiento) y consulta al modelo de IA.</Step>
          <Step n={4}>Si hace falta, el bot usa herramientas: busca en el conocimiento, consulta tu sistema, toma un recado, llena un formulario o transfiere.</Step>
          <Step n={5}>Todo queda en el panel en vivo: la transcripción, el historial, la grabación, los recados y las respuestas.</Step>
          <Step n={6}>En cualquier momento alguien del panel puede tomar la llamada y hablar desde el navegador.</Step>
        </ol>
      </figcaption>
    </figure>
  )
}
