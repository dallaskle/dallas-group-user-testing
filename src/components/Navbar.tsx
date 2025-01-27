import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../features/auth/store/auth.store'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import logo from '../assets/image.jpg'
import { Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const NavItem = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = location.pathname.startsWith(to)
  
  return (
    <DropdownMenuItem
      onClick={() => navigate(to)}
      className={`${
        isActive
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {children}
    </DropdownMenuItem>
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
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="mr-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-start rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                  <Menu className="h-5 w-5" />
                  <span className="ml-2">Menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {user.is_admin && (
                    <NavItem to="/admin">Admin View</NavItem>
                  )}
                  
                  {user.is_student && (
                    <NavItem to="/student">Student View</NavItem>
                  )}
                  
                  {user.is_tester && (
                    <NavItem to="/testing">Tester View</NavItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <Link to="/dashboard" className="flex items-center text-xl font-bold text-gray-900">
              <img src={logo} alt="Logo" className="h-10 w-10 mr-2 rounded-full object-cover" />
              Group User Testing
            </Link>
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