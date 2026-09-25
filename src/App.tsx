import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Link, RouterProvider } from 'react-router'
import { ApiError } from './api/client'
import { RequireAuth } from './auth/RequireAuth'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

// Carga diferida: el login no descarga SignalR ni el resto del panel (importa en móvil con red lenta).
const AppLayout = lazy(() => import('./layout/AppLayout').then((m) => ({ default: m.AppLayout })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const ExtensionsPage = lazy(() => import('./pages/ExtensionsPage').then((m) => ({ default: m.ExtensionsPage })))
const ExtensionFormPage = lazy(() => import('./pages/ExtensionFormPage').then((m) => ({ default: m.ExtensionFormPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const DirectoryPage = lazy(() => import('./pages/DirectoryPage').then((m) => ({ default: m.DirectoryPage })))
const DirectoryFormPage = lazy(() => import('./pages/DirectoryFormPage').then((m) => ({ default: m.DirectoryFormPage })))
const FormsPage = lazy(() => import('./pages/FormsPage').then((m) => ({ default: m.FormsPage })))
const FormDetailPage = lazy(() => import('./pages/FormDetailPage').then((m) => ({ default: m.FormDetailPage })))
const FormEditorPage = lazy(() => import('./pages/FormEditorPage').then((m) => ({ default: m.FormEditorPage })))
const MessagesPage = lazy(() => import('./pages/MessagesPage').then((m) => ({ default: m.MessagesPage })))
const RecordingsPage = lazy(() => import('./pages/RecordingsPage').then((m) => ({ default: m.RecordingsPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Reintentar errores 4xx no sirve: la respuesta no va a cambiar.
      retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2,
    },
  },
})

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/registro', element: <RegisterPage /> },
  {
    element: (
      <RequireAuth>
        <Suspense fallback={<div className="min-h-dvh" />}>
          <AppLayout />
        </Suspense>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'extensiones', element: <ExtensionsPage /> },
      {
        path: 'extensiones/nueva',
        element: (
          <RequireAuth admin>
            <ExtensionFormPage />
          </RequireAuth>
        ),
      },
      {
        path: 'extensiones/:id',
        element: (
          <RequireAuth admin>
            <ExtensionFormPage />
          </RequireAuth>
        ),
      },
      { path: 'directorio', element: <DirectoryPage /> },
      {
        path: 'directorio/nueva',
        element: (
          <RequireAuth admin>
            <DirectoryFormPage />
          </RequireAuth>
        ),
      },
      {
        path: 'directorio/:id',
        element: (
          <RequireAuth admin>
            <DirectoryFormPage />
          </RequireAuth>
        ),
      },
      { path: 'recados', element: <MessagesPage /> },
      { path: 'grabaciones', element: <RecordingsPage /> },
      { path: 'formularios', element: <FormsPage /> },
      {
        path: 'formularios/nuevo',
        element: (
          <RequireAuth admin>
            <FormEditorPage />
          </RequireAuth>
        ),
      },
      { path: 'formularios/:id', element: <FormDetailPage /> },
      {
        path: 'formularios/:id/editar',
        element: (
          <RequireAuth admin>
            <FormEditorPage />
          </RequireAuth>
        ),
      },
      { path: 'perfil', element: <ProfilePage /> },
      {
        path: 'configuracion',
        element: (
          <RequireAuth admin>
            <SettingsPage />
          </RequireAuth>
        ),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])

function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="text-lg font-medium">Página no encontrada</p>
      <Link to="/" className="mt-2 inline-flex min-h-11 items-center font-medium text-indigo-600 dark:text-indigo-400">
        Volver al inicio
      </Link>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App
