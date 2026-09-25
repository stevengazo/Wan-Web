import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { CopyField } from '@/components/molecules/CopyField'
import { usePublicUrl } from '@/services/api'

function Steps({ children }: { children: ReactNode }) {
  return <ol className="list-decimal space-y-2 pl-5 marker:font-semibold marker:text-brand-600">{children}</ol>
}

function Tip({ children }: { children: ReactNode }) {
  return <p className="border-l-2 border-brand-500 bg-brand-50/60 py-2 pl-4 pr-3 text-sm dark:bg-brand-500/10">{children}</p>
}

function Go({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="font-medium text-brand-600 underline underline-offset-4 hover:text-brand-500 dark:text-brand-400">
      {children}
    </Link>
  )
}

function Table({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-zinc-100 border border-zinc-200 dark:divide-white/5 dark:border-white/10">
      {rows.map(([term, detail]) => (
        <div key={term} className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
          <dt className="text-sm font-medium">{term}</dt>
          <dd className="text-sm text-zinc-600 dark:text-zinc-300">{detail}</dd>
        </div>
      ))}
    </dl>
  )
}

export function FirstStepsTopic() {
  return (
    <>
      <p>Para que el bot atienda su primera llamada, sigue este orden. Todo se hace desde el panel.</p>
      <Steps>
        <li>
          <Go to="/configuracion">Configuración → General</Go>: la <b>URL pública</b> con la que se llega a Mapache desde internet (la necesitan
          ElevenLabs, Deepgram y los clientes MCP).
        </li>
        <li>
          <Go to="/configuracion">Configuración → Inteligencia artificial</Go>: elige OpenAI, Gemini o Claude, pega su API key y escribe las
          instrucciones del bot (quién es, cómo habla, qué no debe hacer).
        </li>
        <li>
          <Go to="/configuracion">Configuración → Voz</Go>: elige el proveedor de voz y cárgale sus datos.
        </li>
        <li>
          <Go to="/extensiones">Extensiones → Nueva extensión</Go>: servidor, usuario y contraseña SIP de la cuenta que atenderá el bot. En
          segundos queda registrada.
        </li>
        <li>
          <Go to="/directorio">Directorio</Go>: las personas y áreas a las que el bot puede transferir.
        </li>
        <li>
          <Go to="/conocimiento">Conocimiento</Go>: sube tus documentos (horarios, precios, políticas) para que el bot responda con ellos.
        </li>
        <li>
          Llama a la extensión desde otro teléfono, o usa el <Go to="/telefono">Teléfono</Go> del panel para probarla.
        </li>
      </Steps>
      <Tip>Con OpenAI puedes usar la misma API key para la IA y para la voz: basta con cargarla una vez.</Tip>
    </>
  )
}

export function ExtensionsTopic() {
  return (
    <>
      <p>
        Una extensión es una cuenta SIP, igual que la de un softphone como MicroSIP. Mapache se registra en tu central (Asterisk, FreePBX, 3CX o un
        proveedor en la nube) y atiende las llamadas que llegan a esa cuenta.
      </p>
      <Table
        rows={[
          ['Obligatorio', 'Servidor SIP, usuario y contraseña. La contraseña se guarda cifrada.'],
          ['Quién contesta', 'El bot, el bot con paso a una persona, o una persona (desde el panel).'],
          ['Red y NAT', 'IP pública o STUN y keepalive si Mapache está detrás de un router. Lo configura quien instala.'],
          ['Llamadas simultáneas', 'Cuántas llamadas puede atender a la vez esa cuenta (0 = sin límite).'],
          ['Horario de atención', 'Días, horas y descanso. Fuera de horario el bot no transfiere y dice el mensaje configurado.'],
        ]}
      />
      <Tip>
        Si la extensión no se registra, el motivo aparece en el panel. <b>401 Unauthorized</b> es usuario o contraseña incorrectos.
      </Tip>
    </>
  )
}

