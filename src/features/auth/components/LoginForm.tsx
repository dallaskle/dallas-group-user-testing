import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
        return
      }

      toast.success('Login successful!')
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-natural-lg" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-natural-md">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-slate dark:text-slate-light mb-2"
              >
                Email address
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-natural-md py-2 rounded-md border border-clay/20 
                         bg-pearl dark:bg-charcoal 
                         text-slate dark:text-slate-light
                         placeholder:text-stone/50 dark:placeholder:text-stone-light/50
                         focus-natural"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-slate dark:text-slate-light mb-2"
              >
                Password
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-natural-md py-2 rounded-md border border-clay/20 
                         bg-pearl dark:bg-charcoal 
                         text-slate dark:text-slate-light
                         placeholder:text-stone/50 dark:placeholder:text-stone-light/50
                         focus-natural"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-natural-md rounded-md 
                     bg-forest hover:bg-forest-light dark:bg-forest-light dark:hover:bg-forest
                     text-pearl font-medium
                     transition-natural focus-natural
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Progress value={100} className="w-4 h-4" />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign in'
            )}
          </button>

          <div className="flex items-center justify-between pt-natural-md">
            <Link
              to="/register"
              className="text-sm font-medium text-copper hover:text-copper-light 
                       dark:text-copper-light dark:hover:text-copper
                       transition-natural focus-natural"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 