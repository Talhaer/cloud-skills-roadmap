import { mkdir, readFile, rename, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

const dataDir = join(process.cwd(), 'data');

export async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  const filePath = join(dataDir, fileName);
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    await ensureFile(filePath, fallback);
    return fallback;
  }
}

export async function writeJson<T>(fileName: string, data: T): Promise<void> {
  const filePath = join(dataDir, fileName);
  await mkdir(dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.${Date.now()}.tmp`;
  await writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  await rename(tmpPath, filePath);
}

async function ensureFile<T>(filePath: string, fallback: T) {
  await mkdir(dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.${Date.now()}.tmp`;
  await writeFile(tmpPath, JSON.stringify(fallback, null, 2), 'utf-8');
  await rename(tmpPath, filePath);
}
