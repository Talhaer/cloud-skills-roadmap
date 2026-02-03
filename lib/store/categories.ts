import { nanoid } from 'nanoid';
import { readJson, writeJson } from './store';
import { Category } from '../types';

const FILE = 'categories.json';

type CategoryStore = { categories: Category[] };

export async function listCategories(): Promise<Category[]> {
  const data = await readJson<CategoryStore>(FILE, { categories: [] });
  return [...data.categories].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function createCategory(input: { name: string; description?: string }) {
  const data = await readJson<CategoryStore>(FILE, { categories: [] });
  const now = new Date().toISOString();
  const category: Category = {
    id: nanoid(),
    name: input.name,
    description: input.description,
    createdAt: now,
    updatedAt: now
  };
  data.categories.push(category);
  await writeJson(FILE, data);
  return category;
}

export async function updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<Category | null> {
  const data = await readJson<CategoryStore>(FILE, { categories: [] });
  const index = data.categories.findIndex((category) => category.id === id);
  if (index === -1) return null;
  const updated: Category = {
    ...data.categories[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  data.categories[index] = updated;
  await writeJson(FILE, data);
  return updated;
}

export async function deleteCategory(id: string): Promise<void> {
  const data = await readJson<CategoryStore>(FILE, { categories: [] });
  data.categories = data.categories.filter((category) => category.id !== id);
  await writeJson(FILE, data);
}
