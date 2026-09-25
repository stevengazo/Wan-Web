import { GoogleLogo, MicrosoftLogo } from '@/components/atoms/BrandIcons'
import type { ExternalProvider } from '@/services/api'

export const providerLogos: Record<ExternalProvider, typeof GoogleLogo> = { Google: GoogleLogo, Microsoft: MicrosoftLogo }
