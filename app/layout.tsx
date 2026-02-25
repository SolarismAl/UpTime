import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '../components/Navbar';
import { MonitoringProvider } from '../components/MonitoringProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'UpTime Sentinel',
  description: 'Professional-grade website monitoring dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-zinc-50 text-zinc-900 font-sans antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <MonitoringProvider>
          <Navbar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          <Toaster position="bottom-right" />
        </MonitoringProvider>
      </body>
    </html>
  );
}
