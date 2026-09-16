# Modules and Modern JavaScript

---

## 1. What is a module?

A module is a file with its own isolated scope. Anything declared inside it — variables, functions, classes — is private by default and invisible to other files unless it is explicitly exported. Consumers must explicitly import what they need, so dependencies between files become traceable rather than implicit.

This is a deliberate departure from classic `<script>` tag behavior, where every script shares a single global scope and can silently overwrite or depend on globals defined elsewhere. Modules fix that by giving each file its own top-level scope and a well-defined public surface (its exports).

```js
// math.js — a module
const secret = 42; // private, not accessible outside this file

export function add(a, b) {
  return a + b;
}

// main.js
import { add } from './math.js';

console.log(add(2, 3)); // 5
console.log(typeof secret); // ReferenceError-free access is impossible; secret was never exported
```

Modules also enable dependency graphs that tools can analyze, and in ES Modules specifically, imports/exports are statically structured, which unlocks build-time optimizations like tree shaking (covered below).

---

## 2. What is the difference between named and default exports?

A named export exposes a specific, named binding from a module. A file can have any number of named exports, and importers must reference them by their exact exported name (though they can rename them locally with `as`). Named exports are a good fit for utility modules where you want to expose several independent functions or constants.

A default export designates a single "main" value for the module. A file can have at most one default export, and the importer is free to name it whatever they like on import, since there's no name binding to match against.

```js
// utils.js
export function formatDate(d) { /* ... */ }
export function parseDate(s) { /* ... */ }
export default function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

// consumer.js
import myOwnName, { formatDate, parseDate as parse } from './utils.js';

capitalize; // imported as `myOwnName`, works fine
parse;      // renamed via `as`
```

Mixing named and default exports in the same file is legal but often discouraged — it blurs which value is "the" module's purpose and complicates tooling like auto-imports and refactors.

| | Named export | Default export |
|---|---|---|
| Count per file | Many | One |
| Import syntax | `import { x } from '...'` | `import anything from '...'` |
| Import name | Must match export name (or use `as`) | Chosen freely by importer |
| Typical use | Utility libraries, multiple related values | A single primary class/function/component |

---

## 3. What is the difference between CommonJS and ES Modules?

CommonJS (CJS) is the module system Node.js used historically, built on `require()` and `module.exports`. Modules are resolved and loaded synchronously, at runtime — `require()` is just a function call, so it can appear anywhere, including conditionally inside an `if` block. When you `require` a module, you generally get a copy of the exported values at the time of the call (though mutating the shared `exports` object itself can produce live-looking updates in some patterns).

ES Modules (ESM) use `import`/`export` syntax that is statically structured: import/export statements must appear at the top level of a file and use string literal specifiers, so the entire dependency graph can be analyzed before any code runs. This static structure is what allows tree shaking. Loading is asynchronous by design — the spec models fetching modules over a network — and bindings are live references: if module A exports a variable and later reassigns it, module B's imported binding reflects that new value automatically.

```js
// CommonJS
// counter.js
let count = 0;
function increment() { count++; }
module.exports = { count, increment }; // count is copied at require-time

// main.js
const { count, increment } = require('./counter');
increment();
console.log(count); // 0 — stale copy, not live

// ES Modules
// counter.mjs
export let count = 0;
export function increment() { count++; }

// main.mjs
import { count, increment } from './counter.mjs';
increment();
console.log(count); // 1 — live binding reflects the update
```

| | CommonJS | ES Modules |
|---|---|---|
| Syntax | `require` / `module.exports` | `import` / `export` |
| Resolution | Runtime, synchronous | Static, parse/compile time |
| Loading | Synchronous | Asynchronous |
| Bindings | Copied values (generally) | Live references |
| Placement | Anywhere, even conditional | Top-level only |
| Tree shaking | Generally not possible | Enabled by static analysis |
| Native environment | Node.js (traditionally) | Browsers and modern Node |

---

## 4. What is tree shaking?

Tree shaking is dead-code elimination performed by a bundler (webpack, Rollup, esbuild, etc.): it removes exported values that are never actually imported anywhere in the application, shrinking the final bundle.

