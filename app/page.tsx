'use client';

import { useState } from 'react';
import { useMonitoringStore } from '../hooks/useMonitoring';
import { WebsiteCard } from '../components/WebsiteCard';
import { Plus, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const websites = useMonitoringStore((state) => state.websites);
  const addWebsite = useMonitoringStore((state) => state.addWebsite);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && url) {
      let formattedUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        formattedUrl = `https://${url}`;
      }
      addWebsite(name, formattedUrl);
      toast.success(`Started monitoring ${name}`);
      setName('');
      setUrl('');
      setIsAdding(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="text-zinc-500 mt-1">Real-time monitoring for your web services.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Website
        </button>
      </div>

      {isAdding && (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-medium text-zinc-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            New Monitor
          </h2>
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">
                Friendly Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Production API"
                className="w-full bg-white border border-zinc-300 rounded-lg px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-mono text-sm"
                required
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">
                URL to Monitor
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/health"
                className="w-full bg-white border border-zinc-300 rounded-lg px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-mono text-sm"
                required
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors font-medium w-full md:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors w-full md:w-auto shadow-sm"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {websites.length === 0 && !isAdding ? (
        <div className="text-center py-20 border border-dashed border-zinc-300 rounded-2xl bg-white">
          <Globe className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 mb-2">No websites monitored</h3>
          <p className="text-zinc-500 max-w-md mx-auto">
            Get started by adding a website to monitor its uptime and performance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {websites.map((website) => (
            <WebsiteCard key={website.id} website={website} />
          ))}
        </div>
      )}
    </div>
  );
}
