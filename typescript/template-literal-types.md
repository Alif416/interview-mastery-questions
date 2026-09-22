# Template Literal Types

```ts
type EventName = `on${string}`;
```

## 1. What are template literal types?

Template literal types let you build new string types using the same backtick syntax as JavaScript template literals, but at the type level — combining literal text with other types to produce a precisely constrained set of allowed string values.

```ts
type EventName = `on${string}`;

let a: EventName = "onClick";  // valid
let b: EventName = "onHover";  // valid
// let c: EventName = "click"; // error - doesn't start with "on"
```

---

## 2. How do they differ from JavaScript template strings?

JavaScript template strings (`` `Hello, ${name}` ``) interpolate *values* at runtime to build an actual string. Template literal *types* interpolate *types* at compile time to build a new *type* — describing a pattern of allowed string values, not producing any actual string during program execution.

---

## 3. How can they generate constrained strings?

By combining fixed literal text with a placeholder for another type, you constrain a string to match a specific pattern — useful for things like CSS values, route paths, or naming conventions that follow a predictable shape.

```ts
type CssUnit = `${number}px` | `${number}%`;

let width: CssUnit = "100px"; // valid
let height: CssUnit = "50%";   // valid
// let bad: CssUnit = "wide";  // error - doesn't match either pattern
```

---

## 4. How can they be combined with unions?

Placing a union inside a template literal type produces every possible combination — TypeScript distributes across each union member, generating a new, larger union of every resulting string.

```ts
type Direction = "top" | "bottom" | "left" | "right";
type Margin = `margin-${Direction}`;
// "margin-top" | "margin-bottom" | "margin-left" | "margin-right"
```
