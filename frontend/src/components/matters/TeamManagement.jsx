import PropTypes from 'prop-types'
import { useState } from 'react'
import { Mail, Phone, ShieldCheck, Trash2, UserPlus } from 'lucide-react'

import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { matterService } from '../../services/matterService'

export function TeamManagement({ matterId, team = [], onTeamChanged }) {
  const [showInvite, setShowInvite] = useState(false)
  const [invite, setInvite] = useState({ email: '', role: 'associate' })
  const [saving, setSaving] = useState(false)

  const handleInvite = async () => {
    if (!invite.email) return
    setSaving(true)
    try {
      // Look up user by email in firm, then assign
      const res = await matterService.searchFirmUsers(invite.email, 1)
      const user = (res.items || [])[0]
      if (!user) {
        setSaving(false)
        return
      }
      const currentIds = team.map((m) => m.id)
      const nextIds = Array.from(new Set([...currentIds, user.id]))
      await matterService.assignLawyers(matterId, nextIds)
      onTeamChanged?.()
      setInvite({ email: '', role: 'associate' })
      setShowInvite(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card variant="bordered" padding="md" className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Matter team</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Manage who has access, their roles, and collaboration permissions.</p>
        </div>
        <Button variant="primary" size="sm" icon={UserPlus} onClick={() => setShowInvite(true)}>
          Add team member
        </Button>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Member</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Assigned</th>
              <th className="px-4 py-3 text-left">Activity</th>
              <th className="px-4 py-3 text-left">Permissions</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {team.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-slate-500 dark:text-slate-400 dark:text-slate-500">
                  No team members assigned yet. Invite collaborators to get started.
                </td>
              </tr>
            ) : (
              team.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 dark:bg-slate-900">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={member.avatar} alt={member.name} className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{member.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{member.title || 'Associate'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{member.role || 'associate'}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        {member.email}
                      </span>
                      {member.phone && (
                        <span className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          {member.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{member.assignedAt ? new Date(member.assignedAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col gap-1">
                      <span>{member.activity?.documents || 0} documents</span>
                      <span>{member.activity?.queries || 0} queries</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="primary" size="sm" className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      {member.permissions || 'Workspace'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={async () => {
                        const remaining = team.filter((t) => t.id !== member.id).map((m) => m.id)
                        await matterService.assignLawyers(matterId, remaining)
                        onTeamChanged?.()
                      }}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        title="Invite team member"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleInvite} loading={saving}>
              Send invite
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="colleague@firm.com"
            value={invite.email}
            onChange={(event) => setInvite((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">Role</label>
            <select
              value={invite.role}
              onChange={(event) => setInvite((prev) => ({ ...prev, role: event.target.value }))}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-600 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
            >
              <option value="lead">Lead counsel</option>
              <option value="associate">Associate</option>
              <option value="paralegal">Paralegal</option>
              <option value="client">Client contact</option>
            </select>
          </div>
        </div>
      </Modal>
    </Card>
  )
}

TeamManagement.propTypes = {
  team: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string,
      phone: PropTypes.string,
      avatar: PropTypes.string,
      role: PropTypes.string,
      permissions: PropTypes.string,
      assignedAt: PropTypes.string,
      activity: PropTypes.shape({
        documents: PropTypes.number,
        queries: PropTypes.number,
      }),
      title: PropTypes.string,
    }),
  ),
  onAddMember: PropTypes.func,
  onRemoveMember: PropTypes.func,
  onUpdateRole: PropTypes.func,
}

TeamManagement.defaultProps = {
  team: [],
  onAddMember: undefined,
  onRemoveMember: undefined,
  onUpdateRole: undefined,
}

export default TeamManagement
