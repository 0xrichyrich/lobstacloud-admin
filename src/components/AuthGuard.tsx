'use client';

import { useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const savedKey = api.getApiKey();
    if (savedKey) {
      validateKey(savedKey);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateKey = async (key: string) => {
    try {
      api.setApiKey(key);
      await api.health();
      setIsAuthenticated(true);
      setError('');
    } catch {
      api.clearApiKey();
      setError('Invalid API key');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await validateKey(apiKey);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
        <div className="w-full max-w-md">
          <div className="bg-[var(--card)] rounded-xl p-8 border border-[var(--border)]">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[var(--primary)] mb-2">🦞 LobstaCloud</h1>
              <p className="text-[var(--muted)]">Admin Dashboard</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] transition"
                  placeholder="Enter your API key"
                  required
                />
              </div>
              
              {error && (
                <p className="text-[var(--error)] text-sm mb-4">{error}</p>
              )}
              
              <button
                type="submit"
                className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-lg transition"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
