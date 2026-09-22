# Utility Types ⭐

You absolutely need these for professional TypeScript.

```ts
interface User {
  id: number;
  name: string;
  email: string;
}
```

## 1. What does `Partial<T>` do?

`Partial<T>` makes every property of `T` optional — useful for representing a partial update to an object, like a PATCH request body where only some fields are being changed.

```ts
type UpdateUser = Partial<User>; // { id?: number; name?: string; email?: string }

function updateUser(id: number, changes: UpdateUser) { /* ... */ }
updateUser(1, { name: "New Name" }); // valid - other fields omitted
```

This is extremely common in real applications.

---

## 2. What does `Required<T>` do?

`Required<T>` does the opposite of `Partial<T>` — it makes every property of `T` mandatory, even ones that were originally declared optional with `?`.

```ts
interface DraftUser {
  id: number;
  name?: string;
}

type CompleteUser = Required<DraftUser>; // { id: number; name: string } - name no longer optional
```

---

## 3. What does `Readonly<T>` do?

`Readonly<T>` makes every property of `T` read-only, preventing reassignment after the object is created — the same compile-time-only protection as writing `readonly` on each property by hand, applied automatically to an existing type.

```ts
const user: Readonly<User> = { id: 1, name: "Alex", email: "alex@example.com" };
// user.name = "New Name"; // error - cannot assign to read-only property
```

---

## 4. What's the difference between `Pick` and `Omit`?

`Pick<T, K>` builds a new type containing *only* the listed properties `K` from `T`. `Omit<T, K>` does the reverse — it builds a new type with *everything except* the listed properties. They're complementary tools for the same job: deriving a smaller type from a larger one.

```ts
type UserPreview = Pick<User, "id" | "name">; // { id: number; name: string }
type UserWithoutId = Omit<User, "id">;         // { name: string; email: string }
```

---

## 5. What does `Record<K, T>` do?

`Record<K, T>` builds an object type where every key of type `K` maps to a value of type `T` — a concise way to type a dictionary/map-like object, similar to an index signature but often more readable, especially when `K` is a union of specific literal keys.

```ts
type Role = "admin" | "user" | "guest";

type RolePermissions = Record<Role, string[]>;
// { admin: string[]; user: string[]; guest: string[] }

const permissions: RolePermissions = {
  admin: ["read", "write", "delete"],
  user: ["read", "write"],
  guest: ["read"],
};
```

---

## 6. What's the difference between `Exclude` and `Extract`?

Both work on union types. `Exclude<T, U>` removes from `T` any members that are assignable to `U`, leaving what's left over. `Extract<T, U>` does the opposite — it keeps only the members of `T` that *are* assignable to `U`, discarding the rest.

```ts
type Status = "loading" | "success" | "error" | "idle";

type ActiveStatus = Exclude<Status, "idle">; // "loading" | "success" | "error"
type TerminalStatus = Extract<Status, "success" | "error">; // "success" | "error"
```

---

## 7. What does `NonNullable<T>` do?

`NonNullable<T>` removes `null` and `undefined` from a type, leaving only the values that are guaranteed to be present.

```ts
type MaybeUser = User | null | undefined;
type DefiniteUser = NonNullable<MaybeUser>; // just User
```

---

## 8. What does `ReturnType<T>` do?

`ReturnType<T>` extracts the return type of a function type — useful for deriving a type from an existing function without having to redeclare its return shape by hand, keeping the two in sync automatically.

```ts
function createUser(name: string) {
  return { id: Date.now(), name };
}

type CreatedUser = ReturnType<typeof createUser>; // { id: number; name: string }
```

---

## 9. What does `Parameters<T>` do?

`Parameters<T>` extracts a function type's parameter types as a tuple — useful for reusing a function's exact parameter shape elsewhere without redeclaring it.

```ts
function createUser(name: string, age: number) { /* ... */ }

type CreateUserArgs = Parameters<typeof createUser>; // [name: string, age: number]
```

---

## 10. What does `Awaited<T>` do?

`Awaited<T>` unwraps the type a `Promise` resolves to — the type you'd actually get after `await`ing it — correctly handling nested Promises too. It's especially useful for deriving the resolved type of an `async` function.

```ts
async function fetchUser(): Promise<User> {
  /* ... */
  return { id: 1, name: "Alex", email: "alex@example.com" };
}

type FetchedUser = Awaited<ReturnType<typeof fetchUser>>; // User, not Promise<User>
```
