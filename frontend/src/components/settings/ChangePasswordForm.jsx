import { useState } from 'react'
import PropTypes from 'prop-types'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'

import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Progress } from '../ui/Progress'

const strengthLabels = ['Weak', 'Okay', 'Strong', 'Excellent']

function evaluatePassword(password) {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return score
}

export function ChangePasswordForm({ onChangePassword, loading }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [show, setShow] = useState({ current: false, next: false, confirm: false })

  const score = evaluatePassword(newPassword)
  const percent = (score / (strengthLabels.length - 1)) * 100
  const strengthLabel = strengthLabels[score] ?? 'Weak'

  const handleSubmit = (event) => {
    event.preventDefault()
    if (newPassword !== confirmPassword) return
    onChangePassword?.({ currentPassword, newPassword })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Current password"
        type={show.current ? 'text' : 'password'}
        value={currentPassword}
        onChange={(event) => setCurrentPassword(event.target.value)}
        required
        icon={show.current ? EyeOff : Eye}
        onIconClick={() => setShow((prev) => ({ ...prev, current: !prev.current }))}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="New password"
          type={show.next ? 'text' : 'password'}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
          icon={show.next ? EyeOff : Eye}
          onIconClick={() => setShow((prev) => ({ ...prev, next: !prev.next }))}
        />
        <Input
          label="Confirm new password"
          type={show.confirm ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          icon={show.confirm ? EyeOff : Eye}
          onIconClick={() => setShow((prev) => ({ ...prev, confirm: !prev.confirm }))}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Password strength</span>
          <span className="flex items-center gap-1 text-slate-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            {strengthLabel}
          </span>
        </div>
        <Progress value={percent} className="h-2 rounded-full" />
      </div>
      <Button type="submit" variant="primary" loading={loading}>
        Change password
      </Button>
    </form>
  )
}

ChangePasswordForm.propTypes = {
  onChangePassword: PropTypes.func,
  loading: PropTypes.bool,
}

ChangePasswordForm.defaultProps = {
  onChangePassword: undefined,
  loading: false,
}

export default ChangePasswordForm
