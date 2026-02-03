export type Category = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type Channel = {
  id: string;
  categoryId?: string;
  title: string;
  handle?: string;
  channelUrl: string;
  createdAt: string;
};

export type Project = {
  id: string;
  title: string;
  topic: string;
  categoryId?: string;
  channelId?: string;
  createdAt: string;
  updatedAt: string;
};

export type ScriptVersion = {
  id: string;
  projectId: string;
  versionNumber: number;
  content: string;
  createdAt: string;
};

export type Segment = {
  id: string;
  scriptVersionId: string;
  orderIndex: number;
  text: string;
  createdAt: string;
};

export type Prompt = {
  id: string;
  segmentId: string;
  content: string;
  status: 'draft' | 'approved';
  createdAt: string;
  updatedAt: string;
};
