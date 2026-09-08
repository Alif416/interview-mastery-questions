# JavaScript Fundamentals

## 1. What is JavaScript, and where can it run?

JavaScript is a high-level, interpreted (or JIT-compiled), dynamically-typed programming language. It was originally created to make web pages interactive, but it has since grown into a general-purpose language.

It runs anywhere there is a **JavaScript engine**:

- **Browsers** — every modern browser has an engine (V8 in Chrome/Edge, SpiderMonkey in Firefox, JavaScriptCore in Safari) that runs JS to manipulate the DOM, handle events, make network requests, etc.
- **Servers** — via runtimes like **Node.js**, **Deno**, or **Bun**, which embed V8 (or similar) outside the browser so JS can read files, run servers, talk to databases, etc.
- **Mobile/Desktop apps** — via frameworks like React Native, Electron, or NativeScript.
- **Embedded devices / IoT** — via engines like Espruino or Johnny-Five.

```js
console.log("Hello from any JS environment!");
```

---

## 2. What is the difference between JavaScript and Java?

They share a name (for marketing reasons back in 1995) but are otherwise unrelated languages.

| | JavaScript | Java |
|---|---|---|
| Typing | Dynamically typed | Statically typed |
| Execution | Interpreted / JIT-compiled | Compiled to bytecode, run on JVM |
| Paradigm | Multi-paradigm (functional, prototype-based OOP) | Class-based OOP |
| Where it runs | Browsers, Node.js, servers | JVM (desktop, servers, Android) |
| Concurrency model | Single-threaded, event loop | Multi-threaded |

```js
// JavaScript - no types declared, no compilation step
let x = 5;
x = "now a string"; // totally fine
```

```java
// Java - statically typed, must be compiled
int x = 5;
x = "now a string"; // compile-time error
```

---

## 3. What's the difference between primitive and reference values?

- **Primitive values** are immutable and stored **by value**. When you assign or pass a primitive, a copy is made.
- **Reference values** (objects, arrays, functions) are stored **by reference**. The variable holds a pointer to a location in memory; copying the variable copies the reference, not the underlying data.

```js
// Primitive - copied by value
let a = 10;
let b = a;
b = 20;
console.log(a); // 10 (unaffected)

// Reference - copied by reference
let obj1 = { value: 10 };
let obj2 = obj1;
obj2.value = 20;
console.log(obj1.value); // 20 (both point to the same object)
```

---

## 4. Can you name the primitive data types in JavaScript?

JavaScript has 7 primitive types:

1. `string` — `"hello"`
2. `number` — `42`, `3.14`
3. `boolean` — `true` / `false`
4. `undefined` — a variable declared but not assigned
5. `null` — intentional absence of a value
6. `bigint` — for arbitrarily large integers, e.g. `123n`
7. `symbol` — unique, immutable identifiers, e.g. `Symbol("id")`

```js
typeof "hi";        // "string"
typeof 42;           // "number"
typeof true;          // "boolean"
typeof undefined;      // "undefined"
typeof null;            // "object" (see Q13)
typeof 10n;               // "bigint"
typeof Symbol("id");       // "symbol"
```

---

## 5. What's the difference between var, let, and const?

| | `var` | `let` | `const` |
|---|---|---|---|
| Scope | Function-scoped | Block-scoped | Block-scoped |
| Hoisting | Hoisted & initialized as `undefined` | Hoisted but in TDZ | Hoisted but in TDZ |
| Re-declaration | Allowed | Not allowed | Not allowed |
| Re-assignment | Allowed | Allowed | Not allowed |

```js
function example() {
  if (true) {
    var x = 1;   // function-scoped
    let y = 2;   // block-scoped
    const z = 3; // block-scoped
  }
  console.log(x); // 1
  console.log(y); // ReferenceError: y is not defined
  console.log(z); // ReferenceError: z is not defined
}

const arr = [1, 2, 3];
arr.push(4);       // OK - mutating contents is fine
arr = [5, 6];       // TypeError - can't reassign the binding
```

---

## 6. What is hoisting in JavaScript?

Hoisting is JavaScript's behavior of moving **declarations** (not initializations) to the top of their scope during the compile phase, before the code executes.

```js
console.log(a); // undefined (declaration hoisted, not the assignment)
var a = 5;

// Equivalent to:
var a;
console.log(a); // undefined
a = 5;
```

Function declarations are hoisted entirely (including their body), so you can call them before they appear in the code:

```js
sayHi(); // "Hi!" - works fine

function sayHi() {
  console.log("Hi!");
}
```

`let` and `const` are also hoisted, but they aren't initialized — this leads to the Temporal Dead Zone (next question).

---

## 7. What is the Temporal Dead Zone (TDZ)?

The **Temporal Dead Zone (TDZ)** is the period between the start of a block/scope and the point where a `let` or `const` variable is actually declared. Accessing the variable in this window throws a `ReferenceError`, even though the variable has technically been hoisted.

