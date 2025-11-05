import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { router } from './router'
import { ErrorBoundary } from './components/ErrorBoundary'

const queryClient = new QueryClient()

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors position="top-center" />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
