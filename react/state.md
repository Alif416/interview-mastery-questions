# State

This is one of the most important React topics — most React interviews spend real time here, and the last few questions in particular trip people up in practice, not just in theory.

## 1. What is state?

State is data that a component owns and manages internally, which can change over time in response to user interaction, network responses, or other events — and when it changes, React re-renders the component to reflect the new value. Unlike a prop, which comes from outside, state is private to the component that declares it, unless it's deliberately shared via props or Context.

```jsx
function Counter() {
  const [count, setCount] = React.useState(0); // count is this component's own state
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

---

## 2. Why does React need state?

Without state, a component could only ever render the same output for the same props — there'd be no way to represent something changing over time from within the component itself (a form's current input, whether a menu is open, how many items are in a cart). State gives a component memory that persists between renders.

---

## 3. What is `useState`?

`useState` is a React Hook that lets a functional component declare a piece of state. It returns a pair: the current value, and a function to update it — calling that update function tells React to re-render the component with the new value.

```jsx
const [value, setValue] = React.useState(initialValue);
```

---

## 4. How does `useState` work under the hood?

React keeps a persistent internal list of state "slots" tied to each component instance. Every call to `useState` in that component claims the next slot in the list, in the exact same order on every render — which is exactly why Hooks can't be called conditionally: React relies on call order to know which state belongs to which `useState` call. Calling the setter updates that slot's value and schedules a re-render.

```jsx
function Form() {
  const [name, setName] = React.useState('');   // slot 1
  const [email, setEmail] = React.useState(''); // slot 2
  // React tracks these by call order, not by variable name
}
```

---

## 5. What's the difference between props and state?

Props are passed IN from a parent and are read-only from the receiving component's side — they only change when the parent re-renders and hands down new values. State is owned and managed BY the component itself, and the component can change it directly, via its setter, whenever it wants. Props flow down; state lives locally.

```jsx
function Child({ label }) {                    // label = prop, comes from the parent
  const [count, setCount] = React.useState(0);  // count = state, owned right here
  return <button onClick={() => setCount(count + 1)}>{label}: {count}</button>;
}
```

---

## 6. What causes a React component to re-render?

A component re-renders when its own state changes (via a state setter), when its props change (because its parent re-rendered and passed new values), or when a context it's subscribed to changes. In short: a re-render happens when something the component actually depends on has changed.

---

## 7. Why doesn't changing a normal variable cause a re-render?

A plain `let`/`const` variable only exists for the lifetime of a single function call — when the component function runs again on the next render, that variable is recreated from scratch at its initial value. React has no way of knowing a plain variable changed, and nothing about mutating it tells React "please re-render this component." Only calling a state setter (or receiving new props/context) triggers a re-render.

```jsx
function BrokenCounter() {
  let count = 0;
  return (
    <button onClick={() => { count++; console.log(count); }}>Count</button>
  );
  // count DOES change in the console log, but the UI never updates -
  // and count resets back to 0 at the start of every render anyway
}
```

---

## 8. What happens when state changes?

Calling a state setter schedules a re-render: React calls the component function again, this time `useState` returns the new value, and the function produces a new set of React elements. React compares (diffs) this new output against the previous render and applies only the minimal set of changes needed to the real DOM.

---

## 9. Can state updates happen immediately?

No — a state update isn't applied synchronously within the same function call. Calling the setter schedules an update; React processes it and re-renders on its own schedule (often batched together with other updates from the same event), which means any variable you already have in scope right after calling the setter still holds the OLD value until the next render actually happens.

```jsx
function Example() {
  const [count, setCount] = React.useState(0);
  function handleClick() {
    setCount(count + 1);
    console.log(count); // still logs the OLD value - the update hasn't applied yet
  }
  return <button onClick={handleClick}>{count}</button>;
}
```

---

## 10. Why can logging state right after updating it show the old value?

Because the `count` variable inside `handleClick` is a snapshot captured from that specific render's closure — calling `setCount` doesn't mutate that variable in place, it just tells React "please re-render with a new value next time." The current function call keeps executing with the value it already captured, so logging it immediately afterward still shows what `count` was when this render started, not the value it's about to become.

```jsx
function handleClick() {
  setCount(count + 1);
  console.log(count);                       // old value - this render's snapshot
  setTimeout(() => console.log(count), 0);   // still the OLD value too - same closure
}
```

---

## 11. Why should state not be mutated directly?

React partly decides whether to re-render by comparing whether the state VALUE changed — and for objects and arrays, that comparison is by reference, not a deep comparison. If you mutate an object or array in place, its reference never changes, so React can't tell anything actually happened, and it may skip re-rendering entirely even though the underlying data did change.

```jsx
function TodoList() {
  const [todos, setTodos] = React.useState([]);

  function addTodoWrong(text) {
    todos.push({ text }); // mutates in place - same array reference
    setTodos(todos);       // React sees the same reference - may not re-render at all!
  }

  function addTodoRight(text) {
    setTodos([...todos, { text }]); // new array reference - React detects the change
  }
}
```

---

## 12. What is a functional state update?

Instead of handing the setter a new value directly, you pass it a function that receives the PREVIOUS state and returns the new state. This guarantees the update is based on the most up-to-date value, rather than a value that might be stale in the current render's closure.

```jsx
setCount((prevCount) => prevCount + 1);
```

---

## 13. When should you use a functional update?

Use a functional update whenever the new state depends on the previous state — especially if you might call the setter more than once in a row, inside a loop, or inside an async callback where the "current" value already in scope could be stale by the time it actually runs.

```jsx
function handleClick() {
  setCount(count + 1); // uses the snapshot value from this render
  setCount(count + 1); // uses that SAME stale snapshot again - only +1 total, not +2!
}

