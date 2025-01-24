import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      toast.info('Attempting to log in...')

      const { error } = await login(data)

      if (error) {
        toast.error(error)
        setIsLoading(false)
        return
      }

      setTimeout(() => {
        setIsLoading(false)
      }, 5000)
      
      toast.success('Login successful!')
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to login')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card className="w-full bg-white dark:bg-charcoal shadow-lg shadow-slate-200/50 dark:shadow-none border-none">
        <CardContent className="p-8">
          <form 
            className="space-y-5" 
            onSubmit={handleSubmit(onSubmit)}
            aria-label="Login form"
          >
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-stone dark:text-stone-light mb-1.5"
                >
                  Email address
                </label>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="w-full h-12 px-4 rounded-md border border-clay/20 
                           bg-pearl dark:bg-charcoal 
                           text-slate-900 dark:text-slate-100
                           placeholder:text-stone/50 dark:placeholder:text-stone-light/50
                           focus-natural transition-natural
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-sm text-destructive" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-stone dark:text-stone-light mb-1.5"
                >
                  Password
                </label>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className="w-full h-12 px-4 rounded-md border border-clay/20 
                           bg-pearl dark:bg-charcoal 
                           text-slate-900 dark:text-slate-100
                           placeholder:text-stone/50 dark:placeholder:text-stone-light/50
                           focus-natural transition-natural
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p id="password-error" className="mt-1.5 text-sm text-destructive" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              aria-label={isLoading ? "Signing in..." : "Sign in"}
              className="w-full h-12 rounded-md 
                       bg-forest hover:bg-forest-light dark:bg-forest-light dark:hover:bg-forest
                       text-pearl font-medium text-base
                       transition-natural focus-natural
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2" role="status">
                  <Progress value={100} size="sm" variant="accent" className="w-4 h-4" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign in'
              )}
            </button>

            <div className="flex items-center justify-center pt-1">
              <div className="text-sm text-stone dark:text-stone-light">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-copper hover:text-copper-light 
                           dark:text-copper-light dark:hover:text-copper
                           transition-natural focus-natural"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 