# TypeScript Fundamentals

Start here.

> **Prerequisites:** Comfortable with core JavaScript — variables, functions, objects, arrays, and ES6+ syntax (arrow functions, destructuring, template literals). TypeScript adds a type system on top of JavaScript, so shaky JS fundamentals will make the type errors confusing rather than helpful. If any of that feels shaky, work through [JavaScript Mastery](/javascript-mastery/fundamentals) first.

## 1. What is TypeScript?

TypeScript is a superset of JavaScript that adds static types — you write ordinary JavaScript plus optional type annotations, and a compiler checks those types before your code ever runs, then strips them away to produce plain JavaScript. Every valid JavaScript program is also valid TypeScript; it's JavaScript with an extra layer of tooling on top, not a different language.

```ts
let age: number = 25; // the ": number" is TypeScript - removed entirely by the time this runs
```

---

## 2. Why was TypeScript created?

TypeScript was created by Microsoft to address a real pain point in large JavaScript codebases: since JavaScript has no compile-time type checking, many bugs — calling a method that doesn't exist, passing the wrong shape of object — are only caught at runtime, sometimes in production. TypeScript catches an entire category of these mistakes while you're still writing the code, and its type information also powers much better autocomplete and refactoring tools in editors.

---

## 3. What's the difference between TypeScript and JavaScript?

JavaScript is the language that actually runs in browsers and Node — dynamically typed, with no compile step required. TypeScript is JavaScript plus a type system layered on top; it requires a compilation (or transpilation) step to strip out the types and produce plain JavaScript, and that compiler is what performs type checking, none of which exists in JavaScript itself.

```js
// JavaScript - no compile-time checking at all
function add(a, b) {
  return a + b;
}
add("5", 10); // "510" - runs fine, silently wrong
```

```ts
// TypeScript - catches this before it ever runs
function add(a: number, b: number): number {
  return a + b;
}
add("5", 10); // compile-time error: Argument of type 'string' is not assignable to parameter of type 'number'
```

---

## 4. What's the difference between static typing and dynamic typing?

In a statically typed language, a variable's type is checked before the program runs, at compile time, and mismatches are caught up front. In a dynamically typed language — like plain JavaScript — types are only checked as the code actually executes, so a type error can hide in a rarely-run code path until it happens to run in production. TypeScript adds static typing on top of JavaScript's normally dynamic nature.

---

## 5. What does TypeScript actually check?

TypeScript checks that values are used consistently with their declared (or inferred) types — that you're not passing a string where a number is expected, not accessing a property that doesn't exist on an object's type, not calling something that isn't a function, and so on. It performs this checking entirely at compile time; it does not add any runtime type checks to the resulting JavaScript.

---

## 6. What happens when TypeScript is compiled?

The TypeScript compiler (`tsc`, or a tool like Babel/esbuild/swc configured to strip types) reads your `.ts`/`.tsx` files, checks all the types, and then produces plain `.js` output with every type annotation removed. Type annotations have zero effect on the actual runtime behavior or output of the program — they exist purely for the compile-time check.

```ts
// input.ts
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

```js
// output.js (after compiling) - all type annotations are gone
function greet(name) {
  return `Hello, ${name}`;
}
```

---

## 7. What is type inference?

Type inference is TypeScript automatically figuring out a value's type from context, without you writing an explicit annotation — based on the literal value assigned, a function's return statement, or how a variable is used. This means you don't need to annotate everything by hand; TypeScript often already knows.

```ts
let age = 25;        // inferred as `number` - no annotation needed
let name = "Alex";   // inferred as `string`

function double(n: number) {
  return n * 2; // return type inferred as `number`
}
```

---

## 8. When should you explicitly specify a type?

Explicit annotations matter most when TypeScript can't infer anything useful on its own — an empty array or object (`let items = []` infers as `any[]`, not very useful), a function parameter (parameters are never inferred from usage, only from an annotation or a default value), or when you want a value to conform to a *wider* type than its literal value would otherwise infer, like typing a variable as a union of allowed strings. It's generally fine to lean on inference for local variables with obvious values, and be explicit for anything crossing a function boundary.

```ts
function greet(name: string) { // parameters need explicit types - TS can't infer these
  return `Hello, ${name}`;
}

let status: "loading" | "success" | "error" = "loading"; // explicit - without it, inferred as just `string`
```

---

## 9. What is `number`?

TypeScript's `number` type covers all numeric values — integers and floating-point — since JavaScript itself doesn't distinguish between them at the language level the way some languages do.

```ts
let age: number = 25;
let price: number = 19.99;
```

---

## 10. What is `string`?

`string` represents text values — anything written with single quotes, double quotes, or backticks (template literals).

```ts
let name: string = "Alex";
let greeting: string = `Hello, ${name}`;
```

---

## 11. What is `boolean`?

`boolean` represents a value that is either `true` or `false` — nothing else is assignable to it. (This is different from plain JavaScript's "truthy/falsy" values in a condition — that's about how a value *behaves*, not about the value's actual *type* being boolean.)

```ts
let active: boolean = true;
```

---

## 12. What is `null`?

`null` is a type with exactly one value, `null`, representing an intentional absence of a value. Under TypeScript's `strictNullChecks` setting (part of `strict` mode), a variable typed as, say, `string` can't also hold `null` unless you explicitly include it in the type (`string | null`).

```ts
let selectedUser: string | null = null; // must explicitly allow null
```

---

## 13. What is `undefined`?

`undefined` is a type with exactly one value, `undefined`, representing a variable that's been declared but not yet assigned. Like `null`, under `strictNullChecks` it has to be explicitly included in a type if a value might be `undefined`.

```ts
let user: string | undefined = undefined;
```

---

## 14. What is `symbol`?

`symbol` represents JavaScript's unique, immutable primitive values created with `Symbol()` — each call produces a completely distinct value, even with the same description, typically used as collision-free object property keys.

```ts
const id: symbol = Symbol("id");
```

---

## 15. What is `bigint`?

`bigint` represents whole numbers larger than `number` can safely represent, written with an `n` suffix — useful for precise large-integer arithmetic where `number`'s floating-point representation would lose precision.

```ts
let big: bigint = 9007199254740993n;
```
