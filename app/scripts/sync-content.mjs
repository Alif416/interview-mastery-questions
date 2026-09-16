// Copies the repo's markdown content (kept at the repo root as the single
// source of truth) into app/public/content/<section>/<page>.md, using the
// slugs defined in src/content/manifest.js. Runs before dev/build so the app
// can fetch content at predictable, slug-based URLs.

import { existsSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sections } from '../src/content/manifest.js';

const appDir = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(appDir);
const outDir = join(appDir, 'public', 'content');

rmSync(outDir, { recursive: true, force: true });

for (const section of sections) {
  const sectionOutDir = join(outDir, section.slug);
  mkdirSync(sectionOutDir, { recursive: true });

  for (const page of section.pages) {
    const src = join(repoRoot, section.sourceDir, page.file);
    const dest = join(sectionOutDir, `${page.slug}.md`);

    if (!existsSync(src)) {
      throw new Error(`sync-content: missing source file "${src}" for ${section.slug}/${page.slug}`);
    }

    copyFileSync(src, dest);
  }
}

console.log(`sync-content: copied ${sections.reduce((n, s) => n + s.pages.length, 0)} pages into public/content/`);
