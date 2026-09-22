# Functions

This is essential for React and Node.

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

## 1. How do you type function parameters?

Annotate each parameter with `: Type` after its name — TypeScript then enforces that every call site passes arguments matching those types.

```ts
function add(a: number, b: number) {
  return a + b;
}
```

---

## 2. How do you type the return value?

Add `: Type` after the closing parenthesis of the parameter list, before the function body.

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

---

## 3. How does return-type inference work?

If you don't annotate a return type, TypeScript infers it from whatever the function's `return` statements actually produce. This is usually reliable and often preferred for simple functions, since it avoids a redundant annotation that would just repeat what's already obvious from the body.

```ts
function add(a: number, b: number) {
  return a + b; // return type inferred as `number` - no annotation needed
}
```

---

## 4. How do you type optional parameters?

Add a `?` after the parameter name — an optional parameter can be omitted at the call site, and its type becomes a union with `undefined` inside the function body. Optional parameters must come after all required ones.

```ts
function greet(name: string, greeting?: string) {
  return `${greeting ?? "Hello"}, ${name}`;
}

greet("Alex"); // valid - greeting omitted
```

---

## 5. How do you type default parameters?

Assign a default value directly in the parameter list — TypeScript infers the parameter's type from that default value, and the parameter automatically becomes optional at call sites (though inside the function body its type is never `undefined`, since a default value always fills it in).

```ts
function greet(name: string, greeting = "Hello") { // greeting inferred as string, optional
  return `${greeting}, ${name}`;
}
```

---

## 6. How do you type rest parameters?

Prefix the parameter with `...` and type it as an array — it collects any number of remaining arguments into that array.

```ts
function sum(...numbers: number[]) {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3, 4);
```

---

## 7. How do you type callbacks?

Type the parameter as a function signature — the shape it must have, including its own parameter types and return type.

```ts
function calculate(
  a: number,
  b: number,
  operation: (x: number, y: number) => number
) {
  return operation(a, b);
}

calculate(2, 3, (x, y) => x + y);
```
