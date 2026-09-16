# Memory and Performance

> This is where you move from "I can write JavaScript" to "I understand JavaScript."

---

## 1. How is memory allocated in JavaScript?

JavaScript allocates memory in two distinct regions: the stack and the heap. Primitive values (numbers, strings, booleans, `null`, `undefined`, `BigInt`, `Symbol`) are stored on the stack because they have a fixed, known size at compile time. The engine can push and pop them cheaply as execution enters and leaves function scopes.

Objects, arrays, and functions are allocated on the heap because their size is dynamic — a `for` loop can push arbitrary numbers of elements into an array, or add arbitrary properties to an object. The variable itself still lives on the stack, but it holds a reference (a pointer) into the heap rather than the value itself. This is why assigning an object to another variable copies the reference, not the data.

```js
let a = 10;        // primitive: value lives directly on the stack
let b = a;          // b gets its own independent copy: 10

let obj1 = { x: 1 }; // obj1 stores a reference on the stack, object on the heap
let obj2 = obj1;     // obj2 copies the *reference*, not the object
obj2.x = 99;
console.log(obj1.x); // 99 — both point to the same heap object
```

You never choose where something is allocated — the engine decides based on the value's type. Understanding this split is what explains reference semantics, mutation surprises, and the difference between comparing primitives and comparing objects.

---

## 2. What is garbage collection?

Garbage collection is the automatic process by which the JavaScript engine reclaims heap memory that is no longer reachable from your program. Unlike languages such as C, you never call `free()` — the engine tracks memory for you and runs a collector periodically, pausing execution briefly to do so.

V8 and other modern engines primarily use a **mark-and-sweep** algorithm. The collector starts from a set of "roots" — global objects, and everything currently on the call stack (local variables in active function calls) — and walks every reference it can reach from those roots, marking each object it finds as "reachable." Once the walk finishes, anything left unmarked is, by definition, unreachable from your program and gets swept (freed).

```js
function createUser() {
  let user = { name: "Ada" }; // reachable while createUser runs
  return user;
}

let current = createUser();  // still reachable: referenced by `current`
current = null;              // now unreachable — eligible for collection
```

The critical mental model shift is that garbage collection is about **reachability**, not about reference counting or scope exit. An object is kept alive as long as something reachable from a root still points to it — which is exactly the mechanism that memory leaks in JS end up exploiting.

---

## 3. What causes memory leaks?

A memory leak in JavaScript happens when memory that is no longer needed stays reachable, so the garbage collector can never reclaim it. Since the engine only frees unreachable memory, a leak is really a bug in your reference graph — something you forgot is still holding a pointer.

The most common sources in real code:

- **Forgotten timers/intervals**: a `setInterval` or `setTimeout` callback keeps its closure (and everything that closure captured) alive for as long as the timer is active. If you never call `clearInterval`, the closure — and any large data it references — lives forever.
- **Event listeners never removed**: attaching a listener to a long-lived object (like `window` or `document`) and never calling `removeEventListener` keeps the listener's closure, and everything it captured, reachable indefinitely.
- **Growing caches or arrays with no eviction**: an in-memory cache that only grows (no size cap, no TTL, no LRU eviction) will accumulate memory for the lifetime of the app.
- **Closures unintentionally capturing large outer scope**: a closure only needs a few variables but ends up keeping an entire enclosing scope — and everything referenced within it — alive because JS closures capture by reference, not by the specific values used.
- **Detached DOM nodes**: removing a node from the DOM tree does not free it if a JS variable (or a closure, or an event listener) still references it — it becomes a "detached" node still resident in memory.
- **Accidental globals**: forgetting `let`/`const`/`var` (in non-strict mode) creates an implicit global that never goes out of scope, so it and anything it references live for the entire page/process lifetime.

```js
// Leak: interval closure keeps `hugeBuffer` alive forever
function startPolling() {
  const hugeBuffer = new Array(1_000_000).fill("data");
  setInterval(() => {
    console.log(hugeBuffer.length); // keeps hugeBuffer reachable
  }, 1000);
}

// Fix: keep a handle and clear it when done
function startPollingFixed() {
  const hugeBuffer = new Array(1_000_000).fill("data");
  const id = setInterval(() => console.log(hugeBuffer.length), 1000);
  return () => clearInterval(id); // caller can stop and release
}
```

