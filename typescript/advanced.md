# Advanced TypeScript

After the practical material, this is what rounds out a deep understanding of the type system.

## 1. What is `infer`?

`infer` is used inside a conditional type to extract and name a piece of a type you're pattern-matching against, so you can reference it in the "true" branch — it's how utility types like `ReturnType` and `Parameters` are actually implemented internally, pulling a specific piece out of a larger type shape.

```ts
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type A = UnwrapPromise<Promise<string>>; // string
type B = UnwrapPromise<number>;           // number (not a Promise, so unchanged)
```

---

## 2. What are recursive types?

A recursive type references itself in its own definition, the same way a recursive function calls itself — used for describing arbitrarily-nested structures, like JSON data or a tree, where the shape repeats at every level of nesting.

```ts
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const data: Json = {
  name: "Alex",
  tags: ["admin", "active"],
  meta: { nested: { deeper: true } },
};
```

---

## 3. What is variance in TypeScript's type system?

Variance describes how subtyping relationships between complex types (like arrays or function types) relate to the subtyping relationships of their component parts. TypeScript's arrays and object properties are "covariant" — a `Dog[]` is treated as assignable to `Animal[]` if `Dog` is a subtype of `Animal` — while function *parameters* are checked more strictly under stricter settings. Understanding variance explains some type errors around function assignability that otherwise seem surprising.

---

## 4. What's the difference between structural and nominal typing, and how do "nominal typing patterns" simulate the latter?

TypeScript uses structural typing by default — two types are compatible if they have the same shape, regardless of name. Nominal typing (used by languages like Java) instead cares about a type's actual declared identity. Since TypeScript doesn't support true nominal typing natively, developers simulate it with a "branded type" pattern — adding a unique, otherwise-unused property that makes two structurally-identical types incompatible on purpose.

```ts
type UserId = number & { readonly __brand: "UserId" };
type ProductId = number & { readonly __brand: "ProductId" };

function getUser(id: UserId) { /* ... */ }

declare const productId: ProductId;
// getUser(productId); // error, even though both are "just numbers" structurally
```

---

## 5. What are function overloads?

Function overloads let a single function have multiple, differently-typed call signatures — declaring several possible parameter/return combinations before the actual implementation, so callers get precise typing depending on which shape of arguments they pass, even though there's only one real function underneath.

```ts
function getValue(key: "id"): number;
function getValue(key: "name"): string;
function getValue(key: string): number | string {
  return key === "id" ? 1 : "Alex";
}

const id = getValue("id");     // typed as number
const name = getValue("name"); // typed as string
```

---

## 6. What is module augmentation?

Module augmentation lets you add new types (or extend existing ones) to an *existing* module — often a third-party library — from your own code, without modifying that library's source. It relies on declaration merging: declaring the same module/interface name again adds to it rather than replacing it.

```ts
// express.d.ts - adding a custom property to Express's Request type
import "express";

declare module "express" {
  interface Request {
    user?: { id: number; email: string };
  }
}
```

---

## 7. What is type-level programming?

Type-level programming is writing logic that runs entirely within TypeScript's type system at compile time — conditional types, `infer`, recursive types, and mapped types combined to compute new types based on other types, rather than computing values based on other values the way normal code does. It's a genuinely separate "language" running alongside your actual JavaScript, and pushing it too far can make types hard to read — it's a powerful tool, best reserved for library-level code and genuinely tricky type problems, not everyday application code.

---

## Also Covered Elsewhere

A few topics from this list are covered in depth in earlier sections rather than repeated here:

- **Declaration merging** — see [Interfaces](/typescript/interfaces)
- **Declaration files (`.d.ts`)** — see [Modules & Project Structure](/typescript/modules)
- **Generic constraints** — see [Generics](/typescript/generics)
- **Advanced mapped types** — build on [Mapped Types](/typescript/mapped-types)
- **Advanced conditional types** — build on [Conditional Types](/typescript/conditional-types)