It relies on being able to determine, statically, exactly what each module imports and exports without running any code. ES Modules make this possible because `import`/`export` declarations are fixed at the top level and use literal specifiers — the bundler can build a precise graph of "who uses what" at build time. CommonJS's `require()` is just a function call that can be conditional, computed, or aliased dynamically, so a bundler generally can't prove a given export is unused, and tree shaking mostly doesn't apply to it.

```js
// utils.js
export function used() { return 'I am used'; }
export function unused() { return 'I am never imported'; }

// main.js
import { used } from './utils.js';
console.log(used());

// A bundler doing tree shaking can safely omit `unused`
// from the final output because static analysis proves
// no import path ever references it.
```

---

## 5. What is dynamic import?

Dynamic `import()` is a function-like expression — not a static declaration — that loads a module at runtime and returns a Promise resolving to that module's namespace object. Unlike static `import`, it can be called anywhere: inside functions, conditionals, loops, or event handlers, and its specifier can even be computed at runtime.

This is the primary mechanism for code-splitting and lazy-loading: you defer fetching and parsing a chunk of code until it's actually needed, which shrinks the initial bundle and speeds up first load.

```js
// Only load the heavy charting library when the user opens the dashboard
button.addEventListener('click', async () => {
  const { renderChart } = await import('./heavy-chart-library.js');
  renderChart(data);
});

// Can also branch on the specifier
async function loadLocale(locale) {
  const messages = await import(`./locales/${locale}.js`);
  return messages.default;
}
```

---

## 6. What is optional chaining?

Optional chaining (`?.`) short-circuits an access chain to `undefined` instead of throwing a `TypeError` when an intermediate value is `null` or `undefined`. It works for property access, method calls, and array/computed access, and as soon as one link in the chain is nullish, evaluation stops and the whole expression evaluates to `undefined`.

```js
const user = { profile: { name: 'Ada' } };

console.log(user.profile?.name);      // 'Ada'
console.log(user.address?.city);      // undefined, no throw
console.log(user.getAge?.());         // undefined — method doesn't exist, not called
console.log(user.tags?.[0]);          // undefined — safe array access

// Without optional chaining this would throw:
// console.log(user.address.city); // TypeError: Cannot read properties of undefined
```

It's a syntactic convenience for defensive property access — it does not replace validation logic, but it eliminates the deep `a && a.b && a.b.c` guard chains that were common before.

---

## 7. What is nullish coalescing?

The nullish coalescing operator (`??`) returns its right-hand operand only when the left-hand operand is `null` or `undefined`. Critically, it does not fall through for other falsy values like `0`, `''`, `NaN`, or `false` — that's the key difference from `||`, which treats any falsy value as a signal to use the fallback.

```js
function getVolume(userSetting) {
  return userSetting || 50; // WRONG if userSetting is intentionally 0
}
console.log(getVolume(0)); // 50 — bug: user explicitly muted, but we override it

function getVolumeFixed(userSetting) {
  return userSetting ?? 50; // correct
}
console.log(getVolumeFixed(0));         // 0 — respects the explicit value
console.log(getVolumeFixed(undefined)); // 50 — falls back correctly
console.log(getVolumeFixed(null));      // 50 — falls back correctly
```

| | `\|\|` | `??` |
|---|---|---|
| Triggers fallback on | Any falsy value (`0`, `''`, `NaN`, `false`, `null`, `undefined`) | Only `null` or `undefined` |
| Use case | "Give me a truthy value" | "Give me a defined value" |
| Common bug | Overrides intentional `0`/`''`/`false` | Preserves them correctly |

---

## 8. What are template literals?

