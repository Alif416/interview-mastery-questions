# useRef

## 1. What is `useRef`?

`useRef` is a Hook that returns a mutable object with a single property, `.current`, which persists across renders without ever triggering a re-render when it changes. It's commonly used to hold a reference to a DOM element, or to store any value you need to keep around between renders without it being part of the rendering output.

```jsx
const ref = React.useRef(initialValue);
console.log(ref.current); // access or update this freely
```

---

## 2. How is `useRef` different from `useState`?

`useState` triggers a re-render whenever its value changes, and its value is meant to be reflected in what's rendered. `useRef`'s `.current` can be changed freely and does **not** trigger a re-render, and it's not meant to directly drive what's on screen — it's for values a component needs to remember, but that don't belong in the UI output itself.

```jsx
function Example() {
  const [state, setState] = React.useState(0);
  const ref = React.useRef(0);

  function handleClick() {
    setState(state + 1); // triggers a re-render
    ref.current += 1;    // does NOT trigger a re-render
  }

  return <button onClick={handleClick}>{state}</button>;
}
```

---

## 3. Does changing `ref.current` cause a re-render?

No. Mutating `.current` is completely invisible to React's rendering system — nothing about it schedules a re-render, and the component keeps rendering with whatever state/props changes actually happened. This is precisely why refs are the right tool for values that need to change without the UI needing to reflect that change immediately.

---

## 4. How do you access a DOM element using `useRef`?

Create a ref with `useRef(null)`, then pass it to a JSX element's `ref` attribute. After the component mounts, `ref.current` points to the actual DOM node, and you can call native DOM methods on it directly.

```jsx
function AutoFocusInput() {
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    inputRef.current.focus(); // real DOM method, called directly
  }, []);

  return <input ref={inputRef} />;
}
```

---

## 5. When should you use a ref?

Use a ref when you need to: directly access/manipulate a DOM node (focusing an input, measuring an element, scrolling), store a mutable value that shouldn't trigger a re-render when it changes (like a timer ID, or a previous value for comparison), or keep a value stable across renders without it participating in the render output at all.

---

## 6. When should you use state instead?

Use state whenever the value should affect what's rendered on screen — if the UI needs to visually update in response to a change, that change has to go through `useState` (or a similar Hook like `useReducer`), since only state changes trigger a re-render. If you find yourself reading `.current` inside JSX and expecting it to update the screen, that's a sign it should be state, not a ref.

---

## 7. How can refs store values between renders?

Because `useRef`'s object identity stays exactly the same across every render (React returns the same object every time), and mutating `.current` doesn't reset on re-render the way a local variable would — a ref is effectively a "box" that survives from one render to the next, letting you carry a value forward without React managing it as part of the component's rendering output.

```jsx
function usePrevious(value) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value; // store this render's value, for next render to read
  });
  return ref.current; // still holds the PREVIOUS render's value, since the effect above hasn't run yet
}
```

---

## 8. How can refs help with timers?

A `setInterval`/`setTimeout` ID needs to be remembered so it can later be cleared — but storing it in state would be wrong, since updating it doesn't need to (and shouldn't) trigger a re-render. A ref is the natural place to hold that ID between when the timer starts and when it needs to be cleared.

```jsx
function Stopwatch() {
  const [seconds, setSeconds] = React.useState(0);
  const intervalRef = React.useRef(null);

  function start() {
    intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  function stop() {
    clearInterval(intervalRef.current); // read the stored ID to clear it
  }

  return (
    <div>
      <p>{seconds}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

---

## 9. How can refs help prevent unnecessary effects?

Sometimes an effect needs to read a value's *current* state without wanting the effect to re-run every time that value changes — storing the value in a ref alongside a normal state variable lets the effect read `ref.current` (always up to date) without listing it as a dependency, avoiding extra effect re-runs that would happen if it were a `useState`/dependency instead.

```jsx
function useLatest(value) {
  const ref = React.useRef(value);
  ref.current = value; // always kept up to date, on every render
  return ref;
}

function Chat({ roomId, onMessage }) {
  const latestOnMessage = useLatest(onMessage);

  React.useEffect(() => {
    const socket = connect(roomId);
    socket.on('message', (msg) => latestOnMessage.current(msg)); // always the latest callback
    return () => socket.disconnect();
  }, [roomId]); // doesn't need onMessage in the dependency array, so it won't reconnect if onMessage changes
}
```

---

## Practice

Build:

- **Auto-focus input** — an input that's automatically focused as soon as the component mounts.
- **Stopwatch** — start/stop/reset, using a ref to hold the interval ID.
- **Previous-value tracker** — a component that displays both the current and the previous value of some state (build a small `usePrevious` hook like the one above to do it).
