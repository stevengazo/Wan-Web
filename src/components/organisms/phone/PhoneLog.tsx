import { useState, type ReactNode } from 'react'
import { BookIcon, HistoryIcon, PhoneIncomingIcon, PhoneMissedIcon, PhoneOutgoingIcon, SearchIcon, UserIcon } from '@/components/atoms/icons'
import { formatDuration, formatWhen } from '@/lib/format'
import type { CallRecord, DirectoryEntry } from '@/services/api'

type Tab = 'history' | 'contacts'

interface PhoneLogProps {
  calls: CallRecord[] | undefined
  contacts: DirectoryEntry[] | undefined
  /** Pasa el número al marcador. */
  onPick: (number: string) => void
}

/** Historial de llamadas y contactos del directorio; un clic lleva el número al marcador. */
export function PhoneLog({ calls, contacts, onPick }: PhoneLogProps) {
  const [tab, setTab] = useState<Tab>('history')

  return (
    <section className="flex min-h-[32rem] flex-col border border-zinc-200 dark:border-white/10">
      <div role="tablist" aria-label="Historial y contactos" className="flex border-b border-zinc-200 dark:border-white/10">
        <TabButton active={tab === 'history'} onClick={() => setTab('history')} icon={<HistoryIcon />} label="Recientes" />
        <TabButton active={tab === 'contacts'} onClick={() => setTab('contacts')} icon={<BookIcon />} label="Contactos" />
      </div>
      <div className="max-h-[36rem] flex-1 overflow-y-auto">
        {tab === 'history' ? <History calls={calls} onPick={onPick} /> : <Contacts contacts={contacts} onPick={onPick} />}
      </div>
    </section>
  )
}

function TabButton(props: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={props.active}
      onClick={props.onClick}
      className={`relative flex min-h-12 flex-1 items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
        props.active ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200'
      }`}
    >
      {props.icon}
      {props.label}
      {props.active && <span className="absolute inset-x-6 bottom-0 h-0.5 bg-brand-500" />}
    </button>
  )
}

function History({ calls, onPick }: { calls: CallRecord[] | undefined; onPick: (number: string) => void }) {
  if (!calls) return <p className="p-6 text-sm text-zinc-500">Cargando…</p>
  if (calls.length === 0) return <Empty>Todavía no hay llamadas. Las que hagas o recibas aparecerán aquí.</Empty>

  return (
    <ul className="divide-y divide-zinc-100 dark:divide-white/5">
      {calls.map((call) => (
        <li key={call.id}>
          <button
            type="button"
            onClick={() => onPick(call.callerNumber)}
            title={`Marcar ${call.callerNumber}`}
            className="flex min-h-16 w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-white/5"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
              <UserIcon className="size-4.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-mono text-base">{call.callerNumber}</span>
              <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                {call.extensionName}
                {call.endReason && ` · ${call.endReason}`}
              </span>
            </span>
            <span className="hidden w-20 shrink-0 text-right font-mono text-xs text-zinc-500 tabular-nums sm:block dark:text-zinc-400">
              {duration(call)}
            </span>
            <span className="flex w-32 shrink-0 items-center justify-end gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <DirectionIcon call={call} />
              {formatWhen(call.startedAt)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function DirectionIcon({ call }: { call: CallRecord }) {
  if (call.status === 'Missed' || call.status === 'Failed') {
    return <PhoneMissedIcon className="size-4 text-red-500" aria-label="Sin contestar" aria-hidden={false} />
  }
  return call.direction === 'Outbound' ? (
    <PhoneOutgoingIcon className="size-4 text-brand-500" aria-label="Saliente" aria-hidden={false} />
  ) : (
    <PhoneIncomingIcon className="size-4 text-emerald-500" aria-label="Entrante" aria-hidden={false} />
  )
}

function duration(call: CallRecord) {
  if (!call.answeredAt) return '—'
  const end = call.endedAt ? new Date(call.endedAt).getTime() : Date.now()
  return formatDuration((end - new Date(call.answeredAt).getTime()) / 1000)
}

function Contacts({ contacts, onPick }: { contacts: DirectoryEntry[] | undefined; onPick: (number: string) => void }) {
  const [query, setQuery] = useState('')
  if (!contacts) return <p className="p-6 text-sm text-zinc-500">Cargando…</p>
  if (contacts.length === 0) return <Empty>El directorio está vacío. Agrega personas y áreas en Directorio.</Empty>

  const normalized = normalize(query)
  const visible = contacts.filter((c) => !normalized || normalize(`${c.name} ${c.department ?? ''} ${c.target}`).includes(normalized))

  return (
    <div>
      <label className="relative block border-b border-zinc-100 dark:border-white/5">
        <span className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-zinc-400">
          <SearchIcon className="size-4" />
        </span>
        <input
          aria-label="Buscar contacto"
          placeholder="Buscar por nombre, área o número"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-12 w-full bg-transparent pl-12 pr-5 text-sm outline-none placeholder:text-zinc-400"
        />
      </label>
      <ul className="divide-y divide-zinc-100 dark:divide-white/5">
        {visible.map((contact) => (
          <li key={contact.id}>
            <button
              type="button"
              onClick={() => onPick(contact.target)}
              title={`Marcar ${contact.target}`}
              className="flex min-h-16 w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-white/5"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-medium text-white">
                {initials(contact.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate">{contact.name}</span>
                {contact.department && <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">{contact.department}</span>}
              </span>
              <span className="shrink-0 font-mono text-sm text-zinc-500 dark:text-zinc-400">{contact.target}</span>
            </button>
          </li>
        ))}
      </ul>
      {visible.length === 0 && <Empty>Sin coincidencias.</Empty>}
    </div>
  )
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">{children}</p>
}

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
