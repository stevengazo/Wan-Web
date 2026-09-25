import { useState, type FormEvent } from 'react'
import { Button } from '@/components/atoms/Button'
import { SelectField, TextField } from '@/components/molecules/Field'
import { PasswordField } from '@/components/molecules/PasswordField'
import type { CreateUserInput, UserRole } from '@/services/api'
import { roleLabels } from './roleLabels'

interface CreateUserFormProps {
  saving: boolean
  fieldErrors: Record<string, string[]>
  onSubmit: (input: CreateUserInput, reset: () => void) => void
  onCancel: () => void
}

export function CreateUserForm({ saving, fieldErrors, onSubmit, onCancel }: CreateUserFormProps) {
  const empty: CreateUserInput = { displayName: '', email: '', password: '', role: 'Operator' }
  const [form, setForm] = useState<CreateUserInput>(empty)
  const set = <K extends keyof CreateUserInput>(key: K, value: CreateUserInput[K]) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit(form, () => setForm(empty))
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-xl border border-zinc-300 p-5 dark:border-white/20">
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Nombre" autoComplete="off" value={form.displayName} onChange={(e) => set('displayName', e.target.value)} error={fieldErrors.displayName?.[0]} />
        <TextField label="Correo" type="email" autoComplete="off" value={form.email} onChange={(e) => set('email', e.target.value)} error={fieldErrors.email?.[0]} />
        <PasswordField
          label="Contraseña inicial"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          hint="Mínimo 8 caracteres. La persona la puede cambiar en su perfil."
          error={fieldErrors.password?.[0]}
        />
        <SelectField label="Rol" value={form.role} onChange={(e) => set('role', e.target.value as UserRole)}>
          {Object.entries(roleLabels).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          Crear usuario
        </Button>
      </div>
    </form>
  )
}
