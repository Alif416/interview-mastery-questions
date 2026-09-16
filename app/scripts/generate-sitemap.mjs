// Generates public/sitemap.xml listing every real page (home + one per manifest
// entry), using the same source of truth as sync-content.mjs.

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sections } from '../src/content/manifest.js';

const SITE_URL = 'https://alif416.github.io/interview-mastery-questions';

const appDir = dirname(dirname(fileURLToPath(import.meta.url)));
const outFile = join(appDir, 'public', 'sitemap.xml');

const urls = [
  SITE_URL + '/',
  ...sections.flatMap((section) =>
    section.pages.map((page) => `${SITE_URL}/${section.slug}/${page.slug}`)
  ),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`;

writeFileSync(outFile, xml);
console.log(`generate-sitemap: wrote ${urls.length} URLs to public/sitemap.xml`);
