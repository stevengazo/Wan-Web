import { useState } from 'react'
import { PageHeader } from '@/components/organisms/PageHeader'
import { Dialer } from '@/components/organisms/phone/Dialer'
import { PhoneLog } from '@/components/organisms/phone/PhoneLog'
import { usePhone } from '@/hooks/usePhone'
import { usePhoneLines } from '@/hooks/usePhoneLines'
import { useCalls, useDirectory } from '@/services/api'

const LINE_KEY = 'mapache.phone-line'

/** Contenedor: marcador a la izquierda, historial y contactos a la derecha. */
export function PhonePage() {
  const phone = usePhone()
  const lines = usePhoneLines()
  const { data: calls } = useCalls()
  const { data: contacts } = useDirectory()
  const [number, setNumber] = useState('')
  const [lineId, setLineId] = useState(() => readStored(LINE_KEY))

  const changeLine = (id: string) => {
    setLineId(id)
    try {
      localStorage.setItem(LINE_KEY, id)
    } catch {
      // Sin storage se vuelve a elegir la próxima vez.
    }
  }

  return (
    <div>
      <PageHeader title="Teléfono" subtitle="Llama desde tus extensiones para probarlas, sin salir del navegador." />

      <div className="mt-8 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Dialer
          phone={phone}
          lines={lines}
          lineId={lines.some((l) => l.id === lineId) ? lineId : lines[0]?.id}
          onLineChange={changeLine}
          number={number}
          onNumberChange={setNumber}
        />
        <PhoneLog calls={calls} contacts={contacts?.filter((c) => c.enabled)} onPick={setNumber} />
      </div>
    </div>
  )
}

function readStored(key: string) {
  try {
    return localStorage.getItem(key) ?? ''
  } catch {
    return ''
  }
}
