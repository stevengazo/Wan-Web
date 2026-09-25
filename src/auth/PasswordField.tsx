import { useState, type InputHTMLAttributes } from 'react'
import { TextField } from '../ui/Field'
import { EyeIcon, EyeOffIcon, LockIcon } from '../ui/icons'

type Props = { label: string; error?: string; hint?: string } & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function PasswordField(props: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      icon={<LockIcon />}
      trailing={
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          className="flex size-11 items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  )
}
