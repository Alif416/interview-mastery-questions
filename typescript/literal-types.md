# Literal Types

Understand:

```ts
type Direction = "left" | "right" | "up" | "down";
```

## 1. What is a literal type?

A literal type is a type consisting of one exact, specific value — not "any string," but *this particular* string (or number, or boolean). Combined with unions, literal types let you describe "one of these specific values" instead of "any value of this general type."

```ts
type Direction = "left" | "right" | "up" | "down";
let move: Direction = "left"; // only these 4 exact strings are valid
```

---

## 2. How is a literal type different from `string`?

`string` accepts any possible string value — `"left"`, `"hello"`, `""`, anything. A literal type like `"left"` accepts only that one exact value. A union of literal types (`"left" | "right" | "up" | "down"`) narrows things further, to only that specific *set* of allowed strings, rejecting anything outside it.

```ts
let a: string = "anything at all"; // valid - string accepts any string
let b: "left" = "right"; // error - "right" is not assignable to type "left"
```

---

## 3. Why is `"admin" | "user"` useful?

It restricts a value to only the exact set of options that actually make sense for your program — a typo like `"admn"` becomes a compile-time error instead of a silent bug that only shows up at runtime, and your editor can autocomplete the valid options for you.

```ts
type Role = "admin" | "user";

function checkAccess(role: Role) { /* ... */ }
checkAccess("admin"); // valid
checkAccess("adnim"); // error - typo caught immediately
```

---

## 4. How can literal types improve API/state safety?

Modeling a limited, known set of states — like a request's status, or an action's type in a reducer — as a union of literals means TypeScript can verify every possible value is handled, and it autocompletes/catches typos across your whole codebase. It turns "just a string, hope it's spelled right everywhere" into a value TypeScript actively checks and helps you use correctly.

This becomes extremely useful in React:

```ts
type Status = "loading" | "success" | "error";

function renderStatus(status: Status) {
  switch (status) {
    case "loading": return "Loading...";
    case "success": return "Done!";
    case "error": return "Something went wrong.";
    // TypeScript can flag it if a new Status value is added but not handled here
  }
}
```
