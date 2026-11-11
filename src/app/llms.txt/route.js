import { LIVE_METHODS, UNITS } from '../data/methods';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../utils/seo/site';

/**
 * /llms.txt (roadmap F10): a short, plain guide for AI assistants to what NETZ has, in the llmstxt.org
 * format. Built from the methods list, so a page shows up here the day it goes live.
 */
export const dynamic = 'force-static';

export function GET() {
  const byUnit = UNITS
    .map((u) => ({ u, pages: LIVE_METHODS.filter((m) => m.unit === u.unit) }))
    .filter((g) => g.pages.length);
  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION} Every method page shows each step in the same layout textbooks use, with a worked example and a calculator for your own numbers.`,
    '',
    '## Apps',
    '',
    `- [Notes](${SITE_URL}/Notes): notes with live maths, solver blocks and quizzes`,
    `- [Board](${SITE_URL}/Playground): a whiteboard that turns handwritten maths into equations and answers`,
    `- [All methods](${SITE_URL}/Algorithems): every step-by-step solver, by unit`,
    '',
    ...byUnit.flatMap(({ u, pages }) => [
      `## ${u.title}`,
      '',
      ...pages.map((m) => `- [${m.title || m.name}](${SITE_URL}${m.route}): ${m.description || m.name}`),
      '',
    ]),
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
