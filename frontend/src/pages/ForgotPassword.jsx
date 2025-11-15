import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
	export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    setMessage('If we found an account with that email, a reset link will appear in your inbox shortly.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md animate-[fade-in_0.4s_ease-out] rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-xl">
        <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 transition hover:text-slate-700 dark:hover:text-slate-200 dark:text-slate-300">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>

        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Forgot password?</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Enter your email and we’ll send you a secure link to reset your password.</p>
        </div>

        {submitted && (
          <div className="mt-6">
            <Alert variant="info" title="Email sent" message={message} />
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="you@firm.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            icon={Mail}
            required
          />

          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </form>
      </div>
    </div>
  )
}
