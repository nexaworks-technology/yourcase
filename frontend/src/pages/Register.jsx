import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Phone, ShieldPlus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Progress } from '../components/ui/Progress'

const roles = [
  { label: 'Lawyer', value: 'lawyer' },
  { label: 'Paralegal', value: 'paralegal' },
  { label: 'Admin', value: 'admin' },
]

export default function Register() {
  const navigate = useNavigate()
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'lawyer',
    firmName: '',
    terms: false,
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => () => clearError(), [clearError])

  const passwordStrength = useMemo(() => {
    const score = [
      /[A-Z]/.test(form.password),
      /[0-9]/.test(form.password),
      /[^A-Za-z0-9]/.test(form.password),
      form.password.length >= 8,
    ].filter(Boolean).length

    if (!form.password) return { label: 'Weak', color: 'error', value: 0 }
    if (score <= 2) return { label: 'Weak', color: 'error', value: 33 }
    if (score === 3) return { label: 'Medium', color: 'warning', value: 66 }
    return { label: 'Strong', color: 'success', value: 100 }
  }, [form.password])

  const validate = useMemo(
    () => ({
      firstName: (value) => (!value ? 'First name is required' : undefined),
      lastName: (value) => (!value ? 'Last name is required' : undefined),
      email: (value) =>
        !value
          ? 'Email is required'
          : !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
          ? 'Enter a valid email'
          : undefined,
      password: (value) =>
        !value
          ? 'Password is required'
          : value.length < 8
          ? 'Password must be at least 8 characters'
          : undefined,
      confirmPassword: (value) => (!value ? 'Please confirm password' : value !== form.password ? 'Passwords do not match' : undefined),
      terms: (value) => (!value ? 'You must accept the terms' : undefined),
      firmName: (value) => (!value ? 'Firm name is required' : undefined),
    }),
    [form.password],
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
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
        firmName: form.firmName,
      })
      navigate('/login', { replace: true })
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitted(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <div className="relative flex w-full flex-1 items-center justify-center px-4 py-12 sm:px-8 lg:w-3/5 lg:px-12">
        <div className="w-full max-w-2xl animate-[fade-in_0.4s_ease-out]">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-sm font-semibold text-slate-800">YourCase Legal AI</span>
          </Link>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-slate-900">Create your account</h1>
            <p className="text-sm text-slate-600">Join elite legal teams using AI to accelerate drafting and discovery.</p>
          </div>

          {(error || formErrors.global) && (
            <div className="mt-6 animate-[shake_0.3s_ease-in-out]">
              <Alert variant="error" title="Unable to sign up" message={error || formErrors.global} dismissible onClose={clearError} />
            </div>
          )}

          <form className="mt-8 grid gap-5 lg:grid-cols-2" onSubmit={handleSubmit}>
            <Input
              label="First name"
              name="firstName"
              placeholder="Amelia"
              value={form.firstName}
              onChange={handleChange}
              icon={User}
              error={formErrors.firstName}
              disabled={isLoading || submitted}
              required
            />
            <Input
              label="Last name"
              name="lastName"
              placeholder="Harper"
              value={form.lastName}
              onChange={handleChange}
              icon={User}
              error={formErrors.lastName}
              disabled={isLoading || submitted}
              required
            />
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
              label="Phone"
              name="phone"
              type="tel"
              placeholder="Optional"
              value={form.phone}
              onChange={handleChange}
              icon={Phone}
              disabled={isLoading || submitted}
            />

            <div className="lg:col-span-2 space-y-4">
              <div className="grid gap-5 lg:grid-cols-2">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  icon={Lock}
                  error={formErrors.password}
                  disabled={isLoading || submitted}
                  required
                />
                <Input
                  label="Confirm password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  icon={Lock}
                  error={formErrors.confirmPassword}
                  disabled={isLoading || submitted}
                  required
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-100/60 px-4 py-3 text-sm">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-700">Password strength</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Badge variant={passwordStrength.color} size="sm">{passwordStrength.label}</Badge>
                    <span>Use 8+ characters with uppercase, number, and symbol.</span>
                  </div>
                </div>
                <Progress value={passwordStrength.value} color={passwordStrength.color} showLabel={false} className="w-36" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Firm name"
              name="firmName"
              placeholder="e.g. Harper & Rowe LLP"
              value={form.firmName}
              onChange={handleChange}
              icon={ShieldPlus}
              error={formErrors.firmName}
              disabled={isLoading || submitted}
              required
            />

            <label className="lg:col-span-2 inline-flex items-start gap-3 rounded-2xl bg-slate-100/70 px-4 py-3 text-sm text-slate-600">
              <input
                type="checkbox"
                name="terms"
                checked={form.terms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-400"
              />
              <span>
                I agree to the{' '}
                <Link to="/terms" className="font-semibold text-blue-600 hover:text-blue-700">
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="font-semibold text-blue-600 hover:text-blue-700">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {formErrors.terms && <p className="lg:col-span-2 text-xs text-rose-500">{formErrors.terms}</p>}

            <Button
              type="submit"
              size="lg"
              className="lg:col-span-2 w-full"
              loading={isLoading || submitted}
              disabled={isLoading || submitted}
            >
              Create account
            </Button>

            <p className="lg:col-span-2 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 transition hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="relative hidden min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-700 lg:block lg:w-2/5">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-20" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-between px-10 py-16 text-white">
          <div>
            <h2 className="text-2xl font-semibold">Built for modern legal teams</h2>
            <p className="mt-4 max-w-sm text-sm text-white/80">
              Onboard your firm in minutes, manage cases with AI precision, and collaborate securely across matters and jurisdictions.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl bg-white/10 p-6 shadow-xl backdrop-blur">
              <p className="text-sm text-white/90">
                “YourCase transformed how we collaborate across offices. Templates, workflows, and AI drafting keep us ahead.”
              </p>
              <div className="mt-4 flex items-center gap-3 text-sm text-white/70">
                <img src="https://i.pravatar.cc/64?img=22" alt="Client" className="h-10 w-10 rounded-full" />
                <div>
                  <p className="font-semibold text-white">Daniel Chen</p>
                  <p>Managing Partner, Chen Monroe LLP</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/5 p-4 text-sm text-white/80">
              <p>Enterprise features:</p>
              <ul className="mt-2 space-y-1 text-white/60">
                <li>• AI workflows tailored to your practice</li>
                <li>• Secure document vault with analytics</li>
                <li>• Matter dashboards with real-time insights</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
