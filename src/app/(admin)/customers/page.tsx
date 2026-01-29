'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, Customer } from '@/lib/api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data.customers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      customer.email.toLowerCase().includes(searchLower) ||
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.id.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-[var(--muted)] mt-1">Manage customers from Stripe</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] transition"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-4 text-[var(--muted)] font-medium">Customer</th>
                <th className="text-left p-4 text-[var(--muted)] font-medium">Email</th>
                <th className="text-left p-4 text-[var(--muted)] font-medium">Stripe ID</th>
                <th className="text-left p-4 text-[var(--muted)] font-medium">Gateways</th>
                <th className="text-left p-4 text-[var(--muted)] font-medium">Created</th>
                <th className="text-right p-4 text-[var(--muted)] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--muted)]">
                    {search ? 'No customers match your search' : 'No customers found'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-[var(--border)] hover:bg-[var(--card-hover)]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center text-white font-medium">
                          {(customer.name || customer.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{customer.name || '—'}</div>
                          <div className="text-xs text-[var(--muted)]">{customer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{customer.email}</td>
                    <td className="p-4">
                      {customer.stripe_customer_id ? (
                        <code className="text-sm bg-[var(--background)] px-2 py-1 rounded">
                          {customer.stripe_customer_id}
                        </code>
                      ) : (
                        <span className="text-[var(--muted)]">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-[var(--background)] rounded-full text-sm">
                        {customer.gateways?.length || 0}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--muted)]">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/provision?customer=${customer.id}`}
                        className="text-[var(--primary)] hover:text-[var(--primary-hover)] text-sm font-medium"
                      >
                        + Gateway
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
