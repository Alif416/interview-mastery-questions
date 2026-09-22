# Advanced React

Once everything in the earlier topics is comfortable, this is what separates "knows React" from "understands how React actually works."

## 1. What is Fiber?

Fiber is React's internal reconciliation engine (since React 16) — a reimplementation that represents the component tree as a linked structure of "fiber" units of work, which lets React pause, resume, abort, or reprioritize rendering work incrementally, instead of having to walk the whole tree synchronously in one uninterruptible pass like the older "stack reconciler" did. It's the foundation that makes concurrent rendering possible.

---

## 2. What is reconciliation?

Reconciliation is the process of comparing the newly rendered tree against the previous one to determine the minimal set of real DOM changes needed. *(Covered at the mechanics level in [Rendering & Re-rendering](/react/rendering).)* What Fiber adds is that this comparison work can now be split into small units and interleaved with other work — including pausing to let the browser handle something more urgent, like user input — rather than being one long uninterruptible block.

---

## 3. How does React prioritize updates?

Not all updates are equally urgent — a keystroke should feel instant, while a large list re-filtering in response to that keystroke can tolerate a few extra milliseconds. Fiber assigns updates different priority levels, and React can work on higher-priority updates first, pausing lower-priority ones (and even discarding and redoing stale in-progress work if something more urgent shows up) rather than processing everything strictly in the order it was requested.

---

## 4. What is concurrent rendering?

Concurrent rendering is React's ability to prepare multiple versions of the UI at once, and to interrupt, pause, or abandon a render in progress in favor of something more urgent — rather than every render being an uninterruptible, all-or-nothing unit of work that must finish before anything else can happen. It's an opt-in capability (enabled via APIs like `createRoot`) that features like transitions and Suspense are built on top of.

---

## 5. What are transitions?

A transition marks a state update as "not urgent" — allowed to render in the background and potentially be interrupted by more urgent updates (like the next keystroke), instead of blocking the UI until it finishes. It's how you tell React "this update can take its time."

---

## 6. What is `useTransition`?

`useTransition` gives you a function to wrap a non-urgent state update in, plus an `isPending` flag to show loading feedback while that update is in progress — letting urgent updates (like the input reflecting what was just typed) stay responsive while a more expensive update happens in the background.

```jsx
function SearchPage() {
  const [query, setQuery] = React.useState('');
  const [isPending, startTransition] = React.useTransition();

  function handleChange(e) {
    setQuery(e.target.value); // urgent - updates immediately
    startTransition(() => {
      setResults(search(e.target.value)); // non-urgent - can be interrupted/deferred
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
    </>
  );
}
```

---

## 7. What is `useDeferredValue`?

`useDeferredValue` gives you a "lagging" copy of a value that updates a moment later than the real one, letting an expensive part of the UI (that depends on that value) stay slightly behind and non-blocking, while the rest of the UI updates immediately. It's similar in spirit to `useTransition`, but for a value you're given rather than an update you're triggering yourself.

```jsx
function SearchResults({ query }) {
  const deferredQuery = React.useDeferredValue(query);
  const results = useExpensiveSearch(deferredQuery); // can lag slightly behind `query`
  return <ResultsList results={results} />;
}
```

---

## 8. What is Suspense?

Suspense lets a component "pause" rendering while it's waiting on something asynchronous (data, a lazily-loaded component), showing a fallback UI in the meantime instead of rendering an incomplete or broken result. `React.lazy()` for code-splitting is the most common built-in use; data-fetching libraries can integrate with Suspense too.

```jsx
<React.Suspense fallback={<Spinner />}>
  <ProfilePage /> {/* shows the Spinner until ProfilePage is ready */}
</React.Suspense>
```

---

## 9. What is server-side rendering?

Server-side rendering (SSR) generates the initial HTML for a page on the server (rather than an empty `<div id="root">` that JavaScript fills in after loading), sending fully-formed markup to the browser. This gets meaningful content on screen faster and improves SEO, since crawlers see real content immediately instead of an empty shell.

---

## 10. What is hydration?

Hydration is the process of taking server-rendered HTML that's already on the page and "attaching" React to it on the client — reusing the existing DOM nodes and wiring up event listeners and state, rather than throwing away the server-rendered markup and re-rendering everything from scratch.

---

## 11. What is selective hydration?

Selective hydration lets different parts of a page hydrate independently and in priority order — a part of the page a user is actively interacting with can hydrate first, even if other parts (wrapped in `Suspense`) are still loading their data or code — instead of the entire page being blocked until everything is ready to hydrate all at once.

---

## 12. What are Server Components?

Server Components are components that render entirely on the server and never ship their code to the client at all — no JavaScript bundle for them, no client-side re-rendering. They're well suited to things like fetching data directly from a database and rendering static-ish content, while interactive parts of the page remain ordinary ("Client") components that do run in the browser.

---

## 13. What are Error Boundaries?

An Error Boundary is a component that catches JavaScript errors thrown anywhere in its child component tree during rendering, and renders a fallback UI instead of letting the error crash the entire app. They're implemented as class components (there's no Hook equivalent as of now) using specific lifecycle methods.

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return <p>Something went wrong.</p>;
    return this.props.children;
  }
}

<ErrorBoundary>
  <RiskyComponent />
</ErrorBoundary>
```

---

## 14. What are portals?

A portal renders a component's children into a different DOM node than where the component itself sits in the React tree — useful for things like modals and tooltips that need to visually escape a parent's `overflow: hidden` or `z-index` stacking context, while still behaving like a normal part of the React tree (event bubbling, context, etc. all still work as expected).

```jsx
function Modal({ children }) {
  return ReactDOM.createPortal(
    children,
    document.getElementById('modal-root') // renders here in the DOM, not inline
  );
}
```

---

## 15. What is `useId`?

`useId` generates a unique, stable ID for accessibility attributes (like linking a `<label>` to an `<input>` via `htmlFor`/`id`) that's guaranteed to be consistent between server-rendered HTML and the client's hydration — something a hand-rolled `Math.random()`-based ID can't guarantee, since the server and client would generate different random values.

```jsx
function LabeledInput({ label }) {
  const id = React.useId();
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  );
}
```

---

## 16. What are refs and imperative handles?

A ref, as covered in `useRef`, lets you hold a reference to a DOM node or a mutable value. An "imperative handle" extends this idea to components: instead of exposing a raw DOM node through a ref, a component can expose a *custom* set of methods for a parent to call imperatively — useful for things like a custom `<Input>` component that exposes just a `.focus()` method, without exposing its entire internal DOM structure.

---

## 17. What is `forwardRef`?

By default, a `ref` passed to a custom component doesn't automatically attach to anything inside it — function components don't receive `ref` as a normal prop. `forwardRef` lets a component explicitly accept a ref from its parent and forward it to a specific DOM node (or expose an imperative handle) inside itself.

```jsx
const FancyInput = React.forwardRef(function FancyInput(props, ref) {
  return <input ref={ref} className="fancy" {...props} />;
});

function Parent() {
  const inputRef = React.useRef(null);
  React.useEffect(() => inputRef.current.focus(), []);
  return <FancyInput ref={inputRef} />; // ref reaches the actual <input> inside FancyInput
}
```
