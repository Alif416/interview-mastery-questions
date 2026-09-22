# Union & Intersection Types

Very important.

## 1. What is a union type?

A union type (`A | B`) means a value can be *either* type A or type B — the value's actual type could be one or the other, and TypeScript only lets you use members that are guaranteed to exist no matter which one it turns out to be.

```ts
let id: string | number;
id = "abc123"; // valid
id = 42;        // also valid
```

---

## 2. Why would you use `string | number`?

Some real-world values genuinely can arrive as either type — an ID that's a string in one system and a number in another, or a form input that starts as a string but you want to allow a parsed number too. A union lets you express "it could legitimately be either," rather than lying with a single type or giving up and using `any`.

---

## 3. What happens when accessing properties that aren't shared across a union?

TypeScript only allows you to safely access members that exist on **every** type in the union, since it doesn't yet know which one a given value actually is — accessing something that only exists on one branch is a compile error until you narrow the type first.

```ts
function printLength(value: string | number) {
  console.log(value.length); // error - number doesn't have .length
}
```

---

## 4. How do you work with a union safely?

Narrow it first — check which branch you're actually dealing with (with `typeof`, `instanceof`, a property check, etc.) before using anything specific to just one branch. *(Covered in depth in Type Narrowing.)*

```ts
function printLength(value: string | number) {
  if (typeof value === "string") {
    console.log(value.length); // safe - narrowed to string here
  } else {
    console.log(value.toFixed(2)); // safe - narrowed to number here
  }
}
```

---

## 5. What is an intersection type?

An intersection type (`A & B`) combines multiple types into one that must satisfy **all** of them at once — a value of an intersection type has every property from every combined type, not just one or the other.

```ts
type Person = { name: string };
type Developer = { languages: string[] };

type Employee = Person & Developer;

const e: Employee = { name: "Alex", languages: ["TS", "JS"] }; // needs both
```

---

## 6. What's the difference between union and intersection?

A union (`|`) means "could be this type, OR that type" — narrower access, broader set of allowed values. An intersection (`&`) means "must be this type, AND that type, at once" — a single value satisfying every combined shape's requirements simultaneously. They're conceptually opposite tools.

---

## 7. When is intersection useful?

Intersection is useful for composing several smaller, focused types into one larger required shape — combining a base type with an extension (like `Person & Developer`), or merging props from multiple sources, like a component's own props intersected with a third-party library's prop types.

```ts
type BaseProps = { className?: string };
type ButtonProps = BaseProps & { label: string; onClick: () => void };
```
