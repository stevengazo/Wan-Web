import { AnimatePresence, motion } from 'motion/react'

/** Confirmación breve junto al botón de guardar. */
export function Saved({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          role="status"
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="text-sm text-emerald-600 dark:text-emerald-400"
        >
          Guardado
        </motion.span>
      )}
    </AnimatePresence>
  )
}
