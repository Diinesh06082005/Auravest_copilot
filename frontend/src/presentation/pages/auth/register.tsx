import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../business/store/auth.store';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { register, error, clearError, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name || !email || !password) {
      setValidationError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      // Registration errors are displayed from useAuthStore
    }
  };

  return (
    <div className="space-y-6">
      {/* Error display */}
      {(validationError || error) && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-650 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
          {validationError || error}
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <label htmlFor="name" className="sr-only">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="relative block w-full appearance-none rounded-none rounded-t-xl border border-slate-300 px-3 py-3 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white sm:text-sm"
              placeholder="Full Name"
            />
          </div>
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="relative block w-full appearance-none rounded-none border-x border-slate-300 px-3 py-3 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white sm:text-sm"
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
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="relative block w-full appearance-none rounded-none rounded-b-xl border border-slate-300 px-3 py-3 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white sm:text-sm"
              placeholder="Password (min 8 characters)"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </div>

        <div className="flex items-center justify-between text-xs">
          <Link to="/login" className="text-blue-600 hover:underline dark:text-blue-400">
            Already have an account? Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
