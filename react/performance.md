# Performance Optimization

## 1. Why do React components re-render?

A component re-renders when its own state changes, when its props change (because its parent re-rendered), or when a context it reads changes. By default, when a parent re-renders, every child in its returned tree re-renders too — regardless of whether that child's specific props actually changed.

---

## 2. What is unnecessary re-rendering?

Unnecessary re-rendering is when a component re-renders even though nothing it actually depends on has meaningfully changed — most commonly because its parent re-rendered for an unrelated reason. It's not automatically a problem (React is fast at cheap re-renders), but it becomes one when the component's render work is expensive, or when it happens often enough to visibly slow down the UI.

---

## 3. What is `React.memo`?

`React.memo` is a wrapper that makes a component skip re-rendering if its props are shallowly equal to what they were last time — even if its parent re-rendered. It's the main tool for avoiding unnecessary re-renders of a specific component.

```jsx
const ExpensiveRow = React.memo(function ExpensiveRow({ item }) {
  console.log('rendering', item.id);
  return <li>{item.name}</li>;
});
// Skips re-rendering if `item` is reference-equal to the previous render's `item`
```

---

## 4. What is `useMemo`?

`useMemo` caches (memoizes) the *result* of an expensive calculation between renders, only recomputing it when one of its listed dependencies changes — avoiding redoing costly work on every render if the inputs haven't actually changed.

```jsx
const sortedItems = React.useMemo(() => {
  return [...items].sort((a, b) => a.price - b.price); // only re-sorts when `items` changes
}, [items]);
```

---

## 5. When should you use `useMemo`?

Use it for calculations that are genuinely expensive (sorting/filtering large lists, heavy computation) and that would otherwise re-run on every render for no reason, or when you need to preserve a stable object/array *reference* across renders — for example, to avoid defeating `React.memo` on a child that receives that value as a prop.

---

## 6. What is `useCallback`?

`useCallback` caches a *function* between renders, only creating a new function reference when one of its dependencies changes. Since functions are recreated fresh on every render by default, this is specifically useful for keeping a stable function reference to pass down as a prop.

```jsx
const handleClick = React.useCallback(() => {
  console.log('clicked', id);
}, [id]); // same function reference across renders, unless id changes
```

---

## 7. When should you use `useCallback`?

Use it when you're passing a function as a prop to a child wrapped in `React.memo` (so the function's reference staying stable actually lets the memoization work), or when the function is a dependency of another Hook (like `useEffect`) and you need its reference to stay stable to avoid that effect re-running unnecessarily. Outside of those situations, it mostly just adds overhead for no real benefit.

---

## 8. Why can excessive memoization make code worse?

`useMemo`/`useCallback` aren't free — they still run on every render (checking dependencies, storing cached values) and add code that's harder to read. Wrapping *everything* "just in case" adds real overhead and complexity for cases where the value/function was cheap to recreate anyway, often making the code slower and harder to follow than just letting React re-render normally. Memoization is a targeted fix for a measured problem, not a default habit.

---

## 9. What is code splitting?

Code splitting breaks a single large JavaScript bundle into multiple smaller chunks that can be loaded separately — so users only download the code needed for the part of the app they're actually using right now, instead of the entire application up front.

---

## 10. What is lazy loading?

Lazy loading defers loading a piece of code (or an image, or any resource) until it's actually needed — like a route's component only being downloaded when the user navigates to that route, rather than being bundled into the initial page load.

---

## 11. What is `React.lazy()`?

`React.lazy()` is React's built-in way to code-split at the component level — it takes a dynamic `import()` and returns a component that's only loaded when it's first rendered. It's typically paired with `Suspense` to show a fallback (like a spinner) while the chunk is downloading.

```jsx
const Settings = React.lazy(() => import('./Settings'));

function App() {
  return (
    <React.Suspense fallback={<p>Loading...</p>}>
      <Settings /> {/* Settings.js is only downloaded once this actually renders */}
    </React.Suspense>
  );
}
```

---

## 12. What is virtualization?

Virtualization (or "windowing") renders only the list items currently visible in the viewport — plus a small buffer — instead of rendering every single item in a very long list at once. As the user scrolls, off-screen items are swapped in and out of the DOM, keeping the number of actual DOM nodes small regardless of how many total items exist.

---

## 13. How do you optimize a large list?

Give every item a stable, unique `key`; wrap list item components in `React.memo` if their props don't change often; avoid creating new object/array/function props on every render for each item; and once the list gets into the thousands of items, use a virtualization library (like `react-window` or `react-virtualized`) so only visible items are actually mounted in the DOM.

---

## 14. How do you profile a React application?

Use the React DevTools **Profiler** tab to record a session of interactions and see exactly which components rendered, how long each took, and *why* each one re-rendered — this turns "I think this is slow" into concrete evidence about which specific component is actually the bottleneck, instead of guessing (and potentially memoizing the wrong thing).

---

## Important Interview Question

**Why shouldn't you automatically wrap every function with `useCallback`?**

Because `useCallback` has its own cost — on every render, React still has to check whether the dependency array changed, and still has to hold onto the cached function — and it only pays off when something downstream actually cares about reference stability (a `React.memo`-wrapped child, or another Hook's dependency array). Wrapping a function that's cheap to recreate, and that nothing downstream depends on by reference, adds overhead and extra code for zero benefit — you're paying the cost of memoization without getting the payoff it exists to provide. The right instinct is: measure first, then memoize the specific thing that's actually causing a measured problem — not wrap everything reflexively "to be safe."