---

## 4. What is the difference between stack and heap?

The stack and heap are the two memory regions JS uses, and they differ in structure, size, allocation cost, and cleanup mechanism.

| | Stack | Heap |
|---|---|---|
| Structure | Fixed-size, LIFO (last-in-first-out) | Large, unstructured region |
| Stores | Primitive values, function call frames | Objects, arrays, functions (dynamically-sized data) |
| Allocation speed | Very fast (pointer bump) | Slower (must find/manage free space) |
| Cleanup | Automatic — popped when a function returns | Managed by the garbage collector, not tied to scope exit |
| Access pattern | Direct value access | Access via reference/pointer stored on the stack |

Each function call pushes a new frame onto the stack containing its local primitive variables and return address; when the function returns, that frame is popped and its memory is instantly reclaimed — no GC involvement needed. The heap has no such orderly discipline: objects can be created and referenced from many places at once, live for unpredictable durations, and can only be reclaimed once the GC proves nothing reachable points to them anymore. This is also why deep recursion causes a "stack overflow" (the fixed-size stack fills up with frames) while runaway object creation causes heap exhaustion / OOM instead — different failure modes tied to the different regions.

---

## 5. What is the difference between shallow and deep copying?

A shallow copy duplicates only the top level of an object — primitive properties are copied by value, but any nested object or array is still shared by reference between the original and the copy. Mutating a nested property through the copy therefore also mutates the original. `Object.assign({}, obj)` and spread syntax (`{ ...obj }`) both produce shallow copies.

```js
const original = { name: "Ada", address: { city: "London" } };
const shallow = { ...original };

shallow.name = "Grace";          // does not affect original
shallow.address.city = "Paris";  // DOES affect original — nested object is shared

console.log(original.address.city); // "Paris"
```

A deep copy recursively duplicates every level, so the copy shares no references with the original at all. The modern, correct way to do this is `structuredClone(obj)`, a built-in global that handles far more than plain objects — it correctly clones `Date`, `Map`, `Set`, typed arrays, and even circular references.

```js
const deep = structuredClone(original);
deep.address.city = "Berlin";
console.log(original.address.city); // "Paris" — untouched
```

The older `JSON.parse(JSON.stringify(obj))` trick is still seen in code but is a hack with real gaps: it silently drops functions, `undefined` values, and `Symbol` keys; it converts `Date` objects into strings; and it throws on circular references entirely. `structuredClone` should be preferred whenever available.

