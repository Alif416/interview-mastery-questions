// Single source of truth for site content.
// - `sourceDir` is relative to the repo root (used by scripts/sync-content.mjs).
// - `slug` values define the routes: /<section.slug>/<page.slug>
// - sync-content.mjs copies each page's `file` into
//   app/public/content/<section.slug>/<page.slug>.md

export const sections = [
  {
    slug: 'leetcode',
    title: 'LeetCode Patterns',
    icon: '🧩',
    description: 'Recurring problem-solving patterns that cover most technical interview questions.',
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
    icon: '💻',
    description: 'Core language concepts explained in interview-question form, from hoisting to Proxies.',
    sourceDir: 'javascript mastery',
    pages: [
      { slug: 'fundamentals', title: 'Fundamentals', file: 'fundamentals.md' },
      { slug: 'variables', title: 'Variables', file: 'variables.md' },
      { slug: 'functions', title: 'Functions', file: 'function.md' },
      { slug: 'objects', title: 'Objects & Prototypes', file: 'objects.md' },
      { slug: 'arrays', title: 'Arrays & Data Transformation', file: 'arrays.md' },
      { slug: 'async', title: 'Asynchronous JavaScript', file: 'async.md' },
      { slug: 'dom', title: 'DOM & Browser APIs', file: 'dom.md' },
      { slug: 'modules', title: 'Modules & Modern JS', file: 'modules.md' },
      { slug: 'memory', title: 'Memory & Performance', file: 'memory.md' },
      { slug: 'advanced', title: 'Advanced JavaScript', file: 'advanced.md' },
    ],
  },
  {
    slug: 'react',
    title: 'React',
    icon: '⚛️',
    description: 'From JSX and components to hooks and architecture — React explained in interview-question form.',
    sourceDir: 'react',
    pages: [
      { slug: 'fundamentals', title: 'React Fundamentals', file: 'fundamentals.md' },
      { slug: 'components', title: 'Components', file: 'components.md' },
      { slug: 'jsx', title: 'JSX', file: 'jsx.md' },
      { slug: 'props', title: 'Props', file: 'props.md' },
      { slug: 'state', title: 'State', file: 'state.md' },
      { slug: 'rendering', title: 'Rendering & Re-rendering', file: 'rendering.md' },
      { slug: 'events', title: 'Events', file: 'events.md' },
      { slug: 'forms', title: 'Forms', file: 'forms.md' },
      { slug: 'use-effect', title: 'useEffect', file: 'use-effect.md' },
      { slug: 'use-ref', title: 'useRef', file: 'use-ref.md' },
      { slug: 'use-context', title: 'useContext', file: 'use-context.md' },
      { slug: 'use-reducer', title: 'useReducer', file: 'use-reducer.md' },
      { slug: 'custom-hooks', title: 'Custom Hooks', file: 'custom-hooks.md' },
      { slug: 'data-fetching', title: 'Data Fetching & APIs', file: 'data-fetching.md' },
      { slug: 'state-management', title: 'State Management', file: 'state-management.md' },
      { slug: 'performance', title: 'Performance Optimization', file: 'performance.md' },
      { slug: 'routing', title: 'React Router', file: 'routing.md' },
      { slug: 'architecture', title: 'Component Architecture', file: 'architecture.md' },
      { slug: 'typescript', title: 'TypeScript + React', file: 'typescript.md' },
      { slug: 'testing', title: 'Testing', file: 'testing.md' },
      { slug: 'security', title: 'React Security', file: 'security.md' },
      { slug: 'advanced', title: 'Advanced React', file: 'advanced.md' },
    ],
  },
  {
    slug: 'typescript',
    title: 'TypeScript',
    icon: '🔷',
    description: 'From basic types to generics, utility types, and TypeScript with React — explained in interview-question form.',
    sourceDir: 'typescript',
    pages: [
      { slug: 'fundamentals', title: 'TypeScript Fundamentals', file: 'fundamentals.md' },
      { slug: 'arrays-objects', title: 'Arrays & Objects', file: 'arrays-objects.md' },
      { slug: 'type-aliases', title: 'Type Aliases', file: 'type-aliases.md' },
      { slug: 'interfaces', title: 'Interfaces', file: 'interfaces.md' },
      { slug: 'union-intersection', title: 'Union & Intersection Types', file: 'union-intersection.md' },
      { slug: 'literal-types', title: 'Literal Types', file: 'literal-types.md' },
      { slug: 'functions', title: 'Functions', file: 'functions.md' },
      { slug: 'any-unknown-never-void', title: 'any, unknown, never, void', file: 'any-unknown-never-void.md' },
      { slug: 'type-narrowing', title: 'Type Narrowing', file: 'type-narrowing.md' },
      { slug: 'type-assertions', title: 'Type Assertions', file: 'type-assertions.md' },
      { slug: 'enums', title: 'Enums', file: 'enums.md' },
      { slug: 'generics', title: 'Generics', file: 'generics.md' },
      { slug: 'utility-types', title: 'Utility Types', file: 'utility-types.md' },
      { slug: 'keyof-typeof-indexed-access', title: 'keyof, typeof, Indexed Access', file: 'keyof-typeof-indexed-access.md' },
      { slug: 'mapped-types', title: 'Mapped Types', file: 'mapped-types.md' },
      { slug: 'conditional-types', title: 'Conditional Types', file: 'conditional-types.md' },
      { slug: 'template-literal-types', title: 'Template Literal Types', file: 'template-literal-types.md' },
      { slug: 'discriminated-unions', title: 'Discriminated Unions', file: 'discriminated-unions.md' },
      { slug: 'classes-oop', title: 'Classes & OOP', file: 'classes-oop.md' },
      { slug: 'modules', title: 'Modules & Project Structure', file: 'modules.md' },
      { slug: 'tsconfig', title: 'tsconfig.json', file: 'tsconfig.md' },
      { slug: 'typescript-react', title: 'TypeScript + React', file: 'typescript-react.md' },
      { slug: 'usestate-typescript', title: 'React useState + TypeScript', file: 'usestate-typescript.md' },
      { slug: 'events-typescript', title: 'React Events + TypeScript', file: 'events-typescript.md' },
      { slug: 'useref-typescript', title: 'React useRef + TypeScript', file: 'useref-typescript.md' },
      { slug: 'usecontext-typescript', title: 'React Context + TypeScript', file: 'usecontext-typescript.md' },
      { slug: 'usereducer-typescript', title: 'React useReducer + TypeScript', file: 'usereducer-typescript.md' },
      { slug: 'api-responses', title: 'API Responses', file: 'api-responses.md' },
      { slug: 'node-express', title: 'TypeScript + Node/Express', file: 'node-express.md' },
      { slug: 'advanced', title: 'Advanced TypeScript', file: 'advanced.md' },
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
