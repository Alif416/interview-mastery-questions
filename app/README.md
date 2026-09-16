# Interview Drill — app

Vite + React app that renders the notes in `../leetcode/` and `../javascript mastery/`
at runtime, with a navbar / body layout, sidebar navigation, and search. Uses real URLs
(`BrowserRouter`) with a GitHub Pages SPA-fallback (`public/404.html`) so every page is
directly linkable and indexable.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Both commands first run `npm run sync-content` (copies the markdown content from the repo
root into `public/content/`, gitignored, regenerated every run) and `npm run generate-sitemap`
(writes `public/sitemap.xml` from `src/content/manifest.js`), so both stay in sync automatically.