Template literals are string literals delimited by backticks (`` ` ``) instead of quotes. They support two things regular strings don't natively: expression interpolation via `${...}`, and multi-line strings without needing explicit `\n` escapes.

```js
const name = 'Ada';
const age = 36;

// Interpolation
const greeting = `Hello, ${name}. You are ${age} years old.`;
console.log(greeting); // 'Hello, Ada. You are 36 years old.'

// Expressions, not just variables
console.log(`Next year you'll be ${age + 1}.`); // "Next year you'll be 37."

// Multi-line without \n
const html = `
  <ul>
    <li>${name}</li>
  </ul>
`;
```

Under the hood, `${expr}` calls `String(expr)` (via `ToString`), so any expression — function calls, ternaries, nested template literals — is valid inside the interpolation.

---

## 9. What are tagged template literals?

A tagged template literal is a template literal preceded by a function reference (the "tag"). Instead of producing a plain string, the tag function is called and receives the literal's static string segments as an array (with a `.raw` property holding the unescaped source text) as the first argument, followed by each interpolated value as separate subsequent arguments.

This gives you full control over how the final string (or any other value) is constructed, which is how libraries implement sanitization, internationalization, and CSS-in-JS.

```js
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] !== undefined ? `**${values[i]}**` : '';
    return result + str + value;
  }, '');
}

const name = 'Ada';
const role = 'engineer';
console.log(highlight`${name} is an ${role}.`);
// '**Ada** is an **engineer**.'

// styled-components uses this pattern for CSS-in-JS:
// const Button = styled.button`
//   color: ${props => props.color};
// `;
```

The `strings` array always has one more element than `values`, since it represents the static text surrounding each interpolation point.

---

## 10. What are generators?

A generator is a function declared with `function*` that can pause and resume its execution using the `yield` keyword. Calling a generator function doesn't run its body immediately — it returns a generator object, which is both an iterator and an iterable. Each call to `.next()` resumes execution from the last `yield` (or from the start, on the first call) and runs until the next `yield` or a `return`, producing an object `{ value, done }`.

```js
function* countUpTo(max) {
  let i = 1;
  while (i <= max) {
    yield i;
    i++;
  }
  return 'done counting';
}

const gen = countUpTo(3);
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: 'done counting', done: true }

// Generators are iterable, so they work with for...of
for (const n of countUpTo(3)) {
  console.log(n); // 1, 2, 3
}
```

Generators are ideal for lazy sequences (infinite ranges, streaming data) and for implementing custom iteration logic without manually managing state across calls.

---

## 11. What are iterators?

An iterator is any object that implements the iterator protocol: it has a `.next()` method that returns an object of the shape `{ value, done }`, where `done` is `true` once the sequence is exhausted. Iterators track their own internal position, so each `.next()` call advances the sequence.

Separately, the iterable protocol is what determines whether an object can be used with `for...of`, the spread operator, or destructuring: an object is iterable if it has a method at the well-known key `Symbol.iterator` that returns an iterator.

```js
function makeRangeIterator(start, end) {
  let current = start;
  return {
    next() {
      if (current < end) {
        return { value: current++, done: false };
      }
      return { value: undefined, done: true };
    },
    // Being iterable too lets it work with for...of
    [Symbol.iterator]() {
      return this;
    },
  };
}

const it = makeRangeIterator(0, 3);
console.log(it.next()); // { value: 0, done: false }
console.log(it.next()); // { value: 1, done: false }

for (const n of makeRangeIterator(0, 3)) {
  console.log(n); // 0, 1, 2
}
```

Arrays, strings, Maps, Sets, and generator objects all implement `Symbol.iterator` natively, which is why they all work with `for...of` and spread syntax out of the box.

---

## 12. What is the difference between for...of and for...in?

`for...of` iterates over the values produced by an iterable's iterator — arrays, strings, Maps, Sets, and generators all work directly. `for...in` iterates over the enumerable property keys of an object, as strings, including keys inherited through the prototype chain.

Using `for...in` on an array is discouraged: it iterates the array's indices as strings (not the values), it will also pick up any additional enumerable properties added to the array or its prototype, and it does not guarantee numeric order the way array iteration should.

```js
const arr = ['a', 'b', 'c'];
arr.extra = 'oops'; // an extra enumerable property

for (const value of arr) {
  console.log(value); // 'a', 'b', 'c' — only real values, in order
}

for (const key in arr) {
  console.log(key); // '0', '1', '2', 'extra' — indices as strings, plus the extra key
}

