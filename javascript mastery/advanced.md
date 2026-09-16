# Advanced JavaScript

> Learn these after the fundamentals are strong.

---

## 1. What is the this keyword?

`this` is a special identifier available inside every function that refers to the execution context the function was invoked in. Unlike variables from the enclosing lexical scope, `this` is not resolved by where a function is defined — it's resolved by how the function is called (its call-site), and it can be different on every single call of the same function.

Because `this` is dynamic, the same function can produce different results depending on the calling expression. Regular functions get their `this` bound at call time; arrow functions are the one exception, since they never have their own `this` at all.

```js
function whoAmI() {
  console.log(this);
}

const obj = { name: "obj", whoAmI };

whoAmI();        // this -> undefined (strict mode) or globalThis
obj.whoAmI();     // this -> obj, because obj is left of the dot at the call-site
```

---

## 2. How does this work in different contexts?

The value of `this` depends on the invocation pattern. The main contexts:

| Context | Value of `this` |
|---|---|
| Global scope | `undefined` in strict mode, the global object (`window`/`globalThis`) otherwise |
| Plain function call `fn()` | `undefined` in strict mode, global object otherwise |
| Object method `obj.method()` | The object before the dot (`obj`) |
| Class method | The instance the method was called on |
| Event handler (regular `function`) | The DOM element the listener is attached to |
| Arrow function | Inherited lexically from the enclosing scope at definition time |

```js
"use strict";

class Counter {
  count = 0;
  increment() {
    console.log(this); // the Counter instance
  }
}

const btn = { addEventListener() {} };
document.addEventListener?.("click", function () {
  console.log(this); // the element the listener is bound to
});

const c = new Counter();
c.increment(); // this -> c
```

Detached references break the pattern: passing `c.increment` as a callback without binding loses the instance context, since at that point it's just a plain function call.

---

## 3. What is explicit binding?

Explicit binding is manually setting what `this` will be inside a function, using `call`, `apply`, or `bind`, regardless of how the function is later invoked. It overrides implicit binding — whatever object the function happens to be called through no longer matters once `this` has been explicitly fixed.

`call` and `apply` invoke the function immediately with the given `this` (differing only in how they pass arguments — a list vs an array). `bind` doesn't invoke the function; it returns a new function permanently bound to the given `this`, which can be called (or re-called) later.

```js
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

const person = { name: "Ada" };

greet.call(person, "Hello");     // Hello, Ada
greet.apply(person, ["Hi"]);     // Hi, Ada

const boundGreet = greet.bind(person);
boundGreet("Hey");               // Hey, Ada

const another = { name: "Grace" };
boundGreet.call(another, "Yo");  // Hey, Ada — bind cannot be overridden
```

---

## 4. What is implicit binding?

Implicit binding is the default rule for method calls: when a function is invoked as a property of an object (`obj.method()`), `this` inside that function is set to the object left of the dot at the call-site. It's called "implicit" because nothing manually sets `this` — it falls out naturally from the call syntax.

The catch is that this binding is tied to the call-site, not to the function itself. If the method is extracted into a standalone reference and invoked without the object, the implicit binding is lost and `this` reverts to `undefined` (strict mode) or the global object.

```js
const obj = {
  name: "obj",
  greet() {
    console.log(this.name);
  },
};

obj.greet();               // "obj" — implicit binding, this === obj

const fn = obj.greet;
fn();                      // TypeError or undefined — binding lost, this !== obj

setTimeout(obj.greet, 0);  // same problem — passed as a bare reference
```

---

## 5. What is lexical this?

Lexical `this` describes how arrow functions handle `this`: they don't create their own `this` binding at all. Instead, an arrow function captures `this` from its enclosing lexical scope at the moment it's defined, and that value never changes regardless of how the arrow function is later called — `call`, `apply`, and `bind` cannot override it.

This makes arrow functions well suited to callbacks that need to preserve an outer `this`, such as inside a class method where a nested regular function would otherwise lose the instance context.

```js
class Timer {
  seconds = 0;

  start() {
    setInterval(() => {
      this.seconds++;         // this -> the Timer instance, inherited lexically
      console.log(this.seconds);
    }, 1000);
  }

  startBroken() {
    setInterval(function () {
      this.seconds++;         // this -> undefined/global, NOT the instance
    }, 1000);
  }
}
```

---

## 6. What is a closure?

A closure is a function that retains access to variables from its enclosing (outer) scope, even after that outer scope has already finished executing and would normally have its variables discarded. This happens because the inner function keeps a live reference to the outer scope's variable bindings — not a copied snapshot of their values — so later reads and writes through the closure see up-to-date state.

