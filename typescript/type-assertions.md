# Type Assertions

```ts
const element = document.getElementById("app") as HTMLDivElement;
```

## 1. What is a type assertion?

A type assertion tells TypeScript "trust me, treat this value as this specific type" — overriding whatever TypeScript would have inferred on its own. It's a purely compile-time instruction; it doesn't change the value itself in any way.

```ts
const element = document.getElementById("app") as HTMLDivElement;
```

---

## 2. What is the `as` syntax?

`as` is the standard, most common way to write a type assertion — placed after the value, followed by the type you're asserting it to be.

```ts
const input = document.getElementById("email") as HTMLInputElement;
```

---

## 3. What is the angle-bracket syntax?

An older alternative assertion syntax, `<Type>value` — functionally identical to `as`, but it conflicts with JSX syntax (angle brackets mean something else there), so it can't be used in `.tsx` files. `as` is preferred for this reason and is far more common in modern code.

```ts
const input = <HTMLInputElement>document.getElementById("email"); // same as `as`, but unusable in .tsx
```

---

## 4. Why isn't a type assertion the same as type conversion?

`value as string` doesn't run any code, doesn't call `.toString()`, and doesn't change the value at runtime in any way — it purely tells the *compiler* what type to treat the value as, for the purposes of type checking. If the value doesn't actually match the asserted type at runtime, nothing catches that; you've just told TypeScript to stop checking.

```ts
const value = 42 as unknown as string; // TypeScript now treats `value` as a string...
console.log(value.toUpperCase()); // ...but at runtime this crashes - 42 has no .toUpperCase()
```

---

## 5. When are assertions dangerous?

Whenever the asserted type doesn't actually match reality — asserting a value from an API response, `document.getElementById` (which can genuinely return `null`), or any place where you're essentially telling TypeScript to stop checking something that could legitimately be wrong. Since assertions bypass verification entirely, an incorrect assertion produces a runtime error that TypeScript gave you no warning about.

---

## 6. When should you avoid assertions?

Avoid assertions whenever there's a safer alternative — narrowing with a real runtime check (`typeof`, `instanceof`, a validation library) instead of just asserting, or fixing the underlying type so it's accurate instead of overriding it. Reach for an assertion only when you genuinely know more than TypeScript can infer (like `document.getElementById` returning a more specific element type than TypeScript's generic `HTMLElement | null`), and double-check that assumption is actually safe.

---

## Important Distinction

`value as string` does **not** convert the value to a string at runtime. It's a compile-time-only instruction telling TypeScript what type to treat the value as — the actual value, and its actual runtime type, are completely unaffected by the assertion.
