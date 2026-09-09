# Scope & Closures

These are extremely important for understanding React.

## 1. What is scope?

Scope determines **where in your code a variable or function is accessible**. It defines the "visibility" of a binding — which parts of the program can see and use it.

```js
function greet() {
  const message = "Hello";
  console.log(message); // "Hello" - accessible inside greet
}

greet();
console.log(message); // ReferenceError: message is not defined
```

---

## 2. What's the difference between global, function, and block scope?

| Scope | Created by | Accessible from |
|---|---|---|
| **Global** | Code outside any function/block | Anywhere in the program |
| **Function** | A function body (`function`, `=>`) | Only inside that function |
| **Block** | `{ }` — `if`, `for`, `while`, standalone blocks | Only inside that block (for `let`/`const`) |

```js
const globalVar = "I'm global"; // global scope

function outer() {
  const funcVar = "I'm function-scoped"; // function scope
  console.log(globalVar); // accessible - global

  if (true) {
    const blockVar = "I'm block-scoped"; // block scope
    var notBlocked = "I'm function-scoped too"; // var ignores block scope
    console.log(funcVar); // accessible - same function
  }

  console.log(notBlocked); // "I'm function-scoped too" - var leaked out of the block
  console.log(blockVar);   // ReferenceError - blockVar doesn't exist here
}

outer();
```

---

## 3. What is lexical scope?

Lexical scope means a variable's accessibility is determined by **where it's physically written in the source code** (its nesting), not by where or how a function is called.

```js
function outer() {
  const name = "Alif";

  function inner() {
    console.log(name); // "Alif" - inner can see outer's variables
  }

  inner();
}

outer();

function innerCalledElsewhere() {
  console.log(typeof name); // "undefined" - lexical position, not call site, decides access
}
```

Because scope is fixed at **write time** (not run time), we can predict what a function can access just by reading the code — this is what enables closures.

---

## 4. What is the scope chain?

When JavaScript looks up a variable, it checks the **current scope first**, and if not found, walks **outward** through each enclosing scope until it reaches the global scope. If it's still not found, you get a `ReferenceError`. This ordered list of scopes is the **scope chain**.

```js
const level1 = "global";

function a() {
  const level2 = "function a";

  function b() {
    const level3 = "function b";

    function c() {
      console.log(level3); // found in c's own... no, b's scope
      console.log(level2); // found in a's scope
      console.log(level1); // found in global scope
    }

    c();
  }

  b();
}

a();
// Lookup order for each variable: c -> b -> a -> global
```

---

## 5. What happens when JavaScript executes a function?

Each function call goes through two phases:

1. **Creation phase** — a new execution context is created: parameters and local `var`/function declarations are hoisted into memory (initialized to `undefined`, functions fully hoisted), and `this` is bound.
2. **Execution phase** — the code runs line by line, assigning actual values and executing statements.

```js
function greet(name) {
  console.log(name);      // "Alif" - parameters are already assigned during the creation phase
  console.log(message);   // undefined - var is hoisted, but not yet assigned
  var message = "Hi";
  console.log(message);   // "Hi" - now assigned during the execution phase
}

greet("Alif");
```

---

## 6. What is an execution context?

An execution context is the environment in which JavaScript code is evaluated and run. It bundles together:

- **Variable Environment** — where `var`, function declarations, and (for function contexts) arguments live.
- **Lexical Environment / Scope Chain** — a reference to the outer scope, used for variable lookups.
- **`this` binding** — what `this` refers to in that context.

There are three kinds:

```js
// 1. Global Execution Context - created once, when the script starts
var x = 10;

function foo() {
  // 2. Function Execution Context - created every time foo() is called
  var y = 20;
}

foo();

// 3. Eval Execution Context - created inside eval() (rarely used)
```

---

## 7. What is the call stack?

The call stack is a **LIFO (last-in, first-out)** data structure that tracks execution contexts. Whenever a function is called, its execution context is **pushed** onto the stack; when it returns, it's **popped** off.