Closures are the mechanism behind data privacy in JavaScript, memoization, and factory functions that produce independently stateful instances.

```js
function makeCounter() {
  let count = 0; // enclosing scope variable

  return function increment() {
    count += 1;      // live reference, not a copy
    return count;
  };
}

const counterA = makeCounter();
const counterB = makeCounter();

counterA(); // 1
counterA(); // 2
counterB(); // 1 — independent closure, separate `count`
```

---

## 7. What is a higher-order function?

A higher-order function is a function that operates on other functions — either by accepting one or more functions as arguments, by returning a function, or both. This is possible because JavaScript treats functions as first-class values: they can be stored in variables, passed around, and returned like any other value.

Array methods like `map`, `filter`, and `reduce` are the most common higher-order functions in everyday code. Function factories — functions that return specialized functions, such as debounced or memoized wrappers — are the other major category.

```js
// Takes a function as an argument
const doubled = [1, 2, 3].map(n => n * 2); // [2, 4, 6]

// Returns a function
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const debouncedSave = debounce(() => console.log("saved"), 300);
```

---

## 8. What is function composition?

Function composition is the technique of combining several small, single-purpose functions into a single new function by piping the output of one directly into the input of the next. Instead of writing one large function that does everything, you build a pipeline of focused functions and let composition wire them together.

`compose` typically applies functions right-to-left (mathematical convention, `compose(f, g)(x) === f(g(x))`), while `pipe` applies them left-to-right. Both are trivially implemented with `reduce`.

```js
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

const trim = s => s.trim();
const toLower = s => s.toLowerCase();
const exclaim = s => s + "!";

const shout = compose(exclaim, toLower); // exclaim(toLower(x))
shout("  HELLO ".trim());                // "hello!"

const clean = pipe(trim, toLower, exclaim);
clean("  HELLO  "); // "hello!" — reads left to right
```

---

## 9. What is currying?

Currying transforms a function that takes multiple arguments into a sequence of nested functions, each accepting exactly one argument. Instead of calling `f(a, b, c)`, you call `f(a)(b)(c)`, where each call returns a new function waiting for the next single argument until all have been supplied and the original function finally runs.

Currying is useful for building specialized functions incrementally and composes naturally with point-free / functional pipelines.

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);
    return (...more) => curried(...args, ...more);
  };
}

const add3 = (a, b, c) => a + b + c;
const curriedAdd = curry(add3);

curriedAdd(1)(2)(3);   // 6
curriedAdd(1, 2)(3);   // 6 — this implementation also allows grouped args
curriedAdd(1)(2, 3);   // 6
```

---

## 10. What is partial application?

Partial application fixes (pre-fills) some of a function's arguments up front, returning a new function that accepts only the remaining arguments — not necessarily one at a time. It's related to currying but distinct: currying always decomposes a function into a strict chain of unary (single-argument) calls, while partial application simply pre-binds a subset of arguments and leaves the rest to be passed however many at once.

| | Currying | Partial application |
|---|---|---|
| Argument shape | Always one argument per call | Any number of remaining arguments per call |
| Output | Chain of unary functions | A single new function awaiting the rest |
| Goal | Decompose into unary steps | Pre-configure some inputs |

```js
function partial(fn, ...presetArgs) {
  return (...laterArgs) => fn(...presetArgs, ...laterArgs);
}

function volume(l, w, h) {
  return l * w * h;
}

const baseTile = partial(volume, 10, 5); // l and w fixed
baseTile(2); // 100 — remaining args passed together, not one-by-one
baseTile(3); // 150
```

---

## 11. What is a generator?

A generator is a special function, declared with `function*`, that can pause its execution at a `yield` expression and later resume exactly where it left off. Calling a generator function doesn't run its body immediately — it returns a generator object (an iterator) whose `.next()` calls drive execution forward one `yield` at a time, producing values lazily rather than all at once.

Because values are produced on demand, generators are well suited to representing sequences that are expensive, infinite, or need external control over pacing.

```js
function* idGenerator() {
  let id = 1;
  while (true) {
    yield id++;
  }
}

const gen = idGenerator();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
```

---

## 12. What is an iterator?

An iterator is any object that implements the iterator protocol: it has a `.next()` method that returns an object shaped like `{ value, done }`, where `value` is the current item and `done` is a boolean indicating whether the sequence is exhausted. Anything conforming to this shape can be consumed by constructs that expect an iterator, such as `for...of` or the spread operator, provided it's also exposed via an `[Symbol.iterator]` method (making it iterable).

Generators are the most convenient way to produce iterators, since the runtime builds the `.next()` machinery for you, but you can hand-write the protocol on a plain object just as validly.

```js
// Hand-written iterator, no generator involved
function makeRangeIterator(start, end) {
  let current = start;
  return {
    next() {
      if (current < end) {
        return { value: current++, done: false };
      }
      return { value: undefined, done: true };
    },
  };
}

