# Asynchronous JavaScript

> This is one of the most important sections for React and backend development.

---

## 1. What is synchronous execution?

Synchronous execution means code runs line by line, in order, and each statement must finish before the next one starts. If a statement takes a long time — a heavy computation, a blocking file read — everything after it waits, including rendering and user input handling in a browser.

JavaScript itself is single-threaded: there is exactly one call stack executing one thing at a time. Synchronous code occupies that stack from start to finish, which is why a long-running synchronous loop can freeze a UI or stall a server process.

```js
function double(n) {
  return n * 2;
}

console.log(double(2)); // 4
console.log(double(4)); // 8
console.log('done');    // done
```

Each line completes before the next begins; there is no ambiguity about ordering.

---

## 2. What is asynchronous execution?

Asynchronous execution lets a piece of work be scheduled to run later, without blocking the rest of the program while it waits. The engine kicks off the operation (a timer, a network request, a file read handled by the runtime), continues executing subsequent synchronous code immediately, and only runs the associated callback once the operation completes and the call stack is free.

This is not multithreading in the traditional sense — JavaScript still has a single call stack. The runtime (browser or Node) handles the actual waiting (via OS-level APIs, thread pools, etc.) outside of JavaScript, and hands control back to the JS engine through the event loop when the work is done.

```js
console.log('start');

setTimeout(() => {
  console.log('timer done');
}, 1000);

console.log('end');

// Output:
// start
// end
// timer done   (after ~1000ms)
```

`'end'` logs before `'timer done'` even though the timer was scheduled first, because the callback only runs after the synchronous code finishes and the delay elapses.

---

## 3. What is the event loop?

The event loop is the mechanism that lets JavaScript perform asynchronous, non-blocking behavior on a single thread. It continuously checks: is the call stack empty? If so, it pulls the next unit of queued work and pushes it onto the stack to execute.

The precise algorithm per "tick" is: run synchronous code on the call stack until it's empty, then drain the entire microtask queue (all of it, including any new microtasks queued while draining), then take exactly one task from the macrotask queue and run it, then drain microtasks again, and repeat. This ordering — full microtask drain before every single macrotask — is the single most commonly tested detail about the event loop.

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2
```

Walking through it: `'1'` and `'4'` run synchronously on the initial pass. The `setTimeout` callback is queued as a macrotask; the `.then` callback is queued as a microtask. When the stack empties, the microtask queue is drained first, so `'3'` logs before the macrotask queue is even consulted, and `'2'` logs last.

---

## 4. What is the call stack?

The call stack is a LIFO (last-in, first-out) structure that tracks function calls currently in execution. When a function is called, a frame is pushed onto the stack; when it returns, its frame is popped off. The engine always executes whatever is on top of the stack.

Synchronous code, including synchronous portions of async functions, runs on the call stack. Asynchronous callbacks (from promises, timers, I/O) are not on the stack while they wait — they only get pushed onto the stack when the event loop schedules them for execution, after the stack has emptied of prior work.

```js
function a() {
  b();
  console.log('a done');
}
function b() {
  console.log('inside b');
}

a();
// Stack: a() pushed -> b() pushed -> b() logs 'inside b' -> b() popped
// -> a() logs 'a done' -> a() popped
// Output: inside b, a done
```

An unbounded chain of calls (e.g., a runaway recursion without a base case) overflows this stack, producing a `RangeError: Maximum call stack size exceeded`.

---

## 5. What is the callback queue?

The callback queue — also called the macrotask queue or task queue — holds callbacks from macrotask sources: `setTimeout`, `setInterval`, I/O completion callbacks, UI events, and `setImmediate` in Node. When their associated operation finishes, the callback isn't run immediately; it's appended to this queue.

The event loop pulls from this queue only when the call stack is empty and the microtask queue has been fully drained. Critically, the loop processes just one macrotask per iteration, then goes back to check and drain microtasks again before touching the next macrotask.

```js
setTimeout(() => console.log('macrotask 1'), 0);
setTimeout(() => console.log('macrotask 2'), 0);
console.log('sync');

