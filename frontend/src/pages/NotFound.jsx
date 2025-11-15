import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12">
      <div className="max-w-lg text-center">
        <Alert variant="info" title="404 - Page not found" message="The page you are looking for was moved, removed, or might never existed." />
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button asChild>
            <Link to="/">Back to dashboard</Link>
          </Button>
          <Link to="/support" className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-blue-600">
            Need help? Contact support
          </Link>
        </div>
      </div>
    </div>
  )
}
