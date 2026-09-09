# Functions

## 1. What is a first-class function?

A language has first-class functions when functions are treated **like any other value** — they can be assigned to variables, stored in data structures, passed as arguments, and returned from other functions. JavaScript functions are first-class.

```js
// Assigned to a variable
const greet = function () {
  console.log("Hi!");
};

// Stored in an array
const operations = [Math.sqrt, Math.abs, Math.floor];

// Passed as an argument
setTimeout(() => console.log("later"), 1000);

// Returned from another function
function createGreeter() {
  return function () {
    console.log("Hello from a returned function!");
  };
}

const greeter = createGreeter();
greeter(); // "Hello from a returned function!"
```

---

## 2. What is a higher-order function?

A higher-order function is a function that **takes one or more functions as arguments**, **returns a function**, or both. This is only possible because functions are first-class values.

```js
// Takes a function as an argument
[1, 2, 3].map(function (n) {
  return n * 2;
}); // [2, 4, 6]

// Returns a function
function multiplier(factor) {
  return function (n) {
    return n * factor;
  };
}

const double = multiplier(2);
console.log(double(5)); // 10
```

---

## 3. What is a callback function?

A callback is a function passed into another function as an argument, to be **invoked later** — either synchronously (e.g. inside `array.forEach`) or asynchronously (e.g. after a timer or network request finishes).

```js
// Synchronous callback
[1, 2, 3].forEach(function (n) {
  console.log(n); // runs immediately, once per element
});

// Asynchronous callback
function fetchUser(id, callback) {
  setTimeout(() => {
    callback({ id, name: "Alif" }); // runs later, after the "network" delay
  }, 1000);
}

fetchUser(1, (user) => {
  console.log(user); // { id: 1, name: "Alif" }
});
```

---

## 4. What's the difference between a normal function and an arrow function?

