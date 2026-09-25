import { MutationCache, QueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ApiError } from '@/services/api/client'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** Toast al terminar bien. Sin él la mutación no avisa (p. ej. cambios que ya se ven en pantalla). */
      success?: string
      /** true: el error lo muestra la propia pantalla (p. ej. un resultado de prueba). */
      silentError?: boolean
    }
  }
}

/**
 * Las alertas de todas las mutaciones salen de acá: cada hook declara su mensaje en `meta` y las
 * pantallas no tienen que acordarse de avisar. Los errores por campo se muestran junto al campo; el
 * toast solo resume.
 */
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      if (mutation.meta?.success) toast.success(mutation.meta.success)
    },
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.silentError) return
      const hasFieldErrors = error instanceof ApiError && Object.keys(error.fieldErrors).length > 0
      toast.error(hasFieldErrors ? 'Revisa los campos marcados' : error.message)
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Reintentar errores 4xx no sirve: la respuesta no va a cambiar.
      retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2,
    },
  },
})
