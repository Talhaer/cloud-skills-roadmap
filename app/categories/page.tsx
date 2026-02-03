import { revalidatePath } from 'next/cache';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createCategory, deleteCategory, listCategories, updateCategory } from '@/lib/store/categories';

export default async function CategoriesPage() {
  const categories = await listCategories();

  async function handleCreate(formData: FormData) {
    'use server';
    const name = String(formData.get('name') || '').trim();
    const description = String(formData.get('description') || '').trim();
    if (!name) return;
    await createCategory({ name, description: description || undefined });
    revalidatePath('/categories');
  }

  async function handleUpdate(formData: FormData) {
    'use server';
    const id = String(formData.get('id'));
    const name = String(formData.get('name') || '').trim();
    const description = String(formData.get('description') || '').trim();
    if (!id || !name) return;
    await updateCategory(id, { name, description: description || undefined });
    revalidatePath('/categories');
  }

  async function handleDelete(formData: FormData) {
    'use server';
    const id = String(formData.get('id'));
    if (!id) return;
    await deleteCategory(id);
    revalidatePath('/categories');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Categories</h2>
        <p className="text-sm text-slate-400">Define content pillars and niches.</p>
      </div>
      <Card title="Create Category">
        <form action={handleCreate} className="grid gap-3 md:grid-cols-3">
          <Input name="name" placeholder="Category name" required />
          <Input name="description" placeholder="Optional description" />
          <div className="flex md:justify-end">
            <Button type="submit">Add Category</Button>
          </div>
        </form>
      </Card>
      <div className="grid gap-4">
        {categories.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-400">No categories yet.</p>
          </Card>
        ) : (
          categories.map((category) => (
            <Card key={category.id}>
              <form action={handleUpdate} className="grid gap-3 md:grid-cols-3">
                <input type="hidden" name="id" value={category.id} />
                <Input name="name" defaultValue={category.name} />
                <Textarea name="description" defaultValue={category.description} rows={2} />
                <div className="flex flex-wrap gap-2 md:justify-end">
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
