import { Prompt } from './types';

export function generateScriptContent(topic: string, versionNumber: number) {
  return [
    `# ${topic} (v${versionNumber})`,
    '',
    `Intro: Hook the audience with a surprising fact about ${topic}.`,
    `Outline the key promise and what viewers will learn.`,
    '',
    `Segment 1: Background on ${topic} and why it matters today.`,
    `Segment 2: The biggest mistake people make with ${topic}.`,
    `Segment 3: A step-by-step framework to succeed with ${topic}.`,
    '',
    `Closing: Recap the top three takeaways and invite engagement.`
  ].join('\n');
}

export function splitIntoSegments(script: string): string[] {
  const paragraphs = script
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (paragraphs.length > 1) {
    return paragraphs;
  }

  return script
    .split(/(?<=[.!?])\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

export function generatePromptText(segmentText: string) {
  const trimmed = segmentText.replace(/\s+/g, ' ').trim();
  return `Cinematic still, ${trimmed}, dramatic lighting, high detail, 16:9, documentary style.`;
}

export function buildPrompt(segmentId: string, content: string): Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    segmentId,
    content,
    status: 'draft'
  };
}
