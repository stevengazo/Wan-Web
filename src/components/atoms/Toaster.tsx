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
          '!rounded-xl !bg-white !px-4 !py-3 !text-sm !text-slate-900 !shadow-lg !ring-1 !ring-slate-200 dark:!bg-slate-900 dark:!text-slate-100 dark:!ring-white/10',
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error: { duration: 5000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  )
}
