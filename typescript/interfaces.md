# Interfaces

One of the biggest interview topics.

```ts
interface User {
  id: number;
  name: string;
}
```

## 1. What is an interface?

An interface declares the shape a value must have — the properties (and their types) an object is expected to contain. Like a type alias, it's a compile-time-only construct; nothing about it exists in the compiled JavaScript output.

```ts
interface User {
  id: number;
  name: string;
}
```

---

## 2. What's the difference between `interface` and `type`?

They overlap heavily for describing object shapes, but each has capabilities the other doesn't: `interface` supports declaration merging (multiple declarations of the same name combine) and reads slightly more naturally for "extends" relationships; `type` can represent things an interface can't, like unions, intersections of non-object types, and primitive aliases. For plain object shapes, they're close to interchangeable.

```ts
interface UserI { id: number; name: string; }
type UserT = { id: number; name: string; };
// Both describe the same shape here - either works
```

---

## 3. When would you use an interface?

Reach for `interface` when defining the shape of an object or a class's contract, especially in a public API where declaration merging — like extending a third-party library's types — might be useful. Many codebases default to `interface` for object shapes and use `type` for everything an interface can't express: unions, function types, mapped types.

---

## 4. Can interfaces extend other interfaces?

Yes — `extends` lets one interface inherit all the members of another, then add more.

```ts
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

const d: Dog = { name: "Rex", breed: "Labrador" };
```

---

## 5. Can interfaces describe functions?

Yes — an interface can describe a callable signature, not just object properties.

```ts
interface MathOperation {
  (a: number, b: number): number;
}

const add: MathOperation = (a, b) => a + b;
```

---

## 6. Can interfaces describe arrays?

Yes, though it's uncommon in practice — you can describe an array-like shape with numeric index signatures, but a plain `T[]` or `Array<T>` is almost always simpler and more idiomatic for actual arrays.

```ts
interface StringArray {
  [index: number]: string;
}

const arr: StringArray = ["a", "b", "c"];
```

---

## 7. Can interfaces be merged?

Yes — declaring an interface with the same name more than once in the same scope doesn't cause an error; TypeScript combines all the declarations into one merged interface containing every member from each.

```ts
interface User {
  id: number;
}

interface User {
  name: string;
}

// User is now: { id: number; name: string }
const u: User = { id: 1, name: "Alex" };
```

---

## 8. What is declaration merging?

Declaration merging is the general TypeScript behavior — not limited to interfaces alone — where multiple declarations sharing the same name are combined into a single definition instead of conflicting. It's most commonly seen, and most useful, with interfaces, especially for extending types from external libraries (like adding custom properties to Express's `Request` type) without modifying the library's own source.

---

## Must Understand: `type` vs `interface`

Don't memorize "always use X." Understand what each one actually can and can't do, and let that guide the choice:

- Need a union, an intersection of non-object types, or a primitive alias? You need `type` — `interface` can't express these.
- Extending or adding to a type declared elsewhere (like a library's types) without touching its source? `interface`'s declaration merging is built for exactly this.
- Just describing a plain object or a class's shape, with no need for merging? Either works — pick based on your team's convention and move on.
