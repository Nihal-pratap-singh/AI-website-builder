
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const AuthPage = ({ mode }) => {
  const { login, register } = useAppContext();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }

      navigate('/');
    } catch (err) {
      setError(
        err.message ||
          (isLogin
            ? 'Invalid email or password'
            : 'Registration failed')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-purple-50 px-4 py-8 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">

      {/* Centered Authentication Card */}
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl shadow-purple-900/5 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">

        {/* Logo and Heading */}
        <div className="mb-8 text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <img
              src="/logo.png"
              alt="AI Website Builder Logo"
              className="h-10 w-10 object-contain"
            />

            <span className="text-xl font-semibold tracking-tight sm:text-2xl">
              AI Website Builder
            </span>
          </div>

          <h1 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>

          <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {isLogin
              ? 'Sign in to continue building your website with AI.'
              : 'Get started by creating your AI Website Builder account.'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
          >
            {error}
          </div>
        )}

        {/* Authentication Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>

          {/* Full Name - Registration Only */}
          {!isLogin && (
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                placeholder="John Doe"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-zinc-500"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-zinc-500"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  isLogin ? 'current-password' : 'new-password'
                }
                required
                placeholder="Enter your password"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 pr-10 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:placeholder:text-zinc-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                aria-label={
                  showPassword ? 'Hide password' : 'Show password'
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                {showPassword ? (
                  <EyeOffIcon size={18} />
                ) : (
                  <EyeIcon size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-amber-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}

            {loading
              ? 'Please wait...'
              : isLogin
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>

        {/* Login / Registration Link */}
        <div className="mt-7 border-t border-zinc-100 pt-5 text-center dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {isLogin
              ? 'New to AI Website Builder?'
              : 'Already have an account?'}{' '}

            <Link
              to={isLogin ? '/register' : '/login'}
              className="font-semibold text-purple-600 transition-colors hover:text-purple-700 hover:underline dark:text-purple-400"
            >
              {isLogin ? 'Create an account' : 'Sign in'}
            </Link>
          </p>
        </div>

      </section>
    </main>
  );
};

export default AuthPage;
