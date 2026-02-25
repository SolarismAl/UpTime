'use client';

import { useState } from 'react';
import { useMonitoringStore } from '../../hooks/useMonitoring';
import { Settings as SettingsIcon, Database, AlertTriangle } from 'lucide-react';
import { ConfirmModal } from '../../components/ConfirmModal';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const websites = useMonitoringStore((state) => state.websites);
  const incidents = useMonitoringStore((state) => state.incidents);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleClearData = () => {
    localStorage.removeItem('uptime-sentinel-storage');
    toast.success('All data cleared');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-zinc-400" />
            Settings
          </h1>
          <p className="text-zinc-500 mt-1">Manage your monitoring application preferences.</p>
        </div>

        <div className="grid gap-6 max-w-2xl">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-medium text-zinc-900 flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-zinc-500" />
              Storage & Data
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                <div>
                  <div className="text-sm font-medium text-zinc-900">Monitored Websites</div>
                  <div className="text-xs text-zinc-500">Total number of active monitors</div>
                </div>
                <div className="font-mono text-zinc-600 bg-zinc-50 px-3 py-1 rounded-md border border-zinc-200">
                  {websites.length}
                </div>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                <div>
                  <div className="text-sm font-medium text-zinc-900">Incident Logs</div>
                  <div className="text-xs text-zinc-500">Total recorded status changes</div>
                </div>
                <div className="font-mono text-zinc-600 bg-zinc-50 px-3 py-1 rounded-md border border-zinc-200">
                  {incidents.length}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setIsConfirmOpen(true)}
                  className="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors border border-red-200 shadow-sm"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Clear All Data
                </button>
                <p className="text-xs text-zinc-500 mt-2">
                  This will remove all websites, history, and incident logs from local storage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Clear All Data"
        message="Are you sure you want to delete all monitoring data? This will remove all websites, history, and incident logs. This action cannot be undone."
        confirmText="Clear Everything"
        onConfirm={handleClearData}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
