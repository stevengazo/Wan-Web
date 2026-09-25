import type { CampaignContactStatus, CampaignStatus } from '@/services/api'

export const campaignStatusLabels: Record<CampaignStatus, { label: string; className: string }> = {
  Draft: { label: 'Borrador', className: 'bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300' },
  Running: { label: 'En curso', className: 'bg-emerald-600 text-white' },
  Paused: { label: 'Pausada', className: 'bg-amber-500 text-white' },
  Completed: { label: 'Terminada', className: 'bg-brand-600 text-white' },
}

export const contactStatusLabels: Record<CampaignContactStatus, { label: string; dot: string }> = {
  Pending: { label: 'Pendiente', dot: 'bg-zinc-300 dark:bg-zinc-600' },
  Calling: { label: 'Llamando', dot: 'bg-brand-500 animate-pulse' },
  Completed: { label: 'Contestó', dot: 'bg-emerald-500' },
  NoAnswer: { label: 'No contestó', dot: 'bg-amber-500' },
  Busy: { label: 'Ocupado', dot: 'bg-amber-600' },
  Failed: { label: 'Falló', dot: 'bg-red-500' },
}
