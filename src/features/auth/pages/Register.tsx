import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider'
import { RegisterForm } from '../components/RegisterForm'
import image2 from '../../../assets/image2.jpg'

const Register = () => {
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
        {/* Image Section */}
        <div className="hidden lg:block w-[60%] h-screen">
          <img
            src={image2}
            alt="User Testing Collaboration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form Section */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Group User Testing
                </h1>
                <h2 className="text-2xl font-medium text-gray-700 mb-2">
                  Create Account
                </h2>
                <p className="text-gray-500">
                  Join us to start managing your user tests
                </p>
              </div>
              
              <RegisterForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register