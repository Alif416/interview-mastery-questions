# State Management

## 1. What is local state?

Local state is state that lives inside a single component and is only used by that component (and maybe its direct children, via props) — declared with `useState`/`useReducer` right where it's needed, with no broader app-wide visibility.

```jsx
function SearchBox() {
  const [query, setQuery] = React.useState(''); // local to SearchBox only
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

---

## 2. What is global state?

Global state is state that many, often unrelated, parts of the app need to read or update — the logged-in user, the current theme, cart contents accessible from a header badge and a checkout page at once. It usually lives outside any single component, in Context or a dedicated state management library.

---

## 3. When should state remain local?

Keep state local whenever only one component (or a small, closely related cluster of them) actually needs it. Defaulting to local state, and only moving it further up the tree once something else genuinely needs it too, keeps components simpler and avoids unnecessary re-renders elsewhere in the app.

---

## 4. What is state lifting?

State lifting means moving a piece of state up to the nearest common ancestor of the components that need to share it, so they can both read (and, via callback props, update) the same value instead of each keeping their own disconnected copy.

```jsx
// Before: each input has its own disconnected state
function TemperatureInputBad() {
  const [celsius, setCelsius] = React.useState('');
  // ...
}

// After: state lifted to the shared parent
function TemperatureConverter() {
  const [celsius, setCelsius] = React.useState('');
  return (
    <>
      <CelsiusInput value={celsius} onChange={setCelsius} />
      <FahrenheitDisplay celsius={celsius} />
    </>
  );
}
```

---

## 5. When should state be lifted?

Lift state when two or more sibling components need to stay in sync with the same value — if you find yourself trying to pass data sideways between siblings, or duplicating the same state in two places and manually keeping them consistent, that's the sign it belongs one level higher, owned by their common parent instead.

---

## 6. What is prop drilling?

Prop drilling is passing a prop down through several components that don't use it themselves, just to reach a descendant further down the tree that does. It's one of the costs of lifting state too far up without an easier way (like Context) to distribute it back down to where it's needed.

```jsx
function Page({ user }) {
  return <Sidebar user={user} />; // Page doesn't use `user`, just forwards it
}
```

---

## 7. When should Context be used?

Use Context once prop drilling becomes a real problem for a value that's genuinely needed broadly across the tree and doesn't change constantly — theme, auth, locale. Context is a distribution mechanism for already-lifted state, not a replacement for deciding where state should live in the first place.

---

## 8. When should external state management be used?

Reach for a dedicated library (Redux Toolkit, Zustand, etc.) once app-wide state becomes complex enough that Context alone starts to hurt — frequent updates causing broad re-renders, many independent pieces of shared state, or a need for tooling like time-travel debugging, middleware, or fine-grained subscriptions so components only re-render for the specific slice of state they actually use.

---

## 9. What is server state?

Server state is data that actually lives on a server, fetched over the network — it can go stale the moment it's fetched, may be shared across users, and needs syncing/caching/refetching rather than being simply "owned" by the client. *(Covered in more depth in [Data Fetching & APIs](/react/data-fetching).)*

---

## 10. What is client state?

Client state is data that exists only in the browser and is fully owned by the app itself — a form's current values, whether a sidebar is collapsed, the active tab. It's what `useState`, `useReducer`, and Context are typically managing.

---

## 11. What is derived state?

Derived state is a value that can be entirely calculated from other existing state or props, rather than needing to be stored as its own separate piece of state — like a filtered list computed from a full list plus a search term, or a total computed from a cart's line items.

```jsx
function Cart({ items }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // `total` is derived - no need for its own useState
  return <p>Total: ${total.toFixed(2)}</p>;
}
```

---

## 12. Why shouldn't you store unnecessary derived state?

Storing a derived value in its own `useState` creates a second source of truth that can drift out of sync with the data it was derived from — every place that changes the original data now also has to remember to update the derived copy, and it's easy to forget one. Computing it directly during render instead guarantees it's always correct and up to date, with no synchronization to maintain.

```jsx
// Risky - fullName can get out of sync with firstName/lastName
function Bad({ firstName, lastName }) {
  const [fullName, setFullName] = React.useState(`${firstName} ${lastName}`);
  // if firstName/lastName change later, fullName won't update unless something remembers to call setFullName
}

// Safe - always correct, nothing to keep in sync
function Good({ firstName, lastName }) {
  const fullName = `${firstName} ${lastName}`;
}
```

---

## Learn one library

Once local vs. global state and lifting make sense, learn **one** external state management library — either **Redux Toolkit** or **Zustand** — well. You don't need five state-management libraries; pick one, understand why it exists (given everything above), and go deep on that.
