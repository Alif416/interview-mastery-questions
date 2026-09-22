# any, unknown, never, void

Very important interview section.

## 1. What is `any`?

`any` opts a value out of type checking entirely — TypeScript allows literally anything to be assigned to it, and allows it to be used in any way (called, indexed, any property accessed), with zero compile-time verification.

```ts
let value: any = 42;
value = "now a string"; // no error
value.foo.bar.baz();     // no error either, even though this would crash at runtime
```

---

## 2. Why is `any` dangerous?

`any` silently disables type checking for that value — and it's "contagious": anything derived from an `any` value (a property access, a function call's result) also becomes `any`. A single `any` can quietly erase type safety across a large part of a codebase, exactly the class of bug TypeScript exists to prevent.

---

## 3. What is `unknown`?

`unknown` also represents a value of any type, but — unlike `any` — TypeScript refuses to let you actually *do* anything with it until you've checked/narrowed its type first. It's the type-safe counterpart to `any`.

```ts
let value: unknown = 42;
value = "now a string"; // still allowed - unknown accepts anything
// value.toUpperCase(); // error - must narrow first, TS doesn't know it's a string yet

if (typeof value === "string") {
  value.toUpperCase(); // fine - narrowed to string
}
```

---

## 4. What's the difference between `any` and `unknown`?

Both accept any value being assigned to them, but `any` also lets you freely use that value in any way with no checks at all, while `unknown` forces you to narrow it to a specific type before you're allowed to do anything with it. `unknown` gives you the flexibility of "could be anything" without giving up safety.

---

## 5. What is `void`?

`void` represents the absence of a meaningful return value — it's the type of a function that doesn't return anything useful (its return value, if any, should be ignored). It's most commonly seen as a function's return type.

```ts
function logMessage(msg: string): void {
  console.log(msg); // no return statement - or a `return;` with no value
}
```

---

## 6. What is `never`?

`never` represents a value that can never actually occur — a type with literally no possible values. It's used for things that never successfully complete, like a function that always throws, or a value that's already been fully narrowed down to nothing (an exhaustive check with no remaining cases).

---

## 7. When does a function return `never`?

A function returns `never` when it never returns normally at all — it always throws an error, or always runs forever. This is different from `void`, where the function does return, just without a meaningful value.

```ts
function throwError(message: string): never {
  throw new Error(message); // never returns normally
}

function infiniteLoop(): never {
  while (true) {}
}
```

---

## 8. What's the difference between `void` and `never`?

`void` means the function completes normally, it just doesn't return a useful value — execution reaches the end of the function. `never` means the function never completes normally at all — it always throws, or never terminates. They answer different questions: "does this return something?" (`void` — no, but it does return) versus "does this even finish?" (`never` — no, it doesn't).

---

## Important Rule

**Prefer `unknown` over `any` when you don't know the type yet.** `unknown` keeps you honest — it forces a narrowing check before use — while `any` quietly turns off type checking and lets bugs slip through unnoticed. Reach for `any` only as a rare, deliberate escape hatch, never as a default.
