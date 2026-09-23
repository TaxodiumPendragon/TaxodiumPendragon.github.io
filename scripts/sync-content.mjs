import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repository = path.resolve(import.meta.dirname, '..');
const source = path.join(repository, 'notes');
const target = path.join(repository, 'src', 'content', 'docs');

assert.equal(path.dirname(source), repository, 'Notes source must stay at the repository root.');
assert.equal(path.dirname(path.dirname(target)), path.join(repository, 'src'), 'Generated target escaped src/content.');
assert(fs.existsSync(source), 'Missing notes/ directory.');

const markdown = fs.readdirSync(source, { recursive: true })
  .filter((file) => /\.mdx?$/i.test(file));
assert(markdown.length > 0, 'No Markdown files found under notes/.');

for (const file of markdown) {
  const text = fs.readFileSync(path.join(source, file), 'utf8');
  assert(/^---\r?\n[\s\S]*?\r?\n---/.test(text), `Missing frontmatter: notes/${file}`);
  assert(/^title:\s*.+$/m.test(text), `Missing title: notes/${file}`);
}

fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.cpSync(source, target, { recursive: true });

console.log(`Synced ${markdown.length} Markdown files from notes/ to src/content/docs/.`);
