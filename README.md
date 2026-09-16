# Interview Mastery

Structured notes for coding interview prep — LeetCode problem patterns and JavaScript fundamentals, organized for focused review rather than endless scrolling.

**[Browse the site →](https://alif416.github.io/interview-mastery-questions/)**

## What's inside

### LeetCode Patterns

Each note covers a pattern's core idea, the shapes it recognizes, and a curated set of practice problems — ordered roughly by how they build on each other.

| Pattern | Notes |
|---|---|
| [Array & Hashing](leetcode/array.md) | HashMap/HashSet, frequency counting, prefix sums |
| [Two Pointers](leetcode/two pointer.md) | Sorted-array and opposite-end techniques |
| [Sliding Window](leetcode/sliding window.md) | Fixed and variable-size windows |
| [Stack](leetcode/stack.md) | Monotonic stacks, matching/parsing problems |
| [Binary Search](leetcode/binary search.md) | Search space reduction beyond sorted arrays |
| [Linked List](leetcode/linked list.md) | Fast/slow pointers, reversal, cycle detection |
| [Tries](leetcode/tries.md) | Prefix trees for word/string problems |
| [Heap & Priority Queue](leetcode/heap and priority queue.md) | Top-K, merging, scheduling problems |
| [Backtracking](leetcode/backtracking.md) | Combinations, permutations, constraint search |
| [Graph](leetcode/graph.md) | DFS/BFS, topological sort, union-find |
| [Intervals](leetcode/intervals.md) | Merging, scheduling, overlap problems |
| [Greedy](leetcode/greedy.md) | Local-optimum strategies and when they work |
| [Dynamic Programming](leetcode/dynamic programming.md) | 1D/2D DP, state design |
| [Bit Manipulation](leetcode/bit manipulation.md) | Bitwise tricks and common problems |

### JavaScript Mastery

Core language fundamentals, interview-question style.

| Topic | Notes |
|---|---|
| [Fundamentals](javascript mastery/fundamentals.md) | Language basics, coercion, scoping, equality |
| [Variables](javascript mastery/variables.md) | `var`/`let`/`const`, hoisting, TDZ |
| [Functions](javascript mastery/function.md) | Closures, `this`, higher-order functions |
| [Objects & Prototypes](javascript mastery/objects.md) | Shallow/deep copy, prototype chain, classes |
| [Arrays & Data Transformation](javascript mastery/arrays.md) | map/filter/reduce, sorting, grouping, immutability |
| [Asynchronous JavaScript](javascript mastery/async.md) | Event loop, Promises, async/await, cancellation |
| [DOM & Browser APIs](javascript mastery/dom.md) | Events, storage, Fetch/CORS, debounce/throttle |
| [Modules & Modern JS](javascript mastery/modules.md) | ESM/CommonJS, generators, Map/Set, symbols |
| [Memory & Performance](javascript mastery/memory.md) | GC, memory leaks, memoization, optimization |
| [Advanced JavaScript](javascript mastery/advanced.md) | `this`, closures, currying, Proxy/Reflect |

## Want a topic covered?

If there's a pattern or JS topic you'd like to see notes on, [open an issue](https://github.com/Alif416/interview-mastery-questions/issues/new) describing what you're looking for and I'll add it.

## Site

The notes are published as a React app (Vite) in [`app/`](app), rendered client-side with a
sidebar and search — see [`app/README.md`](app/README.md) to run it locally. Deployment to
GitHub Pages runs via the [`deploy` workflow](.github/workflows/deploy.yml) on every push to
`main`. To add a new note, drop the `.md` file in the right folder and add an entry to
[`app/src/content/manifest.js`](app/src/content/manifest.js).
