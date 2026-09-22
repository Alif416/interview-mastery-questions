# Custom Hooks

## 1. What is a custom hook?

A custom hook is just a regular JavaScript function whose name starts with `use`, that calls one or more built-in Hooks internally (`useState`, `useEffect`, `useRef`, etc.) to package up some reusable stateful logic. It lets you extract logic out of a component and share it across multiple components, without duplicating the same `useState`/`useEffect` code everywhere.

```jsx
function useToggle(initialValue = false) {
  const [value, setValue] = React.useState(initialValue);
  const toggle = () => setValue((v) => !v);
  return [value, toggle];
}

// used in any component:
const [isOpen, toggleOpen] = useToggle();
```

---

## 2. Why create custom hooks?

Without custom hooks, reusable stateful logic (fetching data, tracking window size, debouncing a value) either gets copy-pasted across components, or crammed into awkward wrapper components just to share behavior. A custom hook extracts that logic into one place, so multiple components can reuse it directly, and each individual component stays focused on what it actually renders rather than how some piece of state management works internally.

---

## 3. What logic belongs in a custom hook?

Logic that's stateful, reusable, and not tied to any single component's specific rendering — data fetching, subscribing to a browser API, debouncing/throttling a value, managing a piece of form state, tracking whether the user is online. If the logic doesn't need `useState`/`useEffect`/other Hooks at all, it's usually better as a plain utility function instead of a custom hook.

---

## 4. How do you create a reusable hook?

Write a function named `useSomething`, move the relevant `useState`/`useEffect`/etc. calls into it, and return whatever the consuming components need — a value, a setter, or both. Parameters let the hook be configured differently by each caller.

```jsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = React.useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// used just like useState, but persisted:
const [name, setName] = useLocalStorage('name', '');
```

---

## 5. What rules must hooks follow?

Two core rules: only call Hooks at the top level of a component or another custom hook (never inside conditions, loops, or nested functions), and only call Hooks from React function components or other custom hooks (never from regular JavaScript functions). These rules exist because React relies on Hooks being called in the exact same order on every render to correctly match each Hook call to its stored state.

---

## 6. What does "Hooks must be called at the top level" mean?

It means every `useState`, `useEffect`, `useRef`, etc. call has to run unconditionally, in the same order, every single render — not nested inside an `if`, a loop, a `try/catch`, or a callback that might or might not run. React identifies each Hook's stored data by the *position* it was called in, not by name, so any change in call order between renders breaks that matching.

---

## 7. Why can't Hooks be called inside loops?

A loop can run a different number of times on different renders (depending on data), which means the number of Hook calls would vary between renders too — React would have no reliable way to match each Hook call back to the right stored state, since the order/count is no longer consistent.

```jsx
// Wrong - number of useState calls depends on items.length, which can change
function Bad({ items }) {
  items.forEach((item) => {
    const [checked, setChecked] = React.useState(false); // breaks Hook ordering
  });
}

// Right - use one piece of state that holds data for all items instead
function Good({ items }) {
  const [checkedMap, setCheckedMap] = React.useState({});
}
```

---

## 8. Why can't Hooks be called conditionally?

Same underlying reason as loops: if a Hook is only called when some condition is true, the total number and order of Hook calls differs from render to render depending on that condition — breaking React's ability to match each call to its previously stored state.

```jsx
// Wrong - useEffect is skipped entirely on some renders
function Bad({ isLoggedIn }) {
  if (isLoggedIn) {
    React.useEffect(() => { /* ... */ }, []); // conditional Hook call - not allowed
  }
}

// Right - always call the Hook, put the condition INSIDE it instead
function Good({ isLoggedIn }) {
  React.useEffect(() => {
    if (!isLoggedIn) return;
    /* ... */
  }, [isLoggedIn]);
}
```

---

## Practice

Build these custom hooks:

- `useFetch()` — takes a URL, returns `{ data, loading, error }`.
- `useDebounce()` — takes a value and a delay, returns a debounced version of that value.
- `useLocalStorage()` — behaves like `useState`, but persists to `localStorage`.
- `usePrevious()` — returns the previous render's value of whatever's passed in.
- `useOnlineStatus()` — returns whether the browser currently reports being online.
- `useAuth()` — returns the current user and `login`/`logout` functions (can be a thin wrapper around the Authentication Context from the `useContext` topic).
