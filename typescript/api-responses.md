# API Responses

Extremely important for full-stack development.

```ts
type User = {
  id: number;
  name: string;
};
```

## 1. How do you type an API response?

Define a type/interface describing the expected shape of the response data, and apply it where the response is parsed — either typing the variable that holds the result, or typing an async function's return type.

```ts
type User = {
  id: number;
  name: string;
};

async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  return res.json(); // TypeScript trusts this matches `User` - nothing actually checks that at runtime
}
```

---

## 2. What's the difference between compile-time types and runtime validation?

Compile-time types exist only while the code is being checked and compiled — they verify your *code* is internally consistent, but they're completely erased before the program runs, so they can't check anything about *actual data* arriving while the program executes. Runtime validation is real code that runs while the program executes, actually inspecting a value's real shape and content, and can catch data that doesn't match expectations — something compile-time types alone can never do.

---

## 3. Should you trust API data just because TypeScript says it's typed?

No. Typing `res.json()` as `Promise<User>` is really just an assertion — you're telling TypeScript "trust me, this will have this shape," but nothing about that annotation actually checks the real response. If the API changes, returns an error object instead, or has a bug, TypeScript's type checking gives you zero protection at runtime; the mismatch only surfaces later as a confusing runtime error somewhere downstream.

---

## 4. How do you handle unknown API data?

Type the raw response as `unknown` rather than immediately trusting a specific shape, then validate it — either with manual checks, or (much more commonly in practice) a validation library — before treating it as that type. This makes the "trust boundary" explicit: nothing is treated as a known shape until it's actually been verified.

---

## 5. Why might you use Zod?

Zod (and similar libraries) let you define a schema once that does double duty: it validates data at runtime — checking that a real API response actually matches the expected shape, throwing or reporting a clear error if it doesn't — and it can also generate the exact matching TypeScript type from that same schema. Your compile-time type and your runtime check are then guaranteed to never drift out of sync, unlike hand-writing a `type` and hoping the API honors it.

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
});

type User = z.infer<typeof UserSchema>; // TypeScript type, derived from the schema

async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  const data = await res.json();
  return UserSchema.parse(data); // actually validates at runtime - throws if the shape doesn't match
}
```

---

## Important

**TypeScript does not automatically validate data coming from an API at runtime.** Every type on API data is really just a promise you're making to the compiler — the actual safety only comes from validating the real response, which is exactly the gap libraries like Zod are built to close.
