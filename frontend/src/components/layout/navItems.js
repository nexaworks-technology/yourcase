import { Home, Sparkles, FileText, Briefcase, Workflow, LayoutDashboard, BarChart3, Settings } from 'lucide-react'

// Shared navigation items for Sidebar/Navbar to keep active route in sync
export const navItems = [
  { label: 'Dashboard', to: '/', icon: Home },
  { label: 'AI Assistant', to: '/ai-assistant', icon: Sparkles },
  { label: 'Documents', to: '/documents', icon: FileText },
  { label: 'Matters', to: '/matters', icon: Briefcase },
  { label: 'Workflows', to: '/workflows', icon: Workflow },
  { label: 'Templates', to: '/templates', icon: LayoutDashboard },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/settings', icon: Settings },
]

