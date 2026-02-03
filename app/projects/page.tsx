import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { listCategories } from '@/lib/store/categories';
import { listChannels } from '@/lib/store/channels';
import { createProject, deleteProject, listProjects } from '@/lib/store/projects';

export default async function ProjectsPage() {
  const [projects, categories, channels] = await Promise.all([
    listProjects(),
    listCategories(),
    listChannels()
  ]);

  async function handleCreate(formData: FormData) {
    'use server';
    const title = String(formData.get('title') || '').trim();
    const topic = String(formData.get('topic') || '').trim();
    const categoryId = String(formData.get('categoryId') || '').trim();
    const channelId = String(formData.get('channelId') || '').trim();
    if (!title || !topic) return;
    await createProject({
      title,
      topic,
      categoryId: categoryId || undefined,
      channelId: channelId || undefined
    });
    revalidatePath('/projects');
    revalidatePath('/dashboard');
  }

  async function handleDelete(formData: FormData) {
    'use server';
    const id = String(formData.get('id'));
    if (!id) return;
    await deleteProject(id);
    revalidatePath('/projects');
    revalidatePath('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Projects</h2>
        <p className="text-sm text-slate-400">Spin up new video builds and manage scripts.</p>
      </div>
      <Card title="Create Project">
        <form action={handleCreate} className="grid gap-3 md:grid-cols-4">
          <Input name="title" placeholder="Project title" required />
          <Input name="topic" placeholder="Topic or working brief" required />
          <select
            name="categoryId"
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            name="channelId"
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          >
            <option value="">No channel</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.title}
              </option>
            ))}
          </select>
          <div className="md:col-span-4 flex justify-end">
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Card>
      <div className="grid gap-4">
        {projects.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-400">No projects yet. Start with a new brief.</p>
          </Card>
        ) : (
          projects.map((project) => (
            <Card key={project.id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                  <p className="text-sm text-slate-400">{project.topic}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/projects/${project.id}`}
                    className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
                  >
                    Open
                  </Link>
                  <form action={handleDelete}>
                    <input type="hidden" name="id" value={project.id} />
                    <Button type="submit" variant="danger">
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
