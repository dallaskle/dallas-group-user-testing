import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  role: z.enum(['student', 'tester'], {
    required_error: 'Please select a role'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type RegisterFormData = z.infer<typeof registerSchema>

export const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { register: registerUser } = useAuth()

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

      const { error } = await registerUser(data)

      if (error) {
        toast.error(error)
        return
      }

      toast.success('Registration successful!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to register')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Sign up for a new account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-natural-lg" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-natural-md">
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-slate dark:text-slate-light mb-2"
              >
                Full Name
              </label>
              <input
                {...register('name')}
                id="name"
                type="text"
                autoComplete="name"
                required
                className="w-full px-natural-md py-2 rounded-md border border-clay/20 
                         bg-pearl dark:bg-charcoal 
                         text-slate dark:text-slate-light
                         placeholder:text-stone/50 dark:placeholder:text-stone-light/50
                         focus-natural"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

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
                autoComplete="new-password"
                required
                className="w-full px-natural-md py-2 rounded-md border border-clay/20 
                         bg-pearl dark:bg-charcoal 
                         text-slate dark:text-slate-light
                         placeholder:text-stone/50 dark:placeholder:text-stone-light/50
                         focus-natural"
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium text-slate dark:text-slate-light mb-2"
              >
                Confirm Password
              </label>
              <input
                {...register('confirmPassword')}
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-natural-md py-2 rounded-md border border-clay/20 
                         bg-pearl dark:bg-charcoal 
                         text-slate dark:text-slate-light
                         placeholder:text-stone/50 dark:placeholder:text-stone-light/50
                         focus-natural"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label 
                htmlFor="role" 
                className="block text-sm font-medium text-slate dark:text-slate-light mb-2"
              >
                Role
              </label>
              <select
                {...register('role')}
                id="role"
                required
                className="w-full px-natural-md py-2 rounded-md border border-clay/20 
                         bg-pearl dark:bg-charcoal 
                         text-slate dark:text-slate-light
                         focus-natural"
              >
                <option value="">Select a role</option>
                <option value="student">Student</option>
                <option value="tester">Tester</option>
              </select>
              {errors.role && (
                <p className="mt-2 text-sm text-destructive">{errors.role.message}</p>
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
                <span>Creating account...</span>
              </div>
            ) : (
              'Create account'
            )}
          </button>

          <div className="flex items-center justify-between pt-natural-md">
            <Link
              to="/login"
              className="text-sm font-medium text-copper hover:text-copper-light 
                       dark:text-copper-light dark:hover:text-copper
                       transition-natural focus-natural"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 