import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './features/auth/components/AuthProvider'
import { AuthGuard } from './features/auth/components/AuthGuard'
import React, { Suspense } from 'react'
import { useAuthStore } from './features/auth/store/auth.store'
import { RegistryProvider } from './features/admin/components/RegistryProvider'

// Lazy load pages
const Login = React.lazy(() => import('./features/auth/pages/Login'))
const Register = React.lazy(() => import('./features/auth/pages/Register'))
const VerifyEmail = React.lazy(() => import('./features/auth/pages/VerifyEmail'))
const Dashboard = React.lazy(() => import('./features/dashboard/pages/Dashboard'))
const Unauthorized = React.lazy(() => import('./shared/components/Unauthorized'))
const AdminPage = React.lazy(() => import('./features/admin/pages/AdminPage'))
const ProjectRegistryView = React.lazy(() => import('./features/admin/pages/ProjectRegistryView'))
const StudentDashboard = React.lazy(() => import('./features/student/pages/StudentDashboard'))

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
)

// Smart root redirect component
const RootRedirect = () => {
  const { user, isInitialized, isLoading } = useAuthStore()
  
  // Debug log
  console.log('RootRedirect State:', { user, isInitialized, isLoading })
  
  // Show loading while auth is not initialized
  if (!isInitialized || isLoading) {
    return <LoadingFallback />
  }
  
  // Debug log
  console.log('RootRedirect: Navigating to', user ? "/dashboard" : "/register")
  return <Navigate to={user ? "/dashboard" : "/register"} replace />
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <main className="min-h-screen bg-gray-50">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Root route with smart redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              } />

              {/* Admin routes */}
              <Route path="/admin/*" element={
                <AuthGuard allowedRoles={['admin']}>
                  <RegistryProvider>
                    <Routes>
                      <Route index element={<AdminPage />} />
                      <Route path="registry/:id" element={<ProjectRegistryView />} />
                    </Routes>
                  </RegistryProvider>
                </AuthGuard>
              } />

              {/* Student routes */}
              <Route path="/student/*" element={
                <AuthGuard allowedRoles={['student']}>
                  <Routes>
                    <Route index element={<StudentDashboard />} />
                  </Routes>
                </AuthGuard>
              } />

              {/* Tester routes */}
              <Route path="/testing/*" element={
                <AuthGuard allowedRoles={['tester']}>
                  {/* Testing routes will be added here */}
                  <div>Testing Area</div>
                </AuthGuard>
              } />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  )
}

export default App
