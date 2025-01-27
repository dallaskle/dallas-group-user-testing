import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../features/auth/store/auth.store'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import logo from '../assets/image.jpg'

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation()
  const isActive = location.pathname.startsWith(to)
  
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-md transition-colors ${
        isActive
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {children}
    </Link>
  )
}

export const Navbar = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  
  if (!user) return null

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      logout()
      navigate('/login')
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }
  
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center text-xl font-bold text-gray-900">
              <img src={logo} alt="Logo" className="h-10 w-10 mr-2 rounded-full object-cover" />
              Group User Testing
            </Link>
            
            <div className="ml-10 flex items-center space-x-4">
              
              {user.is_admin && (
                <>
                  <NavLink to="/admin">Admin</NavLink>
                </>
              )}
              
              {user.is_student && (
                <>
                  <NavLink to="/student">Student</NavLink>
                </>
              )}
              
              {user.is_tester && (
                <NavLink to="/testing">Tester</NavLink>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex flex-col items-end mr-4">
              <span className="text-sm font-medium text-gray-900">
                {user.name}
              </span>
              <span className="text-sm text-gray-500">
                {user.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
} 