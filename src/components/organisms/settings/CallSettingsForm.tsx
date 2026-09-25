import { useState, type FormEvent } from 'react'
import { ApiError } from '@/services/api/client'
import { useSaveCallSettings } from '@/services/api'
import type { CallSettings } from '@/services/api'
import { Button } from '@/components/atoms/Button'
import { TextAreaField } from '@/components/molecules/Field'
import { FormSection, FormSections } from '@/components/organisms/FormSection'
import { Switch } from '@/components/atoms/Switch'

const defaultNotice = 'Esta llamada puede ser grabada para mejorar la calidad del servicio.'

/** Grabación de llamadas y aviso de consentimiento. */
export function CallSettingsForm({ settings }: { settings: CallSettings }) {
  const save = useSaveCallSettings()
  const [recordCalls, setRecordCalls] = useState(settings.recordCalls)
  const [notice, setNotice] = useState(settings.recordingNotice ?? defaultNotice)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate({ recordCalls, recordingNotice: notice.trim() || null })
  }

  const noticeError = save.error instanceof ApiError ? save.error.fieldErrors.recordingNotice?.[0] : undefined

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSections>
        <FormSection
          title="Grabación"
          description="Se guarda el audio que ElevenLabs envía al terminar cada llamada (webhook post-llamada con audio)."
        >
          <Switch label="Grabar llamadas" description="Aplica a todas las cuentas." checked={recordCalls} onChange={setRecordCalls} />
          <TextAreaField
            label="Aviso al inicio de la llamada"
            rows={3}
            value={notice}
            onChange={(e) => setNotice(e.target.value)}
            disabled={!recordCalls}
            hint="Informar la grabación suele ser obligatorio. Inclúyelo también en el primer mensaje del agente."
            error={noticeError}
          />
        </FormSection>
      </FormSections>
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-white/10">
        {save.error && !noticeError && <span className="text-sm text-red-600 dark:text-red-400">{save.error.message}</span>}
        <Button type="submit" loading={save.isPending} className="sm:min-w-32">
          Guardar
        </Button>
      </div>
    </form>
  )
}