| | Normal function | Arrow function |
|---|---|---|
| `this` | Dynamic — depends on how it's called | Lexical — inherited from the enclosing scope |
| `arguments` object | Has its own | Does not have its own (uses enclosing scope's) |
| Can be used as a constructor (`new`) | Yes | No — throws `TypeError` |
| Hoisting | Function declarations are fully hoisted | Not hoisted (it's just a variable assignment) |
| Implicit return | No — needs `return` | Yes, for single-expression bodies |

```js
function normal() {
  console.log(arguments); // works - has its own arguments object
}
normal(1, 2, 3); // Arguments(3) [1, 2, 3]

const arrow = () => {
  console.log(arguments); // ReferenceError - no arguments object of its own
};

function Person(name) {
  this.name = name;
}
const p = new Person("Alif"); // works fine

const ArrowPerson = (name) => {
  this.name = name;
};
new ArrowPerson("Alif"); // TypeError: ArrowPerson is not a constructor

const add = (a, b) => a + b; // implicit return
console.log(add(2, 3)); // 5
```

---

## 5. How does `this` behave in a normal function?

In a normal function, `this` is **dynamic** — it's determined by **how the function is called** (its call site), not where it's defined.

```js
function show() {
  console.log(this);
}

show(); // global object (or undefined in strict mode) - default binding

const obj = {
  name: "Alif",
  show() {
    console.log(this.name);
  },
};
obj.show(); // "Alif" - implicit binding, "this" is obj

const unbound = obj.show;
unbound(); // undefined - lost its context when detached from obj

obj.show.call({ name: "Explicit" }); // "Explicit" - explicit binding via call/apply/bind

function Person(name) {
  this.name = name; // "this" is the newly created object
}
const p = new Person("New"); // new binding
console.log(p.name); // "New"
```

---

## 6. How does `this` behave in an arrow function?

Arrow functions don't have their own `this`. Instead, they **lexically inherit `this`** from the enclosing (surrounding) scope at the time they're defined — and it can never be changed with `call`, `apply`, `bind`, or by how the arrow function is invoked.

```js
const obj = {
  name: "Alif",
  showNormal: function () {
    console.log(this.name); // "Alif" - "this" is obj (implicit binding)
  },
  showArrow: () => {
    console.log(this.name); // undefined - "this" comes from the outer (global) scope, not obj
  },
  delayedGreet: function () {
    // Arrow function inside a method inherits "this" from showNormal's scope
    setTimeout(() => {
      console.log(this.name); // "Alif" - inherits "this" from delayedGreet
    }, 100);
  },
};

obj.showNormal();
obj.showArrow();
obj.delayedGreet();
```

This makes arrow functions especially useful for callbacks (like inside `setTimeout` or array methods) where you want to keep the surrounding `this`, instead of it being reset.

---

## 7. What are default parameters?

Default parameters let you specify a fallback value for a function argument, used **only when that argument is `undefined`** (not passed, or explicitly passed as `undefined`).

```js
function greet(name = "Guest") {
  console.log(`Hello, ${name}!`);
}

greet("Alif"); // "Hello, Alif!"
greet();       // "Hello, Guest!" - no argument passed
greet(undefined); // "Hello, Guest!" - explicitly undefined
greet(null);   // "Hello, null!" - null is NOT undefined, so default doesn't kick in

// Defaults can reference earlier parameters
function createUser(name, role = "member", label = `${name} (${role})`) {
  console.log(label);
}
createUser("Alif"); // "Alif (member)"
```

---

## 8. What are rest parameters?

Rest parameters (`...args`) let a function accept an **indefinite number of arguments** as a real array, collecting all remaining arguments after the named ones.

```js
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

console.log(sum(1, 2, 3));       // 6
console.log(sum(1, 2, 3, 4, 5)); // 15

function logFirstAndRest(first, ...rest) {
  console.log(first); // 1
  console.log(rest);  // [2, 3, 4]
}
logFirstAndRest(1, 2, 3, 4);
```

Unlike the old `arguments` object, rest parameters produce a **real array** (with `.map`, `.reduce`, etc. available), and they work in arrow functions too.

---

## 9. What is the spread operator?

The spread operator (`...`) does the **opposite of rest** — it *expands* an iterable (array, string, `Map`, `Set`) or an object's own enumerable properties into individual elements/key-value pairs.

```js
// Spreading into an array literal
const nums = [1, 2, 3];
const moreNums = [...nums, 4, 5]; // [1, 2, 3, 4, 5]

// Spreading into a function call
function add(a, b, c) {
  return a + b + c;
}
console.log(add(...nums)); // 6

// Spreading into an object literal (shallow merge/copy)
const user = { name: "Alif" };
const updatedUser = { ...user, age: 25 }; // { name: "Alif", age: 25 }

// Spreading a string into characters
console.log([..."abc"]); // ["a", "b", "c"]
```

---

## 10. What's the difference between rest and spread?

They use the **same `...` syntax** but do opposite jobs, and the difference is about **which side of the assignment/call they appear on**.

| | Rest | Spread |
|---|---|---|
| Direction | **Collects** many values into one array | **Expands** one array/object into many values |
| Used in | Function parameters, destructuring | Function calls, array/object literals |

```js
// Rest - collecting (appears in a "receiving" position)
function logArgs(...args) {  // gathers arguments into an array
  console.log(args);
}
logArgs(1, 2, 3); // [1, 2, 3]

const [first, ...others] = [1, 2, 3, 4]; // others = [2, 3, 4]

// Spread - expanding (appears in a "giving" position)
const arr1 = [1, 2];
const arr2 = [3, 4];
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4] - expands both arrays

logArgs(...combined); // spreads combined back out as individual arguments
```

---

## 11. What is function composition?

Function composition is combining two or more functions to build a new function, where the **output of one function becomes the input of the next**.

```js
const double = (n) => n * 2;
const increment = (n) => n + 1;

// Manual composition
const doubleThenIncrement = (n) => increment(double(n));
console.log(doubleThenIncrement(5)); // 11 -> double(5)=10, increment(10)=11

// A generic compose helper (right to left)
const compose = (...fns) =>
  (initialValue) => fns.reduceRight((acc, fn) => fn(acc), initialValue);

const composed = compose(increment, double);
console.log(composed(5)); // 11 - runs double first, then increment

// A generic pipe helper (left to right, often more intuitive)
const pipe = (...fns) =>
  (initialValue) => fns.reduce((acc, fn) => fn(acc), initialValue);

const piped = pipe(double, increment);
console.log(piped(5)); // 11
```

---

## 12. What is currying?

Currying transforms a function that takes **multiple arguments** into a **sequence of functions**, each taking a **single argument**, where each call returns a new function until all arguments have been supplied.

```js
// Normal function
function add(a, b, c) {
  return a + b + c;
}
console.log(add(1, 2, 3)); // 6

// Curried version
function curriedAdd(a) {
  return function (b) {
    return function (c) {
      return a + b + c;
    };
  };
}
console.log(curriedAdd(1)(2)(3)); // 6

// Same thing, more concisely with arrow functions
const curriedAddArrow = (a) => (b) => (c) => a + b + c;
console.log(curriedAddArrow(1)(2)(3)); // 6

// Currying is useful for creating specialized functions
const add5 = curriedAddArrow(5);
const add5and10 = add5(10);
console.log(add5and10(2)); // 17
```

---

## 13. What is a pure function?

A pure function is a function that:

1. **Always returns the same output for the same input** (no dependence on outside state).
2. **Has no side effects** — it doesn't modify anything outside its own scope.

```js
// Pure - same input always gives same output, no external changes
function add(a, b) {
  return a + b;
}
console.log(add(2, 3)); // always 5

// Impure - depends on external state
let taxRate = 0.1;
function addTax(amount) {
  return amount + amount * taxRate; // depends on external "taxRate"
}

// Impure - modifies external state (a side effect)
let total = 0;
function addToTotal(amount) {
  total += amount; // mutates something outside the function
  return total;
}
```

---

## 14. What is a side effect?

A side effect is any change a function makes that is **observable outside its own scope** — beyond simply returning a value. Side effects make code harder to test and reason about.

```js
let count = 0;

function increment() {
  count++; // side effect - mutates an outer variable
}

function logMessage(msg) {
  console.log(msg); // side effect - I/O (writing to the console)
}

function updateDOM() {
  document.title = "Updated"; // side effect - mutates the DOM
}

function fetchData() {
  return fetch("/api/data"); // side effect - network request
}

function mutateArray(arr) {
  arr.push(4); // side effect - mutates the argument passed in
}
```

Common sources of side effects: mutating external/global variables, mutating function arguments, console/DOM/file I/O, network requests, and using `Math.random()` or `Date.now()`.

---

## 15. What's the difference between a pure and an impure function?

| | Pure function | Impure function |
|---|---|---|
| Output depends only on | Its input arguments | Input **and/or** external/mutable state |
| Side effects | None | May mutate state, do I/O, log, fetch, etc. |
| Same input -> same output | Always | Not guaranteed |
| Testability | Easy — no setup/mocking needed | Harder — often needs mocks or setup |

```js
// Pure
function square(n) {
  return n * n;
}
console.log(square(4)); // 16, every single time

// Impure - relies on and mutates external state
let history = [];
function squareAndLog(n) {
  const result = n * n;
  history.push(result); // side effect: mutates "history"
  console.log(result);  // side effect: I/O
  return result;
}

// Impure - non-deterministic output for the same input
function getRandomGreeting(name) {
  const rand = Math.random(); // different output each call, same input
  return rand > 0.5 ? `Hi, ${name}!` : `Hello, ${name}!`;
}
```

Pure functions are preferred where possible (especially in React, e.g. render logic and reducers) because they're predictable, easy to test, and safe to memoize or run multiple times.
