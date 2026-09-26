import { useState, type FormEvent } from 'react'
import { ApiError } from '@/services/api/client'
import toast from 'react-hot-toast'
import { useRunRetention, useSaveCallSettings } from '@/services/api'
import type { CallSettings } from '@/services/api'
import { Button } from '@/components/atoms/Button'
import { TextAreaField, TextField } from '@/components/molecules/Field'
import { FormSection, FormSections } from '@/components/organisms/FormSection'
import { Switch } from '@/components/atoms/Switch'

const defaultNotice = 'Esta llamada puede ser grabada para mejorar la calidad del servicio.'

/** Grabación de llamadas y aviso de consentimiento. */
export function CallSettingsForm({ settings }: { settings: CallSettings }) {
  const save = useSaveCallSettings()
  const retention = useRunRetention()
  const [recordCalls, setRecordCalls] = useState(settings.recordCalls)
  const [notice, setNotice] = useState(settings.recordingNotice ?? defaultNotice)
  const [recordingDays, setRecordingDays] = useState(settings.recordingRetentionDays?.toString() ?? '')
  const [transcriptDays, setTranscriptDays] = useState(settings.transcriptRetentionDays?.toString() ?? '')
  const days = (value: string) => (value.trim() ? Number(value) : null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate({
      recordCalls,
      recordingNotice: notice.trim() || null,
      recordingRetentionDays: days(recordingDays),
      transcriptRetentionDays: days(transcriptDays),
    })
  }

  const noticeError = save.error instanceof ApiError ? save.error.fieldErrors.recordingNotice?.[0] : undefined

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSections>
        <FormSection
          title="Grabación"
          description="Con OpenAI y Deepgram graba Wan (voz de quien llama, del bot y del operador). Con ElevenLabs se guarda el audio que envía al terminar (webhook con audio)."
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
        <FormSection
          title="Retención"
          description="Borrado automático, una vez por día. Vacío = se guardan sin límite. Cada borrado queda en la auditoría."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Grabaciones (días)"
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="Sin límite"
              value={recordingDays}
              onChange={(e) => setRecordingDays(e.target.value)}
              error={save.error instanceof ApiError ? save.error.fieldErrors.recordingRetentionDays?.[0] : undefined}
            />
            <TextField
              label="Transcripciones (días)"
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="Sin límite"
              value={transcriptDays}
              onChange={(e) => setTranscriptDays(e.target.value)}
              error={save.error instanceof ApiError ? save.error.fieldErrors.transcriptRetentionDays?.[0] : undefined}
            />
          </div>
          <Button
            variant="secondary"
            loading={retention.isPending}
            onClick={() =>
              retention.mutate(undefined, {
                onSuccess: (r) => toast.success(`Retención aplicada: ${r.recordings} grabaciones y ${r.transcriptLines} líneas de transcripción borradas`),
              })
            }
          >
            Aplicar ahora
          </Button>
        </FormSection>
      </FormSections>
      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-6 dark:border-white/10">
        {save.error && !noticeError && <span className="text-sm text-red-600 dark:text-red-400">{save.error.message}</span>}
        <Button type="submit" loading={save.isPending} className="sm:min-w-32">
          Guardar
        </Button>
      </div>
    </form>
  )
}