```js
{
  console.log(name); // ReferenceError: Cannot access 'name' before initialization
  let name = "Alif";
}
```

`var` does not have a TDZ — it's simply `undefined` until assigned. `let`/`const` are "hoisted" but stay uninitialized (in the TDZ) until their declaration line runs.

---

## 8. What's the difference between == and ===?

- `==` (**loose equality**) compares values **after** performing type coercion if the operand types differ.
- `===` (**strict equality**) compares both **value and type**, with no coercion.

```js
0 == "0";      // true  -> "0" is coerced to 0
0 === "0";     // false -> different types

null == undefined;  // true
null === undefined; // false

1 == true;    // true -> true is coerced to 1
1 === true;   // false
```

**Best practice:** always prefer `===` (and `!==`) to avoid unpredictable coercion bugs.

---

## 9. What is type coercion in JavaScript?

Type coercion is the automatic (implicit) or manual (explicit) conversion of a value from one type to another.

```js
// Implicit coercion
"5" + 1;     // "51"  (number coerced to string, because of +)
"5" - 1;     // 4     (string coerced to number, because of -)
true + 1;    // 2     (true coerced to 1)
"5" == 5;    // true  (string coerced to number)

// Explicit coercion
String(123);   // "123"
Number("123"); // 123
Boolean(0);    // false
```

---

## 10. What are truthy and falsy values in JavaScript?

Every value in JavaScript is inherently truthy or falsy when evaluated in a boolean context (like an `if` statement).

**Falsy values (only these 8):**
```js
false
0
-0
0n        // BigInt zero
""        // empty string
null
undefined
NaN
```

**Everything else is truthy**, including:
```js
"0"       // non-empty string -> truthy
[]        // empty array -> truthy
{}        // empty object -> truthy
"false"   // non-empty string -> truthy
```

```js
if ("") {
  console.log("won't run");
} else {
  console.log("empty string is falsy"); // this runs
}

if ([]) {
  console.log("empty array is truthy"); // this runs
}
```

---

## 11. What's the difference between null and undefined?

- **`undefined`** means a variable has been declared but not yet assigned a value. JavaScript sets this automatically.
- **`null`** is an assignment value that represents "no value" or "empty" — it must be set intentionally by the developer.

```js
let a;
console.log(a); // undefined (JS default)

let b = null;
console.log(b); // null (explicitly set to "nothing")

typeof undefined; // "undefined"
typeof null;      // "object" (a long-standing JS quirk, see Q13)

null == undefined;  // true  (loose equality treats them as equal)
null === undefined; // false (different types)
```

---

## 12. What is NaN in JavaScript?

`NaN` stands for **"Not a Number"**. It's a special numeric value that represents the result of an invalid or undefined mathematical operation.

```js
console.log(0 / 0);          // NaN
console.log("abc" * 2);      // NaN
console.log(Math.sqrt(-1));  // NaN
```

The tricky part: `NaN` is the only value in JavaScript that is **not equal to itself**.

```js
NaN === NaN; // false
```

To check for `NaN`, use `Number.isNaN()` (preferred, no coercion) rather than the global `isNaN()` (which coerces its argument first):

```js
Number.isNaN(NaN);      // true
Number.isNaN("abc");    // false (it's a string, not NaN)
isNaN("abc");            // true  (coerces "abc" to NaN first - misleading)
```

---

## 13. Why does typeof null return "object"?

This is a well-known bug in the original JavaScript implementation (1995) that has never been fixed, because fixing it would break existing code across the web.

In the original implementation, values were represented internally with a type tag plus a value. Objects had a type tag of `0`, and `null` was represented as the **null pointer** (`0x00` on most platforms) — which coincidentally also had a type tag of `0`. So `typeof null` incorrectly reports `"object"`.

```js
typeof null; // "object"  <- historical bug, null is NOT an object
typeof {};   // "object"
```

To reliably check for `null`, use strict equality instead of `typeof`:

```js
value === null; // reliable null check
```

---

## 14. What's the difference between typeof and instanceof?

- **`typeof`** returns a string indicating the **primitive type** of a value. It's mainly useful for primitives.
- **`instanceof`** checks whether an object is an **instance of a specific constructor/class** by walking its prototype chain. It's used for reference types.

```js
typeof 42;            // "number"
typeof "hi";           // "string"
typeof {};               // "object"
typeof [];                // "object" (arrays are objects!)
typeof function(){};       // "function"

[] instanceof Array;   // true
[] instanceof Object;  // true (Array inherits from Object)
{} instanceof Object;  // true

class Dog {}
const d = new Dog();
d instanceof Dog;    // true
typeof d;             // "object" (doesn't tell you it's a Dog)
```

**Rule of thumb:** use `typeof` for primitives/functions, `instanceof` to check an object's class/constructor.

---

