'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, Customer } from '@/lib/api';

function ProvisionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomer = searchParams.get('customer');

  const [formData, setFormData] = useState({
    subdomain: '',
    plan: 'starter' as 'starter' | 'pro' | 'enterprise',
    customer_email: '',
    customer_name: '',
    existing_customer_id: preselectedCustomer || '',
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useExisting, setUseExisting] = useState(!!preselectedCustomer);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data.customers || []);
      
      // Pre-fill customer email if preselected
      if (preselectedCustomer) {
        const customer = data.customers?.find(c => c.id === preselectedCustomer);
        if (customer) {
          setFormData(prev => ({
            ...prev,
            customer_email: customer.email,
            customer_name: customer.name || '',
          }));
        }
      }
    } catch {
      // Silently fail - customers list is optional
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate subdomain
      const subdomainRegex = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;
      if (!subdomainRegex.test(formData.subdomain)) {
        throw new Error('Invalid subdomain. Use lowercase letters, numbers, and hyphens only.');
      }

      let customerEmail = formData.customer_email;
      let customerName = formData.customer_name;

      if (useExisting && formData.existing_customer_id) {
        const customer = customers.find(c => c.id === formData.existing_customer_id);
        if (customer) {
          customerEmail = customer.email;
          customerName = customer.name || '';
        }
      }

      await api.provision({
        subdomain: formData.subdomain,
        plan: formData.plan,
        customer_email: customerEmail,
        customer_name: customerName,
      });

      router.push('/gateways');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to provision gateway');
    } finally {
      setLoading(false);
    }
  };

  const planPricing = {
    starter: { price: 29, features: ['1 vCPU', '1GB RAM', '10GB Storage', 'Basic Support'] },
    pro: { price: 79, features: ['2 vCPU', '4GB RAM', '50GB Storage', 'Priority Support'] },
    enterprise: { price: 199, features: ['4 vCPU', '8GB RAM', '100GB Storage', '24/7 Support'] },
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Provision Gateway</h1>
        <p className="text-[var(--muted)] mt-1">Create a new gateway for a customer</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subdomain */}
          <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-4">Gateway Configuration</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Subdomain</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                  className="flex-1 px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] transition"
                  placeholder="my-gateway"
                  required
                />
                <span className="text-[var(--muted)]">.redlobsta.cloud</span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-2">
                Lowercase letters, numbers, and hyphens only. 3-63 characters.
              </p>
            </div>
          </div>

          {/* Plan Selection */}
          <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-4">Select Plan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.keys(planPricing) as Array<keyof typeof planPricing>).map((plan) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => setFormData({ ...formData, plan })}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    formData.plan === plan
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border)] hover:border-[var(--muted)]'
                  }`}
                >
                  <div className="font-semibold capitalize mb-1">{plan}</div>
                  <div className="text-2xl font-bold text-[var(--primary)]">
                    ${planPricing[plan].price}
                    <span className="text-sm font-normal text-[var(--muted)]">/mo</span>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {planPricing[plan].features.map((feature, i) => (
                      <li key={i} className="text-xs text-[var(--muted)]">✓ {feature}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>

          {/* Customer */}
          <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-4">Customer</h2>
            
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setUseExisting(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  !useExisting
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--background)] text-[var(--foreground)]'
                }`}
              >
                New Customer
              </button>
              <button
                type="button"
                onClick={() => setUseExisting(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  useExisting
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--background)] text-[var(--foreground)]'
                }`}
              >
                Existing Customer
              </button>
            </div>

            {useExisting ? (
              <div>
                <label className="block text-sm font-medium mb-2">Select Customer</label>
                <select
                  value={formData.existing_customer_id}
                  onChange={(e) => setFormData({ ...formData, existing_customer_id: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] transition"
                  required
                >
                  <option value="">Select a customer...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name || customer.email} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] transition"
                    placeholder="customer@example.com"
                    required={!useExisting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Name (optional)</label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] transition"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Provisioning...' : '🚀 Provision Gateway'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ProvisionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    }>
      <ProvisionForm />
    </Suspense>
  );
}
