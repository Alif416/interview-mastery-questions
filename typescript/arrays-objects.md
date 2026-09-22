# Arrays & Objects

This is extremely important for React and backend development.

*Note: the original list had two pairs of near-identical questions ("Optional properties?" / "What does ? mean?" and "Readonly properties?" / "What does readonly mean?") — each pair has been merged into one question below rather than answered twice.*

## Arrays

### 1. How do you type an array?

Append `[]` to the element type.

```ts
let names: string[] = ["Alex", "Sam"];
let scores: number[] = [90, 85, 100];
```

---

### 2. What's the difference between `string[]` and `Array<string>`?

They're exactly equivalent — `string[]` is shorthand syntax, `Array<string>` is the generic form of the same built-in `Array` type. Which one you use is purely a style choice; most style guides prefer the shorter `string[]` for simple cases and reserve the generic form for more complex element types.

```ts
let a: string[] = ["x", "y"];
let b: Array<string> = ["x", "y"]; // identical type to `a`
```

---

### 3. How do you type an array of objects?

Define (or reference) the object's type, then append `[]`.

```ts
type User = { id: number; name: string };

const users: User[] = [
  { id: 1, name: "Alex" },
  { id: 2, name: "Sam" },
];
```

---

### 4. How do you type nested arrays?

Stack `[]` for each level of nesting.

```ts
let grid: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
];
```

---

### 5. How does TypeScript infer array types?

Without an annotation, TypeScript infers an array's type from its initial contents — a mix of types produces a union array type, and TypeScript narrows sensibly based on what you actually write.

```ts
let mixed = [1, "two", 3]; // inferred as (string | number)[]
let nums = [1, 2, 3];       // inferred as number[]
```

---

### 6. How do you type an empty array correctly?

Give it an explicit type annotation — without one, `let arr = []` infers as `any[]`, which defeats type checking for anything pushed into it later.

```ts
let items: string[] = []; // explicit - stays type-checked as strings only
items.push("hello");
// items.push(42); // error - number isn't assignable to string
```

---

### 7. Why can `const arr = []` sometimes cause problems?

Even with `const`, an uninitialized empty array literal infers as `any[]` if there's no annotation and no later context to narrow it — `const` only prevents reassigning the variable itself, it says nothing about the array's element type, so anything can be pushed into it without a type error, silently defeating type safety.

```ts
const items = []; // inferred as any[] - const doesn't fix this
items.push("hello");
items.push(42); // no error at all - any[] accepts anything
```

---

## Objects

```ts
type User = {
  id: number;
  name: string;
  email?: string;
};
```

### 8. How do you define object types?

Describe the shape directly inline, or — more commonly, for reuse — as a named `type` or `interface`.

```ts
type User = {
  id: number;
  name: string;
};

const user: User = { id: 1, name: "Alex" };
```

---

### 9. What does `?` mean on a property (optional properties)?

A `?` after a property name marks it optional — the property can be omitted entirely when creating a value of that type, and its type becomes a union with `undefined` when accessed.

```ts
type User = {
  id: number;
  name: string;
  email?: string; // optional - can be left out
};

const user: User = { id: 1, name: "Alex" }; // valid - email omitted
```

---

### 10. What does `readonly` mean on a property?

`readonly` prevents a property from being reassigned after the object is created — it's a compile-time-only restriction (there's no runtime enforcement), but it stops you from accidentally mutating a value that's supposed to stay fixed.

```ts
type Point = {
  readonly x: number;
  readonly y: number;
};

const p: Point = { x: 1, y: 2 };
// p.x = 5; // error - cannot assign to 'x' because it is a read-only property
```

---

### 11. How do you type nested object types?

Either inline the nested shape directly, or — more readable, and reusable — define a separate named type and reference it as a property's type.

```ts
type Address = {
  city: string;
  country: string;
};

type User = {
  id: number;
  address: Address; // nested type, referenced by name
};
```

---

### 12. What are index signatures?

An index signature lets an object type describe keys that aren't known ahead of time — a dictionary/map-like shape where any string (or number) key maps to a value of a particular type.

```ts
type Scores = {
  [username: string]: number; // any string key is allowed, value must be a number
};

const scores: Scores = { alex: 90, sam: 85 };
scores.jordan = 100; // valid - any new string key works
```

---

### 13. Can an object have extra properties than its type declares?

A variable can hold an object with extra properties if it comes from an existing variable or a wider type — structural typing just checks that the required properties are present. But TypeScript specifically flags extra properties when you assign an **object literal directly**, as a safeguard against typos, via "excess property checking."

```ts
type User = { id: number; name: string };

const existing = { id: 1, name: "Alex", extra: true };
const u1: User = existing; // OK - structural typing, extra property ignored

const u2: User = { id: 1, name: "Alex", extra: true };
// error - object literal may only specify known properties, 'extra' does not exist in type 'User'
```

---

### 14. How does structural typing work?

TypeScript uses structural typing (a.k.a. "duck typing"): two types are considered compatible if they have the same *shape* — the right set of properties with compatible types — regardless of what the types are named, or whether one was ever explicitly declared to "implement" the other. This differs from nominal typing (used by languages like Java or C#), where compatibility depends on explicit type names/declarations, not just shape.

```ts
type Named = { name: string };

function greet(entity: Named) {
  console.log(`Hello, ${entity.name}`);
}

const user = { name: "Alex", age: 25 };
greet(user); // valid - `user`'s shape satisfies `Named`, even though it's never declared as one
```
