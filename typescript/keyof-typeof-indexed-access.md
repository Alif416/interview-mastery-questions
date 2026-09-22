# keyof, typeof, Indexed Access

*Note: the original list had two near-identical questions ("What does keyof do?" and "How do you get keys from a type?") — they've been merged into one below rather than answered twice.*

## 1. What does `keyof` do?

`keyof` takes an object type and produces a union of its property names as string literal types — this is how you get "the keys of a type" as a usable type itself, rather than just knowing them informally.

```ts
type User = {
  id: number;
  name: string;
};

type UserKey = keyof User; // "id" | "name"
```

---

## 2. What does `typeof` mean in a type position?

Inside a *type* position — as opposed to a normal expression — `typeof` extracts the *type* of a value, turning an existing variable, function, or object into a reusable type without having to redeclare its shape separately.

```ts
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
};

type Config = typeof config; // { apiUrl: string; timeout: number }
```

---

## 3. What is indexed access typing (`T[K]`)?

`T[K]` looks up the type of a specific property `K` on type `T` — the same way `obj.key` looks up a *value* at runtime, `T[K]` looks up a *type* at the type level.

```ts
type User = {
  id: number;
  name: string;
};

type NameType = User["name"]; // string
type IdType = User["id"];      // number
```

---

## 4. How do these work together with generics?

`keyof`, `typeof`, and indexed access are frequently combined with generics to write functions that operate safely on "any property of an object" — constraining a generic key parameter with `keyof T` guarantees the key actually exists on `T`, and `T[K]` then gives the precisely correct return type for that specific key.

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: "Alex" };
const name = getProperty(user, "name"); // inferred as string
// getProperty(user, "email"); // error - "email" isn't a key of `user`
```
