import { useRouter } from 'next/router';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="font-display text-neutral-500">Loading...</p>
      </div>
    );
  }

  if (user) {
    router.replace('/planner');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const action = isSignUp ? signUp : signIn;
    action(email.trim(), password)
      .then(() => {
        router.replace('/planner');
      })
      .catch((err: { message?: string }) => {
        setError(err.message ?? 'Something went wrong');
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div>
      <div className="bg-exeter px-8 py-16 dark:bg-neutral-800 lg:px-40">
        <Link href="/">
          <a className="font-display text-sm text-gray-300 hover:text-white">
            ← Back to Home
          </a>
        </Link>
        <h1 className="mt-2 font-display text-4xl font-black text-white md:text-5xl">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h1>
        <p className="mt-2 font-display text-lg text-white/90">
          Use your Exeter email and password to save your course planner and
          joined clubs.
        </p>
      </div>
      <div className="mx-auto max-w-xl px-8 py-14 lg:px-40">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-8 shadow dark:border-neutral-600 dark:bg-neutral-700"
        >
          {error && (
            <div className="rounded bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block font-display text-sm font-bold text-gray-700 dark:text-neutral-200"
            >
              Exeter Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@exeter.edu"
              required
              className="w-full rounded border border-neutral-300 px-4 py-3 text-base text-gray-900 dark:border-neutral-500 dark:bg-neutral-600 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block font-display text-sm font-bold text-gray-700 dark:text-neutral-200"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded border border-neutral-300 px-4 py-3 text-base text-gray-900 dark:border-neutral-500 dark:bg-neutral-600 dark:text-white"
            />
            {isSignUp && (
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Minimum 6 characters
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-exeter px-4 py-2 font-display font-bold text-white hover:bg-exeter-600 disabled:opacity-50 dark:bg-exeter-200 dark:text-exeter-900 dark:hover:bg-exeter-300"
          >
            {submitting ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp((s) => !s);
              setError('');
            }}
            className="text-sm text-neutral-600 hover:underline dark:text-neutral-400"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
}
