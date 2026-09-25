import { PageHeader } from '@/components/organisms/PageHeader'
import { HttpToolsSection } from '@/components/organisms/tools/HttpToolsSection'
import { McpServersSection } from '@/components/organisms/tools/McpServersSection'

export function ToolsPage() {
  return (
    <div>
      <PageHeader
        title="Herramientas"
        subtitle="Lo que el bot puede consultar o hacer durante la llamada. Mapache las ejecuta y le devuelve el resultado al instante."
      />

      <section className="mt-10">
        <h2 className="font-medium">Peticiones a sistemas externos</h2>
        <p className="mt-1 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
          Por ejemplo, consultar un pedido en tu ERP o el saldo de un cliente. El bot completa los parámetros con lo que dice quien llama.
        </p>
        <div className="mt-4">
          <HttpToolsSection />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-medium">Servidores MCP</h2>
        <p className="mt-1 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
          Conecta servidores MCP y elige qué herramientas puede usar el bot.
        </p>
        <div className="mt-4">
          <McpServersSection />
        </div>
      </section>
    </div>
  )
}
