# Discriminated Unions ⭐

Extremely useful for React state and API states.

```ts
type State =
  | { status: "loading" }
  | { status: "success"; data: User[] }
  | { status: "error"; error: string };
```

## 1. What is a discriminated union?

A discriminated union is a union of object types that all share one common property — the "discriminant," often called `type`, `status`, or `kind` — with a different literal value in each member. Checking that one shared property tells TypeScript (and you) exactly which shape you're dealing with.

```ts
type State =
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; error: string };
```

---

## 2. Why is a shared `status` field useful?

It gives every possible state a single, reliable, always-present property to check — instead of having to infer which state you're in from which combination of other properties happen to be present or absent, you just look at one field, and TypeScript can verify that check exhaustively.

---

## 3. How does TypeScript narrow each state?

By checking the discriminant field with equality narrowing (`===`, or a `switch`) — inside each branch, TypeScript automatically narrows the union down to exactly the member whose discriminant matches, giving you safe access to that member's other properties, which don't necessarily exist on the other members.

```ts
function render(state: State) {
  switch (state.status) {
    case "loading":
      return "Loading...";
    case "success":
      return state.data.join(", "); // safe - narrowed to the "success" branch, `data` exists here
    case "error":
      return state.error; // safe - narrowed to the "error" branch
  }
}
```

---

## 4. Why is this better than having many optional properties?

A single object with a pile of optional properties (`{ loading?: boolean; data?: string[]; error?: string }`) can represent *invalid* combinations that should never actually happen — loading AND having data AND having an error, all at once — and TypeScript can't stop you from creating (or checking for) states that don't make sense. A discriminated union makes only the valid states representable at all, and the discriminant lets TypeScript verify every case is handled.

This is a very important real-world pattern — especially for React component state and API responses, where "which state am I actually in?" needs to be unambiguous.
