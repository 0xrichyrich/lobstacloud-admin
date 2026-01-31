'use client';

import { useState, useEffect } from 'react';
import { api, Stats } from '@/lib/api';
import StatCard from '@/components/StatCard';

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const profit = (stats?.monthly_revenue || 0) - (stats?.monthly_costs || 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-[var(--muted)] mt-1">Overview of your LobstaCloud infrastructure</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Gateways"
          value={stats?.total_gateways || 0}
          icon="🌐"
        />
        <StatCard
          label="Active Gateways"
          value={stats?.active_gateways || 0}
          icon="✅"
          color="success"
        />
        <StatCard
          label="Total Customers"
          value={stats?.total_customers || 0}
          icon="👥"
        />
        <StatCard
          label="Monthly Profit"
          value={formatCurrency(profit)}
          icon="💰"
          color={profit >= 0 ? 'success' : 'error'}
        />
      </div>

      {/* Revenue & Costs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <h2 className="text-lg font-semibold mb-4">💵 Revenue & Costs</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[var(--muted)]">Monthly Revenue</span>
              <span className="text-[var(--success)] font-semibold">
                {formatCurrency(stats?.monthly_revenue || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--muted)]">Server Costs</span>
              <span className="text-[var(--error)] font-semibold">
                {formatCurrency(stats?.monthly_costs || 0)}
              </span>
            </div>
            <div className="border-t border-[var(--border)] pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Net Profit</span>
                <span className={`font-bold text-lg ${profit >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                  {formatCurrency(profit)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <h2 className="text-lg font-semibold mb-4">📊 Gateways by Plan</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-400">Starter</span>
                <span>{stats?.gateways_by_plan?.starter || 0}</span>
              </div>
              <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ 
                    width: `${((stats?.gateways_by_plan?.starter || 0) / (stats?.total_gateways || 1)) * 100}%` 
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-purple-400">Pro</span>
                <span>{stats?.gateways_by_plan?.pro || 0}</span>
              </div>
              <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full"
                  style={{ 
                    width: `${((stats?.gateways_by_plan?.pro || 0) / (stats?.total_gateways || 1)) * 100}%` 
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-amber-400">Enterprise</span>
                <span>{stats?.gateways_by_plan?.business || 0}</span>
              </div>
              <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full"
                  style={{ 
                    width: `${((stats?.gateways_by_plan?.business || 0) / (stats?.total_gateways || 1)) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
        <h2 className="text-lg font-semibold mb-4">🔄 Gateway Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--background)] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats?.gateways_by_status?.active || 0}</div>
            <div className="text-sm text-[var(--muted)]">Active</div>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats?.gateways_by_status?.provisioning || 0}</div>
            <div className="text-sm text-[var(--muted)]">Provisioning</div>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">{stats?.gateways_by_status?.stopped || 0}</div>
            <div className="text-sm text-[var(--muted)]">Stopped</div>
          </div>
          <div className="bg-[var(--background)] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{stats?.gateways_by_status?.error || 0}</div>
            <div className="text-sm text-[var(--muted)]">Error</div>
          </div>
        </div>
      </div>
    </div>
  );
}
