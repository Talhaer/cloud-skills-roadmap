import { nanoid } from 'nanoid';
import { readJson, writeJson } from './store';
import { Prompt } from '../types';

const FILE = 'prompts.json';

type PromptStore = { prompts: Prompt[] };

export async function listPrompts(): Promise<Prompt[]> {
  const data = await readJson<PromptStore>(FILE, { prompts: [] });
  return [...data.prompts].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function listPromptsBySegmentIds(segmentIds: string[]): Promise<Prompt[]> {
  const data = await readJson<PromptStore>(FILE, { prompts: [] });
  return data.prompts
    .filter((prompt) => segmentIds.includes(prompt.segmentId))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function createPrompt(input: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) {
  const data = await readJson<PromptStore>(FILE, { prompts: [] });
  const now = new Date().toISOString();
  const prompt: Prompt = {
    id: nanoid(),
    createdAt: now,
    updatedAt: now,
    ...input
  };
  data.prompts.push(prompt);
  await writeJson(FILE, data);
  return prompt;
}

export async function updatePrompt(id: string, updates: Partial<Omit<Prompt, 'id' | 'segmentId' | 'createdAt'>>) {
  const data = await readJson<PromptStore>(FILE, { prompts: [] });
  const index = data.prompts.findIndex((prompt) => prompt.id === id);
  if (index === -1) return null;
  const updated: Prompt = {
    ...data.prompts[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  data.prompts[index] = updated;
  await writeJson(FILE, data);
  return updated;
}

export async function setPrompts(prompts: Prompt[]) {
  const data = await readJson<PromptStore>(FILE, { prompts: [] });
  const promptIds = new Set(prompts.map((prompt) => prompt.id));
  data.prompts = data.prompts.filter((prompt) => !promptIds.has(prompt.id));
  data.prompts.push(...prompts);
  await writeJson(FILE, data);
}

export async function deletePromptsForSegments(segmentIds: string[]) {
  const data = await readJson<PromptStore>(FILE, { prompts: [] });
  data.prompts = data.prompts.filter((prompt) => !segmentIds.includes(prompt.segmentId));
  await writeJson(FILE, data);
}
