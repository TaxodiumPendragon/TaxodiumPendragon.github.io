import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const dist = path.resolve('dist');
const docs = path.resolve('src/content/docs');
const read = (file) => fs.readFileSync(file, 'utf8');
const files = fs.readdirSync(dist, { recursive: true }).filter((f) => f.endsWith('.html'));
const notes = fs.readdirSync(docs, { recursive: true }).filter((f) => /\.mdx?$/.test(f));
let published = 0;
for (const file of notes) {
  const data = parse(read(path.join(docs, file)).match(/^---\n([\s\S]*?)\n---/)[1]);
  const slug = file.replaceAll('\\', '/').replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '');
  const output = path.join(dist, slug === '404' ? '404.html' : `${slug}/index.html`);
  if (data.draft) {
    assert(!fs.existsSync(output), `Draft was published: ${slug}`);
    continue;
  }
  assert(fs.existsSync(output), `Missing page: ${slug}`);
  const html = read(output);
  for (const direction of ['prev', 'next']) {
    if (data[direction]?.link) assert(html.includes(`href="${data[direction].link}"`), `Missing ${direction}: ${slug}`);
  }
  if (data.course || data.venue) published++;
}
for (const file of files) {
  const html = read(path.join(dist, file));
  assert(!html.includes('katex-error'), `Invalid math in ${file}`);
  assert(!html.includes('relative_url'), `Unconverted Liquid in ${file}`);
  for (const match of html.matchAll(/(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
    if (match[1].startsWith('//')) continue;
    const target = path.join(dist, decodeURIComponent(match[1]));
    assert(fs.existsSync(target), `Broken local link in ${file}: ${match[1]}`);
  }
}
assert(published >= 19, 'Migrated course or paper notes are missing');
assert(read(path.join(dist, 'courses/compilers/02-syntax-analysis/index.html')).includes('katex'), 'Math was not rendered');
assert(read(path.join(dist, 'about/index.html')).includes('src="/avatar.png"'), 'Missing author avatar');
assert(fs.existsSync(path.join(dist, 'avatar.png')), 'Missing avatar asset');
assert(fs.existsSync(path.join(dist, 'pagefind/pagefind.js')), 'Missing search index');
assert(fs.existsSync(path.join(dist, 'feed.xml')), 'Missing existing feed URL');
console.log(`Verified ${files.length} HTML pages: ${published} notes, draft exclusion, local links, images, navigation, math, avatar and search index.`);
