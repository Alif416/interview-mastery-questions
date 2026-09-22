# React useState + TypeScript

```ts
const [user, setUser] = useState<User | null>(null);
```

## 1. How does TypeScript infer `useState`?

TypeScript infers the state's type from the initial value you pass to `useState` — the same inference `let`/`const` get, applied to the state variable.

```tsx
const [count, setCount] = React.useState(0); // inferred as number
const [name, setName] = React.useState("");   // inferred as string
```

---

## 2. When should you provide a generic explicitly?

When the initial value doesn't fully describe the type the state will eventually hold — most commonly, starting at `null` before data has loaded, where inference alone would give you just `null` as the type, rejecting any real value later.

```tsx
interface User { id: number; name: string; }

const [user, setUser] = React.useState<User | null>(null); // explicit - without it, inferred as just `null`
```

---

## 3. How do you type object state?

Provide the object's type as the generic — the same idea as typing any other object, just applied to `useState`.

```tsx
interface Form { name: string; email: string; }

const [form, setForm] = React.useState<Form>({ name: "", email: "" });
```

---

## 4. How do you type array state?

Provide the array type as the generic, and start with an empty array as the initial value if there's nothing to show yet.

```tsx
interface Todo { id: number; text: string; }

const [todos, setTodos] = React.useState<Todo[]>([]);
```

---

## 5. How do you type nullable state?

Union the real type with `null` (or `undefined`, matching whatever your initial "nothing yet" value actually is) — this accurately represents "not loaded yet" as a distinct, checkable state, rather than lying about what the value could be.

```tsx
const [user, setUser] = React.useState<User | null>(null);

if (user) {
  console.log(user.name); // safe - narrowed to User here, not null
}
```

---

## Why `User | null` Is Necessary

You should understand why `User | null` — not just `User` — is the correct type here: the state genuinely starts out with no user loaded yet, and `null` is how that "not available yet" state is represented. If you typed it as just `User` and initialized with `null` anyway, TypeScript would either reject the initial value outright, or — without `strictNullChecks` — silently let you access properties on a value that could really be `null` at runtime, causing a crash. The union makes the "might not exist yet" case something TypeScript actively forces you to handle.
