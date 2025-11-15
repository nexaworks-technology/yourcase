import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'

import { PageHeader } from '../components/layout/PageHeader'
import { SettingsSidebar } from '../components/settings/SettingsSidebar'
import { SettingsSection } from '../components/settings/SettingsSection'
import { ChangePasswordForm } from '../components/settings/ChangePasswordForm'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'
import { Progress } from '../components/ui/Progress'
import { Switch } from '../components/ui/Switch'
import { userService } from '../services/userService'
import { NotificationToggles } from '../components/settings/NotificationToggles'
import { ThemeSelector } from '../components/settings/ThemeSelector'
import { useTheme } from '../context/ThemeContext'
import { useSettingsStore } from '../store/settingsStore'

const initialProfile = {
  firstName: 'Sahil',
  lastName: 'Kapoor',
  email: 'sahil@example.com',
  phone: '+91 99999 99999',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sahil',
  bio: 'Senior legal associate specialising in corporate compliance and AI-assisted drafting.',
  location: 'New Delhi, India',
  language: 'English',
  timezone: 'Asia/Kolkata',
}

const sessionData = [
  { id: 'browser-01', device: 'MacBook Pro', browser: 'Chrome 123', location: 'New Delhi, IN', lastActive: 'Just now', current: true },
  { id: 'browser-02', device: 'iPhone 15', browser: 'Safari', location: 'Mumbai, IN', lastActive: '2h ago' },
  { id: 'browser-03', device: 'Windows PC', browser: 'Edge', location: 'Bengaluru, IN', lastActive: 'Yesterday' },
]

const loginHistory = [
  { id: 1, date: '12 Jan 2025', time: '09:21', location: 'New Delhi, IN', device: 'Chrome · macOS', status: 'Success' },
  { id: 2, date: '11 Jan 2025', time: '22:08', location: 'Mumbai, IN', device: 'Safari · iOS', status: 'Success' },
  { id: 3, date: '10 Jan 2025', time: '14:37', location: 'Unknown', device: 'Firefox · Linux', status: 'Blocked' },
]

