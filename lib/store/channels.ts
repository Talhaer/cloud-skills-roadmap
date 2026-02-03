import { nanoid } from 'nanoid';
import { readJson, writeJson } from './store';
import { Channel } from '../types';

const FILE = 'channels.json';

type ChannelStore = { channels: Channel[] };

export async function listChannels(): Promise<Channel[]> {
  const data = await readJson<ChannelStore>(FILE, { channels: [] });
  return [...data.channels].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function createChannel(input: Omit<Channel, 'id' | 'createdAt'>) {
  const data = await readJson<ChannelStore>(FILE, { channels: [] });
  const channel: Channel = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    ...input
  };
  data.channels.push(channel);
  await writeJson(FILE, data);
  return channel;
}

export async function updateChannel(id: string, updates: Partial<Omit<Channel, 'id' | 'createdAt'>>): Promise<Channel | null> {
  const data = await readJson<ChannelStore>(FILE, { channels: [] });
  const index = data.channels.findIndex((channel) => channel.id === id);
  if (index === -1) return null;
  const updated: Channel = { ...data.channels[index], ...updates };
  data.channels[index] = updated;
  await writeJson(FILE, data);
  return updated;
}

export async function deleteChannel(id: string): Promise<void> {
  const data = await readJson<ChannelStore>(FILE, { channels: [] });
  data.channels = data.channels.filter((channel) => channel.id !== id);
  await writeJson(FILE, data);
}
