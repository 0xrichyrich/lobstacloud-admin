// H-3 FIX: API key is stored server-side only (via env var), never in localStorage
// Client-side requests go through Next.js API routes which add the key server-side
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.redlobsta.cloud';

// Server-side API key — only available in server components/routes
const SERVER_API_KEY = typeof window === 'undefined' 
  ? (process.env.LOBSTA_API_KEY || process.env.ADMIN_API_KEY || '')
  : '';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    
    let url = `${API_BASE}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // H-3 FIX: API key is only available server-side via env var
    if (SERVER_API_KEY) {
      headers['Authorization'] = `Bearer ${SERVER_API_KEY}`;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Gateway endpoints
  async getGateways() {
    return this.fetch<{ gateways: Gateway[] }>('/gateways');
  }

  async getGateway(id: string) {
    return this.fetch<{ gateway: Gateway }>(`/gateways/${id}`);
  }

  async createGateway(data: CreateGatewayRequest) {
    return this.fetch<{ gateway: Gateway }>('/gateways', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGateway(id: string, data: Partial<Gateway>) {
    return this.fetch<{ gateway: Gateway }>(`/gateways/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteGateway(id: string) {
    return this.fetch<{ success: boolean }>(`/gateways/${id}`, {
      method: 'DELETE',
    });
  }

  async restartGateway(id: string) {
    return this.fetch<{ success: boolean }>(`/gateways/${id}/restart`, {
      method: 'POST',
    });
  }

  async getGatewayLogs(id: string) {
    return this.fetch<{ logs: string[] }>(`/gateways/${id}/logs`);
  }

  // Customer endpoints  
  async getCustomers() {
    return this.fetch<{ customers: Customer[] }>('/customers');
  }

  async getCustomer(id: string) {
    return this.fetch<{ customer: Customer }>(`/customers/${id}`);
  }

  // Stats endpoint
  async getStats() {
    return this.fetch<Stats>('/stats');
  }

  // Provision endpoint
  async provision(data: ProvisionRequest) {
    return this.fetch<{ gateway: Gateway }>('/provision', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async health() {
    return this.fetch<{ status: string; timestamp: string }>('/health');
  }

  // Auth validation — server-side only (API key from env)
  async validateAuth() {
    return this.fetch<{ valid: boolean; role: 'admin' | 'user' | null; timestamp?: string }>('/auth/validate', {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();

// Types
export interface Gateway {
  id: string;
  subdomain: string;
  domain: string;
  status: 'provisioning' | 'active' | 'stopped' | 'error' | 'deprovisioning';
  plan: 'starter' | 'pro' | 'business';
  customer_id: string;
  customer_email?: string;
  ip_address?: string;
  server_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
  stripe_customer_id?: string;
  gateways?: Gateway[];
  created_at: string;
}

export interface Stats {
  total_gateways: number;
  active_gateways: number;
  total_customers: number;
  monthly_revenue: number;
  monthly_costs: number;
  gateways_by_plan: {
    starter: number;
    pro: number;
    business: number;
  };
  gateways_by_status: {
    active: number;
    provisioning: number;
    stopped: number;
    error: number;
  };
}

export interface CreateGatewayRequest {
  subdomain: string;
  plan: 'starter' | 'pro' | 'business';
  customer_id: string;
}

export interface ProvisionRequest {
  subdomain: string;
  plan: 'starter' | 'pro' | 'business';
  customer_email: string;
  customer_name?: string;
}
