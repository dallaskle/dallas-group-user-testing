import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider'
import { LoginForm } from '../components/LoginForm'
import logo from '../../../assets/image.jpg'
import image1 from '../../../assets/image1.jpg'

const Login = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      <div className="relative min-h-screen flex">
        {/* Form Section */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <img src={logo} alt="Logo" className="h-24 w-24 rounded-full object-cover mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Group User Testing
              </h1>
              <h2 className="text-xl font-medium text-gray-700 mb-2">
                Login to Your Account
              </h2>
              <p className="text-gray-500">
                Sign in to continue managing your tests
              </p>
            </div>
            
            <LoginForm />
          </div>
        </div>

        {/* Image Section */}
        <div className="hidden lg:block w-[60%] h-screen">
          <img
            src={image1}
            alt="User Testing Illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}

export default Login