export function PhoneTopic() {
  return (
    <>
      <p>
        El <Go to="/telefono">Teléfono</Go> (el botón junto a tu perfil) sirve para llamar desde cualquier extensión sin instalar nada, por
        ejemplo para probar que una cuenta funciona.
      </p>
      <Steps>
        <li>Elige abajo la extensión desde la que sale la llamada; el punto verde indica que está registrada.</li>
        <li>Escribe el número o usa el teclado (mantén el 0 para escribir +).</li>
        <li>En llamada puedes silenciar, marcar tonos para menús de la central y colgar. La llamada sigue aunque cambies de página.</li>
      </Steps>
      <p>
        <b>Recientes</b> muestra las últimas llamadas y <b>Contactos</b> el directorio: un clic pone el número en el marcador.
      </p>
      <Tip>El navegador pide permiso para el micrófono la primera vez. Fuera de tu computadora local, el panel debe estar en HTTPS.</Tip>
    </>
  )
}

export function LiveCallsTopic() {
  return (
    <>
      <p>Cuando entra una llamada y tienes el panel abierto, aparece una ventana con la conversación en vivo: lo que dice el cliente y lo que responde el bot.</p>
      <Steps>
        <li>
          <b>Tomar la llamada</b>: el bot se retira y hablas tú desde el navegador, con silenciar y colgar.
        </li>
        <li>
          <b>Ocultar</b>: el bot sigue atendiendo; la llamada queda en el historial.
        </li>
      </Steps>
      <p>
        Con <b>Habilitar notificaciones</b> (en el Teléfono) el sistema te avisa aunque la pestaña esté en segundo plano: llamadas entrantes,
        recados y formularios nuevos.
      </p>
    </>
  )
}

export function MessagesTopic() {
  return (
    <>
      <p>
        Cuando la persona buscada no puede atender, el bot toma un <b>recado</b>: para quién es, quién llamó, a qué número devolver la llamada y el
        mensaje. Llegan en vivo a <Go to="/recados">Recados</Go>.
      </p>
      <Steps>
        <li>Al abrir un recado se marca como leído; <b>Marcar como resuelto</b> lo saca de pendientes.</li>
        <li>
          <b>Compartir</b> crea un enlace que vence (1 hora a 30 días) para mandarlo por <b>WhatsApp</b>. Quien lo abre ve el recado, puede tocar el
          número para devolver la llamada y escuchar la grabación, sin iniciar sesión.
        </li>
      </Steps>
    </>
  )
}

export function FormsTopic() {
  return (
    <>
      <p>
        Un formulario es lo que el bot debe preguntar y registrar: una solicitud de soporte, una cita, un pedido. Cada respuesta queda en{' '}
        <Go to="/formularios">Formularios</Go> y dispara sus <b>acciones</b>.
      </p>
      <Table
        rows={[
          ['Campos', 'Texto, número, teléfono, correo, fecha, sí/no u opciones. El bot vuelve a preguntar si falta algo o no es válido.'],
          ['Crear con IA', 'Describe el formulario y la IA arma un borrador para revisar.'],
          ['Webhook, Teams, Google Chat, Slack, correo', 'Avisos con los datos de cada respuesta.'],
          [
            'API (CRM, ERP…)',
            <>
              Envía los datos a cualquier sistema: método, URL, headers cifrados y un cuerpo JSON con marcadores como <code>{'{{nombre}}'}</code> o{' '}
              <code>{'{{summary}}'}</code>.
            </>,
          ],
        ]}
      />
      <Tip>Si un destino falla, se reintenta solo varias veces. El error queda visible en la respuesta, con un botón para reintentar.</Tip>
    </>
  )
}

export function KnowledgeTopic() {
  return (
    <>
      <p>
        En <Go to="/conocimiento">Conocimiento</Go> subes PDF, Word, TXT, Markdown, CSV o HTML. En cada turno, el bot recibe los fragmentos más
        relevantes para lo que preguntó el cliente y responde con esa información.
      </p>
      <Steps>
        <li>Crea una base (por ejemplo «Precios 2026») y sube los archivos.</li>
        <li>
          Usa <b>Probar búsqueda</b> con una pregunta como la haría un cliente, para ver qué recibiría el bot.
        </li>
        <li>Desactiva una base para sacarla del bot sin borrarla.</li>
      </Steps>
      <Tip>Documentos cortos y ordenados por tema dan mejores respuestas que un PDF enorme.</Tip>
    </>
  )
}

