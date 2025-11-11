import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [formErrors, setFormErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => () => clearError(), [clearError])

  const validate = useMemo(
    () => ({
      email: (value) =>
        !value
          ? 'Email is required'
          : !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
          ? 'Enter a valid email'
          : undefined,
      password: (value) =>
        !value ? 'Password is required' : value.length < 6 ? 'Password must be at least 6 characters' : undefined,
    }),
    [],
  )

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setFormErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = Object.entries(validate).reduce((acc, [key, fn]) => {
      const message = fn(form[key])
      if (message) acc[key] = message
      return acc
    }, {})

    setFormErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitted(true)
    try {
      await login(form.email, form.password)
      navigate('/', { replace: true })
    } catch (error) {
      console.error(error)
    } finally {
     setSubmitted(false)
   }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <div className="relative flex w-full flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:w-3/5 lg:px-12">
        <div className="w-full max-w-md animate-[fade-in_0.4s_ease-out]">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-sm font-semibold text-slate-800">YourCase Legal AI</span>
          </Link>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-600">Sign in to access your legal AI workspace.</p>
          </div>

          {(error || formErrors.global) && (
            <div className="mt-6 animate-[shake_0.3s_ease-in-out]">
              <Alert variant="error" title="Authentication failed" message={error || formErrors.global} dismissible onClose={clearError} />
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@firm.com"
              value={form.email}
              onChange={handleChange}
              icon={Mail}
              error={formErrors.email}
              disabled={isLoading || submitted}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              icon={Lock}
              error={formErrors.password}
              disabled={isLoading || submitted}
              required
            />

            <div className="flex items-center justify-between text-sm text-slate-500">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-400"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-blue-600 transition hover:text-blue-700">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={isLoading || submitted} disabled={isLoading || submitted} icon={ShieldCheck} iconPosition="right">
              Sign in
            </Button>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              or
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-blue-600 transition hover:text-blue-700">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="relative hidden min-h-screen w-full overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-slate-700 lg:block lg:w-2/5">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1528747045269-390fe33c19d4?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-20" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-between px-10 py-16 text-white">
          <div>
            <h2 className="text-2xl font-semibold">AI legal intelligence you can trust</h2>
            <p className="mt-4 max-w-sm text-sm text-white/80">
              YourCase empowers attorneys and legal teams with AI-assisted drafting, research, and matter management designed for compliance and confidentiality.
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 p-6 shadow-xl backdrop-blur">
            <p className="text-sm text-white/90">
              “We ship legal opinions twice as fast with YourCase. The AI assistant reads thousands of pages and produces briefing points that our partners trust.”
            </p>
            <div className="mt-4 flex items-center gap-3 text-sm text-white/70">
              <img src="https://i.pravatar.cc/64?img=11" alt="Client" className="h-10 w-10 rounded-full" />
              <div>
                <p className="font-semibold text-white">Amelia Harper</p>
                <p>Partner, Harper & Rowe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
