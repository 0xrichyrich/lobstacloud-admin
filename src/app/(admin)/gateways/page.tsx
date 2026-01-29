'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, Gateway } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import PlanBadge from '@/components/PlanBadge';

export default function GatewaysPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadGateways();
  }, []);

  const loadGateways = async () => {
    try {
      const data = await api.getGateways();
      setGateways(data.gateways || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gateways');
    } finally {
      setLoading(false);
    }
  };

  const filteredGateways = gateways.filter(gateway => {
    if (filter === 'all') return true;
    return gateway.status === filter;
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
          <h1 className="text-3xl font-bold">Gateways</h1>
          <p className="text-[var(--muted)] mt-1">Manage all provisioned gateways</p>
        </div>
        <Link
          href="/provision"
          className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition"
        >
          + New Gateway
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'active', 'provisioning', 'stopped', 'error'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === status
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--card-hover)]'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Gateways Table */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-4 text-[var(--muted)] font-medium">Subdomain</th>
                <th className="text-left p-4 text-[var(--muted)] font-medium">Status</th>
                <th className="text-left p-4 text-[var(--muted)] font-medium">Plan</th>
                <th className="text-left p-4 text-[var(--muted)] font-medium">Customer</th>
                <th className="text-left p-4 text-[var(--muted)] font-medium">IP Address</th>
                <th className="text-left p-4 text-[var(--muted)] font-medium">Created</th>
                <th className="text-right p-4 text-[var(--muted)] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGateways.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--muted)]">
                    No gateways found
                  </td>
                </tr>
              ) : (
                filteredGateways.map((gateway) => (
                  <tr key={gateway.id} className="border-b border-[var(--border)] hover:bg-[var(--card-hover)]">
                    <td className="p-4">
                      <div className="font-medium">{gateway.subdomain}</div>
                      <div className="text-xs text-[var(--muted)]">{gateway.domain}</div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={gateway.status} />
                    </td>
                    <td className="p-4">
                      <PlanBadge plan={gateway.plan} />
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{gateway.customer_email || gateway.customer_id}</div>
                    </td>
                    <td className="p-4">
                      <code className="text-sm bg-[var(--background)] px-2 py-1 rounded">
                        {gateway.ip_address || '—'}
                      </code>
                    </td>
                    <td className="p-4 text-sm text-[var(--muted)]">
                      {new Date(gateway.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/gateways/${gateway.id}`}
                        className="text-[var(--primary)] hover:text-[var(--primary-hover)] text-sm font-medium"
                      >
                        View →
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
