import { useState, type FormEvent } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/atoms/Button'
import { ShieldIcon } from '@/components/atoms/icons'
import { CopyField } from '@/components/molecules/CopyField'
import { TextField } from '@/components/molecules/Field'
import { ApiError } from '@/services/api/client'
import {
  useBeginMfaSetup,
  useDisableMfa,
  useEnableMfa,
  useMfaStatus,
  useRegenerateRecoveryCodes,
  type MfaSetup,
} from '@/services/api'

/** Doble factor con app autenticadora: activar (QR + código), ver códigos de recuperación y desactivar. */
export function MfaSection({ onChanged }: { onChanged: () => void }) {
  const { data: status } = useMfaStatus()
  const [setup, setSetup] = useState<MfaSetup | null>(null)
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const begin = useBeginMfaSetup()

  if (!status) return null

  if (recoveryCodes) {
    return <RecoveryCodes codes={recoveryCodes} onDone={() => setRecoveryCodes(null)} />
  }

  if (status.enabled) {
    return <EnabledMfa recoveryCodesLeft={status.recoveryCodesLeft} onCodes={setRecoveryCodes} onDisabled={onChanged} />
  }

  if (setup) {
    return (
      <SetupMfa
        setup={setup}
        onCancel={() => setSetup(null)}
        onEnabled={(codes) => {
          setSetup(null)
          setRecoveryCodes(codes)
          onChanged()
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Además de la contraseña, al entrar se pide un código de tu teléfono. Sirve cualquier app autenticadora: Google Authenticator,
        Microsoft Authenticator, 1Password, Authy.
      </p>
      {begin.error && <p className="text-sm text-red-600 dark:text-red-400">{begin.error.message}</p>}
      <Button type="button" loading={begin.isPending} onClick={() => begin.mutate(undefined, { onSuccess: setSetup })}>
        Activar doble factor
      </Button>
    </div>
  )
}

function SetupMfa({ setup, onCancel, onEnabled }: { setup: MfaSetup; onCancel: () => void; onEnabled: (codes: string[]) => void }) {
  const enable = useEnableMfa()
  const [code, setCode] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    enable.mutate(code, { onSuccess: (result) => onEnabled(result.recoveryCodes) })
  }

  const error = enable.error instanceof ApiError ? (enable.error.fieldErrors.code?.[0] ?? enable.error.message) : undefined

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
        <li>Escanea el código con tu app autenticadora.</li>
        <li>Escribe el código de 6 dígitos que muestra.</li>
      </ol>
      <div className="w-fit rounded-xl bg-white p-3 ring-1 ring-zinc-200 dark:ring-white/10">
        <QRCodeSVG value={setup.otpAuthUri} size={176} marginSize={0} title="Código QR para la app autenticadora" />
      </div>
      <CopyField label="¿No puedes escanear? Cárgala a mano" value={setup.secret} />
      <TextField
        label="Código"
        autoComplete="one-time-code"
        inputMode="numeric"
        placeholder="123 456"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        error={error}
      />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={enable.isPending} disabled={code.replace(/\D/g, '').length !== 6}>
          Activar
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function EnabledMfa({ recoveryCodesLeft, onCodes, onDisabled }: { recoveryCodesLeft: number; onCodes: (codes: string[]) => void; onDisabled: () => void }) {
  const disable = useDisableMfa()
  const regenerate = useRegenerateRecoveryCodes()
  const [action, setAction] = useState<'disable' | 'codes' | null>(null)
  const [code, setCode] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (action === 'disable') {
      disable.mutate(code, { onSuccess: onDisabled })
    } else {
      regenerate.mutate(code, { onSuccess: (result) => onCodes(result.recoveryCodes) })
    }
  }

  const mutation = action === 'disable' ? disable : regenerate
  const error = mutation.error instanceof ApiError ? (mutation.error.fieldErrors.code?.[0] ?? mutation.error.message) : undefined

  return (
    <div className="space-y-5">
      <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
        <ShieldIcon className="size-5" />
        Activo · te quedan {recoveryCodesLeft} códigos de recuperación
      </p>
      {recoveryCodesLeft <= 3 && (
        <p className="text-sm text-amber-600 dark:text-amber-400">Te quedan pocos códigos de recuperación: genera nuevos.</p>
      )}
      {action ? (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <TextField
            label={action === 'disable' ? 'Código para desactivar' : 'Código para generar nuevos'}
            autoComplete="one-time-code"
            inputMode="numeric"
            autoFocus
            placeholder="123 456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            hint={action === 'codes' ? 'Los códigos anteriores dejan de servir.' : undefined}
            error={error}
          />
          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant={action === 'disable' ? 'danger' : 'primary'} loading={mutation.isPending} disabled={!code.trim()}>
              {action === 'disable' ? 'Desactivar' : 'Generar códigos'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => { setAction(null); setCode('') }}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => setAction('codes')}>
            Nuevos códigos de recuperación
          </Button>
          <Button type="button" variant="secondary" onClick={() => setAction('disable')}>
            Desactivar
          </Button>
        </div>
      )}
    </div>
  )
}

function RecoveryCodes({ codes, onDone }: { codes: string[]; onDone: () => void }) {
  const download = () => {
    const blob = new Blob([`Códigos de recuperación de Mapache\nCada uno sirve una sola vez.\n\n${codes.join('\n')}\n`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = Object.assign(document.createElement('a'), { href: url, download: 'mapache-codigos-de-recuperacion.txt' })
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Guarda estos códigos en un lugar seguro: sirven para entrar si pierdes el teléfono. <strong>No se vuelven a mostrar</strong> y cada uno se usa una
        sola vez.
      </p>
      <ul className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-4 font-mono text-sm sm:max-w-sm dark:bg-white/5">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={download}>
          Descargar
        </Button>
        <Button type="button" onClick={onDone}>
          Ya los guardé
        </Button>
      </div>
    </div>
  )
}
