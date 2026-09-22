# useContext

## 1. What problem does Context solve?

Context solves prop drilling — the need to pass a value down through many layers of components that don't use it themselves, just to get it to a component deep in the tree that does. Context lets any component below a `Provider` read a value directly, no matter how deeply nested it is, without every component in between needing to know about it.

---

## 2. What is prop drilling?

Prop drilling is passing a prop down through several components that don't actually need it, purely to hand it off to a descendant further down the tree. It couples every intermediate component to data it doesn't care about, and makes the tree harder to reorganize or refactor.

```jsx
function App() {
  const user = { name: 'Alif' };
  return <Page user={user} />;
}
function Page({ user }) {
  return <Sidebar user={user} />; // doesn't use `user`, just forwards it
}
function Sidebar({ user }) {
  return <Profile user={user} />; // doesn't use it either
}
function Profile({ user }) {
  return <p>{user.name}</p>; // finally used, 3 levels down
}
```

---

## 3. How does Context work?

You create a Context object, wrap part of your component tree in that Context's `Provider` with a `value`, and then any descendant component — no matter how deeply nested — can read that value with `useContext`, skipping every layer in between entirely.

```jsx
const UserContext = React.createContext(null);

function App() {
  return (
    <UserContext.Provider value={{ name: 'Alif' }}>
      <Page />
    </UserContext.Provider>
  );
}
function Page() { return <Sidebar />; }
function Sidebar() { return <Profile />; }
function Profile() {
  const user = React.useContext(UserContext); // reads directly, no drilling
  return <p>{user.name}</p>;
}
```

---

## 4. What is a Provider?

The Provider is the component (`SomeContext.Provider`) that supplies a Context's value to every component nested inside it. Any component within that Provider's subtree — at any depth — can read the value it's currently holding via `useContext`. If a component is rendered *outside* the Provider, it falls back to the Context's default value (the one passed to `createContext`).

```jsx
<UserContext.Provider value={currentUser}>
  {/* everything in here can read currentUser via useContext(UserContext) */}
</UserContext.Provider>
```

---

## 5. What is a Consumer?

A Consumer (`SomeContext.Consumer`) is the older, pre-Hooks way to read a Context's value, using a render-prop pattern instead of a Hook. Modern function components almost always use `useContext` instead, which is simpler and doesn't require wrapping your JSX in an extra component just to read a value.

```jsx
// Older pattern - Consumer (render prop)
<UserContext.Consumer>
  {(user) => <p>{user.name}</p>}
</UserContext.Consumer>

// Modern pattern - useContext
function Profile() {
  const user = React.useContext(UserContext);
  return <p>{user.name}</p>;
}
```

---

## 6. How do you create a Context?

Call `React.createContext(defaultValue)` once, outside of any component, and export the resulting Context object so both the Provider and any consuming components can import and use it.

```jsx
// UserContext.js
export const UserContext = React.createContext(null); // null = default value if no Provider is found
```

---

## 7. When should you use Context?

Use Context for values that many components across different parts of the tree genuinely need, and that don't change very often — things like the current theme, the logged-in user, the active locale/language, or feature flags. It's meant for "broadly shared, relatively stable" data.

---

## 8. When should you NOT use Context?

Avoid Context for state that changes frequently and is only needed by a small, localized part of the tree — that's usually better handled with plain `useState` passed down a level or two, or lifted just far enough to be shared, rather than made global. Context also isn't a general state-management replacement — for complex, frequently-updating application state with lots of independent consumers, a dedicated state library often manages performance and updates better.

---

## 9. Can Context cause unnecessary re-renders?

Yes — every component that calls `useContext` for a given Context re-renders whenever that Context's value changes, even if the specific piece of data that component actually cares about didn't change. This is especially costly if the Provider's `value` is a new object literal on every render (a fresh reference every time), since that makes React treat the value as "changed" on every single render, regardless of its actual contents.

```jsx
function App() {
  const [user, setUser] = React.useState({ name: 'Alif' });

  // New object on EVERY render - every consumer re-renders every time, even if user didn't change
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Page />
    </UserContext.Provider>
  );
}

// Better - memoize the value so its reference only changes when it actually should
const value = React.useMemo(() => ({ user, setUser }), [user]);
```

---

## 10. Context vs Redux — what problem does each solve?

Context solves the plumbing problem of getting a value to deeply nested components without manually drilling it through every layer — it's a distribution mechanism, not a state management system on its own. Redux (and similar libraries) solve state *management* problems: predictable updates via actions/reducers, time-travel debugging, middleware for side effects, and — importantly — fine-grained subscriptions so components only re-render when the specific slice of state they use actually changes, which plain Context doesn't give you out of the box.

---

## Practice

Build a **theme system** supporting **Light**, **Dark**, and **System** modes, using Context to make the current theme (and a way to change it) available anywhere in the app.

Then build an **Authentication Context** that holds the current user (or `null` if logged out) and exposes `login`/`logout` functions, and use it to conditionally render different UI depending on whether someone's signed in.
