import { getCollection } from 'astro:content';
const escape = (text: string) => text.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!);
export async function GET() {
  const notes = await getCollection('docs', ({ data }) => !data.draft && !!(data.course || data.venue));
  const site = 'https://taxodiumpendragon.github.io';
  const items = notes.map(({ id, data }) => `<item><title>${escape(data.title)}</title><link>${site}/${id}/</link><guid>${site}/${id}/</guid><description>${escape(data.description ?? '')}</description></item>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>TaxodiumPendragon</title><link>${site}/</link><description>课程笔记与论文阅读</description><language>zh-CN</language>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
