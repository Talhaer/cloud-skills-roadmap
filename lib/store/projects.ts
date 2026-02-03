import { nanoid } from 'nanoid';
import { readJson, writeJson } from './store';
import { Project } from '../types';

const FILE = 'projects.json';

type ProjectStore = { projects: Project[] };

export async function listProjects(): Promise<Project[]> {
  const data = await readJson<ProjectStore>(FILE, { projects: [] });
  return [...data.projects].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getProject(id: string): Promise<Project | null> {
  const data = await readJson<ProjectStore>(FILE, { projects: [] });
  return data.projects.find((project) => project.id === id) ?? null;
}

export async function createProject(input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
  const data = await readJson<ProjectStore>(FILE, { projects: [] });
  const now = new Date().toISOString();
  const project: Project = {
    id: nanoid(),
    createdAt: now,
    updatedAt: now,
    ...input
  };
  data.projects.push(project);
  await writeJson(FILE, data);
  return project;
}

export async function updateProject(
  id: string,
  updates: Partial<Omit<Project, 'id' | 'createdAt'>>
): Promise<Project | null> {
  const data = await readJson<ProjectStore>(FILE, { projects: [] });
  const index = data.projects.findIndex((project) => project.id === id);
  if (index === -1) return null;
  const updated: Project = {
    ...data.projects[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  data.projects[index] = updated;
  await writeJson(FILE, data);
  return updated;
}

export async function deleteProject(id: string): Promise<void> {
  const data = await readJson<ProjectStore>(FILE, { projects: [] });
  data.projects = data.projects.filter((project) => project.id !== id);
  await writeJson(FILE, data);
}
