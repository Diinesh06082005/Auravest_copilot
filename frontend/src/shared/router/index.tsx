import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../../presentation/layouts/MainLayout';
import { AuthLayout } from '../../presentation/layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { LoadingScreen } from '../../presentation/components/common/LoadingScreen';

// Lazy load page components for bundle optimization
const DashboardPage = lazy(() => import('../../presentation/pages/dashboard'));
const ResearchPage = lazy(() => import('../../presentation/pages/research'));
const PortfolioPage = lazy(() => import('../../presentation/pages/portfolio'));
const SettingsPage = lazy(() => import('../../presentation/pages/settings'));
const LoginPage = lazy(() => import('../../presentation/pages/auth'));
const RegisterPage = lazy(() => import('../../presentation/pages/auth/register'));

export const router = createBrowserRouter([
  // Public Guest Routes
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: '/login',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <LoginPage />
              </Suspense>
            ),
          },
          {
            path: '/register',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <RegisterPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  
  // Protected App Routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: '/research',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <ResearchPage />
              </Suspense>
            ),
          },
          {
            path: '/portfolio',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <PortfolioPage />
              </Suspense>
            ),
          },
          {
            path: '/settings',
            element: (
              <Suspense fallback={<LoadingScreen />}>
                <SettingsPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },

  // Fallback Route
  {
    path: '*',
    element: (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <h1 className="text-6xl font-extrabold text-blue-600">404</h1>
          <p className="mt-4 text-xl text-slate-850 dark:text-slate-200">Page not found</p>
          <a href="/" className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Back to Dashboard
          </a>
        </div>
      </div>
    ),
  },
]);