```js
function first() {
  second();
  console.log("first done");
}

function second() {
  third();
  console.log("second done");
}

function third() {
  console.log("third done");
}

first();
// Stack grows: [first] -> [first, second] -> [first, second, third]
// third() finishes and pops -> "third done"
// second() finishes and pops -> "second done"
// first() finishes and pops -> "first done"
```

If functions call themselves without a base case, the stack keeps growing until it overflows:

```js
function recurse() {
  recurse();
}

recurse(); // RangeError: Maximum call stack size exceeded
```

---

## 8. What's the difference between a function declaration and a function expression?

| | Function Declaration | Function Expression |
|---|---|---|
| Syntax | `function foo() {}` | `const foo = function() {}` |
| Hoisting | Fully hoisted (usable before defined) | Only the variable is hoisted, not the assignment |
| Name required | Yes | No (can be anonymous) |

```js
// Function declaration - hoisted entirely
sayHi(); // "Hi!" - works even though called before the definition

function sayHi() {
  console.log("Hi!");
}

// Function expression - only the variable binding is hoisted
sayBye(); // TypeError: sayBye is not a function (or ReferenceError with let/const)

var sayBye = function () {
  console.log("Bye!");
};
```

---

## 9. What is a closure?

A closure is a function that **remembers and can access variables from its outer (enclosing) lexical scope**, even after that outer function has finished executing.

```js
function makeCounter() {
  let count = 0;

  return function () {
    count++;
    return count;
  };
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3 - "count" is remembered between calls
```

---

## 10. Why does a closure remember variables after the outer function finishes?

Normally, a function's local variables are destroyed once it returns. But if an **inner function references those variables**, JavaScript keeps that variable environment alive in memory — because the inner function's scope chain still points to it, and the garbage collector won't free memory that's still reachable/referenced.

```js
function outer() {
  let secret = "hidden value";

  return function inner() {
    return secret; // inner keeps a live reference to outer's scope
  };
}

const revealSecret = outer(); // outer() has already returned
console.log(revealSecret()); // "hidden value" - secret is still alive, kept by the closure
```

---

## 11. What's the difference between a closure and a callback?

- A **closure** is a *scoping concept*: a function bundled together with references to its surrounding (lexical) state.
- A **callback** is a *usage pattern*: any function passed as an argument to another function, to be invoked later.

They often overlap (a callback frequently *is* a closure), but they answer different questions — closure is about **what a function can access**, callback is about **how a function is used**.

```js
// Callback that is also a closure
function fetchData(callback) {
  const data = { id: 1 };
  setTimeout(() => {
    callback(data); // callback used later, asynchronously
  }, 1000);
}

function makeAdder(x) {
  return function (y) {   // this is a closure - it remembers "x"
    return x + y;
  };
}

const add5 = makeAdder(5);
console.log(add5(2)); // 7 - closure remembers x = 5

// add5 itself could also be passed as a callback:
[1, 2, 3].map(add5); // [6, 7, 8]
```

---

## 12. What happens in this code?

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Logs: 3, 3, 3

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 100);
}
// Logs: 0, 1, 2
```

**With `var`:** `var` is function-scoped, so there's only **one** `i` shared across all loop iterations. By the time the `setTimeout` callbacks run (after the loop has finished), `i` has already reached `3`. All three closures point to the *same* variable, so they all log `3`.

**With `let`:** `let` is block-scoped, so JavaScript creates a **new binding of `j` for every iteration**. Each `setTimeout` callback closes over its own separate `j`, capturing the value at that point in time — giving `0`, `1`, `2`.

```js
// Roughly what happens under the hood with let (a new scope per iteration):
{ let j = 0; setTimeout(() => console.log(j), 100); }
{ let j = 1; setTimeout(() => console.log(j), 100); }
{ let j = 2; setTimeout(() => console.log(j), 100); }
```

This is one of the most common closure interview questions, and a big reason `let` replaced `var` in modern JavaScript (and in React, where stale closures over loop variables cause similar bugs).
