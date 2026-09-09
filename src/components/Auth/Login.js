import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';

export const Login = ({ onSwitchToRegister }) => {
  const { login, isLoading, error } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(form.email, form.password);
    } catch (submitError) {
      console.error('Login failed:', submitError);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back</h2>
        <p className="text-slate-500 mb-6">Log in to continue paper trading</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Don’t have an account?{' '}
          <button type="button" onClick={onSwitchToRegister} className="font-semibold text-indigo-600 hover:text-indigo-700">
            Register
          </button>
        </p>
      </div>
    </div>
  );
};
