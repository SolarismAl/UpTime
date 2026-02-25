'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, FileText, Settings, ShieldAlert } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: Activity },
  { name: 'Incident Logs', href: '/logs', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-emerald-600" />
            </div>
            <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">UpTime Sentinel</h1>
          </div>
          
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-900 font-medium'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
