'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/gateways', label: 'Gateways', icon: '🌐' },
  { href: '/customers', label: 'Customers', icon: '👥' },
  { href: '/provision', label: 'Provision', icon: '➕' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    api.clearApiKey();
    window.location.reload();
  };

  return (
    <aside className="w-64 bg-[var(--card)] border-r border-[var(--border)] min-h-screen flex flex-col">
      <div className="p-6 border-b border-[var(--border)]">
        <h1 className="text-xl font-bold text-[var(--primary)]">🦞 LobstaCloud</h1>
        <p className="text-xs text-[var(--muted)] mt-1">Admin Dashboard</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-[var(--primary)] text-white'
                      : 'hover:bg-[var(--card-hover)] text-[var(--foreground)]'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-[var(--border)]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--card-hover)] text-[var(--muted)] transition"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
