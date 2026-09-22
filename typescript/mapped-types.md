# Mapped Types

Once you understand generics + `keyof`, mapped types click naturally.

## 1. What is a mapped type?

A mapped type builds a new object type by transforming every property of an existing type, following one rule applied uniformly across all of them — rather than writing out each property by hand, you describe the transformation once and TypeScript applies it to every key.

```ts
type Optional<T> = {
  [K in keyof T]?: T[K];
};
```

---

## 2. How does `[K in keyof T]` work?

`keyof T` produces the union of `T`'s property names; `K in <union>` then iterates over each member of that union one at a time, letting you define what each resulting property's type should be. This is TypeScript's version of "for each key in this type, do the following."

```ts
type User = { id: number; name: string };

type Stringified<T> = {
  [K in keyof T]: string; // every property, regardless of original type, becomes a string
};

type StringifiedUser = Stringified<User>; // { id: string; name: string }
```

---

## 3. How do mapped types modify properties (add modifiers)?

Within the mapping, you can add `?` (optional) or `readonly` to change every property's modifiers at once — and prefixing either with `-` (like `-readonly` or `-?`) explicitly *removes* that modifier instead, even if the original property had it.

```ts
type Mutable<T> = {
  -readonly [K in keyof T]: T[K]; // strips `readonly` from every property
};

type WithRequiredFields<T> = {
  [K in keyof T]-?: T[K]; // strips `?` (makes every property required)
};
```

---

## 4. How can you create your own version of `Partial`?

Combine `keyof` with a mapped type and the `?` modifier — this is, in fact, essentially how TypeScript's own built-in `Partial<T>` is implemented internally.

```ts
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

interface User {
  id: number;
  name: string;
}

type PartialUser = MyPartial<User>; // { id?: number; name?: string } - same as Partial<User>
```