const it = makeRangeIterator(1, 4);
it.next(); // { value: 1, done: false }
it.next(); // { value: 2, done: false }
it.next(); // { value: 3, done: false }
it.next(); // { value: undefined, done: true }
```

---

## 13. What is a Proxy?

A `Proxy` wraps a target object and lets you intercept and customize fundamental operations performed on it — reading a property, setting one, checking existence with `in`, deleting a property, and more — via functions called "traps" defined on a handler object. Code interacting with the proxy generally can't tell it isn't the plain target, since the proxy forwards operations (potentially after modifying, validating, or logging them).

Proxies are the foundation of reactive systems: Vue 3's reactivity, for instance, wraps reactive state in proxies whose `get`/`set` traps track dependencies and trigger re-renders when values change.

```js
const user = { name: "Ada", age: 30 };

const validated = new Proxy(user, {
  set(target, prop, value) {
    if (prop === "age" && typeof value !== "number") {
      throw new TypeError("age must be a number");
    }
    target[prop] = value;
    return true;
  },
  get(target, prop) {
    console.log(`reading ${String(prop)}`);
    return target[prop];
  },
});

validated.name;        // logs "reading name", returns "Ada"
validated.age = "old";  // throws TypeError
```

---

## 14. What is a Reflect API?

`Reflect` is a built-in, non-constructible object that provides static methods mirroring the same internal operations that `Proxy` traps intercept — `Reflect.get`, `Reflect.set`, `Reflect.has`, `Reflect.deleteProperty`, and so on. Inside a Proxy trap, `Reflect` is the natural way to forward the default behavior after your custom logic runs, since its methods correspond one-to-one with the trap names.

`Reflect` methods are also generally preferable to the equivalent legacy `Object.*` methods (like `Object.defineProperty`) outside of proxies, because they return a boolean success value instead of throwing in more cases, giving more predictable, function-based semantics.

```js
const target = { name: "Ada" };

const logged = new Proxy(target, {
  set(obj, prop, value, receiver) {
    console.log(`setting ${String(prop)} = ${value}`);
    return Reflect.set(obj, prop, value, receiver); // forward default behavior
  },
});

logged.name = "Grace"; // logs "setting name = Grace", then actually sets it

Reflect.has(target, "name");   // true, like `"name" in target`
Reflect.ownKeys(target);       // ["name"]
```

---

## 15. What are Symbols?

`Symbol` is a primitive type introduced to produce unique, immutable values, typically used as object property keys that are guaranteed never to collide with any other key — even another symbol created with the same description. Two symbols are never equal to each other, even if their descriptions match.

The language also defines "well-known symbols," such as `Symbol.iterator`, which hook custom objects into built-in behaviors — implementing `[Symbol.iterator]` on an object is what makes it work with `for...of` and the spread operator.

```js
const id1 = Symbol("id");
const id2 = Symbol("id");
id1 === id2; // false — always unique, even with the same description

const user = {
  name: "Ada",
  [id1]: 12345, // collision-free key, won't clash with a string "id" key
};

const range = {
  from: 1,
  to: 3,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next: () => current <= last
        ? { value: current++, done: false }
        : { value: undefined, done: true },
    };
  },
};

[...range]; // [1, 2, 3] — works because of Symbol.iterator
```

---

## 16. What are WeakMap and WeakSet?

`WeakMap` and `WeakSet` are collections similar to `Map` and `Set`, but they hold their object keys (WeakMap) or members (WeakSet) weakly — meaning that holding a reference in the collection doesn't prevent the JavaScript engine from garbage-collecting that object if nothing else references it. As a consequence, neither collection is iterable, neither exposes a `.size`, and `WeakMap` keys must always be objects (never primitives).

This makes them well suited for attaching metadata or private data to objects without creating a memory leak — the association disappears automatically once the object itself is no longer reachable elsewhere.

| | Map / Set | WeakMap / WeakSet |
|---|---|---|
| Key/value types | Any value | Keys (WeakMap) / members (WeakSet) must be objects |
| Prevents garbage collection | Yes | No — held weakly |
| Iterable | Yes | No |
| Has `.size` | Yes | No |

```js
const cache = new WeakMap();

function getMetadata(obj) {
  if (!cache.has(obj)) {
    cache.set(obj, { computedAt: Date.now() });
  }
  return cache.get(obj);
}

