# Type Aliases

You need to become comfortable with:

```ts
type User = {
  id: number;
  name: string;
};
```

## 1. What is a type alias?

A type alias gives a name to any type — a primitive, an object shape, a union, a function signature — so it can be reused and referenced by that name instead of rewriting the same shape repeatedly.

```ts
type UserId = number; // alias for a primitive
type User = { id: UserId; name: string }; // alias for an object shape
```

---

## 2. Why use `type`?

Naming a type makes code more readable — a parameter typed `User` communicates intent better than an inline object literal type — keeps you from repeating the same shape in multiple places, and gives you one place to update if the shape changes.

---

## 3. Can a type alias represent an object?

Yes — this is one of the most common uses.

```ts
type User = {
  id: number;
  name: string;
};
```

---

## 4. Can a type alias represent a union?

Yes — `type` is actually required for naming a union, since `interface` can't directly represent one.

```ts
type Id = string | number;
```

---

## 5. Can a type alias represent a function?

Yes — you can alias a function's full call signature.

```ts
type MathOperation = (a: number, b: number) => number;

const add: MathOperation = (a, b) => a + b;
```

---

## 6. Can types be nested?

Yes — a type alias can contain other object types, arrays, or unions nested directly inside it, either inline or by referencing other named types.

```ts
type Admin = {
  user: {
    id: number;
    name: string;
  };
  permissions: string[];
};
```

---

## 7. Can types reference other types?

Yes — this is how larger types get built up from smaller, reusable pieces, rather than repeating the same shape everywhere.

```ts
type User = {
  id: number;
  name: string;
};

type Admin = {
  user: User; // references the User type
  permissions: string[];
};
```
