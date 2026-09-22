# Conditional Types

Advanced but important.

```ts
T extends U ? X : Y
```

## 1. What are conditional types?

A conditional type picks one of two types based on a type-level condition, using syntax that mirrors JavaScript's ternary operator: `T extends U ? X : Y`. If `T` is assignable to `U`, the result is `X`; otherwise it's `Y`.

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">; // true
type B = IsString<42>;       // false
```

---

## 2. How do they work?

The compiler checks, at the type level, whether the type on the left of `extends` is assignable to the type on the right — evaluating the whole expression down to either the "true" or "false" branch type, the same way a runtime ternary evaluates down to one of two values based on a boolean condition.

```ts
type MessageOf<T> = T extends { message: unknown } ? T["message"] : never;

type Email = MessageOf<{ message: string }>; // string
type Empty = MessageOf<{}>;                   // never - no `message` property
```

---

## 3. How can generics be combined with conditional types?

Conditional types are almost always paired with a generic type parameter — the condition is evaluated differently depending on whatever type gets passed in when the generic is used, letting a single type definition produce different results for different inputs.

```ts
type ElementType<T> = T extends (infer U)[] ? U : T;

type A = ElementType<string[]>; // string
type B = ElementType<number>;    // number (not an array, so T itself)
```

---

## 4. What is a distributive conditional type?

When the type being checked (`T`) is a bare, naked type parameter and it's a union, a conditional type automatically "distributes" over each member of the union individually, applying the condition to each one separately and combining the results back into a union — rather than checking the union as a single whole.

```ts
type ToArray<T> = T extends unknown ? T[] : never;

type Result = ToArray<string | number>;
// distributes to: ToArray<string> | ToArray<number>
// = string[] | number[]  (not (string | number)[])
```

---

## 5. How are conditional types used in utility types?

Many of TypeScript's built-in utility types are implemented using conditional types under the hood — `Exclude<T, U>` and `Extract<T, U>` (relying on distribution to filter a union member by member), `NonNullable<T>` (excluding `null`/`undefined` via a conditional check), and `ReturnType<T>`/`Parameters<T>` (using conditional types with `infer` to pull a type out of a function signature).

```ts
// Roughly how Exclude is actually defined internally:
type MyExclude<T, U> = T extends U ? never : T;

type Status = "loading" | "success" | "error" | "idle";
type ActiveStatus = MyExclude<Status, "idle">; // "loading" | "success" | "error"
```