// Output:
// sync
// macrotask 1
// macrotask 2
```

Both timers queue as macrotasks; synchronous code always wins the race against a `0ms` timer because the timer callback can only run after the current script finishes and the stack clears.

---

## 6. What is the microtask queue?

The microtask queue holds callbacks from promise resolutions (`.then`, `.catch`, `.finally`), `queueMicrotask()`, and the continuation of code after an `await`. It has strictly higher priority than the macrotask queue: after every synchronous script finishes and after every single macrotask, the event loop drains the microtask queue completely before doing anything else.

"Completely" matters: if a microtask callback itself schedules another microtask, that new one is also executed before the loop moves on to macrotasks — the queue is processed until it's empty, not just once through its original contents.

```js
Promise.resolve().then(() => {
  console.log('microtask 1');
  Promise.resolve().then(() => console.log('microtask 1.1'));
});
Promise.resolve().then(() => console.log('microtask 2'));

// Output:
// microtask 1
// microtask 2
// microtask 1.1
```

`microtask 1.1` is queued while draining, but still executes before the loop is considered "done" with microtasks for this cycle — it runs before any macrotask, but after the microtasks that were already ahead of it in the queue.

---

## 7. What is the difference between microtasks and macrotasks?

The core distinction is priority and drain behavior: every microtask queued gets executed before the next macrotask runs, and the microtask queue is drained to empty (including microtasks queued by other microtasks) on every pass, whereas only one macrotask is processed per event loop iteration.

| | Microtasks | Macrotasks |
|---|---|---|
| Sources | Promise `.then`/`.catch`/`.finally`, `queueMicrotask`, `async/await` continuations | `setTimeout`, `setInterval`, `setImmediate` (Node), I/O callbacks, UI events |
| Priority | Run before the next macrotask, always | Run one at a time, after microtasks are drained |
| Drain behavior | Entire queue drained per cycle, including newly added ones | Exactly one task processed per event loop tick |
| Starvation risk | Can starve macrotasks if microtasks keep queueing more microtasks | Cannot starve microtasks |

```js
console.log('start');

setTimeout(() => console.log('timeout'), 0);

Promise.resolve()
  .then(() => console.log('promise 1'))
  .then(() => console.log('promise 2'));

console.log('end');

// Output: start, end, promise 1, promise 2, timeout
```

Both chained `.then` calls (microtasks) resolve before the `setTimeout` callback (a macrotask) gets a turn, even though the promise was already resolved and the timeout delay was `0`.

---

## 8. What is a Promise?

A Promise is an object representing the eventual result of an asynchronous operation — a value that isn't available yet but will be at some point, either successfully (fulfilled) or unsuccessfully (rejected). It decouples "kick off an async operation" from "handle its result," replacing nested callback-based code with chainable, composable syntax.

A Promise is constructed with an executor function that receives `resolve` and `reject`. Once created, consumers attach handlers via `.then()`, `.catch()`, and `.finally()` rather than passing callbacks directly into the async function.

```js
function fetchUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id > 0) {
        resolve({ id, name: 'Ada' });
      } else {
        reject(new Error('Invalid id'));
      }
    }, 100);
  });
}

fetchUser(1)
  .then((user) => console.log(user)) // { id: 1, name: 'Ada' }
  .catch((err) => console.error(err));
```

---

## 9. What are the three states of a Promise?

A Promise has exactly three states: pending, fulfilled, and rejected. It starts as pending — the operation hasn't completed yet. It transitions to fulfilled if the operation succeeds (calling `resolve(value)`), or to rejected if it fails (calling `reject(reason)`).

Fulfilled and rejected are both considered "settled" states. This transition is a one-way door: once a promise settles, it is locked into that state and value permanently — calling `resolve` or `reject` again afterward has no effect.

```js
const p1 = new Promise((resolve) => resolve('done')); // fulfilled
const p2 = new Promise((_, reject) => reject('failed')); // rejected
const p3 = new Promise(() => {}); // pending forever, never settles