function handleClickFixed() {
  setCount((prev) => prev + 1); // always builds on the latest value
  setCount((prev) => prev + 1); // sees the result of the update just above it - +2 total
}
```

---

## 14. What is batching?

Batching is when React groups multiple state updates that happen within the same event handler (or the same synchronous block of code) into a single re-render, instead of re-rendering once per individual setter call. This avoids wasted, redundant renders whenever several pieces of state change together in response to one event.

```jsx
function handleClick() {
  setCount((c) => c + 1);
  setFlag((f) => !f);
  // Even though there are 2 setter calls, React re-renders only ONCE,
  // after handleClick finishes - not twice.
}
```

---

## 15. How does React batch state updates?

React collects the state updates triggered during an event — and since React 18, during most async code too (timeouts, promises, etc., under "automatic batching") — into a queue, processes them together, and then performs a single re-render reflecting all the combined changes, instead of re-rendering after each individual setter call.

```jsx
// React 18+: batched even inside a promise callback (automatic batching)
fetch('/api/data').then(() => {
  setLoading(false);
  setData(result);
  // still just ONE re-render, not two, in React 18+
});
```

---

## 16. Why can multiple state updates behave unexpectedly?

Because every setter call inside the same render/event handler reads from the SAME stale snapshot of state, unless you use a functional update — so calling `setCount(count + 1)` twice in a row doesn't add 2, it applies "current + 1" twice and lands on current + 1 overall. Combine that with batching (updates don't apply until the whole handler finishes) and stale closures (variables captured at render time), and it's easy to assume state updates behave like ordinary synchronous variable assignments, when they really don't.

```jsx
function handleTripleClick() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
  // If count starts at 0, you might expect 3 - you actually get 1,
  // because all three reads see the same stale `count` from this render.
}
```

---

## Practice

Build each of these, using only `useState`:

- **Counter** — increment, decrement, and reset.
- **Todo list** — add, remove, and toggle items as complete.
- **Shopping cart** — add/remove items, plus a running total.
- **Like button** — toggles between liked/unliked, with a count.
- **Quantity selector** — a `+`/`-` stepper with a minimum of 1.

For each one, once it works, write out — in your own words — exactly what happens, step by step, from the click event to the updated UI: which function runs, what gets scheduled, and when the new value actually becomes visible. That explanation is the real point of the exercise, not just getting the UI working.
