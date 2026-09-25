import { authStore } from '@/stores/authStore'

/** Error de la API a partir de un ProblemDetails de ASP.NET Core. */
export class ApiError extends Error {
  readonly status: number
  /** Errores de validación por campo, con la clave en camelCase. */
  readonly fieldErrors: Record<string, string[]>

  constructor(status: number, title: string, fieldErrors: Record<string, string[]> = {}) {
    super(title)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

interface ProblemDetails {
  title?: string
  errors?: Record<string, string[]>
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  // FormData va tal cual: el navegador pone el Content-Type multipart con su boundary.
  const isForm = init.body instanceof FormData
  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = authStore.get()?.accessToken
  if (token) headers.Authorization = `Bearer ${token}`
  if (init.body !== undefined && !isForm) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      method: init.method ?? 'GET',
      headers,
      body: init.body === undefined ? undefined : isForm ? (init.body as FormData) : JSON.stringify(init.body),
    })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor')
  }

  if (response.status === 401 && token) {
    // Token vencido o revocado: cerrar sesión lleva al login vía RequireAuth.
    authStore.set(null)
  }

  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as ProblemDetails
    throw new ApiError(response.status, problem.title ?? messageFor(response.status), normalizeKeys(problem.errors))
  }

  return response.status === 204 ? (undefined as T) : ((await response.json()) as T)
}

function messageFor(status: number) {
  if (status === 403) return 'No tienes permiso para esta acción'
  if (status === 404) return 'No encontrado'
  if (status === 429) return 'Demasiados intentos, espera un minuto'
  return 'Ocurrió un error inesperado'
}

// ASP.NET devuelve las claves con el nombre de la propiedad C# (PascalCase) o como "$.campo".
function normalizeKeys(errors: Record<string, string[]> = {}) {
  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => {
      const name = key.replace(/^\$\./, '')
      return [name.charAt(0).toLowerCase() + name.slice(1), value]
    }),
  )
}
