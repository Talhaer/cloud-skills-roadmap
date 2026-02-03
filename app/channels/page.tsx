import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { listCategories } from '@/lib/store/categories';
import { createChannel, deleteChannel, listChannels, updateChannel } from '@/lib/store/channels';

export default async function ChannelsPage({
  searchParams
}: {
  searchParams?: { category?: string };
}) {
  const [channels, categories] = await Promise.all([listChannels(), listCategories()]);
  const activeCategory = searchParams?.category || 'all';
  const filteredChannels =
    activeCategory === 'all'
      ? channels
      : channels.filter((channel) => channel.categoryId === activeCategory);

  async function handleCreate(formData: FormData) {
    'use server';
    const title = String(formData.get('title') || '').trim();
    const handle = String(formData.get('handle') || '').trim();
    const channelUrl = String(formData.get('channelUrl') || '').trim();
    const categoryId = String(formData.get('categoryId') || '').trim();
    if (!title || !channelUrl) return;
    await createChannel({
      title,
      handle: handle || undefined,
      channelUrl,
      categoryId: categoryId || undefined
    });
    revalidatePath('/channels');
  }

  async function handleUpdate(formData: FormData) {
    'use server';
    const id = String(formData.get('id'));
    const title = String(formData.get('title') || '').trim();
    const handle = String(formData.get('handle') || '').trim();
    const channelUrl = String(formData.get('channelUrl') || '').trim();
    const categoryId = String(formData.get('categoryId') || '').trim();
    if (!id || !title || !channelUrl) return;
    await updateChannel(id, {
      title,
      handle: handle || undefined,
      channelUrl,
      categoryId: categoryId || undefined
    });
    revalidatePath('/channels');
  }

  async function handleDelete(formData: FormData) {
    'use server';
    const id = String(formData.get('id'));
    if (!id) return;
    await deleteChannel(id);
    revalidatePath('/channels');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Channels</h2>
        <p className="text-sm text-slate-400">Track creators and map them to categories.</p>
      </div>
      <Card title="Create Channel">
        <form action={handleCreate} className="grid gap-3 md:grid-cols-4">
          <Input name="title" placeholder="Channel title" required />
          <Input name="handle" placeholder="@handle" />
          <Input name="channelUrl" placeholder="Channel URL" required />
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
          <div className="md:col-span-4 flex justify-end">
            <Button type="submit">Add Channel</Button>
          </div>
        </form>
      </Card>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/channels"
          className={`rounded-full px-3 py-1 text-sm ${
            activeCategory === 'all' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-200'
          }`}
        >
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/channels?category=${category.id}`}
            className={`rounded-full px-3 py-1 text-sm ${
              activeCategory === category.id
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800 text-slate-200'
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>
      <div className="grid gap-4">
        {filteredChannels.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-400">No channels for this filter yet.</p>
          </Card>
        ) : (
          filteredChannels.map((channel) => (
            <Card key={channel.id}>
              <form action={handleUpdate} className="grid gap-3 md:grid-cols-4">
                <input type="hidden" name="id" value={channel.id} />
                <Input name="title" defaultValue={channel.title} />
                <Input name="handle" defaultValue={channel.handle} />
                <Input name="channelUrl" defaultValue={channel.channelUrl} />
                <select
                  name="categoryId"
                  defaultValue={channel.categoryId || ''}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="md:col-span-4 flex flex-wrap justify-end gap-2">
                  <Button type="submit" variant="secondary">
                    Save
                  </Button>
                  <Button type="submit" formAction={handleDelete} variant="danger">
                    Delete
                  </Button>
                </div>
              </form>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
