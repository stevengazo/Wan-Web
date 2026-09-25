import { useNavigate, useParams } from 'react-router'
import { CampaignForm } from '@/components/organisms/campaigns/CampaignForm'
import { PageHeader } from '@/components/organisms/PageHeader'
import { ApiError } from '@/services/api/client'
import { useCampaign, useExtensions, useSaveCampaign, type CampaignInput } from '@/services/api'

const empty: CampaignInput = {
  name: '',
  extensionId: '',
  instructions: '',
  openingLine: null,
  outcomes: ['Interesado', 'No interesado', 'Volver a llamar'],
  maxConcurrentCalls: 1,
  maxAttempts: 2,
  retryMinutes: 60,
  respectBusinessHours: true,
}

/** Crear o editar una campaña. */
export function CampaignEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: campaign, isPending } = useCampaign(id)
  const { data: extensions } = useExtensions()
  const save = useSaveCampaign(id)

  if (id && isPending) return <p className="text-zinc-500">Cargando…</p>

  const initial: CampaignInput = campaign
    ? {
        name: campaign.name,
        extensionId: campaign.extensionId,
        instructions: campaign.instructions,
        openingLine: campaign.openingLine,
        outcomes: campaign.outcomes,
        maxConcurrentCalls: campaign.maxConcurrentCalls,
        maxAttempts: campaign.maxAttempts,
        retryMinutes: campaign.retryMinutes,
        respectBusinessHours: campaign.respectBusinessHours,
      }
    : { ...empty, extensionId: extensions?.[0]?.id ?? '' }

  return (
    <div>
      <PageHeader
        title={id ? 'Editar campaña' : 'Nueva campaña'}
        back={{ to: id ? `/campanas/${id}` : '/campanas', label: 'Volver' }}
        subtitle="El guion le dice al bot qué lograr; los resultados son las opciones con las que registra cada llamada."
      />
      <div className="mt-8">
        <CampaignForm
          key={campaign?.id ?? 'new'}
          initial={initial}
          extensions={(extensions ?? []).map((e) => ({ id: e.id, name: e.name }))}
          fieldErrors={save.error instanceof ApiError ? save.error.fieldErrors : {}}
          saving={save.isPending}
          onSubmit={(input) => save.mutate(input, { onSuccess: (saved) => navigate(`/campanas/${saved.id}`) })}
          onCancel={() => navigate(id ? `/campanas/${id}` : '/campanas')}
        />
      </div>
    </div>
  )
}
