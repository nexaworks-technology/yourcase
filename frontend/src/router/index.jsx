import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy } from 'react'
import { RouteChunkBoundary } from '../components/RouteChunkBoundary'

import { MainLayout } from '../components/layout/MainLayout'
import { ProtectedRoute } from '../components/ProtectedRoute'

import Login from '../pages/Login'
import Register from '../pages/Register'
import ForgotPassword from '../pages/ForgotPassword'
import NotFound from '../pages/NotFound'
import Forbidden from '../pages/Forbidden'
import ServerError from '../pages/ServerError'

// Eager-lightweight pages
import { DashboardPage, AIAssistantPage, WorkflowsPage, WorkflowEditorPage, AnalyticsPage, ProfilePage } from '../pages/protected'

// Lazily load heavier pages (documents/matters/templates/settings)
const DocumentsPage = lazy(() => import('../pages/Documents'))
const DocumentDetailsPage = lazy(() => import('../pages/DocumentDetails'))
const MattersPage = lazy(() => import('../pages/Matters'))
const MatterDetailsPage = lazy(() => import('../pages/MatterDetails'))
const TemplatesPage = lazy(() => import('../pages/Templates'))
const SettingsPage = lazy(() => import('../pages/Settings'))

const protectedChildren = [
  { path: '/dashboard', element: (
      <RouteChunkBoundary label="dashboard">
        <DashboardPage />
      </RouteChunkBoundary>
    ) },
  { path: '/ai-assistant', element: (
      <RouteChunkBoundary label="ai assistant">
        <AIAssistantPage />
      </RouteChunkBoundary>
    ) },
  { path: '/documents', element: (
      <RouteChunkBoundary label="documents">
        <DocumentsPage />
      </RouteChunkBoundary>
    ) },
  { path: '/documents/:id', element: (
      <RouteChunkBoundary label="document">
        <DocumentDetailsPage />
      </RouteChunkBoundary>
    ) },
  { path: '/matters', element: (
      <RouteChunkBoundary label="matters">
        <MattersPage />
      </RouteChunkBoundary>
    ) },
  { path: '/matters/:id', element: (
      <RouteChunkBoundary label="matter">
        <MatterDetailsPage />
      </RouteChunkBoundary>
    ) },
  { path: '/workflows', element: (
      <RouteChunkBoundary label="workflows">
        <WorkflowsPage />
      </RouteChunkBoundary>
    ) },
  { path: '/workflows/:id', element: (
      <RouteChunkBoundary label="workflow editor">
        <WorkflowEditorPage />
      </RouteChunkBoundary>
    ) },
  { path: '/templates', element: (
      <RouteChunkBoundary label="templates">
        <TemplatesPage />
      </RouteChunkBoundary>
    ) },
  { path: '/analytics', element: (
      <RouteChunkBoundary label="analytics">
        <AnalyticsPage />
      </RouteChunkBoundary>
    ) },
  { path: '/profile', element: (
      <RouteChunkBoundary label="profile">
        <ProfilePage />
      </RouteChunkBoundary>
    ) },
  { path: '/settings', element: (
      <RouteChunkBoundary label="settings">
        <SettingsPage />
      </RouteChunkBoundary>
    ), roles: ['admin'] },
]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
    errorElement: <ServerError />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: protectedChildren.flatMap((route) => {
          if (route.roles) {
            return [
              {
                element: <ProtectedRoute roles={route.roles} />,
                children: [{ path: route.path, element: route.element }],
              },
            ]
          }
          return [route]
        }),
      },
    ],
  },
  {
    path: '/403',
    element: <Forbidden />,
  },
  {
    path: '/500',
    element: <ServerError />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
])
