import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { ApiError } from '../api/client';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [accessDeniedError, setAccessDeniedError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: (data: LoginForm) => login(data.email, data.password),
    onSuccess: (auth) => {
      if (!auth.globalRoles.includes('SUPER_ADMIN')) {
        // Deliberately don't keep the session - this app is exclusively for
        // platform operators, a valid school-scoped login isn't enough. The
        // backend already issued a token for this account; we just refuse
        // to use it here rather than rejecting the credentials themselves.
        setAccessDeniedError('This account does not have platform admin access.');
        return;
      }
      setSession(auth);
      navigate('/', { replace: true });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white shadow-sm rounded-lg p-8 border border-gray-100">
        <h1 className="text-xl font-semibold text-secondary mb-1">Super Admin</h1>
        <p className="text-sm text-gray-500 mb-6">Platform administration - schools, plans, and audit log.</p>

        <form
          onSubmit={handleSubmit((data) => {
            setAccessDeniedError(null);
            mutation.mutate(data);
          })}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('password')}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          {accessDeniedError && <p className="text-sm text-red-600">{accessDeniedError}</p>}
          {mutation.isError && (
            <p className="text-sm text-red-600">
              {mutation.error instanceof ApiError ? mutation.error.message : 'Login failed'}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-md bg-primary text-white text-sm font-medium py-2 hover:opacity-90 disabled:opacity-50"
          >
            {mutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
