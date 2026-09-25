import { Toaster as HotToaster } from 'react-hot-toast'

/** Toasts con la estética del panel; arriba al centro en móvil para no tapar la barra inferior. */
export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      gutter={8}
      toastOptions={{
        duration: 3500,
        className:
          '!rounded-xl !bg-white !px-4 !py-3 !text-sm !text-zinc-900 !shadow-lg !ring-1 !ring-zinc-200 dark:!bg-zinc-900 dark:!text-zinc-100 dark:!ring-white/10',
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error: { duration: 5000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  )
}
