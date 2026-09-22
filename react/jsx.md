# JSX

## 1. What is JSX?

JSX is a syntax extension for JavaScript that lets you write markup-like code directly inside your JS files to describe what a piece of UI should look like. It compiles into regular JavaScript before it ever runs in the browser.

```jsx
const heading = <h1>Hello, JSX</h1>;
```

---

## 2. Can browsers understand JSX directly?

No. Browsers only understand plain JavaScript — JSX has to be compiled (transpiled) into regular JS function calls by a build tool like Babel (or the TypeScript compiler) as part of the build step, before the code ever reaches the browser.

```jsx
// This is what you write, in a .jsx file:
const el = <p>Hi</p>;

// This is roughly what the browser actually receives, after compiling:
const el = React.createElement('p', null, 'Hi');
```

---

## 3. What does JSX compile into?

JSX compiles into calls that create React elements — historically `React.createElement(type, props, ...children)`, or with the modern "automatic" JSX runtime, calls to a `jsx()`/`jsxs()` helper the build tool imports for you automatically. Either way, the result is a plain JavaScript object describing the UI, not markup.

```jsx
<div className="box">Hello</div>

// compiles to (classic runtime):
React.createElement('div', { className: 'box' }, 'Hello')
```

---

## 4. Why must JSX return a single parent element?

A component's return value has to be a single expression, and element creation only describes one root node at a time — the same way a JavaScript function can't `return a, b;` as two separate values. You can't return two sibling elements side by side without something to wrap them; wrapping everything in one parent element (or a Fragment) satisfies that "single expression" requirement.

```jsx
// Invalid - two sibling root elements, won't compile
function Broken() {
  return (
    <h1>Title</h1>
    <p>Text</p>
  );
}

// Valid - wrapped in one parent
function Fixed() {
  return (
    <div>
      <h1>Title</h1>
      <p>Text</p>
    </div>
  );
}
```

---

## 5. What are React Fragments?

A Fragment (`<>...</>`, or explicitly `<React.Fragment>...</React.Fragment>`) lets you group multiple elements together to satisfy JSX's "single parent" rule, without adding an actual extra DOM node — like a wrapper `<div>` — to the rendered output. It's especially useful when an extra wrapper element would interfere with your CSS layout (flex/grid siblings, table rows, etc.).

```jsx
function Row() {
  return (
    <>
      <td>Name</td>
      <td>Age</td>
    </>
  );
  // No extra wrapping <div> in the actual DOM output - just the two <td>s
}
```

---

## 6. What's the difference between `class` and `className`?

In HTML, you set an element's CSS class with the `class` attribute. In JSX, you use `className` instead, because `class` is a reserved word in JavaScript (used to define classes) — JSX attributes ultimately become JavaScript object keys, so `class` can't be used directly as one.

```jsx
// HTML: <div class="card"></div>

// JSX:
<div className="card"></div>
```

---

## 7. How do you embed JavaScript expressions inside JSX?

Wrap any JavaScript expression in curly braces `{}` inside JSX. This can be a variable, a function call, a ternary, arithmetic, or anything else that evaluates to a value — but it has to be an expression, not a statement, so `if`, `for`, and variable declarations can't go directly inside `{}`.

```jsx
function Greeting({ name }) {
  const hour = new Date().getHours();
  return (
    <p>
      {hour < 12 ? 'Good morning' : 'Good afternoon'}, {name.toUpperCase()}!
    </p>
  );
}
```

---

## 8. How do conditional expressions work in JSX?

Since JSX only allows expressions inside `{}` — not statements like `if` — conditional rendering is done with things that evaluate to a value: ternaries (`condition ? a : b`), logical AND (`condition && element`), or by computing a value before the `return` and referencing that variable in the JSX.

```jsx
function StatusBadge({ isOnline }) {
  return <span>{isOnline ? '🟢 Online' : '⚪ Offline'}</span>;
}
```

---

## 9. What's the difference between `{condition && <Component />}` and a ternary?

`condition && <Component />` renders the component only when `condition` is truthy, and renders nothing meaningful otherwise — there's no explicit "else" branch. A ternary (`condition ? <A /> : <B />`) always has both a true AND a false branch, which makes it the right tool when you need to render something different (not just nothing) in the falsy case.

```jsx
// && - render, or render nothing
{hasError && <ErrorMessage />}

// ternary - render one of two things
{isLoading ? <Spinner /> : <Content />}

// Gotcha: with &&, a falsy NUMBER (like 0) gets rendered literally as "0"
{itemCount && <p>{itemCount} items</p>}     // renders the text "0" if itemCount is 0!
{itemCount > 0 && <p>{itemCount} items</p>} // safer - always a real boolean
```

---

## 10. How do you render a list of items from an array?

Use `.map()` to transform an array of data into an array of JSX elements, then embed that resulting array directly inside `{}` in your JSX — React renders each element in order.

```jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

---

## 11. Why are keys needed when rendering lists?

Keys give React a stable identity for each item in a list, so it can tell which items were added, removed, or reordered between renders — instead of having to guess by comparing lists position by position. Without stable keys, React may re-render more than it needs to, or even mix up state between list items, when the list changes.

```jsx
{todos.map((todo) => (
  <li key={todo.id}>{todo.text}</li> // todo.id is stable and unique - a good key
))}
```

---

## 12. What happens if you use array indexes as keys?

Using the index works fine for a static list that never reorders, has items inserted/removed from the middle, or gets filtered — but if the list DOES change shape, React can misattribute state to the wrong item, since the "identity" of index `2` silently shifts to a different piece of data. That can cause bugs like a typed input value ending up on the wrong row after a reorder, or component state leaking between items.

```jsx
// Risky if the list can reorder/filter/insert in the middle
{todos.map((todo, index) => (
  <li key={index}>{todo.text}</li>
))}

// If todos = ['A', 'B', 'C'] becomes ['B', 'C'] (removed 'A'),
// index-based keys make React think item 0 changed from 'A' to 'B'
// (rather than 'A' being removed) - any state tied to that list item
// (like an open/closed toggle) can end up attached to the wrong row.
```

---

## Practice

Build these using conditional rendering (no library needed — just JSX and state):

- **Product list** — render a list of products from an array, each with a name and price.
- **Empty state** — what renders when the product list is empty.
- **Loading state** — what renders while data is "loading" (simulate with a boolean or a timeout).
- **Error state** — what renders if fetching the products "failed" (simulate with a boolean).

Try wiring all four into a single component that switches between them based on one `status` value (`'loading' | 'error' | 'empty' | 'success'`), instead of juggling several separate booleans.
