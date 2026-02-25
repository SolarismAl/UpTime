import { Status } from '../types';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export function StatusBadge({ status }: { status: Status }) {
  switch (status) {
    case 'online':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Online
        </span>
      );
    case 'offline':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
          <XCircle className="w-3.5 h-3.5" />
          Offline
        </span>
      );
    case 'error':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
          <AlertCircle className="w-3.5 h-3.5" />
          Error
        </span>
      );
    case 'checking':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Checking
        </span>
      );
  }
}
