'use client';

import { useState } from 'react';
import { useMonitoringStore } from '../../hooks/useMonitoring';
import { Download, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import { ConfirmModal } from '../../components/ConfirmModal';
import toast from 'react-hot-toast';

export default function LogsPage() {
  const incidents = useMonitoringStore((state) => state.incidents);
  const clearIncidents = useMonitoringStore((state) => state.clearIncidents);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleExportCSV = () => {
    if (incidents.length === 0) return;

    const headers = ['Timestamp', 'Website', 'Previous Status', 'New Status', 'Response Time (ms)'];
    const rows = incidents.map((i) => [
      new Date(i.timestamp).toISOString(),
      i.websiteName,
      i.previousStatus,
      i.newStatus,
      i.responseTime ?? '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((e) => e.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `uptime-incidents-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported CSV successfully');
  };

  const handleAnalyze = async () => {
    if (incidents.length === 0) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    const toastId = toast.loading('Analyzing incidents...');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidents: incidents.slice(0, 50) }), // Send last 50 incidents to avoid token limits
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setAnalysis(data.analysis);
      toast.success('Analysis complete', { id: toastId });
    } catch (error) {
      console.error(error);
      setAnalysis('Failed to generate analysis. Please try again later.');
      toast.error('Analysis failed', { id: toastId });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    clearIncidents();
    toast.success('Incident logs cleared');
  };

  return (
    <>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Incident Logs</h1>
            <p className="text-zinc-500 mt-1">History of status changes and downtime events.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              disabled={incidents.length === 0}
              className="bg-white hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-700 font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-zinc-200 shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleAnalyze}
              disabled={incidents.length === 0 || isAnalyzing}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
            </button>
            <button
              onClick={() => setIsConfirmOpen(true)}
              disabled={incidents.length === 0}
              className="bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-red-200 shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {analysis && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-medium text-indigo-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Insights
            </h2>
            <div className="prose prose-indigo max-w-none text-sm text-zinc-700">
              {/* Simple markdown rendering for the AI response */}
              {analysis.split('\n').map((line, i) => (
                <p key={i} className="mb-2">{line}</p>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          {incidents.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-zinc-500 mb-2">No incidents recorded yet.</div>
              <div className="text-sm text-zinc-400">When a website goes offline or comes back online, it will appear here.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider text-xs border-b border-zinc-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Time</th>
                    <th className="px-6 py-4 font-medium">Website</th>
                    <th className="px-6 py-4 font-medium">Status Change</th>
                    <th className="px-6 py-4 font-medium">Response Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {incidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4 text-zinc-500 font-mono whitespace-nowrap">
                        {new Date(incident.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-zinc-900">
                        {incident.websiteName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            incident.previousStatus === 'online' ? 'bg-emerald-100 text-emerald-700' :
                            incident.previousStatus === 'offline' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {incident.previousStatus}
                          </span>
                          <ArrowRight className="w-3 h-3 text-zinc-400" />
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            incident.newStatus === 'online' ? 'bg-emerald-100 text-emerald-700' :
                            incident.newStatus === 'offline' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {incident.newStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-500">
                        {incident.responseTime ? `${incident.responseTime.toFixed(0)}ms` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Clear Incident Logs"
        message="Are you sure you want to clear all incident logs? This action cannot be undone."
        confirmText="Clear Logs"
        onConfirm={handleClear}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
