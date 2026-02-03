import { listCategories } from '@/lib/store/categories';
import { listChannels } from '@/lib/store/channels';
import { listProjects } from '@/lib/store/projects';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default async function DashboardPage() {
  const [categories, channels, projects] = await Promise.all([
    listCategories(),
    listChannels(),
    listProjects()
  ]);
  const recentProjects = [...projects].slice(-5).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Dashboard</h2>
        <p className="text-sm text-slate-400">Quick pulse on your automation pipeline.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Categories" description="Active category groups">
          <p className="text-3xl font-semibold text-white">{categories.length}</p>
        </Card>
        <Card title="Channels" description="Tracked channel profiles">
          <p className="text-3xl font-semibold text-white">{channels.length}</p>
        </Card>
        <Card title="Projects" description="Scripts in production">
          <p className="text-3xl font-semibold text-white">{projects.length}</p>
        </Card>
      </div>
      <Card title="Recent Projects" description="Jump back into active builds">
        {recentProjects.length === 0 ? (
          <p className="text-sm text-slate-400">No projects yet. Create one to get started.</p>
        ) : (
          <ul className="space-y-2">
            {recentProjects.map((project) => (
              <li key={project.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-white">{project.title}</p>
                  <p className="text-xs text-slate-400">{project.topic}</p>
                </div>
                <Link
                  href={`/projects/${project.id}`}
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800"
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
