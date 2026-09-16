# Interview Mastery — app

Vite + React app that renders the notes in `../leetcode/` and `../javascript mastery/`
at runtime, with a black navbar / white body layout, sidebar navigation, and search.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Both commands first run `npm run sync-content`, which copies the markdown content from
the repo root into `public/content/` (gitignored, regenerated on every run) using the
slugs defined in `src/content/manifest.js`.
