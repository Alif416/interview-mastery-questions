# useEffect

This is probably the Hook you need to understand most deeply — more React bugs trace back to a misunderstood `useEffect` than almost anything else.

## 1. What is `useEffect`?

`useEffect` is a Hook that lets a component run side effects — code that reaches outside of rendering, like fetching data, subscribing to something, manually touching the DOM, or setting up a timer — after React has committed the render to the screen.

```jsx
React.useEffect(() => {
  console.log('This runs after the component renders');
}, []);
```

---

## 2. Why does `useEffect` exist?

Rendering is supposed to be a pure calculation: given props/state, produce JSX — with no side effects sneaking into the render itself. But real apps need to do things that aren't pure, like fetching data or talking to browser APIs. `useEffect` gives those side effects an explicit place to live, clearly separated from the rendering logic, and lets React control exactly when they run relative to rendering and DOM updates.

---

## 3. What is an effect?

An "effect" is any code that synchronizes your component with something outside of React — the network, the DOM, a browser API, a timer, a third-party library. Effects are things that need to happen *because* the component rendered with certain data, not things that determine what to render in the first place.

```jsx
React.useEffect(() => {
  document.title = `${unreadCount} unread messages`; // synchronizing with the browser tab title
}, [unreadCount]);
```

---

## 4. What is the dependency array?

The dependency array is the second argument to `useEffect` — a list of values the effect depends on. React compares this list to the previous render's list; if any value is different (by reference/value comparison), the effect re-runs. If nothing in the list changed, React skips running the effect again.

```jsx
React.useEffect(() => {
  // this effect "depends on" userId
}, [userId]);
```

---

## 5. When does an effect run?

An effect runs *after* React has rendered and committed the changes to the real DOM — not during rendering itself. This ordering matters: by the time your effect runs, the DOM is already updated, so it's safe to read layout, focus an element, or start a subscription against the current UI.

---

## 6. What happens with no dependency array?

```jsx
React.useEffect(() => {
  console.log('runs after every single render');
});
```

Omitting the array entirely means the effect runs after *every* render, with no comparison happening at all. This is rarely what you want — it's usually a sign the dependency array was forgotten, not a deliberate choice.

---

## 7. What happens with `[]`?

```jsx
React.useEffect(() => {
  console.log('runs once, after the first render only');
}, []);
```

An empty array means the effect has no dependencies — so it runs once, right after the initial render, and never again (unless the component unmounts and remounts). This is the pattern for "run this setup exactly once," like an initial data fetch.

---

## 8. What happens with `[value]`?

```jsx
React.useEffect(() => {
  console.log('runs after the first render, and again whenever value changes');
}, [value]);
```

The effect runs after the first render, and then re-runs on any later render where `value` is different from what it was last time. If `value` stays the same between renders, the effect is skipped.

---

## 9. What is effect cleanup?

Cleanup is an optional function an effect can return, which React calls to undo whatever the effect set up — unsubscribing from something, clearing a timer, cancelling a request — before the effect runs again, or when the component unmounts. It exists so effects don't leak resources or leave stale subscriptions running.

```jsx
React.useEffect(() => {
  const id = setInterval(() => console.log('tick'), 1000);
  return () => clearInterval(id); // cleanup - stops the old interval
}, []);
```

---

## 10. When does cleanup run?

Cleanup runs right before the effect runs again (if its dependencies changed), and also when the component unmounts entirely. This means for an effect with dependencies, the sequence on a dependency change is: cleanup (for the OLD dependencies) → then the effect body runs again (for the NEW dependencies).

```jsx
React.useEffect(() => {
  console.log('subscribing to', roomId);
  return () => console.log('unsubscribing from', roomId); // runs before the NEXT effect, or on unmount
}, [roomId]);
```

---

## 11. Why can effects run more than once in development?

In development, React's Strict Mode deliberately mounts, unmounts, and immediately re-mounts components once, calling effects (and their cleanup) an extra time — specifically to surface effects that aren't properly cleaned up. If an effect isn't idempotent (safe to run twice) or is missing a cleanup function, this double-invocation will expose the bug during development instead of letting it hide until production. This extra double-run does **not** happen in production builds.

---

## 12. How do you fetch data using an effect?

Call the fetch inside the effect, store the result in state once it resolves, and include any values the fetch depends on (like an ID) in the dependency array so it refetches when they change.

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then(setUser);
  }, [userId]);

  return user ? <p>{user.name}</p> : <p>Loading...</p>;
}
```

---

## 13. How do you cancel an API request?

Use an `AbortController`: create one inside the effect, pass its `signal` to `fetch`, and call `controller.abort()` in the cleanup function. If the component unmounts (or the dependency changes and the effect re-runs) before the request finishes, the in-flight request is cancelled.

```jsx
React.useEffect(() => {
  const controller = new AbortController();

  fetch(`/api/users/${userId}`, { signal: controller.signal })
    .then((res) => res.json())
    .then(setUser)
    .catch((err) => {
      if (err.name !== 'AbortError') throw err; // ignore expected cancellations
    });

  return () => controller.abort(); // cancel if userId changes again, or on unmount
}, [userId]);
```

---

## 14. How do you avoid infinite effect loops?

An infinite loop usually happens when an effect updates a piece of state that's also in its own dependency array, without a condition to stop it — each update triggers a re-render, which re-runs the effect, which updates state again, forever. Fix it by only including dependencies the effect actually needs, using a functional state update instead of depending on the current value, or adding a condition that stops the update once a target state is reached.

```jsx
// Infinite loop - count is both read and written, and is a dependency
React.useEffect(() => {
  setCount(count + 1);
}, [count]); // count changes -> effect runs -> count changes -> effect runs -> ...

// Fixed - remove count from the dependency array and use a functional update
React.useEffect(() => {
  setCount((c) => c + 1);
}, []); // runs once, doesn't depend on count at all
```

---

## 15. When should you not use `useEffect`?

Don't reach for `useEffect` when a value can simply be calculated directly during render instead — that's not a side effect, it's a derived value. Also avoid it for things that should just happen inside an event handler (like a `POST` request triggered by a button click) rather than being tied to a render. A good rule of thumb: if you can compute something directly while rendering, or trigger it directly from the event that caused it, you probably don't need an effect at all.

```jsx
// Unnecessary effect - fullName can just be computed directly
function BadExample({ firstName, lastName }) {
  const [fullName, setFullName] = React.useState('');
  React.useEffect(() => {
    setFullName(`${firstName} ${lastName}`);
  }, [firstName, lastName]);
  return <p>{fullName}</p>;
}

// Better - no effect needed at all, just compute it during render
function GoodExample({ firstName, lastName }) {
  const fullName = `${firstName} ${lastName}`;
  return <p>{fullName}</p>;
}
```

---

## Critical Question

**What problem is `useEffect` actually designed to solve?**

`useEffect` exists to *synchronize* a component with something outside of React's rendering model — keeping an external system (the DOM, a subscription, the network, browser APIs) in sync with the component's current props and state. It is **not** a general-purpose "run this after that" or "react to a state change" tool — reaching for it as a catch-all for anything that should happen after a render is exactly what causes most of the classic `useEffect` bugs (infinite loops, stale closures, race conditions, missing cleanup).

If you genuinely understand `useEffect` as "keep this external thing synchronized with my current state," rather than "run this code when something changes," a large fraction of the confusing React bugs people run into simply stop happening.