export function ToolsTopic() {
  return (
    <>
      <p>
        En <Go to="/herramientas">Herramientas</Go> el bot aprende a consultar tus sistemas durante la llamada.
      </p>
      <Table
        rows={[
          [
            'Peticiones HTTP',
            <>
              URL con <code>{'{{parametros}}'}</code>, headers cifrados y los datos que el bot debe pedir. Ejemplo: consultar el estado de un pedido.{' '}
              <b>Probar</b> la ejecuta con valores de ejemplo.
            </>,
          ],
          ['Servidores MCP', 'Conecta un servidor MCP y elige con interruptores qué herramientas puede usar el bot.'],
        ]}
      />
      <Tip>La descripción de cada herramienta es lo que el bot lee para decidir cuándo usarla: di cuándo usarla y qué devuelve.</Tip>
    </>
  )
}

export function DirectoryTopic() {
  return (
    <>
      <p>
        El <Go to="/directorio">Directorio</Go> lista a quién puede transferir el bot: nombre, área, destino (extensión, número o dirección SIP) y
        cuándo transferir.
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>El bot solo transfiere a destinos del directorio: nunca marca un número inventado.</li>
        <li>Fuera del horario de atención de la extensión no transfiere: dice el mensaje de fuera de horario y ofrece un recado.</li>
      </ul>
    </>
  )
}

export function CampaignsTopic() {
  return (
    <>
      <p>
        Con <Go to="/campanas">Campañas</Go> el bot llama a una lista de contactos con un guion: recordatorios de citas, cobros, encuestas,
        seguimiento.
      </p>
      <Steps>
        <li>
          Crea la campaña: extensión, guion con variables (<code>{'{{nombre}}'}</code>, <code>{'{{monto}}'}</code>…), frase inicial y resultados
          posibles.
        </li>
        <li>Importa los contactos desde un CSV de Excel o Google Sheets, con una columna de teléfono.</li>
        <li>
          <b>Iniciar</b>: el bot llama respetando las llamadas simultáneas, los reintentos y el horario. Registra el resultado y notas de cada
          contacto.
        </li>
      </Steps>
      <Tip>Llama solo a personas que dieron su consentimiento y respeta «No volver a llamar».</Tip>
    </>
  )
}

export function AnalyticsTopic() {
  return (
    <p>
      <Go to="/analitica">Analítica</Go> muestra cuántas llamadas hubo, cuántas atendió el bot, cuánto duraron, cuántas pasaron a una persona, a qué
      horas llaman más (mapa de calor), el detalle por extensión, cómo terminan y los resultados de las campañas. Elige 7, 30 o 90 días.
    </p>
  )
}

export function RecordingsTopic() {
  return (
    <>
      <p>
        Activa <b>Grabar llamadas</b> en <Go to="/configuracion">Configuración → Llamadas</Go> y escúchalas en <Go to="/grabaciones">Grabaciones</Go>.
        El bot avisa al inicio que la llamada se graba.
      </p>
      <Table
        rows={[
          ['En el servidor', 'Sin configurar nada.'],
          ['Amazon S3 o compatible', 'AWS, Cloudflare R2, MinIO o DigitalOcean Spaces: bucket y credenciales.'],
          ['Azure Blob Storage', 'Cadena de conexión y contenedor.'],
        ]}
      />
      <Tip>Cambiar de destino no mueve ni rompe las grabaciones anteriores. Usa Probar antes de guardar.</Tip>
      <p>
        Las grabaciones se guardan <b>cifradas</b> (AES-256), también en la nube; el panel las descifra al escucharlas. En Configuración → Llamadas se
        define cuántos días se guardan grabaciones y transcripciones: se borran solas cada noche.
      </p>
    </>
  )
}

export function VoiceTopic() {
  const publicUrl = usePublicUrl()
  return (
    <>
      <p>Mapache no depende de un solo proveedor de voz. Se elige en Configuración → Voz y se puede cambiar cuando quieras.</p>
      <Table
        rows={[
          ['OpenAI Realtime', 'Muy poca latencia. Usa la API key de OpenAI. Elige voz y modelo.'],
          ['Deepgram', 'Menor costo por minuto. Necesita la URL pública configurada.'],
          ['ElevenLabs', 'Voces muy naturales. El agente se crea en ElevenLabs con estos datos:'],
        ]}
      />
      <div className="space-y-3">
        <CopyField label="LLM del agente: Custom LLM (Server URL)" value={`${publicUrl}/api/llm/v1`} />
        <CopyField label="Webhook post-llamada (grabaciones)" value={`${publicUrl}/api/webhooks/elevenlabs/post-call`} />
      </div>
      <Tip>En ElevenLabs, la API key del Custom LLM es el token de tools del servidor (lo tiene quien instaló Mapache).</Tip>
    </>
  )
}

