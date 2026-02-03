import { listProjects } from '@/lib/store/projects';
import { listScriptVersions } from '@/lib/store/scripts';
import { listSegments } from '@/lib/store/segments';
import { listPromptsBySegmentIds } from '@/lib/store/prompts';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const projects = await listProjects();
  const project = projects.find((item) => item.id === params.id);
  if (!project) {
    return new Response('Not found', { status: 404 });
  }
  const scriptVersions = await listScriptVersions(project.id);
  const latestScript = scriptVersions[scriptVersions.length - 1];
  if (!latestScript) {
    return new Response('No script available', { status: 400 });
  }
  const segments = await listSegments(latestScript.id);
  const prompts = await listPromptsBySegmentIds(segments.map((segment) => segment.id));
  const promptMap = new Map(prompts.map((prompt) => [prompt.segmentId, prompt]));
  const body = segments
    .map((segment) => `image: ${promptMap.get(segment.id)?.content ?? 'Missing prompt'}`)
    .join('\n\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="${project.title.replace(/\s+/g, '_')}_prompts.txt"`
    }
  });
}
