import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api/client'
import { keys } from '@/services/api/keys'

export type HttpToolParameterType = 'String' | 'Number' | 'Boolean'

export interface HttpToolParameter {
  name: string
  type: HttpToolParameterType
  description: string | null
  required: boolean
}

/** Petición a un sistema externo que el bot puede hacer durante la llamada. */
export interface HttpTool {
  id: string
  name: string
  description: string
  method: string
  urlTemplate: string
  bodyTemplate: string | null
  /** Solo los nombres: los valores quedan cifrados en el servidor. */
  headerNames: string[]
  parameters: HttpToolParameter[]
  timeoutSeconds: number
  enabled: boolean
}

export interface SaveHttpTool {
  name: string
  description: string
  method: string
  urlTemplate: string
  bodyTemplate: string | null
  /** Nulo conserva los guardados; un objeto los reemplaza. */
  headers: Record<string, string> | null
  parameters: HttpToolParameter[]
  timeoutSeconds: number
  enabled: boolean
}

export interface McpTool {
  name: string
  /** Nombre con el que lo ve el modelo. */
  exposedName: string
  description: string | null
  enabled: boolean
}

/** Servidor MCP externo cuyas herramientas usa el bot. */
export interface McpServer {
  id: string
  name: string
  url: string
  headerNames: string[]
  enabled: boolean
  tools: McpTool[]
  lastError: string | null
  lastSyncedAt: string | null
}

export interface SaveMcpServer {
  name: string
  url: string
  headers: Record<string, string> | null
  disabledTools: string[] | null
  enabled: boolean
}

/** Herramienta del servidor MCP de Mapache que se puede permitir a un token. */
export interface McpServerToolInfo {
  name: string
  description: string
  /** Solo consulta; las demás modifican datos. */
  readOnly: boolean
}

export interface McpTokenPermissions {
  /** Todas las herramientas, incluidas las que se agreguen en el futuro. */
  allowAll: boolean
  allowedTools: string[]
}

export interface McpAccessToken extends McpTokenPermissions {
  id: string
  name: string
  prefix: string
  createdAt: string
  lastUsedAt: string | null
}

export const useHttpTools = () => useQuery({ queryKey: keys.httpTools, queryFn: () => api<HttpTool[]>('/http-tools') })

export function useSaveHttpTool(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Petición guardada' },
    mutationFn: (input: SaveHttpTool) =>
      id ? api<HttpTool>(`/http-tools/${id}`, { method: 'PUT', body: input }) : api<HttpTool>('/http-tools', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.httpTools }),
  })
}

export function useDeleteHttpTool() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Petición eliminada' },
    mutationFn: (id: string) => api<void>(`/http-tools/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.httpTools }),
  })
}

export const useTestHttpTool = () =>
  useMutation({
    meta: { silentError: true },
    mutationFn: ({ id, args }: { id: string; args: Record<string, unknown> }) =>
      api<{ url: string; result: string }>(`/http-tools/${id}/test`, { method: 'POST', body: { arguments: args } }),
  })

export const useMcpServers = () => useQuery({ queryKey: keys.mcpServers, queryFn: () => api<McpServer[]>('/mcp-servers') })

export function useSaveMcpServer(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Servidor MCP guardado' },
    mutationFn: (input: SaveMcpServer) =>
      id ? api<McpServer>(`/mcp-servers/${id}`, { method: 'PUT', body: input }) : api<McpServer>('/mcp-servers', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.mcpServers }),
  })
}

export function useSyncMcpServer() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Herramientas actualizadas' },
    mutationFn: (id: string) => api<McpServer>(`/mcp-servers/${id}/sync`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.mcpServers }),
  })
}

export function useDeleteMcpServer() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Servidor MCP eliminado' },
    mutationFn: (id: string) => api<void>(`/mcp-servers/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.mcpServers }),
  })
}

export const useTestMcpTool = () =>
  useMutation({
    meta: { silentError: true },
    mutationFn: ({ id, tool, args }: { id: string; tool: string; args: Record<string, unknown> }) =>
      api<{ result: string }>(`/mcp-servers/${id}/tools/${encodeURIComponent(tool)}/test`, { method: 'POST', body: { arguments: args } }),
  })

export const useMcpTokens = () => useQuery({ queryKey: keys.mcpTokens, queryFn: () => api<McpAccessToken[]>('/mcp-tokens') })

export const useMcpServerTools = () =>
  useQuery({ queryKey: keys.mcpServerTools, queryFn: () => api<McpServerToolInfo[]>('/mcp-tokens/tools'), staleTime: Infinity })

export function useUpdateMcpToken() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Permisos actualizados' },
    mutationFn: ({ id, ...permissions }: McpTokenPermissions & { id: string }) =>
      api<McpAccessToken>(`/mcp-tokens/${id}`, { method: 'PUT', body: permissions }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.mcpTokens }),
  })
}

export function useCreateMcpToken() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: McpTokenPermissions & { name: string }) =>
      api<{ token: McpAccessToken; value: string }>('/mcp-tokens', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.mcpTokens }),
  })
}

export function useRevokeMcpToken() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Token revocado' },
    mutationFn: (id: string) => api<void>(`/mcp-tokens/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.mcpTokens }),
  })
}
