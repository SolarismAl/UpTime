'use client';

import { useState } from 'react';
import { Website } from '../types';
import { StatusBadge } from './StatusBadge';
import { UptimeChart } from './UptimeChart';
import { Trash2, ExternalLink, Clock } from 'lucide-react';
import { useMonitoringStore } from '../hooks/useMonitoring';
import { ConfirmModal } from './ConfirmModal';
import toast from 'react-hot-toast';

export function WebsiteCard({ website }: { website: Website }) {
  const removeWebsite = useMonitoringStore((state) => state.removeWebsite);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const totalChecks = website.history.length;
  const onlineChecks = website.history.filter((h) => h.status === 'online').length;
  const uptimePercentage = totalChecks > 0 ? ((onlineChecks / totalChecks) * 100).toFixed(2) : '0.00';

  const onlineHistory = website.history.filter((h) => h.status === 'online' && h.responseTime !== null);
  const avgResponseTime =
    onlineHistory.length > 0
      ? (onlineHistory.reduce((acc, curr) => acc + (curr.responseTime || 0), 0) / onlineHistory.length).toFixed(0)
      : '0';

  const handleDelete = () => {
    removeWebsite(website.id);
    toast.success(`Removed ${website.name}`);
  };

  return (
    <>
      <div className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-colors group relative overflow-hidden shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-zinc-900 flex items-center gap-2">
              {website.name}
              <a href={website.url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-zinc-600">
                <ExternalLink className="w-4 h-4" />
              </a>
            </h3>
            <p className="text-sm text-zinc-500 font-mono mt-1 truncate max-w-[200px] sm:max-w-xs">
              {website.url}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={website.status} />
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
              title="Remove Website"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Uptime</div>
            <div className="text-2xl font-light font-mono text-zinc-900">{uptimePercentage}%</div>
          </div>
          <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Avg Response</div>
            <div className="text-2xl font-light font-mono text-zinc-900">{avgResponseTime}ms</div>
          </div>
        </div>

        <UptimeChart history={website.history} />

        <div className="mt-4 flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
          <Clock className="w-3.5 h-3.5" />
          Last checked: {website.lastChecked ? new Date(website.lastChecked).toLocaleTimeString() : 'Never'}
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Remove Website"
        message={`Are you sure you want to stop monitoring ${website.name}? This will also delete its incident history.`}
        confirmText="Remove"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
