# React useReducer + TypeScript

```ts
type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset" };
```

## 1. How do you type reducer state?

Define a type/interface describing the state shape, the same way you'd type any other piece of state, and use it as the reducer function's `state` parameter and return type.

```tsx
interface CounterState {
  count: number;
}
```

---

## 2. How do you type actions?

Define a discriminated union — each possible action as an object type with a shared `type` discriminant field, plus whatever extra data (`payload`) that specific action needs.

```tsx
type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset" };
```

---

## 3. Why are discriminated unions useful here?

Inside the reducer's `switch` statement, TypeScript narrows `action` to exactly the matching member for each `case`, so you get safe, correct access to that action's specific `payload` (if it has one) without a manual type assertion — and TypeScript rejects any action shape that isn't one of the ones actually defined.

```tsx
function reducer(state: CounterState, action: Action): CounterState {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "reset":
      return { count: 0 };
  }
}
```

---

## 4. How does TypeScript ensure exhaustive action handling?

By checking that every `switch` branch returns a value and that no possible member of the `Action` union goes unhandled. If a new action type is added to the union later but a matching `case` isn't added to the reducer, adding a `default: return assertNever(action);` branch — using a helper typed to accept only `never` — turns a forgotten case into a compile-time error instead of a silent runtime bug.

```ts
function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

function reducer(state: CounterState, action: Action): CounterState {
  switch (action.type) {
    case "increment": return { count: state.count + 1 };
    case "decrement": return { count: state.count - 1 };
    case "reset": return { count: 0 };
    default: return assertNever(action); // errors at compile time if a case is ever missing
  }
}
```