let el = { id: 1 };
getMetadata(el);
el = null; // no other references left — the WeakMap entry can now be garbage collected
```

---

## 17. What is the difference between Object.create() and new?

`Object.create(proto)` creates a brand-new object whose internal `[[Prototype]]` is explicitly set to `proto`, with no constructor function invoked at all — it's a direct, minimal way to wire up prototype inheritance. `new Ctor()`, by contrast, creates a new object whose `[[Prototype]]` is set to `Ctor.prototype`, and then immediately invokes `Ctor` with `this` bound to that new object, running any initialization logic inside the constructor.

`Object.create` is useful when you want prototype-based inheritance without the overhead or side effects of a constructor call — for instance, building an object from an existing object as its prototype directly.

| | `Object.create(proto)` | `new Ctor()` |
|---|---|---|
| Constructor invoked | No | Yes, `Ctor` runs with `this` bound to the new object |
| Prototype | Set explicitly to `proto` | Set to `Ctor.prototype` |
| Initialization logic | None — you set properties manually after | Runs whatever `Ctor` defines |

```js
const animal = {
  speak() {
    console.log(`${this.name} makes a sound`);
  },
};

const dog = Object.create(animal); // no constructor involved
dog.name = "Rex";
dog.speak(); // "Rex makes a sound"

function Animal(name) {
  this.name = name; // constructor logic runs
}
Animal.prototype.speak = function () {
  console.log(`${this.name} makes a sound`);
};

const cat = new Animal("Whiskers"); // constructor invoked, this bound to new object
cat.speak(); // "Whiskers makes a sound"
```

---

## 18. What is the difference between Object.assign() and spread syntax?

`Object.assign(target, ...sources)` copies enumerable own properties from one or more source objects into an existing target object, mutating that target in place and also returning it. A very common (and easy to misuse) pattern is `Object.assign({}, obj)`, which uses a throwaway empty object as the target purely to simulate a shallow copy.

Spread syntax (`{ ...obj }`) achieves the equivalent shallow copy or merge, but it's expression syntax rather than a function call — it always produces a brand-new object literal and never mutates any of the source objects, which makes it a better fit for immutability-focused code. The two behave equivalently for merging plain enumerable own properties; the difference is mutation and where each can be used.

| | `Object.assign(target, ...sources)` | `{ ...obj }` |
|---|---|---|
| Mutates target | Yes, mutates and returns the first argument | No — always produces a new object |
| Syntax form | Function call | Expression, usable inline in a literal |
| Typical shallow-copy idiom | `Object.assign({}, obj)` | `{ ...obj }` |

```js
const defaults = { theme: "light", notifications: true };
const overrides = { theme: "dark" };

// Object.assign mutates its first argument
const merged1 = Object.assign({}, defaults, overrides);

// spread creates a new object inline, no mutation risk
const merged2 = { ...defaults, ...overrides };

merged1; // { theme: "dark", notifications: true }
merged2; // { theme: "dark", notifications: true }
```

---

## 19. What is the difference between structuredClone() and JSON cloning?

`structuredClone(obj)` is a built-in deep-clone function that correctly handles a much wider range of types than the old JSON trick — `Date` objects, `Map`, `Set`, `ArrayBuffer`/typed arrays, and circular references are all cloned properly. It cannot clone functions (or DOM nodes in most contexts) — attempting to do so throws, rather than silently producing something wrong.

`JSON.parse(JSON.stringify(obj))` is the older deep-clone workaround: it silently drops functions, `undefined` values, and `Symbol` keys/values; converts `Date` objects into plain strings instead of preserving them as dates; and throws on circular references instead of handling them. It happens to work for simple, JSON-safe data (plain objects, arrays, strings, numbers, booleans), but it mangles or loses anything beyond that.

| | `structuredClone()` | `JSON.parse(JSON.stringify())` |
|---|---|---|
| Dates | Preserved as `Date` objects | Converted to strings |
| Map / Set | Preserved | Lost (become `{}`) |
| Circular references | Supported | Throws |
| `undefined` / Symbols | `undefined` preserved as a value; symbol keys dropped | Silently dropped |
| Functions | Throws (not cloneable) | Silently dropped |

```js
const original = {
  createdAt: new Date(),
  tags: new Set(["a", "b"]),
};
original.self = original; // circular reference

const clone = structuredClone(original);
clone.createdAt instanceof Date; // true
clone.tags instanceof Set;       // true
clone.self === clone;            // true — circular reference preserved

JSON.parse(JSON.stringify(original)); // throws: Converting circular structure to JSON
```
