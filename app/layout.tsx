import type { ReactNode } from 'react';
import Link from 'next/link';
import { LayoutDashboard, FolderKanban, Layers, Video } from 'lucide-react';
import './globals.css';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/categories', label: 'Categories', icon: Layers },
  { href: '/channels', label: 'Channels', icon: Video },
  { href: '/projects', label: 'Projects', icon: FolderKanban }
];

export const metadata = {
  title: 'YouTube Automation Pipeline',
  description: 'Local automation pipeline for YouTube scripts and prompts.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="flex min-h-screen">
          <aside className="w-64 border-r border-slate-800 bg-slate-900/80 px-4 py-6">
            <div className="mb-8">
              <h1 className="text-lg font-semibold text-white">YouTube Automation</h1>
              <p className="text-xs text-slate-400">Local-only pipeline</p>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
                >
                  <item.icon className="h-4 w-4 text-slate-300" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="flex-1 px-8 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
