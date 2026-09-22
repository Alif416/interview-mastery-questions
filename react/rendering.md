# Rendering & Re-rendering

This is where your understanding of React stops being surface-level.

## 1. What causes a component to render?

A component renders the first time it's mounted onto the screen — React calls the component function to produce its initial output, which is then converted into real DOM nodes.

```jsx
function App() {
  return <Counter />; // Counter renders for the first time here
}
```

---

## 2. What causes a component to re-render?

After that first render, a re-render happens whenever: the component's own state changes, its props change (because its parent re-rendered and passed new values), or a context value it reads from changes.

```jsx
function Counter() {
  const [count, setCount] = React.useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
  // clicking calls setCount -> triggers a re-render of Counter
}
```

---

## 3. Does a parent re-rendering cause its children to re-render?

Yes, by default — when a parent re-renders, React re-renders every child in its returned tree too, even if that child's own props didn't actually change. This is the default behavior; it can be avoided with `React.memo` (covered in Performance Optimization), which skips re-rendering a component if its props are shallowly equal to last time.

```jsx
function Parent() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <ExpensiveChild /> {/* re-renders every time Parent does, even with no props */}
    </div>
  );
}
```

---

## 4. What is the Virtual DOM?

The Virtual DOM is a lightweight, in-memory representation of the UI — a tree of plain JavaScript objects (React elements) that mirrors the structure of the real DOM. React builds a new Virtual DOM tree on every render and uses it to work out what actually changed, before touching the real, much slower browser DOM.

```jsx
// This JSX...
const ui = <h1>Hello</h1>;
// ...becomes a lightweight object first:
// { type: 'h1', props: { children: 'Hello' } }
// - not a real DOM node yet.
```

---

## 5. Is the Virtual DOM the reason React is fast?

Not entirely — that's an oversimplification. The Virtual DOM itself doesn't make updates faster in some magical sense; what actually helps is that React can compare two lightweight JS object trees and compute a minimal set of real DOM changes, applying only those, instead of rebuilding the whole UI from scratch on every update. The real performance win comes from avoiding unnecessary DOM work, not from the Virtual DOM being inherently fast.

---

## 6. What is reconciliation?

Reconciliation is the process React uses to figure out what changed between the previous render's output and the new render's output, and to update the real DOM to match — without tearing everything down and rebuilding it from scratch. It's the overall algorithm that "diffing" is part of.

---

## 7. What is diffing?

Diffing is the specific comparison React performs between the old and new Virtual DOM trees to find the minimal set of differences — which nodes were added, removed, or changed — so only those need to be applied to the real DOM. React's diffing algorithm makes simplifying assumptions (like comparing elements of the same type at the same tree position) to keep this fast, rather than performing a fully generic tree-diff.

---

## 8. How does React decide what to update?

React walks the new tree and the previous tree together, node by node. If an element's type stays the same, React updates just its changed attributes and children in place. If the type changes (a `<div>` becoming a `<span>`, for example), React discards that whole subtree and builds a fresh one instead of trying to patch it. Keys additionally tell React which list items correspond to which across renders.

```jsx
// Same type at the same position - React updates it in place
<button className="a" /> // previous render
<button className="b" /> // next render -> just updates className

// Different type at the same position - React discards and rebuilds
<button /> // previous render
<a />      // next render -> old <button> is removed, a new <a> is created
```

---

## 9. What is referential equality?

Referential equality means two variables point to the exact same object, array, or function in memory — not just that they look the same. `{} === {}` is `false`: two different objects with identical (empty) contents, but different references. React relies on this kind of comparison in several places, including `React.memo`, `useEffect` dependency arrays, and state comparisons.

```jsx
const a = { name: 'Alif' };
const b = { name: 'Alif' };
console.log(a === b); // false - same content, different reference

const c = a;
console.log(a === c); // true - same reference
```

---

## 10. Why does creating a new object produce a different reference?

Every time you write an object or array literal (`{}`, `[]`), or call `.map()`, `.filter()`, or a spread (`{...obj}`), JavaScript allocates a brand-new object in memory — even if its contents are identical to a previous one. This matters in React because a component that creates a new object prop (or effect dependency) on every render will always "look changed" by reference comparison, even when nothing meaningful actually changed.

```jsx
function Parent() {
  // A NEW object is created on every single render, even though the values never change
  const style = { color: 'red' };
  return <Child style={style} />;
  // Child (even wrapped in React.memo) will still re-render every time,
  // because `style` is a different reference on every render.
}
```

---

## 11. What is reconciliation with keys?

When React reconciles a list of children, keys tell it which rendered element corresponds to which piece of data across renders — instead of matching elements up purely by their position in the array. With good keys, React can correctly detect "this item moved" or "this item was removed," rather than assuming everything after a change is brand new.

```jsx
{items.map((item) => (
  <ListItem key={item.id} data={item} />
))}
// React matches by item.id across renders, not by array position
```

---

## 12. Why are stable keys important?

A stable key stays the same for the same logical item across every render — like a database ID — rather than changing or being regenerated. If a key changes between renders even though it's conceptually "the same" item, React assumes the old element was removed and a brand-new one was added, discarding any state or DOM it had (focus, scroll position, an uncontrolled input's value) instead of reusing it.

---

## 13. Why can incorrect keys cause UI bugs?

Incorrect keys — array indexes on a reorderable list, or randomly generated keys on every render — break React's ability to correctly match old items to new ones. This can attach state to the wrong row after a reorder, show the wrong value in a form input, trigger animations on the wrong element, or cause unnecessary full re-mounts of components that should have simply moved.

```jsx
// Randomly generated on every render - React can NEVER match old to new correctly
{items.map((item) => (
  <ListItem key={Math.random()} data={item} />
))}
// Every single render, React thinks ALL items are brand new -
// remounting them, losing local state, and re-triggering mount animations.
```

---

## Interview Practice

Explain what happens here, step by step:

```jsx
const [count, setCount] = useState(0);

setCount(count + 1);
```

Walk through the full path from click → state update → render → DOM update, in your own words, without reciting a memorized script:

1. The click event fires and calls the handler.
2. `setCount(count + 1)` doesn't change anything immediately — it schedules a state update with React.
3. React re-runs the component function, this time with the new value returned from `useState`.
4. The function returns a new tree of React elements (a new Virtual DOM).
5. React diffs this new tree against the previous one (reconciliation) to find the minimal set of real changes.
6. React applies just those changes to the actual DOM — in this case, updating the text node showing the count.

Being able to walk through all six steps clearly, and explain *why* each one happens, is what interviewers are actually listening for — not just "it re-renders."
