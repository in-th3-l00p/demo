interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  active: 'badge-success',
  confirmed: 'badge-success',
  completed: 'badge-success',
  ready: 'badge-success',
  broadcast: 'badge-info',
  signed: 'badge-info',
  pending: 'badge-warning',
  collecting: 'badge-warning',
  archived: 'badge-error',
  failed: 'badge-error',
  expired: 'badge-error',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] || 'badge-info';
  return <span className={style}>{status}</span>;
}
