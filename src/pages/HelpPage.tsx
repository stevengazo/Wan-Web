import { useMemo, useState, type ComponentType } from 'react'
import { SearchIcon } from '@/components/atoms/icons'
import { HowItWorksDiagram } from '@/components/organisms/help/HowItWorksDiagram'
import * as Topics from '@/components/organisms/help/HelpTopics'
import { PageHeader } from '@/components/organisms/PageHeader'

interface HelpTopic {
  id: string
  title: string
  /** Palabras con las que se encuentra el tema en el buscador. */
  keywords: string
  Body: ComponentType
}

const topics: HelpTopic[] = [
  { id: 'primeros-pasos', title: 'Primeros pasos', keywords: 'empezar configurar inicio instalar', Body: Topics.FirstStepsTopic },
  { id: 'extensiones', title: 'Extensiones', keywords: 'sip cuenta central registro nat horario pbx', Body: Topics.ExtensionsTopic },
  { id: 'voz', title: 'Proveedores de voz', keywords: 'elevenlabs openai deepgram voz agente custom llm', Body: Topics.VoiceTopic },
  { id: 'telefono', title: 'Teléfono', keywords: 'llamar marcar softphone micrófono', Body: Topics.PhoneTopic },
  { id: 'en-vivo', title: 'Llamadas en vivo y notificaciones', keywords: 'entrante tomar modal transcripción notificaciones', Body: Topics.LiveCallsTopic },
  { id: 'directorio', title: 'Directorio y transferencias', keywords: 'transferir desvío extensión área', Body: Topics.DirectoryTopic },
  { id: 'conocimiento', title: 'Conocimiento', keywords: 'documentos pdf preguntas frecuentes base', Body: Topics.KnowledgeTopic },
  { id: 'recados', title: 'Recados', keywords: 'mensajes whatsapp compartir enlace', Body: Topics.MessagesTopic },
  { id: 'formularios', title: 'Formularios y acciones', keywords: 'datos crm erp webhook teams slack correo api', Body: Topics.FormsTopic },
  { id: 'herramientas', title: 'Herramientas', keywords: 'http api mcp consultar sistemas', Body: Topics.ToolsTopic },
  { id: 'campanas', title: 'Campañas', keywords: 'salientes llamar lista csv contactos', Body: Topics.CampaignsTopic },
  { id: 'grabaciones', title: 'Grabaciones', keywords: 'grabar audio s3 azure almacenamiento', Body: Topics.RecordingsTopic },
  { id: 'analitica', title: 'Analítica', keywords: 'estadísticas reportes métricas', Body: Topics.AnalyticsTopic },
  { id: 'usuarios', title: 'Usuarios y roles', keywords: 'administrador operador permisos', Body: Topics.UsersTopic },
  { id: 'mcp', title: 'Conectar agentes de IA (MCP)', keywords: 'claude cursor token mcp', Body: Topics.McpTopic },
  { id: 'problemas', title: 'Solución de problemas', keywords: 'error no funciona falla ayuda', Body: Topics.TroubleshootingTopic },
  { id: 'glosario', title: 'Glosario', keywords: 'qué significa términos', Body: Topics.GlossaryTopic },
]

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/** Ayuda del sistema: cómo funciona, primeros pasos, cada módulo y solución de problemas. */
export function HelpPage() {
  const [query, setQuery] = useState('')
  const visible = useMemo(() => {
    const q = normalize(query.trim())
    return q ? topics.filter((t) => normalize(`${t.title} ${t.keywords}`).includes(q)) : topics
  }, [query])

  return (
    <div>
      <PageHeader title="Ayuda" subtitle="Cómo funciona Mapache y cómo sacarle provecho." />

      <section className="mt-8 border border-zinc-200 p-5 sm:p-8 dark:border-white/10">
        <h2 className="eyebrow mb-6 flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
          <span className="h-px w-5 bg-brand-500" />
          Cómo funciona
        </h2>
        <HowItWorksDiagram />
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <label className="relative block">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
              <SearchIcon className="size-4" />
            </span>
            <input
              type="search"
              aria-label="Buscar en la ayuda"
              placeholder="Buscar…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-10 w-full border border-zinc-300 bg-white pl-9 pr-3 text-sm dark:border-white/15 dark:bg-zinc-900"
            />
          </label>
          <nav aria-label="Temas" className="mt-4 hidden lg:block">
            <ul className="space-y-1 text-sm">
              {visible.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="block py-1 text-zinc-500 hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-400">
                    {t.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="space-y-12">
          {visible.length === 0 && <p className="text-zinc-500">Nada coincide con «{query}».</p>}
          {visible.map(({ id, title, Body }) => (
            <section key={id} id={id} className="scroll-mt-8">
              <h2 className="font-display text-3xl">{title}</h2>
              <div className="mt-4 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
                <Body />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
