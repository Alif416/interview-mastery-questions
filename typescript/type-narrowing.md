# Type Narrowing

This is where TypeScript starts becoming really powerful.

## 1. What is type narrowing?

Type narrowing is TypeScript refining a value's type to something more specific, within a particular branch of code, based on a runtime check you've performed — like a `typeof` check inside an `if` statement. Outside that branch, the type reverts to its original, wider form.

---

## 2. How do you narrow unions?

By performing a runtime check that only some members of the union could pass — inside the branch where that check succeeds, TypeScript narrows the union down to just the members consistent with it.

```ts
function printId(id: string | number) {
  if (typeof id === "string") {
    console.log(id.toUpperCase()); // narrowed to string here
  } else {
    console.log(id.toFixed()); // narrowed to number here
  }
}
```

---

## 3. How does `typeof` narrow types?

`typeof` checks a value's runtime type (`"string"`, `"number"`, `"boolean"`, `"object"`, `"function"`, `"undefined"`, etc.) — TypeScript recognizes this specific check inside conditionals and narrows accordingly, but only for that fixed set of primitive-distinguishing categories (it can't, for example, distinguish between different object shapes).

```ts
function double(value: string | number) {
  if (typeof value === "number") {
    return value * 2; // safe - narrowed to number
  }
  return value + value; // narrowed to string here
}
```

---

## 4. How does `instanceof` work?

`instanceof` checks whether a value was constructed by a particular class (walking the prototype chain) — TypeScript recognizes this check and narrows a union of class instances down to the specific class being checked.

```ts
class Dog { bark() { return "Woof!"; } }
class Cat { meow() { return "Meow!"; } }

function speak(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    return animal.bark(); // narrowed to Dog
  }
  return animal.meow(); // narrowed to Cat
}
```

---

## 5. How does the `in` operator narrow types?

The `in` operator checks whether a specific property name exists on an object at runtime — TypeScript recognizes this check and narrows a union of object types down to whichever ones actually have that property. This is especially useful when the union members are plain object shapes with no class to check via `instanceof`.

```ts
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim(); // narrowed to Fish
  } else {
    animal.fly(); // narrowed to Bird
  }
}
```

---

## 6. What is equality narrowing?

Equality narrowing is TypeScript narrowing a type based on a direct comparison (`===`, `!==`, `==`, `switch`) against a specific literal value — commonly used with a shared "discriminant" property to narrow a discriminated union down to exactly one of its members.

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

function area(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius ** 2; // narrowed to the circle branch
  }
  return shape.side ** 2; // narrowed to the square branch
}
```

---

## 7. What is a type guard?

A type guard is any expression that TypeScript can use to narrow a type within a branch — the built-in checks (`typeof`, `instanceof`, `in`, equality) are all type guards. You can also write your own **custom type guard**: a function whose return type is a special `arg is Type` predicate, telling TypeScript how to narrow based on that function's result.

```ts
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function isFish(animal: Fish | Bird): animal is Fish { // custom type guard
  return "swim" in animal;
}

function move(animal: Fish | Bird) {
  if (isFish(animal)) {
    animal.swim(); // narrowed to Fish, via the custom guard
  } else {
    animal.fly();
  }
}
```
