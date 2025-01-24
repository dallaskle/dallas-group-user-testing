import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'tester'])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type RegisterFormData = z.infer<typeof registerSchema>

export const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      toast.info('Creating your account...')

      const { error } = await registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role
      })

      if (error) {
        toast.error(error)
        return
      }

      toast.success('Registration successful!')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to register')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">

      <Card className="w-full bg-white dark:bg-charcoal shadow-lg shadow-slate-200/50 dark:shadow-none border-none">
        <CardContent className="p-8">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="name" 
                  className="block text-sm font-medium text-stone dark:text-stone-light mb-1.5"
                >
                  Full Name
                </label>
                <input
                  {...register('name')}
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  aria-invalid={errors.name ? "true" : "false"}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className="w-full h-12 px-4 rounded-md border border-clay/20 
                           bg-pearl dark:bg-charcoal 
                           text-slate-900 dark:text-slate-100
                           placeholder:text-stone/50 dark:placeholder:text-stone-light/50
                           focus-natural transition-natural
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1.5 text-sm text-destructive" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>

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
                  htmlFor="role" 
                  className="block text-sm font-medium text-stone dark:text-stone-light mb-1.5"
                >
                  Role
                </label>
                <select
                  {...register('role')}
                  id="role"
                  className="w-full h-12 px-4 rounded-md border border-clay/20 
                           bg-pearl dark:bg-charcoal 
                           text-slate-900 dark:text-slate-100
                           focus-natural transition-natural
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  <option value="">Select a role</option>
                  <option value="student">Student</option>
                  <option value="tester">Tester</option>
                </select>
                {errors.role && (
                  <p id="role-error" className="mt-1.5 text-sm text-destructive" role="alert">
                    {errors.role.message}
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
                  autoComplete="new-password"
                  required
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className="w-full h-12 px-4 rounded-md border border-clay/20 
                           bg-pearl dark:bg-charcoal 
                           text-slate-900 dark:text-slate-100
                           placeholder:text-stone/50 dark:placeholder:text-stone-light/50
                           focus-natural transition-natural
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Create a password"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p id="password-error" className="mt-1.5 text-sm text-destructive" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium text-stone dark:text-stone-light mb-1.5"
                >
                  Confirm Password
                </label>
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                  aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                  className="w-full h-12 px-4 rounded-md border border-clay/20 
                           bg-pearl dark:bg-charcoal 
                           text-slate-900 dark:text-slate-100
                           placeholder:text-stone/50 dark:placeholder:text-stone-light/50
                           focus-natural transition-natural
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p id="confirm-password-error" className="mt-1.5 text-sm text-destructive" role="alert">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              aria-label={isLoading ? "Creating account..." : "Create account"}
              className="w-full h-12 rounded-md 
                       bg-forest hover:bg-forest-light dark:bg-forest-light dark:hover:bg-forest
                       text-pearl font-medium text-base
                       transition-natural focus-natural
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2" role="status">
                  <Progress value={100} size="sm" variant="accent" className="w-4 h-4" />
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create account'
              )}
            </button>

            <div className="flex items-center justify-center pt-1">
              <div className="text-sm text-stone dark:text-stone-light">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-copper hover:text-copper-light 
                           dark:text-copper-light dark:hover:text-copper
                           transition-natural focus-natural"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 