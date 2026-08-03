import { CalendarDays, AlertTriangle, Info, UserCheck, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export const typeConfig = {
  schedule: { icon: CalendarDays, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Schedule' },
  assignment: { icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Assignment' },
  emergency: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', label: 'Emergency' },
  info: { icon: Info, color: 'text-slate-500', bg: 'bg-slate-100', label: 'Info' },
  warning: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Warning' },
  success: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Success' },
  error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Error' },
};

export function formatTimeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