| | Shallow copy | Deep copy |
|---|---|---|
| Nested objects | Shared by reference | Fully duplicated |
| Typical tools | Spread `{...obj}`, `Object.assign` | `structuredClone()` |
| Handles circular refs | N/A (doesn't recurse) | Yes (`structuredClone`), no (`JSON` hack) |
| Handles `Date`/`Map`/`Set`/functions | Preserves as-is (same reference) | `structuredClone`: yes for Date/Map/Set, no for functions; `JSON` hack: no |

---

## 6. What is memoization?

Memoization is an optimization technique where the return value of a **pure** function is cached, keyed by its input arguments, so that a subsequent call with the same arguments returns the cached result instead of recomputing it. It only works correctly for pure functions — ones whose output depends solely on their inputs and that produce no side effects — because the cache assumes "same inputs always produce the same output."

```js
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

function slowSquare(n) {
  for (let i = 0; i < 1e8; i++) {} // simulate expensive work
  return n * n;
}

const fastSquare = memoize(slowSquare);
fastSquare(5); // slow — computes and caches
fastSquare(5); // instant — returns cached result
```

Memoization trades memory for time: each unique set of arguments seen keeps its result resident until the cache is cleared or garbage collected, which is exactly why unbounded memoization on a function with unbounded input variety can itself become a memory leak. Recursive algorithms with overlapping subproblems (Fibonacci, dynamic programming problems in general) are the canonical use case, since they turn exponential recomputation into linear work.

---

## 7. What is the difference between memoization and caching?

Memoization is a specific technique; caching is the general concept. It's easy to conflate them because memoization is an instance of caching, but the two aren't synonyms.

| | Memoization | Caching (general) |
|---|---|---|
| Scope | A specific function's return values | Any expensive-to-obtain data: HTTP responses, DB query results, computed values, rendered output |
| Key | The function's arguments | Whatever makes sense for the domain — a URL, a query, a user ID |
| Typical storage | In-memory (`Map`, object), tied to the function's/module's lifetime | Anywhere — memory, disk, Redis, CDN, browser HTTP cache |
| Invalidation | Usually none, or a simple bound/LRU on the map | Explicit strategies: TTL, cache invalidation events, versioning, `Cache-Control` headers |
| Precondition | Requires a pure function | No purity requirement — caching a network response is caching a side effect's result, not a pure computation |

In short: every memoized function is a cache, but not every cache is memoization. A CDN caching images, a browser caching HTTP responses, and a service caching database query results are all "caching" in the broad sense, but none of them are memoization because they aren't wrapping a pure function keyed by its arguments — they have their own expiry and invalidation rules layered on top.

---

## 8. What is lazy evaluation?

Lazy evaluation means deferring a computation until the moment its result is actually needed, rather than computing it eagerly up front. The benefit is that if the value is never actually needed, the work is never done at all — and if it is needed, the cost is paid exactly once, at the point of use.

Generators are JavaScript's most direct expression of this idea: a generator function's body doesn't run when you call it — it runs incrementally, one step at a time, each time `.next()` is called. This lets you represent infinite or expensive sequences without ever materializing them fully in memory.

```js
function* infiniteIds() {
  let id = 1;
  while (true) {
    yield id++; // computed only when .next() is called
  }
}

const ids = infiniteIds();
console.log(ids.next().value); // 1 — nothing beyond this was computed
console.log(ids.next().value); // 2
```

A getter, or a "lazy-initialized" property, is the other common pattern: an expensive value is computed the first time it's accessed and cached from then on, rather than being computed unconditionally when the object is constructed.

```js
class Report {
  #summary;
  get summary() {
    if (!this.#summary) {
      console.log("computing summary...");
      this.#summary = expensiveComputation();
    }
    return this.#summary;
  }
}
```

---

## 9. What is the difference between Map and Object for lookups?

`Map` and plain objects can both be used as key-value lookup structures, but `Map` is purpose-built for it while object literals carry baggage from also being JavaScript's general-purpose structure for modeling entities.

| | `Map` | Object |
|---|---|---|
| Key types | Any value — objects, functions, `NaN`, etc. | Strings and Symbols only (other keys get coerced to strings) |
| Performance under frequent add/remove | Optimized, more consistent | Can degrade (engines optimize objects for stable shapes) |
| Prototype pollution risk | None — no inherited keys | Inherited keys (`toString`, `constructor`, etc.) can collide with real data |
| Insertion order | Guaranteed, reliably iterable | Mostly preserved for string keys, but with quirks (integer-like keys are reordered first) |
| Size | `.size` property, O(1) | `Object.keys(obj).length` — O(n) to compute |
| Iteration | Directly iterable (`for...of`, `.forEach`) | Requires `Object.keys/values/entries` first |

The prototype pollution gap is the sharpest practical difference: an object literal used as a lookup table is vulnerable to a key like `"constructor"` or `"__proto__"` silently colliding with inherited properties, whereas a `Map` has no prototype chain of string keys to collide with. For any lookup structure with keys not known in advance, or that changes frequently at runtime, `Map` is the safer and typically faster choice; plain objects remain perfectly fine for small, fixed, string-keyed structures — especially ones you intend to serialize with `JSON.stringify` directly, since `Map` doesn't serialize to JSON without extra handling.

---

## 10. How do you optimize a slow JavaScript function?

The first rule is: profile before you optimize. Guessing at what's slow wastes effort and often makes the code harder to read without moving the needle — use the browser's Performance panel or `console.time`/`console.timeEnd` to find the actual hot path before touching anything.

Once you know where the time goes, the highest-leverage fix is almost always reducing algorithmic complexity. An O(n²) nested loop rewritten as an O(n) pass using a `Map` or `Set` for lookups will outperform any amount of micro-optimization on the O(n²) version. Big-O improvements dominate; shaving milliseconds off a loop body that runs a fixed small number of times rarely matters.

```js
// O(n^2): nested loop checking membership
function findDuplicatesSlow(arr) {
  const dupes = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) dupes.push(arr[i]);
    }
  }
  return dupes;
}

// O(n): single pass with a Set for O(1) lookups
function findDuplicatesFast(arr) {
  const seen = new Set();
  const dupes = new Set();
  for (const item of arr) {
    if (seen.has(item)) dupes.add(item);
    seen.add(item);
  }
  return [...dupes];
}
```

Beyond algorithmic complexity: avoid allocating new objects or arrays inside hot loops (each allocation is heap work and future GC pressure), memoize pure functions that get called repeatedly with the same inputs, and in DOM-heavy code avoid layout thrashing — batch reads and writes to `offsetHeight`/`getBoundingClientRect` separately from style mutations, since interleaving them forces the browser to recalculate layout repeatedly. For code reacting to high-frequency events (scroll, resize, keystrokes), debouncing or throttling the handler avoids doing expensive work far more often than needed.

---

## 11. How do you measure performance?

The simplest tool is `console.time(label)` / `console.timeEnd(label)`, which wraps a block of code and logs the elapsed wall-clock time — good for quick, low-ceremony checks during development.

```js
console.time("sort");
bigArray.sort((a, b) => a - b);
console.timeEnd("sort"); // sort: 42.15ms
```

For anything more rigorous, the `Performance` API gives high-resolution timestamps and named markers: `performance.now()` returns a sub-millisecond timestamp, and `performance.mark()`/`performance.measure()` let you tag specific points in execution and compute durations between them — these marks also show up in browser DevTools' Performance panel, correlated with rendering, scripting, and GC activity.

```js
performance.mark("start");
doExpensiveWork();
performance.mark("end");
performance.measure("expensiveWork", "start", "end");
console.log(performance.getEntriesByName("expensiveWork")[0].duration);
```

For deeper investigation, the browser's Performance panel / Profiler records a full timeline — call stacks, flame charts, memory snapshots — letting you see exactly which function is consuming time or allocating memory rather than just how long a block took in aggregate. In Node.js, the equivalent tools are `--prof` (V8's built-in CPU profiler, producing a log you process with `--prof-process`) and third-party tools like `clinic.js`, which produce flame graphs and bottleneck reports for server-side code.

