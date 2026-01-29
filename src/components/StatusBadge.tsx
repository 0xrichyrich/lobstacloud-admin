interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
  provisioning: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Provisioning' },
  stopped: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Stopped' },
  error: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Error' },
  deprovisioning: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Deprovisioning' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { bg: 'bg-gray-500/20', text: 'text-gray-400', label: status };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
