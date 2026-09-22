# Component Architecture

This matters far more in real projects than any single Hook does — a codebase with good architecture stays pleasant to work in as it grows; one without it doesn't.

## 1. How do you decide when to create a component?

Create a component when a piece of UI has its own clear responsibility, is reused (or likely to be reused) elsewhere, has its own internal state or logic, or is large enough that extracting it makes the parent easier to read. Not every small chunk of markup needs to be its own component — extracting too aggressively has its own costs (see question 11).

---

## 2. What is a reusable component?

A reusable component is written generically enough — through props, not hardcoded assumptions — that it can be used in more than one place without modification. A `<Button label="Save" />` is reusable; a component with "Save" hardcoded directly into its JSX is not.

---

## 3. What is component composition?

Composition is building complex UI by combining smaller components together — often passing components in as `children` — rather than building one large, heavily-configurable component that tries to handle every case through props alone. It's React's preferred way to share and combine behavior, instead of inheritance.

---

## 4. What is a presentational component?

A presentational component is concerned only with *how things look* — it receives data and callbacks via props and renders UI, with no data fetching, no direct business logic, and minimal internal state (usually only UI state like "is this dropdown open").

```jsx
function UserCard({ name, avatarUrl, onFollow }) {
  return (
    <div className="card">
      <img src={avatarUrl} alt={name} />
      <p>{name}</p>
      <button onClick={onFollow}>Follow</button>
    </div>
  );
}
```

---

## 5. What is a container component?

A container component is concerned with *how things work* — it fetches data, manages state, and handles logic, then passes the results down to presentational components as props. This split (container vs. presentational) is a classic pattern, though in modern React it's often blurred somewhat by custom hooks taking over the "container" logic instead of a wrapping component.

```jsx
function UserCardContainer({ userId }) {
  const { user, follow } = useUser(userId); // logic lives in a custom hook
  return <UserCard name={user.name} avatarUrl={user.avatarUrl} onFollow={follow} />;
}
```

---

## 6. What is separation of concerns?

Separation of concerns means keeping distinct responsibilities — rendering, business logic, data fetching, validation — in distinct places, rather than tangled together in one component. It's the underlying principle behind splitting presentational from container logic, and behind extracting business/API logic into their own modules or hooks.

---

## 7. Where should business logic live?

Business logic (rules and calculations independent of how anything is displayed — pricing rules, permission checks, data transformations) belongs outside of rendering components entirely, in plain utility functions or custom hooks. That keeps it testable in isolation, and reusable by any component that needs it, without dragging along unrelated rendering code.

```jsx
// business logic, in a plain function - no React involved at all
function calculateDiscount(order) {
  if (order.total > 100) return order.total * 0.1;
  return 0;
}
```

---

## 8. Where should API logic live?

API calls belong in a dedicated layer — a set of functions (often grouped by resource, like `api/users.js`) or custom hooks (`useUsers()`) — rather than inline inside components. This keeps endpoints, headers, and error handling defined in one place, makes them easy to reuse and mock in tests, and keeps components focused on rendering rather than knowing request/response details.

```jsx
// api/users.js
export function fetchUser(id) {
  return fetch(`/api/users/${id}`).then((res) => res.json());
}

// component just calls it, doesn't know the URL/fetch details
React.useEffect(() => {
  fetchUser(userId).then(setUser);
}, [userId]);
```

---

## 9. Where should validation logic live?

Like business logic, validation rules are best defined outside of components — as plain functions (or, for complex forms, a schema using a library like Zod or Yup) — so the same rules can be reused across multiple forms, tested independently, and kept in sync in one place instead of duplicated inline in every form component.

```jsx
function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email) ? null : 'Enter a valid email';
}
```

---

## 10. How do you avoid huge components?

Extract distinct pieces of UI into their own components once they have a clear identity, move business/API/validation logic out into functions or hooks (as above), and keep a component's own body focused on composing those pieces together and describing what to render — not on containing every detail itself.

---

## 11. How do you avoid excessive component fragmentation?

Splitting can go too far the other direction too — a component broken into ten tiny pieces that are each only ever used once, in one place, adds indirection (jumping between files to understand one feature) without adding any real reuse or clarity benefit. Split when it genuinely improves readability or enables reuse; don't split purely to keep files short, or purely because a rule of thumb says components "should" be small.

---

## 12. How should you organize a large React project?

Common approaches: group files **by feature** (a `features/checkout/` folder containing that feature's components, hooks, and API calls together) rather than by file type (`components/`, `hooks/`, `api/` as flat top-level folders holding everything from every feature). Feature-based organization tends to scale better as an app grows, since related code stays physically close together, and it's usually paired with a smaller `shared/` or `common/` folder for genuinely cross-cutting components (buttons, inputs, layout primitives) used across many features.