---

## 12. What is the difference between CPU-bound and I/O-bound work?

CPU-bound work is work whose bottleneck is raw computation — sorting a huge array, image or video processing, cryptographic hashing, parsing large payloads. Because JavaScript runs on a single thread, CPU-bound work blocks that thread entirely: no other code, including UI rendering or handling other requests, can run until it finishes. The way to address it is either algorithmic optimization (a better Big-O, as above) or offloading the work off the main thread entirely — in the browser, that means a Web Worker; in Node, a `worker_thread` or a separate process.

I/O-bound work is work whose bottleneck is waiting — network requests, file reads, database queries. The CPU is mostly idle during I/O; the time is spent waiting on a disk, a network round-trip, or another system to respond. This is precisely what JavaScript's async, non-blocking model is designed for: an I/O-bound operation is handed off (to the OS, the network stack, etc.) and the JS thread is freed to do other work while it waits, resuming via the event loop when the result is ready.

| | CPU-bound | I/O-bound |
|---|---|---|
| Bottleneck | Computation | Waiting (network, disk, DB) |
| Blocks the JS thread | Yes, for the full duration | No, if done asynchronously |
| Examples | Sorting, image processing, crypto, big data transforms | `fetch`, file reads, DB queries |
| How to speed up | Better algorithm, or offload to Web Workers/worker_threads | Concurrency — run requests in parallel, use non-blocking async APIs |
| Benefits from more CPU cores | Yes | Not directly — the CPU isn't the constraint |

```js
// I/O-bound: run independent requests concurrently instead of sequentially
async function sequential(urls) {
  const results = [];
  for (const url of urls) {
    results.push(await fetch(url)); // waits for each before starting the next
  }
  return results;
}

async function concurrent(urls) {
  return Promise.all(urls.map((url) => fetch(url))); // all in flight at once
}
```

Mistaking one for the other leads to the wrong fix: throwing more concurrency at CPU-bound work does nothing (the single thread is still the bottleneck), while trying to "optimize the algorithm" of an I/O-bound operation misses that the time is spent waiting, not computing — the real win there is not blocking on each wait sequentially.
