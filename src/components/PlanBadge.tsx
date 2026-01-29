interface PlanBadgeProps {
  plan: string;
}

const planConfig: Record<string, { bg: string; text: string; label: string }> = {
  starter: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Starter' },
  pro: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Pro' },
  enterprise: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Enterprise' },
};

export default function PlanBadge({ plan }: PlanBadgeProps) {
  const config = planConfig[plan] || { bg: 'bg-gray-500/20', text: 'text-gray-400', label: plan };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
