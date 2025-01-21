import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '../../services/auth.service'

export const VerifyEmailForm = () => {
  const location = useLocation()
  const [email, setEmail] = useState<string>('')
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Get email from location state if available (for resend functionality)
    const stateEmail = location.state?.email
    if (stateEmail) {
      setEmail(stateEmail)
    }

    // Parse hash parameters
    const hashParams = new URLSearchParams(location.hash.replace('#', ''))
    
    // Check for access token (successful verification)
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const type = hashParams.get('type')
    
    // Check for error
    const error = hashParams.get('error')
    const errorDescription = hashParams.get('error_description')

    if (error) {
      toast.error(errorDescription || 'Verification failed')
      return
    }

    if (accessToken && type === 'signup') {
      handleVerification(accessToken, refreshToken!)
    }
  }, [location])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerification = async (accessToken: string, refreshToken: string) => {
    try {
      setIsProcessing(true)
      const { error } = await authService.verifyEmail(accessToken, refreshToken)
      
      if (error) {
        toast.error(error)
        return
      }

      toast.success('Email verified successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to verify email')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('No email address available')
      return
    }

    try {
      setIsResending(true)
      const { error } = await authService.resendVerification(email)

      if (error) {
        toast.error(error)
        return
      }

      toast.success('Verification email sent!')
      setCountdown(60) // Start 60 second countdown
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  if (isProcessing) {
    return (
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <h2 className="mt-6 text-xl font-medium text-gray-900">
          Verifying your email...
        </h2>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your email
        </h2>
        {email && (
          <p className="mt-2 text-center text-sm text-gray-600">
            We sent a verification email to{' '}
            <span className="font-medium text-indigo-600">{email}</span>
          </p>
        )}
      </div>

      <div className="mt-8 space-y-6">
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Please verify your email address
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Check your email for a verification link. If you don't see it, check your spam
                  folder.
                </p>
              </div>
            </div>
          </div>
        </div>

        {email && (
          <div className="flex items-center justify-center">
            <button
              onClick={handleResendVerification}
              disabled={isResending || countdown > 0}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {countdown > 0
                ? `Resend email in ${countdown}s`
                : isResending
                ? 'Sending...'
                : 'Resend verification email'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 