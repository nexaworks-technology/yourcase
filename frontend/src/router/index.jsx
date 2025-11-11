import { createBrowserRouter, Navigate } from 'react-router-dom'

import { MainLayout } from '../components/layout/MainLayout'
import { ProtectedRoute } from '../components/ProtectedRoute'

import Login from '../pages/Login'
import Register from '../pages/Register'
import ForgotPassword from '../pages/ForgotPassword'
import NotFound from '../pages/NotFound'
import Forbidden from '../pages/Forbidden'
import ServerError from '../pages/ServerError'

import {
  DashboardPage,
  AIAssistantPage,
  DocumentsPage,
  DocumentDetailsPage,
  MattersPage,
  MatterDetailsPage,
  WorkflowsPage,
  WorkflowEditorPage,
  TemplatesPage,
  AnalyticsPage,
  SettingsPage,
  ProfilePage,
} from '../pages/protected'

const protectedChildren = [
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/ai-assistant', element: <AIAssistantPage /> },
  { path: '/documents', element: <DocumentsPage /> },
  { path: '/documents/:id', element: <DocumentDetailsPage /> },
  { path: '/matters', element: <MattersPage /> },
  { path: '/matters/:id', element: <MatterDetailsPage /> },
  { path: '/workflows', element: <WorkflowsPage /> },
  { path: '/workflows/:id', element: <WorkflowEditorPage /> },
  { path: '/templates', element: <TemplatesPage /> },
  { path: '/analytics', element: <AnalyticsPage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/settings', element: <SettingsPage />, roles: ['admin'] },
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
