# Generics ⭐

This is one of the most important TypeScript topics.

```ts
function identity<T>(value: T): T {
  return value;
}
```

## 1. What are generics?

Generics let a function, interface, type, or class work with a type that's decided at the point it's actually used, rather than being locked to one specific type. A reusable "type parameter" (conventionally named `T`) stands in for whatever type gets passed in, and TypeScript tracks it through the rest of the definition.

```ts
function identity<T>(value: T): T {
  return value;
}

identity(42);       // T becomes number
identity("hello");  // T becomes string

// Generics work the same way across all four constructs:
interface Box<T> { value: T; }              // generic interface
type Pair<T> = [T, T];                       // generic type
class Stack<T> { private items: T[] = []; }  // generic class
```

---

## 2. Why do generics exist?

Without generics, you'd either have to write a separate, near-identical function for every type you need to support, or fall back to `any` and lose type safety entirely. Generics let you write one definition that works correctly — and stays fully type-checked — across many different types, capturing the *relationship* between input and output types instead of hardcoding one specific type.

---

## 3. What's the difference between a generic and `any`?

`any` throws away type information entirely — the function becomes untyped, and TypeScript can't verify anything about what goes in or comes out. A generic *preserves* type information — whatever type you pass in is tracked and reflected in the return type (or other parts of the signature), so TypeScript still fully checks the relationship between them.

```ts
function identityAny(value: any): any {
  return value;
}
const result1 = identityAny("hello"); // result1: any - TypeScript no longer knows it's a string

function identityGeneric<T>(value: T): T {
  return value;
}
const result2 = identityGeneric("hello"); // result2: string - TypeScript tracked the type through
```

---

## 4. How does generic inference work?

In most cases, you don't need to specify the generic type explicitly — TypeScript infers `T` from the arguments you actually pass, the same way it infers a variable's type from its initial value.

```ts
function identity<T>(value: T): T {
  return value;
}

identity("hello"); // T inferred as string - no need to write identity<string>("hello")
```

---

## 5. How do you use multiple generic parameters?

List more than one type parameter, separated by commas — each one can be used independently anywhere in the signature, letting a function relate several distinct types to each other.

```ts
function pair<A, B>(first: A, second: B): [A, B] {
  return [first, second];
}

pair("id", 42); // A inferred as string, B inferred as number -> returns [string, number]
```

---

## 6. What are generic constraints (`T extends`)?

`T extends SomeType` restricts what can be passed as `T` — instead of accepting literally anything, the type parameter must satisfy a minimum shape, which also means you can safely access whatever properties that shape guarantees inside the function.

```ts
function getId<T extends { id: number }>(obj: T) {
  return obj.id; // safe - T is guaranteed to have an `id` property
}

getId({ id: 1, name: "Alex" }); // valid
// getId({ name: "Alex" }); // error - missing required `id` property
```

---

## 7. What are default generic types?

A generic parameter can have a default type, used when the caller doesn't explicitly specify one — similar in spirit to a default function parameter, but for types.

```ts
interface ApiResponse<T = unknown> {
  data: T;
  status: number;
}

const res1: ApiResponse = { data: "anything", status: 200 }; // T defaults to unknown
const res2: ApiResponse<string> = { data: "hello", status: 200 }; // T explicitly string
```