p1.then((v) => console.log(v)); // 'done'
p2.catch((e) => console.log(e)); // 'failed'
console.log(p3); // Promise { <pending> }
```

| State | Meaning | Can transition to |
|---|---|---|
| Pending | Initial state, operation in progress | Fulfilled or Rejected |
| Fulfilled | Operation succeeded, has a value | Nothing (locked/settled) |
| Rejected | Operation failed, has a reason | Nothing (locked/settled) |

---

## 10. What is the difference between then() and catch()?

`.then()` takes up to two callbacks: an `onFulfilled` handler (required, called with the resolved value) and an optional `onRejected` handler (called with the rejection reason). `.catch(onRejected)` is syntactic sugar equivalent to `.then(undefined, onRejected)` — it only ever handles rejection, and it reads more clearly at the end of a chain because it catches rejections from any preceding link, not just the immediately prior one.

`.finally(callback)` differs from both: it runs regardless of whether the promise fulfilled or rejected, receives no arguments (it can't access the value or the error), and is typically used for cleanup like hiding a loading spinner or closing a connection.

```js
Promise.reject(new Error('boom'))
  .then((value) => console.log('never runs', value))
  .catch((err) => console.log('caught:', err.message)) // caught: boom
  .finally(() => console.log('cleanup runs either way'));
```

| | `.then(onFulfilled, onRejected)` | `.catch(onRejected)` |
|---|---|---|
| Handles fulfillment | Yes (first argument) | No |
| Handles rejection | Optionally (second argument) | Yes, always |
| Equivalent form | — | `.then(undefined, onRejected)` |
| Typical use | Transform the resolved value | Centralized error handling at chain end |

---

## 11. What is async/await?

`async/await` is syntax built on top of Promises that lets asynchronous code be written and read like synchronous code, without changing the underlying concurrency model. Declaring a function `async` guarantees it always returns a Promise: if the function returns a plain value, that value is automatically wrapped in a resolved Promise; if it throws, the returned Promise rejects with that error.

`await` can only be used inside an `async` function (or, in modern environments, at the top level of a module). It unwraps a Promise's resolved value directly into a regular variable, or throws if the Promise rejects, removing the need for explicit `.then()` chaining.

```js
async function getValue() {
  return 42;
}

getValue().then((v) => console.log(v)); // 42, because getValue() returns a Promise

async function getUser() {
  const user = await fetchUser(1); // waits for the promise to settle
  console.log(user);
  return user;
}
```

---

## 12. What happens when you use await?

`await` pauses execution of the enclosing `async` function at that line until the awaited promise settles — it does not pause the entire program. Control returns immediately to the event loop, which is free to run other synchronous code, other microtasks, or other macrotasks while the promise is pending.

Once the awaited promise settles, the rest of the `async` function's body is scheduled to resume as a microtask. This is why interleaving with other synchronous code and promise chains follows normal microtask-ordering rules, not a "wait right here" blocking model.

```js
async function main() {
  console.log('A');
  await null; // yields to the event loop here
  console.log('B');
}

console.log('start');
main();
console.log('end');

// Output:
// start
// A
// end
// B
```

`main()` runs synchronously up to `await null`, at which point it yields back to the caller. `'end'` logs before `'B'` because the resumption of `main` after `await` is queued as a microtask, which only runs once the current synchronous script (including `console.log('end')`) finishes.

---

## 13. What is the difference between Promise.all() and Promise.allSettled()?

`Promise.all()` takes an array (or iterable) of promises and resolves with an array of their values, but only if every promise fulfills. If any single promise rejects, `Promise.all()` immediately rejects with that reason — this is "fail-fast" behavior, and it does not wait for the other promises to finish (though they continue running in the background).

`Promise.allSettled()` never short-circuits and never rejects. It always resolves once every input promise has settled, with an array of outcome objects — `{ status: 'fulfilled', value }` for successes and `{ status: 'rejected', reason }` for failures — letting you inspect each result individually regardless of whether others failed.

```js
const p1 = Promise.resolve(1);
const p2 = Promise.reject('error');
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3])
  .then((values) => console.log('all resolved', values))
  .catch((err) => console.log('all rejected because:', err)); // all rejected because: error