const obj = { x: 1, y: 2 };
for (const key in obj) {
  console.log(key, obj[key]); // 'x' 1, 'y' 2
}
// obj is not iterable — for...of would throw here
```

| | `for...of` | `for...in` |
|---|---|---|
| Iterates over | Values (from the iterator) | Enumerable property keys (as strings) |
| Works on | Iterables: arrays, strings, Maps, Sets, generators | Any object |
| Includes inherited props | N/A | Yes, via the prototype chain |
| Recommended for arrays | Yes | No |

---

## 13. What are symbols?

`Symbol` is a primitive type whose every value is guaranteed unique and immutable. Calling `Symbol()` — optionally with a description string for debugging — always produces a brand-new value, even if the description is identical to a previous call. Symbols are used mainly as collision-free object property keys, since no accidental key collision with a string property (yours or a library's) is possible.

```js
const id1 = Symbol('id');
const id2 = Symbol('id');
console.log(id1 === id2); // false — unique even with the same description

const user = {
  name: 'Ada',
  [id1]: 12345, // symbol-keyed property, hidden from normal enumeration
};

console.log(Object.keys(user));            // ['name'] — symbol key is excluded
console.log(JSON.stringify(user));         // '{"name":"Ada"}' — excluded too
console.log(user[id1]);                    // 12345 — still accessible directly
```

The language itself uses well-known symbols to define customizable, low-collision-risk hooks into built-in behavior — for example, `Symbol.iterator` lets any object opt into `for...of` support, and `Symbol.toPrimitive` lets an object control its own coercion.

---

## 14. What are Map and Set?

`Map` is a key-value collection where keys may be of any type, including objects and functions, not just strings/symbols as with plain objects. It preserves insertion order during iteration, exposes its size via a `.size` property, and is directly iterable (yielding `[key, value]` pairs), unlike plain objects which need `Object.keys`/`Object.entries` workarounds.

`Set` is a collection of unique values of any type — adding a duplicate value is a no-op. Like `Map`, it preserves insertion order, has a `.size` property, and is directly iterable.

```js
const map = new Map();
const objKey = { id: 1 };
map.set('name', 'Ada');
map.set(objKey, 'object as key works');
console.log(map.size);        // 2
console.log(map.get(objKey)); // 'object as key works'

for (const [key, value] of map) {
  console.log(key, value);
}

const set = new Set([1, 2, 2, 3]);
console.log(set.size);       // 3 — duplicates collapsed
console.log([...set]);       // [1, 2, 3]
set.add(4);
console.log(set.has(2));     // true
```

---

## 15. What is the difference between Map and WeakMap?

`WeakMap` is a restricted variant of `Map`: its keys must be objects (primitives are not allowed), and those keys are held weakly — meaning if there are no other references to a key object anywhere in the program, it becomes eligible for garbage collection, and its entry is automatically removed from the `WeakMap`. Because entries can disappear at any time due to garbage collection, `WeakMap` is deliberately not enumerable: it has no `.size`, no `.keys()`, no `.entries()`, and is not iterable.

This makes `WeakMap` well suited for attaching private data or metadata to objects — such as caches or internal state tied to a DOM node or class instance — without preventing that object from being garbage collected once nothing else references it, which avoids a whole category of memory leaks a regular `Map` would introduce in the same scenario.

```js
let obj = { name: 'Ada' };

const wm = new WeakMap();
wm.set(obj, 'metadata attached privately');
console.log(wm.get(obj)); // 'metadata attached privately'

obj = null; // no other references remain
// The entry in wm is now eligible for garbage collection;
// there is no way to enumerate wm to observe this directly.

const regularMap = new Map();
const key = {};
regularMap.set(key, 'value');
// Even if we did `key = null` here, the Map itself still holds
// a strong reference, so the object could never be collected.
```

| | `Map` | `WeakMap` |
|---|---|---|
| Key types | Any value | Objects only |
| Reference strength | Strong (prevents GC) | Weak (allows GC) |
| Iterable | Yes | No |
| `.size` | Yes | No |
| Typical use | General-purpose keyed collection | Private/metadata attached to objects, leak-safe |
