import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

const controlClass =
  'block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-2 focus:outline-indigo-500/30 aria-invalid:border-red-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500'

interface FieldProps {
  label: string
  error?: string
  hint?: string
  children: (props: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string; className: string }) => ReactNode
}

function Field({ label, error, hint, children }: FieldProps) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy, className: controlClass })}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-sm text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

// text-base (16 px) en los inputs evita que iOS Safari haga zoom al enfocar.
export function TextField({
  label,
  error,
  hint,
  trailing,
  ...props
}: {
  label: string
  error?: string
  hint?: string
  /** Acción al final del input (p. ej. mostrar contraseña). */
  trailing?: ReactNode
} & InputHTMLAttributes<HTMLInputElement>) {
  if (!trailing) {
    return (
      <Field label={label} error={error} hint={hint}>
        {(control) => <input {...props} {...control} />}
      </Field>
    )
  }

  return (
    <Field label={label} error={error} hint={hint}>
      {({ className, ...control }) => (
        <div className="relative">
          <input {...props} {...control} className={`${className} pr-12`} />
          <span className="absolute inset-y-0 right-0 flex items-center">{trailing}</span>
        </div>
      )}
    </Field>
  )
}

export function SelectField({
  label,
  error,
  children,
  ...props
}: { label: string; error?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Field label={label} error={error}>
      {(control) => (
        <select {...props} {...control}>
          {children}
        </select>
      )}
    </Field>
  )
}

export function TextAreaField({
  label,
  error,
  hint,
  ...props
}: { label: string; error?: string; hint?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} error={error} hint={hint}>
      {({ className, ...control }) => <textarea {...props} {...control} className={`${className} py-2.5`} />}
    </Field>
  )
}
