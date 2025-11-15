import { Link } from 'react-router-dom'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'

export default function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12">
      <div className="max-w-md animate-[fade-in_0.4s_ease-out] rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-xl">
        <Alert
          variant="warning"
          title="403 - Access denied"
          message="You don’t have permission to view this resource. Contact your administrator if you believe this is an error."
        />
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" asChild>
            <Link to="/dashboard">Return to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