## 15. What is strict mode, and how do you enable it?

Strict mode is an opt-in mode that makes JavaScript enforce stricter parsing and error handling. It's enabled by adding `"use strict";` at the top of a file or function.

```js
"use strict";

x = 10; // ReferenceError: x is not defined (must be declared first)
```

What strict mode changes:
- Throws errors for assigning to undeclared variables (prevents accidental globals).
- Disallows duplicate parameter names.
- Makes `this` `undefined` in standalone function calls (instead of the global object).
- Disallows some unsafe syntax (e.g. `with` statement, octal literals).

```js
function normal() {
  console.log(this); // global object (or window in browsers)
}
normal();

function strict() {
  "use strict";
  console.log(this); // undefined
}
strict();
```

Note: ES6 modules and classes are automatically in strict mode, no directive needed.

---

## 16. What's the difference between an expression and a statement?

- An **expression** is any piece of code that **produces a value**.
- A **statement** is an instruction that **performs an action**; it does not necessarily produce a value.

```js
// Expressions - each of these evaluates to a value
5 + 3;
"hello".toUpperCase();
x > 10;
(function() { return 1; })();

// Statements - perform actions, control flow
if (x > 10) {
  console.log("big");
}

for (let i = 0; i < 5; i++) {
  console.log(i);
}

function greet() {
  console.log("hi");
}
```

A helpful test: can you put it on the right side of an assignment (`let a = ...`)? If yes, it's an expression.

```js
let a = (5 + 3); // valid -> 5 + 3 is an expression
let b = (if (true) {}); // SyntaxError -> if is a statement, not an expression
```

---

## 17. What is short-circuit evaluation in JavaScript?

Logical operators `&&` and `||` don't always evaluate both operands — they stop ("short-circuit") as soon as the result is determined.

- **`&&`** returns the first falsy value, or the last value if all are truthy.
- **`||`** returns the first truthy value, or the last value if all are falsy.

```js
// && stops at the first falsy value
false && sideEffect(); // sideEffect() never runs
true && "hello";        // "hello"

// || stops at the first truthy value
"" || "default";        // "default"
"hi" || sideEffect();    // sideEffect() never runs, returns "hi"

// Common pattern: guard against calling a method on undefined/null
user && user.sayHi();

// Common pattern: default values
const name = inputName || "Guest";
```

---

## 18. What's the difference between the || and ?? operators?

Both provide a fallback value, but they differ in **which values trigger the fallback**.

- **`||`** falls back when the left side is any **falsy** value (`0`, `""`, `false`, `null`, `undefined`, `NaN`).
- **`??`** (nullish coalescing) falls back **only** when the left side is `null` or `undefined`.

```js
const count = 0;

count || 10; // 10  -> 0 is falsy, so it falls back (often NOT what you want)
count ?? 10; // 0   -> 0 is not null/undefined, so it's kept

const text = "";
text || "default"; // "default" -> "" is falsy
text ?? "default";  // ""        -> "" is not null/undefined

let x = null;
x ?? "fallback"; // "fallback"
```

**Use `??`** when you specifically want to fall back only on `null`/`undefined`, and legitimate falsy values like `0`, `""`, or `false` should be preserved.

---

## 19. What is optional chaining, and when would you use it?

Optional chaining (`?.`) lets you safely access deeply nested properties/methods without manually checking if each level exists. If any part of the chain is `null` or `undefined`, the whole expression short-circuits and returns `undefined` instead of throwing an error.

```js
const user = {
  name: "Alif",
  address: {
    city: "Dhaka",
  },
};

// Without optional chaining - throws if address doesn't exist
console.log(user.address.zip); // undefined (no error, zip just doesn't exist)
console.log(user.contact.email); // TypeError: Cannot read properties of undefined

// With optional chaining - safe
console.log(user.contact?.email); // undefined, no error

// Works with method calls too
user.sayHi?.(); // does nothing if sayHi doesn't exist, instead of throwing

// Works with array/bracket access
const arr = null;
console.log(arr?.[0]); // undefined

// Often combined with nullish coalescing for a default
const email = user.contact?.email ?? "no email provided";
```

---

## 20. What's the difference between undefined, null, and a variable that was never declared?

| | `undefined` | `null` | Undeclared |
|---|---|---|---|
| Meaning | Declared, no value assigned | Intentionally "no value" | Never declared at all |
| Set by | JavaScript automatically | Developer explicitly | N/A |
| `typeof` | `"undefined"` | `"object"` | `"undefined"` |
| Accessing it | Returns `undefined`, no error | Returns `null`, no error | `ReferenceError` if used (not with `typeof`) |

```js
let a;
console.log(a); // undefined - declared but not assigned

let b = null;
console.log(b); // null - explicitly set to "no value"

console.log(c); // ReferenceError: c is not defined - never declared

typeof c; // "undefined" - typeof is safe even on undeclared variables
```