export function UsersTopic() {
  return (
    <>
      <Table
        rows={[
          ['Administrador', 'Configura todo: extensiones, IA, voz, herramientas, formularios, campañas, usuarios.'],
          ['Operador', 'Ve el panel, atiende recados y respuestas, escucha grabaciones, usa el teléfono y toma llamadas.'],
        ]}
      />
      <p>
        Los administradores crean usuarios y cambian roles en <Go to="/usuarios">Usuarios</Go>. Cada persona cambia su nombre, su contraseña y el
        tema en su perfil.
      </p>
    </>
  )
}

export function SecurityTopic() {
  return (
    <>
      <Table
        rows={[
          ['Doble factor', 'En tu perfil: escanea el QR con una app autenticadora y guarda los códigos de recuperación.'],
          ['Google y Microsoft', 'Un administrador los habilita en Configuración → Inicio de sesión; cada persona vincula su cuenta en el perfil.'],
          ['Auditoría', 'Quién entró, escuchó una grabación, compartió un recado o cambió la configuración. Se exporta a CSV.'],
          ['Retención', 'Borrado automático de grabaciones y transcripciones viejas (Configuración → Llamadas).'],
        ]}
      />
      <p>
        Si alguien perdió el teléfono y los códigos de recuperación, un administrador le quita el doble factor en <Go to="/usuarios">Usuarios</Go>.
      </p>
      <Tip>
        Una cuenta de Google o Microsoft nunca se une sola a un usuario por tener el mismo correo: se vincula desde el perfil, con la sesión abierta.
      </Tip>
    </>
  )
}

export function McpTopic() {
  const publicUrl = usePublicUrl()
  return (
    <>
      <p>
        Mapache se puede conectar a Claude, Cursor u otros agentes de IA para consultar recados, formularios, directorio y conocimiento. En{' '}
        <Go to="/configuracion">Configuración → Acceso por MCP</Go> se crean tokens con acceso total o por herramienta.
      </p>
      <CopyField label="URL del servidor MCP" value={`${publicUrl}/api/mcp`} />
    </>
  )
}

export function TroubleshootingTopic() {
  return (
    <Table
      rows={[
        ['La extensión no se registra', '401: usuario o contraseña. Sin respuesta: servidor, puerto o transporte (UDP/TCP/TLS) incorrectos.'],
        ['Se registra pero no entran llamadas', 'La central no llega a Mapache: revisar NAT, IP pública o STUN y los puertos.'],
        ['La llamada entra y se corta', 'Falta configurar la voz (Configuración → Voz) o el proveedor no responde: el motivo queda en el historial.'],
        ['El bot saluda pero no responde', 'Revisa la API key de la IA; con Deepgram, la URL pública; con ElevenLabs, que el agente use el Custom LLM.'],
        ['El bot no conoce un dato', 'Súbelo a Conocimiento o agrégalo a las instrucciones del bot.'],
        ['No transfiere', 'El destino debe estar en el Directorio y la extensión en horario de atención.'],
        ['El teléfono no suena o no se oye', 'Permite el micrófono en el navegador y usa el panel por HTTPS.'],
        ['No llegan notificaciones', 'Habilitar notificaciones en el Teléfono y permitirlas en el navegador y en el sistema operativo.'],
      ]}
    />
  )
}

export function GlossaryTopic() {
  return (
    <Table
      rows={[
        ['Extensión', 'Cuenta SIP que Mapache registra en tu central.'],
        ['SIP', 'El protocolo con el que hablan las centrales telefónicas.'],
        ['Proveedor de voz', 'Quien escucha y habla: ElevenLabs, OpenAI Realtime o Deepgram.'],
        ['Custom LLM', 'La dirección de Mapache a la que el proveedor de voz le pregunta qué responder.'],
        ['Transferencia', 'Pasar la llamada a otra extensión o número del directorio.'],
        ['Tomar la llamada', 'Que una persona del panel reemplace al bot en una llamada en curso.'],
        ['MCP', 'Estándar para conectar agentes de IA con sistemas: Mapache lo usa en ambos sentidos.'],
        ['URL pública', 'Dirección con la que se llega a Mapache desde internet.'],
      ]}
    />
  )
}
