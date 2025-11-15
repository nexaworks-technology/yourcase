import { Link } from 'react-router-dom'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'

export default function ServerError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-12">
      <div className="max-w-md animate-[fade-in_0.4s_ease-out] rounded-3xl border border-white/20 bg-white dark:bg-slate-900/10 p-8 shadow-xl backdrop-blur">
        <Alert
          variant="error"
          title="500 - Server error"
          message="Something went wrong on our end. Please try again in a moment or contact support."
        />
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" asChild>
            <Link to="/dashboard">Return home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/support">Contact support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