const teamMembers = [
  { id: 'tm-1', name: 'Riya Sharma', email: 'riya@yourcase.in', role: 'Admin', status: 'Active', lastActive: '2h ago', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RS' },
  { id: 'tm-2', name: 'Aarav Mehta', email: 'aarav@yourcase.in', role: 'Associate', status: 'Active', lastActive: 'Yesterday', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AM' },
  { id: 'tm-3', name: 'Neha Gupta', email: 'neha@yourcase.in', role: 'Paralegal', status: 'Invited', lastActive: '—', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=NG' },
]

const pendingInvites = [
  { email: 'client@firm.com', role: 'Client', invitedAt: '5 Jan 2025' },
]

const integrations = [
  { id: 'm365', name: 'Microsoft 365', status: 'Connected', lastSynced: 'Today 10:14', description: 'Sync Word templates and Outlook calendars.' },
  { id: 'google', name: 'Google Workspace', status: 'Not connected', lastSynced: null, description: 'Sync Drive files and Gmail threads.' },
  { id: 'slack', name: 'Slack', status: 'Connected', lastSynced: 'Today 08:02', description: 'Receive AI briefings inside channels.' },
  { id: 'zapier', name: 'Zapier', status: 'Not connected', lastSynced: null, description: 'Automate workflows with 5,000+ apps.' },
]

const apiKeys = [
  { id: 'key-1', name: 'Production key', createdAt: '02 Dec 2024', lastUsed: 'Yesterday', masked: 'yc_pk_live_******9f1' },
  { id: 'key-2', name: 'Staging key', createdAt: '14 Oct 2024', lastUsed: '3 days ago', masked: 'yc_pk_test_******dd4' },
]

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile')
  const [profile, setProfile] = useState(initialProfile)
  const [notice, setNotice] = useState(null)
  const { notifications, preferences, theme: storedTheme, accentColor: storedAccent, updateNotifications, updatePreferences, setTheme: setStoredTheme, setAccentColor: setStoredAccent } = useSettingsStore()
  const { theme, accentColor, setTheme, setAccentColor } = useTheme()

  const handleThemeChange = (value) => {
    setStoredTheme(value)
    setTheme(value)
  }

  const handleAccentChange = (value) => {
    setStoredAccent(value)
    setAccentColor(value)
  }

  useEffect(() => {
    if (storedTheme && storedTheme !== theme) {
      setTheme(storedTheme)
    }
  }, [storedTheme, theme, setTheme])

  useEffect(() => {
    if (storedAccent && storedAccent !== accentColor) {
      setAccentColor(storedAccent)
    }
  }, [storedAccent, accentColor, setAccentColor])

  const profileMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => setNotice({ type: 'success', message: 'Profile updated successfully.' }),
    onError: (error) => setNotice({ type: 'error', message: error.message || 'Failed to update profile.' }),
  })

  const passwordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }) => userService.changePassword(currentPassword, newPassword),
    onSuccess: () => setNotice({ type: 'success', message: 'Password changed successfully.' }),
    onError: (error) => setNotice({ type: 'error', message: error.message || 'Current password incorrect.' }),
  })

  useQuery({
    queryKey: ['profile'],
    queryFn: () => Promise.resolve(initialProfile),
    onSuccess: (data) => setProfile(data),
  })

  const sections = (
    <div className="space-y-8">
      <SettingsSection
        id="profile"
        title="Profile"
        description="Manage how your identity appears to clients and teammates across YourCase."
        onSave={() => profileMutation.mutate(profile)}
        saving={profileMutation.isLoading}
      >
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
          <img src={profile.avatar} alt={profile.firstName} className="h-20 w-20 rounded-full object-cover" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">{profile.email}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
              <Badge variant="primary" size="sm">
                Senior Associate
              </Badge>
              <span>Member since 2021</span>
            </div>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" size="sm">
              Change avatar
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="First name"
            value={profile.firstName}
            onChange={(event) => setProfile((prev) => ({ ...prev, firstName: event.target.value }))}
            required
          />
          <Input
            label="Last name"
            value={profile.lastName}
            onChange={(event) => setProfile((prev) => ({ ...prev, lastName: event.target.value }))}
            required
          />
          <Input
            label="Phone number"
            value={profile.phone}
            onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
          />
          <Input
            label="Avatar URL"
            value={profile.avatar}
            onChange={(event) => setProfile((prev) => ({ ...prev, avatar: event.target.value }))}
          />
          <Input
            label="Location"
            value={profile.location}
            onChange={(event) => setProfile((prev) => ({ ...prev, location: event.target.value }))}
          />
          <Input
            label="Language"
            value={profile.language}
            onChange={(event) => setProfile((prev) => ({ ...prev, language: event.target.value }))}
          />
          <Input
            label="Timezone"
            value={profile.timezone}
            onChange={(event) => setProfile((prev) => ({ ...prev, timezone: event.target.value }))}
          />
          <Textarea
            label="Bio"
            value={profile.bio}
            onChange={(event) => setProfile((prev) => ({ ...prev, bio: event.target.value }))}
            rows={3}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        id="account"
        title="Account"
        description="Control your account credentials, subscription, and identification."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Account information</h4>
            <dl className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex justify-between"><dt>User ID</dt><dd>#YC-02948</dd></div>
              <div className="flex justify-between"><dt>Email</dt><dd>{profile.email}</dd></div>
              <div className="flex justify-between"><dt>Account type</dt><dd>Professional</dd></div>
              <div className="flex justify-between"><dt>Subscription</dt><dd>Enterprise annual</dd></div>
            </dl>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-amber-800">Delete account</h4>
            <p className="mt-2 text-xs text-amber-700">
              Deleting your account removes all matters, templates, and analytics permanently. This action cannot be undone.
            </p>
            <Button variant="danger" size="sm" className="mt-4">
              Delete account
            </Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="security" title="Security" description="Protect your account with strong passwords and multi-factor authentication.">
        <ChangePasswordForm onChangePassword={passwordMutation.mutate} loading={passwordMutation.isLoading} />
      </SettingsSection>

      <SettingsSection
        id="notifications"
        title="Notifications"
        description="Choose how YourCase keeps you informed about matters and activity."
        onSave={() => userService.updateNotificationSettings(notifications).then(() => setNotice({ type: 'success', message: 'Notification preferences saved.' }))}
      >
        <NotificationToggles
          groups={[
            {
              title: 'Email alerts',
              items: [
                { id: 'queryResponses', label: 'Query responses', description: 'Receive alerts when AI finishes answering a query.', enabled: notifications.queryResponses },
                { id: 'documentAnalysis', label: 'Document analysis', description: 'Notified when AI completes document review.', enabled: notifications.documentAnalysis },
                { id: 'matterUpdates', label: 'Matter updates', description: 'Changes to matters you follow.', enabled: notifications.matterUpdates },
                { id: 'teamMentions', label: 'Team mentions', description: 'When collaborators mention you.', enabled: notifications.teamMentions },
                { id: 'weeklySummary', label: 'Weekly summary', description: 'Highlights from the past week.', enabled: notifications.weeklySummary },
                { id: 'marketing', label: 'Product updates & offers', enabled: notifications.marketing },
              ],
            },
            {
              title: 'In-app notifications',
              items: [
                { id: 'push', label: 'Push notifications', enabled: notifications.push },
                { id: 'sound', label: 'Sound alerts', enabled: notifications.sound },
                { id: 'desktop', label: 'Desktop notifications', enabled: notifications.desktop },
              ],
            },
          ]}
          onChange={(id, value) => updateNotifications({ [id]: value })}
        />
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 shadow-sm">
          <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Frequency</span>
          {['instant', 'daily', 'weekly'].map((option) => (
            <button
              key={option}
              type="button"
              className={`rounded-full border px-3 py-1 text-xs transition ${
                notifications.frequency === option ? 'border-blue-200 bg-blue-50 text-blue-600 shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800'
              }`}
              onClick={() => updateNotifications({ frequency: option })}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)} digest
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        id="preferences"
        title="Preferences"
        description="Customise AI behaviour, UI, and regional formatting."
        onSave={() => userService.updatePreferences(preferences).then(() => setNotice({ type: 'success', message: 'Preferences updated.' }))}
      >
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI preferences</h4>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Default model</label>
                <select
                  value={preferences.aiModel}
                  onChange={(event) => updatePreferences({ aiModel: event.target.value })}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-600 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
                >
                  <option value="Gemini Pro">Gemini Pro</option>
                  <option value="Gemini Flash">Gemini Flash</option>
                  <option value="GPT-4.1">GPT-4.1</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Temperature ({preferences.temperature})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={preferences.temperature}
                  onChange={(event) => updatePreferences({ temperature: Number(event.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Max tokens ({preferences.maxTokens})</label>
                <input
                  type="range"
                  min="512"
                  max="4096"
                  step="256"
                  value={preferences.maxTokens}
                  onChange={(event) => updatePreferences({ maxTokens: Number(event.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Default query type</label>
                <select
                  value={preferences.defaultQueryType}
                  onChange={(event) => updatePreferences({ defaultQueryType: event.target.value })}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-600 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
                >
                  <option>Summary</option>
                  <option>Draft response</option>
                  <option>Legal research</option>
                  <option>Clause analysis</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">UI preferences</h4>
            <ThemeSelector value={theme} onChange={handleThemeChange} accentColor={accentColor} onAccentChange={handleAccentChange} />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 shadow-sm">
                Compact mode
                <Switch checked={preferences.compactMode} onCheckedChange={(value) => updatePreferences({ compactMode: value })} />
              </label>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Default view</label>
                <select
                  value={preferences.defaultView}
                  onChange={(event) => updatePreferences({ defaultView: event.target.value })}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-600 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Regional settings</h4>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <Input
                label="Language"
                value={preferences.language}
                onChange={(event) => updatePreferences({ language: event.target.value })}
              />
              <Input
                label="Timezone"
                value={preferences.timezone}
                onChange={(event) => updatePreferences({ timezone: event.target.value })}
              />
              <Input
                label="Date format"
                value={preferences.dateFormat}
                onChange={(event) => updatePreferences({ dateFormat: event.target.value })}
              />
              <Input
                label="Currency"
                value={preferences.currency}
                onChange={(event) => updatePreferences({ currency: event.target.value })}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Editor preferences</h4>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <Input
                label="Font size"
                type="number"
                value={preferences.editorFontSize}
                onChange={(event) => updatePreferences({ editorFontSize: Number(event.target.value) })}
              />
              <Input
                label="Line spacing"
                type="number"
                step="0.1"
                value={preferences.editorLineSpacing}
                onChange={(event) => updatePreferences({ editorLineSpacing: Number(event.target.value) })}
              />
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 shadow-sm md:col-span-2">
                Auto-save drafts
                <Switch checked={preferences.autoSave} onCheckedChange={(value) => updatePreferences({ autoSave: value })} />
              </label>
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="billing" title="Billing" description="Review plan details, usage metrics, and invoices.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <header className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Professional plan</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Billed annually • Next billing 12 Jan 2026</p>
              </div>
              <Button variant="secondary" size="sm">
                Upgrade
              </Button>
            </header>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">₹8,499<span className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">/month</span></p>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span>API calls</span>
                  <span>32,000 / 50,000</span>
                </div>
                <Progress value={64} className="mt-1" />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span>Storage</span>
                  <span>62 GB / 100 GB</span>
                </div>
                <Progress value={62} className="mt-1" />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                <span>Team members</span>
                <span>18 / 25</span>
              </div>
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Payment method</h4>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
              <span>Visa ending •••• 4242</span>
              <span>Expires 03/27</span>
            </div>
            <Button variant="ghost" size="sm">
              Update payment method
            </Button>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Billing history</h4>
          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 dark:text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { date: '12 Dec 2024', amount: '₹8,499', status: 'Paid' },
                  { date: '12 Nov 2024', amount: '₹8,499', status: 'Paid' },
                  { date: '12 Oct 2024', amount: '₹8,499', status: 'Paid' },
                ].map((invoice) => (
                  <tr key={invoice.date}>
                    <td className="px-4 py-3">{invoice.date}</td>
                    <td className="px-4 py-3">{invoice.amount}</td>
                    <td className="px-4 py-3">{invoice.status}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="team" title="Team" description="Manage workspace members, roles, and invitations.">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Team members</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Active colleagues who can access this workspace.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setNotice({ type: 'info', message: 'Invitations coming soon.' })}>
              Invite member
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                <img src={member.avatar} alt={member.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{member.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{member.email}</p>
                </div>
                <Badge variant="secondary" size="sm">
                  {member.role}
                </Badge>
                <span className="text-xs text-slate-400 dark:text-slate-500">Last active {member.lastActive}</span>
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    Edit role
                  </Button>
                  <Button variant="ghost" size="sm">
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Pending invitations</h4>
          <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {pendingInvites.map((invite) => (
              <div key={invite.email} className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{invite.email}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Role: {invite.role}</p>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">Invited {invite.invitedAt}</span>
              </div>
            ))}
            {pendingInvites.length === 0 && <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">No pending invitations.</p>}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Team settings</h4>
          <label className="mt-3 flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
            Allow members to invite others
            <Switch checked onCheckedChange={() => setNotice({ type: 'info', message: 'Team settings coming soon.' })} />
          </label>
          <div className="mt-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Default role</label>
            <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-600 dark:text-slate-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none">
              <option>Associate</option>
              <option>Paralegal</option>
              <option>Viewer</option>
            </select>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="integrations" title="Integrations" description="Connect YourCase with third-party platforms and webhooks.">
        <div className="grid gap-4 md:grid-cols-2">
          {integrations.map((integration) => (
            <div key={integration.id} className="space-y-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{integration.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{integration.description}</p>
                </div>
                <Badge variant={integration.status === 'Connected' ? 'success' : 'secondary'} size="sm">
                  {integration.status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
                <span>Last synced {integration.lastSynced || '—'}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" size="sm">
                  {integration.status === 'Connected' ? 'Manage' : 'Connect'}
                </Button>
                {integration.status === 'Connected' && (
                  <Button variant="ghost" size="sm">
                    Disconnect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Webhooks</h4>
          <Input label="Webhook URL" placeholder="https://example.com/webhook" />
          <Textarea label="Events" placeholder="document.created, matter.updated" rows={2} />
          <div className="flex flex-wrap items-center gap-2">
            <Input label="Secret" placeholder="Auto-generated secret" />
            <Button variant="secondary" size="sm">
              Test webhook
            </Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="api" title="API Keys" description="Generate and manage API credentials for automations.">
        <div className="space-y-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Keys</h4>
            <Button variant="primary" size="sm">
              Generate key
            </Button>
          </div>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{key.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Created {key.createdAt} · Last used {key.lastUsed}</p>
                </div>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{key.masked}</span>
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    Copy
                  </Button>
                  <Button variant="ghost" size="sm">
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
            Need help? Read the <a href="#" className="text-blue-600">API documentation</a>.
          </div>
        </div>
      </SettingsSection>

      <SettingsSection id="about" title="About" description="Release notes, server status, and support resources.">
        <div className="space-y-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3 text-sm text-slate-600 dark:text-slate-300">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Version</p>
              <p className="text-slate-900 dark:text-slate-100">v1.8.2</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Last updated</p>
              <p className="text-slate-900 dark:text-slate-100">09 Jan 2025</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Server status</p>
              <Badge variant="success" size="sm">
                All systems operational
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-blue-600">
            <a href="#" className="hover:underline">Documentation</a>
            <a href="#" className="hover:underline">Support</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Changelog</a>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary">Contact support</Button>
            <Button variant="ghost">Check for updates</Button>
          </div>
        </div>
      </SettingsSection>

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workspace settings"
        description="Fine-tune your YourCase experience, security, and team controls."
        breadcrumbs={<span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Dashboard · Settings</span>}
      />

      {notice && (
        <Alert
          variant={notice.type === 'error' ? 'error' : notice.type === 'success' ? 'success' : 'info'}
          title={notice.type === 'success' ? 'Saved' : notice.type === 'error' ? 'Update failed' : 'Notice'}
          message={notice.message}
          dismissible
          onClose={() => setNotice(null)}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {!isMobile && (
          <aside className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <SettingsSidebar active={activeSection} onChange={setActiveSection} />
          </aside>
        )}
        <main className="space-y-8">{sections}</main>
      </div>
    </div>
  )
}