Promise.allSettled([p1, p2, p3]).then((results) => {
  console.log(results);
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected', reason: 'error' },
  //   { status: 'fulfilled', value: 3 }
  // ]
});
```

| | `Promise.all()` | `Promise.allSettled()` |
|---|---|---|
| Rejects if one fails | Yes, immediately (fail-fast) | Never rejects |
| Resolution value | Array of values (only if all succeed) | Array of `{status, value/reason}` for every input |
| Use case | All-or-nothing operations | Independent operations where partial success is fine |

---

## 14. What is the difference between Promise.race() and Promise.any()?

`Promise.race()` settles as soon as the first input promise settles — whether that promise fulfills or rejects. If the fastest promise rejects, `Promise.race()` rejects with that reason, even if other promises would have gone on to fulfill.

`Promise.any()` settles as soon as the first input promise fulfills, and it ignores rejections entirely as long as at least one promise eventually fulfills. It only rejects if every single input promise rejects, in which case it rejects with an `AggregateError` containing all the individual rejection reasons.

```js
const fast = new Promise((_, reject) => setTimeout(() => reject('fast fail'), 10));
const slow = new Promise((resolve) => setTimeout(() => resolve('slow success'), 50));

Promise.race([fast, slow])
  .then((v) => console.log('race won:', v))
  .catch((e) => console.log('race rejected:', e)); // race rejected: fast fail

Promise.any([fast, slow])
  .then((v) => console.log('any won:', v)) // any won: slow success
  .catch((e) => console.log('any rejected:', e));
```

| | `Promise.race()` | `Promise.any()` |
|---|---|---|
| Settles on | First promise to settle, fulfilled or rejected | First promise to fulfill |
| Ignores rejections | No — a fast rejection wins | Yes — keeps waiting for a fulfillment |
| Rejects when | The first-settled promise rejects | All promises reject (`AggregateError`) |

---

## 15. How do you handle errors in async functions?

Wrap `await` expressions in a `try/catch` block. When an awaited promise rejects, the rejection is thrown synchronously at that point inside the `async` function — exactly as if you had written `throw`, not delivered asynchronously — so a normal surrounding `try/catch` catches it, unlike raw unhandled promise rejections which require a `.catch()` on the promise chain.

For multiple independent awaited calls, decide deliberately whether a single failure should abort the whole function (put them all in one `try` block, or use `Promise.all`) or whether failures should be isolated (wrap each `await` in its own `try/catch`, or use `Promise.allSettled`). Uncaught errors in an `async` function simply cause the function's returned Promise to reject, so callers must still handle it with either `.catch()` or their own `try/catch` around the call.

```js
async function loadData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('loadData failed:', err.message);
    throw err; // re-throw so the caller can also react if needed
  }
}

loadData().catch((err) => console.log('caller handled:', err.message));
```

---

## 16. How do you cancel an API request?

An in-flight `fetch` request is cancelled using an `AbortController`. You create the controller, pass its `signal` into the `fetch` options, and call `controller.abort()` whenever cancellation is needed — for example, when a component unmounts, a user navigates away, or a newer request supersedes an older one (a common debounce/race-avoidance pattern).

When `abort()` is called, the pending `fetch` promise rejects with a `DOMException` named `AbortError` (in some runtimes exposed as an `AbortError`-typed error). This must be handled explicitly, typically by checking `err.name === 'AbortError'` so it isn't treated as a genuine network failure.

```js
const controller = new AbortController();

fetch('https://api.example.com/data', { signal: controller.signal })
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((err) => {
    if (err.name === 'AbortError') {
      console.log('request was cancelled');
    } else {
      console.log('request failed:', err.message);
    }
  });

// Cancel it, e.g. after 2 seconds or on user navigation
setTimeout(() => controller.abort(), 2000);
```

---

## 17. What is AbortController?

`AbortController` is a standard web API for signaling cancellation to asynchronous operations. It exposes two pieces: `controller.signal`, an `AbortSignal` object that can be passed into cancellable APIs (`fetch`, and many event listeners and custom async utilities), and `controller.abort(reason?)`, a method that flips the signal's `aborted` flag to `true` and emits an `abort` event.

Any consumer holding the signal — not just `fetch` — can check `signal.aborted` or listen for the `abort` event to cooperatively stop its own work, which makes `AbortController` a general-purpose cancellation primitive, not something tied only to network requests.

```js
const controller = new AbortController();
const { signal } = controller;

signal.addEventListener('abort', () => {
  console.log('cancellation requested, reason:', signal.reason);
});

function longRunningTask(signal) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => resolve('task complete'), 5000);
    signal.addEventListener('abort', () => {
      clearTimeout(id);
      reject(new DOMException('Task aborted', 'AbortError'));
    });
  });
}

