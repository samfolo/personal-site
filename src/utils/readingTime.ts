/**
 * Reading Time Utility
 *
 * Calculates estimated reading time for post content.
 * Uses average reading speed of 200 words per minute.
 */

const WORDS_PER_MINUTE = 200;

export function calculateReadingTime(content: string): string {
  // Remove MDX/JSX components and code blocks
  const textContent = content
    .replace(/<[^>]*>/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '');

  const wordCount = textContent.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);

  return `${minutes} min read`;
}
