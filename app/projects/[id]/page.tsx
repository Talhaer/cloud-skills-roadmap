import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs } from '@/components/ui/tabs';
import { generatePromptText, generateScriptContent, splitIntoSegments } from '@/lib/generators';
import { nanoid } from 'nanoid';
import { listCategories } from '@/lib/store/categories';
import { listChannels } from '@/lib/store/channels';
import { createPrompt, listPromptsBySegmentIds, updatePrompt } from '@/lib/store/prompts';
import { listProjects, updateProject } from '@/lib/store/projects';
import { createScriptVersion, listScriptVersions, updateScriptVersion } from '@/lib/store/scripts';
import { createSegments, listSegments, setSegments, updateSegment } from '@/lib/store/segments';
import { Segment } from '@/lib/types';

const tabs = [
  { key: 'brief', label: 'Brief' },
  { key: 'script', label: 'Script' },
  { key: 'mapping', label: 'Mapping' },
  { key: 'export', label: 'Export' }
];

export default async function ProjectDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { tab?: string };
}) {
  const [projects, categories, channels, scriptVersions] = await Promise.all([
    listProjects(),
    listCategories(),
    listChannels(),
    listScriptVersions(params.id)
  ]);
  const project = projects.find((item) => item.id === params.id);
  if (!project) return notFound();

  const activeTab = tabs.find((tab) => tab.key === searchParams?.tab)?.key ?? 'brief';
  const latestScript = scriptVersions[scriptVersions.length - 1];
  const segments = latestScript ? await listSegments(latestScript.id) : [];
  const prompts = await listPromptsBySegmentIds(segments.map((segment) => segment.id));

  async function handleUpdateBrief(formData: FormData) {
    'use server';
    const title = String(formData.get('title') || '').trim();
    const topic = String(formData.get('topic') || '').trim();
    const categoryId = String(formData.get('categoryId') || '').trim();
    const channelId = String(formData.get('channelId') || '').trim();
    if (!title || !topic) return;
    await updateProject(project.id, {
      title,
      topic,
      categoryId: categoryId || undefined,
      channelId: channelId || undefined
    });
    revalidatePath(`/projects/${project.id}`);
  }

  async function handleGenerateScript() {
    'use server';
    const versionNumber = scriptVersions.length + 1;
    const content = generateScriptContent(project.topic, versionNumber);
    await createScriptVersion({
      projectId: project.id,
      versionNumber,
      content
    });
    revalidatePath(`/projects/${project.id}`);
  }

  async function handleUpdateScript(formData: FormData) {
    'use server';
    const scriptId = String(formData.get('scriptId'));
    const content = String(formData.get('content') || '').trim();
    if (!scriptId || !content) return;
    await updateScriptVersion(scriptId, { content });
    revalidatePath(`/projects/${project.id}`);
  }

  async function handleGenerateSegments() {
    'use server';
    if (!latestScript) return;
    const segments = splitIntoSegments(latestScript.content);
    await createSegments(latestScript.id, segments);
    revalidatePath(`/projects/${project.id}`);
  }

  async function handleUpdateSegment(formData: FormData) {
    'use server';
    const segmentId = String(formData.get('segmentId'));
    const text = String(formData.get('text') || '').trim();
    if (!segmentId || !text) return;
    await updateSegment(segmentId, { text });
    revalidatePath(`/projects/${project.id}`);
  }

  async function handleReorderSegment(formData: FormData) {
    'use server';
    const segmentId = String(formData.get('segmentId'));
    const direction = String(formData.get('direction'));
    if (!latestScript || !segmentId) return;
    const currentSegments = await listSegments(latestScript.id);
    const index = currentSegments.findIndex((segment) => segment.id === segmentId);
    if (index === -1) return;
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= currentSegments.length) return;
    const updated = [...currentSegments];
    const temp = updated[index].orderIndex;
    updated[index].orderIndex = updated[swapIndex].orderIndex;
    updated[swapIndex].orderIndex = temp;
    updated.sort((a, b) => a.orderIndex - b.orderIndex);
    await setSegments(latestScript.id, updated);
    revalidatePath(`/projects/${project.id}`);
  }

  async function handleSplitSegment(formData: FormData) {
    'use server';
    const segmentId = String(formData.get('segmentId'));
    if (!latestScript || !segmentId) return;
    const currentSegments = await listSegments(latestScript.id);
    const index = currentSegments.findIndex((segment) => segment.id === segmentId);
    if (index === -1) return;
    const segment = currentSegments[index];
    const midpoint = Math.max(1, Math.floor(segment.text.length / 2));
    const first = segment.text.slice(0, midpoint).trim();
    const second = segment.text.slice(midpoint).trim();
    if (!first || !second) return;
    const newSegment: Segment = {
      ...segment,
      id: nanoid(),
      text: second,
      orderIndex: segment.orderIndex + 0.5,
      createdAt: new Date().toISOString()
    };
    const updated = [...currentSegments];
    updated[index] = { ...segment, text: first };
    updated.splice(index + 1, 0, newSegment);
    const normalized = updated
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((item, idx) => ({ ...item, orderIndex: idx }));
    await setSegments(latestScript.id, normalized);
    revalidatePath(`/projects/${project.id}`);
  }

  async function handleMergeSegment(formData: FormData) {
    'use server';
    const segmentId = String(formData.get('segmentId'));
    if (!latestScript || !segmentId) return;
    const currentSegments = await listSegments(latestScript.id);
    const index = currentSegments.findIndex((segment) => segment.id === segmentId);
    if (index === -1 || index === currentSegments.length - 1) return;
    const current = currentSegments[index];
    const next = currentSegments[index + 1];
    const merged = {
      ...current,
      text: `${current.text.trim()} ${next.text.trim()}`.trim()
    };
    const updated = [...currentSegments];
    updated.splice(index, 2, merged);
    const normalized = updated.map((item, idx) => ({ ...item, orderIndex: idx }));
    await setSegments(latestScript.id, normalized);
    revalidatePath(`/projects/${project.id}`);
  }

  async function handleGeneratePrompts() {
    'use server';
    if (!latestScript) return;
    const currentSegments = await listSegments(latestScript.id);
    const existingPrompts = await listPromptsBySegmentIds(currentSegments.map((segment) => segment.id));
    const existingMap = new Map(existingPrompts.map((prompt) => [prompt.segmentId, prompt]));
    for (const segment of currentSegments) {
      const promptText = generatePromptText(segment.text);
      const existing = existingMap.get(segment.id);
      if (existing) {
        await updatePrompt(existing.id, { content: promptText, status: 'draft' });
      } else {
        await createPrompt({ segmentId: segment.id, content: promptText, status: 'draft' });
      }
    }
    revalidatePath(`/projects/${project.id}`);
  }

  async function handleUpdatePrompt(formData: FormData) {
    'use server';
    const promptId = String(formData.get('promptId'));
    const content = String(formData.get('content') || '').trim();
    if (!promptId || !content) return;
    await updatePrompt(promptId, { content });
    revalidatePath(`/projects/${project.id}`);
  }

  async function handleApprovePrompt(formData: FormData) {
    'use server';
    const promptId = String(formData.get('promptId'));
    if (!promptId) return;
    await updatePrompt(promptId, { status: 'approved' });
    revalidatePath(`/projects/${project.id}`);
  }

  async function handleRegeneratePrompt(formData: FormData) {
    'use server';
    const segmentId = String(formData.get('segmentId'));
    const promptId = String(formData.get('promptId'));
    if (!segmentId || !promptId) return;
    const segment = segments.find((item) => item.id === segmentId);
    if (!segment) return;
    const content = generatePromptText(segment.text);
    await updatePrompt(promptId, { content, status: 'draft' });
    revalidatePath(`/projects/${project.id}`);
  }

  const promptMap = new Map(prompts.map((prompt) => [prompt.segmentId, prompt]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Project</p>
          <h2 className="text-2xl font-semibold text-white">{project.title}</h2>
          <p className="text-sm text-slate-400">{project.topic}</p>
        </div>
        <Link href="/projects" className="text-sm text-slate-300 hover:text-white">
          ← Back to projects
        </Link>
      </div>

      <Tabs
        tabs={tabs.map((tab) => ({
          label: tab.label,
          href: `/projects/${project.id}?tab=${tab.key}`,
          active: activeTab === tab.key
        }))}
      />

      {activeTab === 'brief' && (
        <Card title="Project Brief" description="Edit the core metadata for this project.">
          <form action={handleUpdateBrief} className="grid gap-3 md:grid-cols-2">
            <Input name="title" defaultValue={project.title} />
            <Input name="topic" defaultValue={project.topic} />
            <select
              name="categoryId"
              defaultValue={project.categoryId || ''}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              name="channelId"
              defaultValue={project.channelId || ''}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">No channel</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.title}
                </option>
              ))}
            </select>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" variant="secondary">
                Save Brief
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'script' && (
        <div className="grid gap-4">
          <Card title="Script Writer" description="Generate placeholder scripts with version control.">
            <div className="flex flex-wrap items-center gap-3">
              <form action={handleGenerateScript}>
                <Button type="submit">Generate Script</Button>
              </form>
              <span className="text-sm text-slate-400">
                Versions: {scriptVersions.length || 0}
              </span>
            </div>
          </Card>
          {latestScript ? (
            <Card title={`Latest Script (v${latestScript.versionNumber})`}>
              <form action={handleUpdateScript} className="space-y-3">
                <input type="hidden" name="scriptId" value={latestScript.id} />
                <Textarea name="content" defaultValue={latestScript.content} rows={12} />
                <div className="flex justify-end">
                  <Button type="submit" variant="secondary">
                    Save Script
                  </Button>
                </div>
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={handleGenerateSegments}>
                  <Button type="submit" variant="ghost">
                    Generate Segments
                  </Button>
                </form>
                <span className="text-xs text-slate-500">
                  Splits by blank lines, otherwise sentence punctuation.
                </span>
              </div>
            </Card>
          ) : (
            <Card>
              <p className="text-sm text-slate-400">Generate a script to begin segmentation.</p>
            </Card>
          )}
          {segments.length > 0 && (
            <Card title="Segments" description="Edit, reorder, split, and merge segments.">
              <div className="space-y-4">
                {segments.map((segment, index) => (
                  <div key={segment.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                    <form action={handleUpdateSegment} className="space-y-2">
                      <input type="hidden" name="segmentId" value={segment.id} />
                      <Textarea name="text" defaultValue={segment.text} rows={3} />
                      <div className="flex flex-wrap gap-2">
                        <Button type="submit" variant="secondary">
                          Save
                        </Button>
                        <Button type="submit" formAction={handleReorderSegment} name="direction" value="up" disabled={index === 0}>
                          Move Up
                        </Button>
                        <Button
                          type="submit"
                          formAction={handleReorderSegment}
                          name="direction"
                          value="down"
                          disabled={index === segments.length - 1}
                        >
                          Move Down
                        </Button>
                        <Button type="submit" formAction={handleSplitSegment} variant="ghost">
                          Split
                        </Button>
                        <Button type="submit" formAction={handleMergeSegment} variant="ghost" disabled={index === segments.length - 1}>
                          Merge Next
                        </Button>
                      </div>
                    </form>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'mapping' && (
        <div className="space-y-4">
          <Card title="Prompt Engine" description="Generate Midjourney/DALL-E friendly prompts per segment.">
            <div className="flex flex-wrap items-center gap-3">
              <form action={handleGeneratePrompts}>
                <Button type="submit">Generate Prompts</Button>
              </form>
              <span className="text-sm text-slate-400">
                {segments.length} segment(s) mapped to prompts.
              </span>
            </div>
          </Card>
          {segments.length === 0 ? (
            <Card>
              <p className="text-sm text-slate-400">Generate segments first to map prompts.</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {segments.map((segment) => {
                const prompt = promptMap.get(segment.id);
                return (
                  <Card key={segment.id} className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs uppercase text-slate-500">Segment</p>
                      <form action={handleUpdateSegment} className="space-y-2">
                        <input type="hidden" name="segmentId" value={segment.id} />
                        <Textarea name="text" defaultValue={segment.text} rows={5} />
                        <Button type="submit" variant="secondary">
                          Save Segment
                        </Button>
                      </form>
                    </div>
                    <div>
                      <p className="mb-2 flex items-center justify-between text-xs uppercase text-slate-500">
                        Prompt
                        {prompt && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] ${
                              prompt.status === 'approved'
                                ? 'bg-emerald-600/30 text-emerald-200'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {prompt.status}
                          </span>
                        )}
                      </p>
                      {prompt ? (
                        <form action={handleUpdatePrompt} className="space-y-2">
                          <input type="hidden" name="promptId" value={prompt.id} />
                          <Textarea name="content" defaultValue={prompt.content} rows={5} />
                          <div className="flex flex-wrap gap-2">
                            <Button type="submit" variant="secondary">
                              Save Prompt
                            </Button>
                            <Button
                              type="submit"
                              formAction={handleRegeneratePrompt}
                              name="segmentId"
                              value={segment.id}
                              variant="ghost"
                            >
                              Regenerate
                            </Button>
                            <Button type="submit" formAction={handleApprovePrompt} variant="primary">
                              Approve
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <p className="text-sm text-slate-400">
                          No prompt yet. Use “Generate Prompts” to create one.
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'export' && (
        <Card title="Export" description="Download prompts in segment order.">
          {segments.length === 0 ? (
            <p className="text-sm text-slate-400">Generate segments and prompts to export.</p>
          ) : (
            <div className="space-y-3">
              <pre className="max-h-96 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200">
                {segments
                  .map((segment) => {
                    const prompt = promptMap.get(segment.id);
                    return `image: ${prompt?.content ?? 'Missing prompt'}`;
                  })
                  .join('\n\n')}
              </pre>
              <Link
                href={`/projects/${project.id}/export`}
                className="inline-flex w-fit items-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
              >
                Download TXT
              </Link>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
