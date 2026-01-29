'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Gateway } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import PlanBadge from '@/components/PlanBadge';

export default function GatewayDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [gateway, setGateway] = useState<Gateway | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadGateway();
  }, [id]);

  const loadGateway = async () => {
    try {
      const [gatewayData, logsData] = await Promise.all([
        api.getGateway(id),
        api.getGatewayLogs(id).catch(() => ({ logs: [] })),
      ]);
      setGateway(gatewayData.gateway);
      setLogs(logsData.logs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gateway');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = async () => {
    if (!confirm('Are you sure you want to restart this gateway?')) return;
    
    setActionLoading('restart');
    try {
      await api.restartGateway(id);
      await loadGateway();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to restart gateway');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeprovision = async () => {
    if (!confirm('Are you sure you want to deprovision this gateway? This action cannot be undone.')) return;
    if (!confirm('This will permanently delete the gateway and all associated data. Continue?')) return;
    
    setActionLoading('deprovision');
    try {
      await api.deleteGateway(id);
      router.push('/gateways');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to deprovision gateway');
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (error || !gateway) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
        {error || 'Gateway not found'}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-[var(--muted)] mb-4">
        <Link href="/gateways" className="hover:text-[var(--foreground)]">Gateways</Link>
        <span>/</span>
        <span className="text-[var(--foreground)]">{gateway.subdomain}</span>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {gateway.subdomain}
            <StatusBadge status={gateway.status} />
          </h1>
          <p className="text-[var(--muted)] mt-1">{gateway.domain}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRestart}
            disabled={actionLoading !== null}
            className="px-4 py-2 bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border)] rounded-lg transition disabled:opacity-50"
          >
            {actionLoading === 'restart' ? 'Restarting...' : '🔄 Restart'}
          </button>
          <button
            onClick={handleDeprovision}
            disabled={actionLoading !== null}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {actionLoading === 'deprovision' ? 'Deprovisioning...' : '🗑️ Deprovision'}
          </button>
        </div>
      </div>

      {/* Gateway Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <h2 className="text-lg font-semibold mb-4">Gateway Details</h2>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">ID</dt>
              <dd className="font-mono text-sm">{gateway.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">Subdomain</dt>
              <dd>{gateway.subdomain}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">Domain</dt>
              <dd>{gateway.domain}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">Plan</dt>
              <dd><PlanBadge plan={gateway.plan} /></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">IP Address</dt>
              <dd className="font-mono">{gateway.ip_address || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">Server ID</dt>
              <dd className="font-mono text-sm">{gateway.server_id || '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <h2 className="text-lg font-semibold mb-4">Customer & Billing</h2>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">Customer ID</dt>
              <dd className="font-mono text-sm">{gateway.customer_id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">Customer Email</dt>
              <dd>{gateway.customer_email || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">Created</dt>
              <dd>{new Date(gateway.created_at).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">Updated</dt>
              <dd>{new Date(gateway.updated_at).toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Logs</h2>
          <button
            onClick={loadGateway}
            className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)]"
          >
            Refresh
          </button>
        </div>
        <div className="bg-[var(--background)] rounded-lg p-4 font-mono text-sm max-h-96 overflow-auto">
          {logs.length === 0 ? (
            <p className="text-[var(--muted)]">No logs available</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="py-1 border-b border-[var(--border)] last:border-0">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
