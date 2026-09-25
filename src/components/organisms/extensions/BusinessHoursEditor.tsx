import { Switch } from '@/components/atoms/Switch'
import { SelectField, TextAreaField } from '@/components/molecules/Field'
import type { BusinessDay, BusinessHours, DayOfWeek } from '@/services/api'
import { defaultBusinessHours, week } from './businessHoursDefaults'


const commonZones = [
  'America/Costa_Rica',
  'America/Mexico_City',
  'America/Guatemala',
  'America/Panama',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  'America/Argentina/Buenos_Aires',
  'America/New_York',
  'Europe/Madrid',
  'UTC',
]

interface BusinessHoursEditorProps {
  value: BusinessHours
  onChange: (value: BusinessHours) => void
  error?: string
}

/** Días y horas de atención, descanso, zona horaria y lo que dice el bot fuera de horario. */
export function BusinessHoursEditor({ value, onChange, error }: BusinessHoursEditorProps) {
  const set = (patch: Partial<BusinessHours>) => onChange({ ...value, ...patch })
  const dayOf = (day: DayOfWeek) => value.days.find((d) => d.day === day)

  const toggleDay = (day: DayOfWeek, open: boolean) => {
    const template = value.days[0] ?? { opens: '08:00:00', closes: '17:00:00', breakStarts: null, breakEnds: null }
    const days = open
      ? [...value.days, { ...template, day }]
      : value.days.filter((d) => d.day !== day)
    set({ days: week.map((w) => days.find((d) => d.day === w.day)).filter((d): d is BusinessDay => !!d) })
  }

  const updateDay = (day: DayOfWeek, patch: Partial<BusinessDay>) =>
    set({ days: value.days.map((d) => (d.day === day ? { ...d, ...patch } : d)) })

  const copyToAll = (source: BusinessDay) => set({ days: value.days.map((d) => ({ ...source, day: d.day })) })

  const zones = commonZones.includes(value.timeZone) ? commonZones : [value.timeZone, ...commonZones]

  return (
    <div className="space-y-5">
      <Switch
        label="Usar horario de atención"
        description="Fuera de horario o en el descanso el bot no transfiere llamadas y dice el mensaje de abajo."
        checked={value.enabled}
        onChange={(enabled) =>
          // Primera vez (sin días): se parte del horario sugerido en vez de todo cerrado.
          enabled && value.days.length === 0 ? onChange({ ...defaultBusinessHours(), enabled }) : set({ enabled })
        }
      />

      {value.enabled && (
        <>
          <SelectField label="Zona horaria" value={value.timeZone} onChange={(e) => set({ timeZone: e.target.value })}>
            {zones.map((zone) => (
              <option key={zone} value={zone}>
                {zone.replace(/_/g, ' ')}
              </option>
            ))}
          </SelectField>

          <div className="divide-y divide-zinc-100 border border-zinc-200 dark:divide-white/5 dark:border-white/10">
            {week.map(({ day, label }) => {
              const current = dayOf(day)
              return (
                <div key={day} className="space-y-2 px-3 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex min-h-10 w-28 items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={!!current}
                        onChange={(e) => toggleDay(day, e.target.checked)}
                        className="size-4 accent-brand-600"
                      />
                      {label}
                    </label>
                    {current ? (
                      <>
                        <TimeRange
                          from={current.opens}
                          to={current.closes}
                          labels={['Abre', 'Cierra']}
                          onChange={(opens, closes) => updateDay(day, { opens, closes })}
                        />
                        <button
                          type="button"
                          onClick={() => copyToAll(current)}
                          className="ml-auto text-xs text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-white"
                        >
                          Copiar a todos
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-zinc-400">Cerrado</span>
                    )}
                  </div>
                  {current && (
                    <div className="flex flex-wrap items-center gap-3 pl-0 sm:pl-31">
                      {current.breakStarts ? (
                        <>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">Descanso</span>
                          <TimeRange
                            from={current.breakStarts}
                            to={current.breakEnds ?? current.breakStarts}
                            labels={['Inicio del descanso', 'Fin del descanso']}
                            onChange={(breakStarts, breakEnds) => updateDay(day, { breakStarts, breakEnds })}
                          />
                          <button
                            type="button"
                            onClick={() => updateDay(day, { breakStarts: null, breakEnds: null })}
                            className="text-xs text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
                          >
                            Quitar
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateDay(day, { breakStarts: '12:00:00', breakEnds: '13:00:00' })}
                          className="text-xs text-brand-600 underline-offset-4 hover:underline dark:text-brand-400"
                        >
                          + Agregar descanso
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <TextAreaField
            label="Mensaje fuera de horario"
            rows={3}
            value={value.closedMessage ?? ''}
            onChange={(e) => set({ closedMessage: e.target.value || null })}
            hint="Lo dice el bot cuando llaman fuera de horario. Después ofrece tomar un recado si tiene la herramienta."
          />
          <TextAreaField
            label="Mensaje en el descanso (opcional)"
            rows={2}
            placeholder="Vacío = el mismo de fuera de horario"
            value={value.breakMessage ?? ''}
            onChange={(e) => set({ breakMessage: e.target.value || null })}
          />
        </>
      )}
    </div>
  )
}

function TimeRange(props: { from: string; to: string; labels: [string, string]; onChange: (from: string, to: string) => void }) {
  // input type="time" usa HH:mm; la API espera HH:mm:ss.
  const toApi = (value: string) => (value.length === 5 ? `${value}:00` : value)
  const input =
    'min-h-10 border border-zinc-300 bg-white px-2 font-mono text-sm tabular-nums dark:border-white/15 dark:bg-zinc-900 dark:[color-scheme:dark]'
  return (
    <span className="flex items-center gap-2">
      <input
        type="time"
        aria-label={props.labels[0]}
        value={props.from.slice(0, 5)}
        onChange={(e) => props.onChange(toApi(e.target.value), props.to)}
        className={input}
      />
      <span className="text-zinc-400">–</span>
      <input
        type="time"
        aria-label={props.labels[1]}
        value={props.to.slice(0, 5)}
        onChange={(e) => props.onChange(props.from, toApi(e.target.value))}
        className={input}
      />
    </span>
  )
}
