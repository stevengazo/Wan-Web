import { motion } from 'motion/react'
import { Button } from '@/components/atoms/Button'

/** Hoja inferior en móvil, diálogo centrado desde sm:. */
export function ConfirmSheet(props: {
  title: string
  description: string
  error?: string
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <motion.div
      className="fixed inset-0 z-30 flex items-end bg-zinc-950/50 sm:items-center sm:justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={props.onCancel}
    >
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full space-y-4 rounded-t-3xl bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-3xl dark:bg-zinc-900"
      >
        <h2 id="confirm-title" className="text-lg font-semibold">
          {props.title}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">{props.description}</p>
        {props.error && <p className="text-sm text-red-600 dark:text-red-400">{props.error}</p>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={props.onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" loading={props.loading} onClick={props.onConfirm}>
            Eliminar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
