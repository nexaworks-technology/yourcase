export { default as DashboardPage } from '../Dashboard'
export { default as AIAssistantPage } from '../AIAssistant'
// Stop statically re-exporting heavy pages. These are lazy-loaded in the router.
// export { default as DocumentsPage } from '../Documents'
// export { default as DocumentDetailsPage } from '../DocumentDetails'
// export { default as MattersPage } from '../Matters'
// export { default as MatterDetailsPage } from '../MatterDetails' // Lazy-loaded in router; avoid static re-export to silence Vite warning
export const WorkflowsPage = () => <div className="p-8">Workflows</div>
export const WorkflowEditorPage = () => <div className="p-8">Workflow editor</div>
export const TemplatesPage = () => <div className="p-8">Templates</div>
export const AnalyticsPage = () => <div className="p-8">Analytics</div>
export const SettingsPage = () => <div className="p-8">Settings</div>
export const ProfilePage = () => <div className="p-8">Profile</div>
