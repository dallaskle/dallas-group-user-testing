import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/auth'
import { lazy, Suspense } from 'react'

// Lazy load pages
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignUpPage = lazy(() => import('./pages/SignUpPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ProjectPage = lazy(() => import('./pages/ProjectPage'))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))

// Create Query Client
const queryClient = new QueryClient()

function App() {
  const { setSession, setUser, setLoading } = useAuthStore()

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        if (session?.user) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (data) setUser(data)
          else setLoading(false)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        try {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (data) setUser(data)
          else setLoading(false)
        } catch (error) {
          console.error('Auth state change error:', error)
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [setSession, setUser, setLoading])

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/project/:id"
              element={
                <ProtectedRoute>
                  <ProjectPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </Router>
      <Toaster position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}

// Admin Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

export default App
