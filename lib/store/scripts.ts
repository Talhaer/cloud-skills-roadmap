import { nanoid } from 'nanoid';
import { readJson, writeJson } from './store';
import { ScriptVersion } from '../types';

const FILE = 'script_versions.json';

type ScriptStore = { scriptVersions: ScriptVersion[] };

export async function listScriptVersions(projectId: string): Promise<ScriptVersion[]> {
  const data = await readJson<ScriptStore>(FILE, { scriptVersions: [] });
  return data.scriptVersions
    .filter((version) => version.projectId === projectId)
    .sort((a, b) => a.versionNumber - b.versionNumber);
}

export async function getScriptVersion(id: string): Promise<ScriptVersion | null> {
  const data = await readJson<ScriptStore>(FILE, { scriptVersions: [] });
  return data.scriptVersions.find((version) => version.id === id) ?? null;
}

export async function createScriptVersion(input: Omit<ScriptVersion, 'id' | 'createdAt'>) {
  const data = await readJson<ScriptStore>(FILE, { scriptVersions: [] });
  const script: ScriptVersion = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    ...input
  };
  data.scriptVersions.push(script);
  await writeJson(FILE, data);
  return script;
}

export async function updateScriptVersion(
  id: string,
  updates: Partial<Omit<ScriptVersion, 'id' | 'createdAt'>>
): Promise<ScriptVersion | null> {
  const data = await readJson<ScriptStore>(FILE, { scriptVersions: [] });
  const index = data.scriptVersions.findIndex((version) => version.id === id);
  if (index === -1) return null;
  const updated = { ...data.scriptVersions[index], ...updates };
  data.scriptVersions[index] = updated;
  await writeJson(FILE, data);
  return updated;
}

export async function deleteScriptVersionsForProject(projectId: string) {
  const data = await readJson<ScriptStore>(FILE, { scriptVersions: [] });
  data.scriptVersions = data.scriptVersions.filter((version) => version.projectId !== projectId);
  await writeJson(FILE, data);
}
