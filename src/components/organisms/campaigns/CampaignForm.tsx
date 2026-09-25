import { useState, type FormEvent } from 'react'
import { Button } from '@/components/atoms/Button'
import { Switch } from '@/components/atoms/Switch'
import { SelectField, TextAreaField, TextField } from '@/components/molecules/Field'
import { FormSection, FormSections } from '@/components/organisms/FormSection'
import type { CampaignInput } from '@/services/api'

interface CampaignFormProps {
  initial: CampaignInput
  extensions: { id: string; name: string }[]
  fieldErrors: Record<string, string[]>
  saving: boolean
  onSubmit: (input: CampaignInput) => void
  onCancel: () => void
}

/** Datos de la campaña: guion, apertura, resultados y ritmo de llamadas. */
export function CampaignForm({ initial, extensions, fieldErrors, saving, onSubmit, onCancel }: CampaignFormProps) {
  const [form, setForm] = useState(initial)
  const [newOutcome, setNewOutcome] = useState('')
  const set = <K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) => setForm((f) => ({ ...f, [key]: value }))
  const error = (key: keyof CampaignInput) => fieldErrors[key]?.[0]
  const numeric = (key: 'maxConcurrentCalls' | 'maxAttempts' | 'retryMinutes') => ({
    type: 'number',
    inputMode: 'numeric' as const,
    value: form[key],
    onChange: (e: { target: { valueAsNumber: number } }) => set(key, Number.isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber),
    error: error(key),
  })

  const addOutcome = () => {
    const value = newOutcome.trim()
    if (value && !form.outcomes.includes(value)) set('outcomes', [...form.outcomes, value])
    setNewOutcome('')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSections>
        <FormSection title="Campaña" description="Nombre interno y extensión desde la que llama el bot (su cuenta, límites y horario).">
          <TextField label="Nombre" placeholder="Recordatorio de citas de octubre" value={form.name} onChange={(e) => set('name', e.target.value)} error={error('name')} />
          <SelectField label="Llamar desde" value={form.extensionId} onChange={(e) => set('extensionId', e.target.value)} error={error('extensionId')}>
            <option value="">Elige una extensión</option>
            {extensions.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </SelectField>
        </FormSection>

        <FormSection
          title="Guion"
          description="Qué debe lograr el bot en cada llamada. Usa {{nombre}}, {{telefono}} o cualquier columna del CSV, como {{monto}}."
        >
          <TextAreaField
            label="Objetivo e indicaciones"
            rows={7}
            placeholder="Recuerda a {{nombre}} su cita del {{fecha}} a las {{hora}}. Si no puede asistir, ofrece reprogramar…"
            value={form.instructions}
            onChange={(e) => set('instructions', e.target.value)}
            error={error('instructions')}
          />
          <TextField
            label="Frase inicial"
            placeholder="Hola {{nombre}}, te llamo de la Clínica Sol. ¿Tienes un minuto?"
            value={form.openingLine ?? ''}
            onChange={(e) => set('openingLine', e.target.value || null)}
            hint="Lo primero que dice el bot al contestar. Con ElevenLabs, el agente debe permitir cambiar el primer mensaje."
            error={error('openingLine')}
          />
        </FormSection>

        <FormSection title="Resultados" description="Cómo puede terminar cada llamada. El bot elige uno y deja notas; siempre existe «No volver a llamar».">
          <div className="flex flex-wrap gap-2">
            {form.outcomes.map((outcome) => (
              <span key={outcome} className="inline-flex items-center gap-2 border border-zinc-300 py-1 pl-3 pr-1 text-sm dark:border-white/15">
                {outcome}
                <button
                  type="button"
                  aria-label={`Quitar ${outcome}`}
                  onClick={() => set('outcomes', form.outcomes.filter((o) => o !== outcome))}
                  className="flex size-6 items-center justify-center text-zinc-400 hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <TextField
              label="Agregar resultado"
              placeholder="Confirmó la cita"
              value={newOutcome}
              onChange={(e) => setNewOutcome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addOutcome()
                }
              }}
            />
            <Button variant="secondary" onClick={addOutcome} className="mt-7 shrink-0">
              Agregar
            </Button>
          </div>
        </FormSection>

        <FormSection title="Ritmo" description="Cuántas llamadas a la vez y cuántas veces reintentar a quien no contesta o da ocupado.">
          <div className="grid grid-cols-3 gap-4">
            <TextField label="Simultáneas" min={1} max={20} {...numeric('maxConcurrentCalls')} />
            <TextField label="Intentos" min={1} max={10} {...numeric('maxAttempts')} />
            <TextField label="Reintentar (min)" min={1} {...numeric('retryMinutes')} />
          </div>
          <Switch
            label="Solo en horario de atención"
            description="No marca fuera del horario de la extensión."
            checked={form.respectBusinessHours}
            onChange={(value) => set('respectBusinessHours', value)}
          />
        </FormSection>
      </FormSections>

      <div className="flex justify-end gap-2 border-t border-zinc-200 pt-6 dark:border-white/10">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          Guardar
        </Button>
      </div>
    </form>
  )
}
