// Single source of truth for site content.
// - `sourceDir` is relative to the repo root (used by scripts/sync-content.mjs).
// - `slug` values define the routes: /<section.slug>/<page.slug>
// - sync-content.mjs copies each page's `file` into
//   app/public/content/<section.slug>/<page.slug>.md

export const sections = [
  {
    slug: 'leetcode',
    title: 'LeetCode Patterns',
    sourceDir: 'leetcode',
    pages: [
      { slug: 'array-hashing', title: 'Array & Hashing', file: 'array.md' },
      { slug: 'two-pointer', title: 'Two Pointer', file: 'two pointer.md' },
      { slug: 'sliding-window', title: 'Sliding Window', file: 'sliding window.md' },
      { slug: 'stack', title: 'Stack', file: 'stack.md' },
      { slug: 'binary-search', title: 'Binary Search', file: 'binary search.md' },
      { slug: 'linked-list', title: 'Linked List', file: 'linked list.md' },
      { slug: 'tries', title: 'Tries', file: 'tries.md' },
      { slug: 'heap-priority-queue', title: 'Heap & Priority Queue', file: 'heap and priority queue.md' },
      { slug: 'backtracking', title: 'Backtracking', file: 'backtracking.md' },
      { slug: 'graph', title: 'Graph', file: 'graph.md' },
      { slug: 'intervals', title: 'Intervals', file: 'intervals.md' },
      { slug: 'greedy', title: 'Greedy', file: 'greedy.md' },
      { slug: 'dynamic-programming', title: 'Dynamic Programming', file: 'dynamic programming.md' },
      { slug: 'bit-manipulation', title: 'Bit Manipulation', file: 'bit manipulation.md' },
    ],
  },
  {
    slug: 'javascript-mastery',
    title: 'JavaScript Mastery',
    sourceDir: 'javascript mastery',
    pages: [
      { slug: 'fundamentals', title: 'Fundamentals', file: 'fundamentals.md' },
      { slug: 'variables', title: 'Variables', file: 'variables.md' },
      { slug: 'functions', title: 'Functions', file: 'function.md' },
    ],
  },
];

export function findPage(sectionSlug, pageSlug) {
  const section = sections.find((s) => s.slug === sectionSlug);
  if (!section) return null;
  const page = section.pages.find((p) => p.slug === pageSlug);
  if (!page) return null;
  return { section, page };
}

export function allPages() {
  return sections.flatMap((section) =>
    section.pages.map((page) => ({ section, page }))
  );
}
