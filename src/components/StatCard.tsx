interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  color?: 'default' | 'success' | 'warning' | 'error';
}

export default function StatCard({ label, value, icon, trend, color = 'default' }: StatCardProps) {
  const colorClasses = {
    default: 'text-[var(--foreground)]',
    success: 'text-[var(--success)]',
    warning: 'text-[var(--warning)]',
    error: 'text-[var(--error)]',
  };

  return (
    <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] hover:border-[var(--primary)] transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[var(--muted)] text-sm">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${colorClasses[color]}`}>{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.positive ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
