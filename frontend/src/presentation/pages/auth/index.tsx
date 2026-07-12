import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../business/store/auth.store';
 
export default function LoginPage() {
  const [email, setEmail] = useState('demo@auravest.com');
  const [password, setPassword] = useState('demopassword');
  const [validationError, setValidationError] = useState<string | null>(null);
 
  const { login, error, clearError, isLoading } = useAuthStore();
 
  useEffect(() => {
    // Clear global store auth errors when page is mounted
    clearError();
  }, [clearError]);
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
 
    if (!email || !password) {
      setValidationError('Please fill in all fields.');
      return;
    }
 
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }
 
    try {
      await login(email, password);
    } catch (err) {
      // Login failures are set and displayed from useAuthStore
    }
  };
 
  return (
    <div className="space-y-6">
      {/* Demo Credentials Box */}
      <div className="rounded-xl border border-slate-205 bg-slate-50/50 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/50">
        <span className="font-bold text-slate-700 dark:text-slate-350 block mb-1">Demo Credentials:</span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-slate-500 dark:text-slate-400">
          <span>Email: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-blue-600 dark:text-blue-400">demo@auravest.com</code></span>
          <span>Password: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-blue-600 dark:text-blue-400">demopassword</code></span>
        </div>
      </div>

      {/* Dynamic Error Notifications */}
      {(validationError || error) && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
          {validationError || error}
        </div>
      )}
 
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="relative block w-full appearance-none rounded-none rounded-t-xl border border-slate-300 px-3 py-3 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="relative block w-full appearance-none rounded-none rounded-b-xl border border-slate-300 px-3 py-3 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>
 
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
 
        <div className="flex items-center justify-between text-xs mt-4">
          <Link to="/register" className="text-blue-605 hover:underline dark:text-blue-400">
            Don't have an account? Register Now
          </Link>
        </div>
      </form>
    </div>
  );
}
