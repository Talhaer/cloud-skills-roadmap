import Link from 'next/link';
import clsx from 'clsx';

export type TabItem = {
  label: string;
  href: string;
  active?: boolean;
};

export function Tabs({ tabs }: { tabs: TabItem[] }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={clsx(
            'rounded-full px-4 py-1.5 text-sm font-medium',
            tab.active ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
