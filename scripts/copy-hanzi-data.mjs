import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'node_modules/hanzi-writer-data');
const target = resolve(root, 'public/hanzi-writer-data');

await mkdir(target, { recursive: true });
await cp(source, target, {
  recursive: true,
  force: true,
  filter: (path) => path.endsWith('.json') || path === source,
});

console.log('Copied Hanzi Writer stroke data to public/hanzi-writer-data');
