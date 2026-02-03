import { nanoid } from 'nanoid';
import { readJson, writeJson } from './store';
import { Segment } from '../types';

const FILE = 'segments.json';

type SegmentStore = { segments: Segment[] };

export async function listSegments(scriptVersionId: string): Promise<Segment[]> {
  const data = await readJson<SegmentStore>(FILE, { segments: [] });
  return data.segments
    .filter((segment) => segment.scriptVersionId === scriptVersionId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function createSegments(scriptVersionId: string, texts: string[]) {
  const data = await readJson<SegmentStore>(FILE, { segments: [] });
  const now = new Date().toISOString();
  const newSegments = texts.map((text, index) => ({
    id: nanoid(),
    scriptVersionId,
    orderIndex: index,
    text,
    createdAt: now
  }));
  data.segments = data.segments.filter((segment) => segment.scriptVersionId !== scriptVersionId);
  data.segments.push(...newSegments);
  await writeJson(FILE, data);
  return newSegments;
}

export async function updateSegment(id: string, updates: Partial<Omit<Segment, 'id' | 'scriptVersionId' | 'createdAt'>>) {
  const data = await readJson<SegmentStore>(FILE, { segments: [] });
  const index = data.segments.findIndex((segment) => segment.id === id);
  if (index === -1) return null;
  const updated = { ...data.segments[index], ...updates };
  data.segments[index] = updated;
  await writeJson(FILE, data);
  return updated;
}

export async function setSegments(scriptVersionId: string, segments: Segment[]) {
  const data = await readJson<SegmentStore>(FILE, { segments: [] });
  data.segments = data.segments.filter((segment) => segment.scriptVersionId !== scriptVersionId);
  data.segments.push(...segments);
  await writeJson(FILE, data);
}

export async function deleteSegmentsForScript(scriptVersionId: string) {
  const data = await readJson<SegmentStore>(FILE, { segments: [] });
  data.segments = data.segments.filter((segment) => segment.scriptVersionId !== scriptVersionId);
  await writeJson(FILE, data);
}