longRunningTask(signal).catch((err) => console.log(err.name)); // AbortError

controller.abort('user cancelled');
```

---

## 18. What is the difference between sequential and parallel API requests?

Sequential requests `await` each call one after another, so the second request doesn't even start until the first has fully completed. Total time is approximately the sum of every individual request's latency — three 200ms requests run sequentially take roughly 600ms. This is necessary when a later request depends on data from an earlier one.

Parallel requests are started together — by calling the async functions without awaiting each individually and then awaiting the resulting promises via `Promise.all` (or similar) — so their network round trips overlap. Total time is approximately the latency of the slowest single request, not the sum, because the requests are in flight concurrently rather than one blocking the next.

```js
async function sequential() {
  const a = await fetch('https://api.example.com/a').then((r) => r.json());
  const b = await fetch('https://api.example.com/b').then((r) => r.json());
  const c = await fetch('https://api.example.com/c').then((r) => r.json());
  return [a, b, c];
  // total time ~= latency(a) + latency(b) + latency(c)
}

async function parallel() {
  const [a, b, c] = await Promise.all([
    fetch('https://api.example.com/a').then((r) => r.json()),
    fetch('https://api.example.com/b').then((r) => r.json()),
    fetch('https://api.example.com/c').then((r) => r.json()),
  ]);
  return [a, b, c];
  // total time ~= max(latency(a), latency(b), latency(c))
}
```

| | Sequential | Parallel |
|---|---|---|
| Start time of each request | After the previous one resolves | All at (roughly) the same time |
| Total time | Sum of all latencies | Max of all latencies |
| Use when | Request B depends on data from A | Requests are independent of each other |

---

## Practice

Fetch three APIs: Sequentially, In parallel, With error handling, With cancellation. Then explain the difference.

```js
// NOTE: these URLs are placeholders — replace with real endpoints.
const URL_A = 'https://api.example.com/a';
const URL_B = 'https://api.example.com/b';
const URL_C = 'https://api.example.com/c';

// (a) Sequential awaits — each request waits for the previous one to finish
async function fetchSequential() {
  const a = await fetch(URL_A).then((r) => r.json());
  const b = await fetch(URL_B).then((r) => r.json());
  const c = await fetch(URL_C).then((r) => r.json());
  return [a, b, c];
}

// (b) Parallel with Promise.all — all requests start together, fails fast on any rejection
async function fetchParallel() {
  const [a, b, c] = await Promise.all([
    fetch(URL_A).then((r) => r.json()),
    fetch(URL_B).then((r) => r.json()),
    fetch(URL_C).then((r) => r.json()),
  ]);
  return [a, b, c];
}

// (c) Parallel with per-request error handling — one failure doesn't sink the batch
async function fetchWithErrorHandling() {
  const results = await Promise.allSettled([
    fetch(URL_A).then((r) => r.json()),
    fetch(URL_B).then((r) => r.json()),
    fetch(URL_C).then((r) => r.json()),
  ]);

  return results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    console.error(`Request ${i} failed:`, result.reason);
    return null; // fall back to a safe default instead of failing the whole batch
  });
}

// (d) Parallel with cancellation via AbortController
async function fetchWithCancellation(timeoutMs = 3000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const [a, b, c] = await Promise.all([
      fetch(URL_A, { signal: controller.signal }).then((r) => r.json()),
      fetch(URL_B, { signal: controller.signal }).then((r) => r.json()),
      fetch(URL_C, { signal: controller.signal }).then((r) => r.json()),
    ]);
    return [a, b, c];
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('Requests cancelled: exceeded', timeoutMs, 'ms');
    } else {
      console.error('Requests failed:', err.message);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

The sequential version's total time is roughly the sum of each request's latency (A + B + C), while the parallel versions' total time is roughly the latency of the slowest single request, since all three fire concurrently. On failure behavior, `Promise.all` (used in `fetchParallel` and `fetchWithCancellation`) rejects the entire batch the moment any one request fails, discarding the results of the others, whereas `Promise.allSettled` (used in `fetchWithErrorHandling`) always resolves and reports every request's outcome individually, so one bad endpoint doesn't wipe out the two good responses.
