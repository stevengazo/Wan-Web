import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api/client'
import { keys } from '@/services/api/keys'
import type { UserRole } from '@/services/api/auth'

export interface UserListItem {
  id: string
  email: string
  displayName: string
  role: UserRole
  createdAt: string
  /** La sesión actual: no se puede eliminar a sí misma. */
  isCurrent: boolean
}

export interface CreateUserInput {
  displayName: string
  email: string
  password: string
  role: UserRole
}

export const useUsers = () => useQuery({ queryKey: keys.users, queryFn: () => api<UserListItem[]>('/users') })

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Usuario creado' },
    mutationFn: (input: CreateUserInput) => api<UserListItem>('/users', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.users }),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Usuario actualizado' },
    mutationFn: ({ id, ...input }: { id: string; displayName: string; role: UserRole }) =>
      api<UserListItem>(`/users/${id}`, { method: 'PUT', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.users }),
  })
}

export function useResetUserPassword() {
  return useMutation({
    meta: { success: 'Contraseña cambiada' },
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      api<void>(`/users/${id}/password`, { method: 'POST', body: { password } }),
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { success: 'Usuario eliminado' },
    mutationFn: (id: string) => api<void>(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.users }),
  })
}
