# React Fundamentals

## 1. What is React?

React is a JavaScript library (not a full framework) for building user interfaces, created and maintained by Meta. It lets you describe what a UI should look like for a given piece of data, and it takes care of updating the actual browser DOM to match. It's most commonly used to build single-page applications out of small, reusable components.

```jsx
function Greeting() {
  return <h1>Hello, React!</h1>;
}
```

---

## 2. What problem does React solve?

Before component-based libraries like React, large UIs were often built by manually finding DOM nodes and updating them step by step (classic jQuery-style code). As an app grew, it became easy for the DOM to drift out of sync with the app's actual data, and there was no consistent way to structure or reuse pieces of UI. React solves this by treating the UI as a function of state — you describe what it should look like, and React figures out how to update the real DOM to match.

```jsx
// Without React - imperative, manual DOM updates
const button = document.createElement('button');
button.textContent = 'Clicked 0 times';
let count = 0;
button.addEventListener('click', () => {
  count++;
  button.textContent = `Clicked ${count} times`; // must remember to sync this by hand
});

// With React - declarative, React keeps the DOM in sync for you
function Counter() {
  const [count, setCount] = React.useState(0);
  return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>;
}
```

---

## 3. Why was React created?

React was built internally at Facebook to deal with real problems maintaining a large, constantly-changing UI (the News Feed), where ad hoc DOM manipulation was becoming a major source of bugs. It was open-sourced in 2013. Its core ideas — a component model, a virtual DOM, and one-way data flow — were designed specifically to make large, dynamic interfaces easier to reason about and update efficiently.

---

## 4. What is a component in React?

A component is a self-contained, reusable piece of UI — typically a JavaScript function that accepts inputs (props) and returns what should be rendered. Components can be composed together like building blocks to construct an entire application, and each one can manage its own internal state.

```jsx
function Welcome({ name }) {
  return <p>Welcome, {name}!</p>;
}

function App() {
  return (
    <div>
      <Welcome name="Alif" />
      <Welcome name="Sara" />
    </div>
  );
}
```

---

## 5. What is JSX?

JSX (JavaScript XML) is a syntax extension for JavaScript that lets you write HTML-like markup directly inside your JavaScript code. It isn't valid plain JavaScript or HTML on its own — a build tool (usually Babel) compiles it into regular JavaScript before it ever reaches the browser.

```jsx
const element = <h1 className="title">Hello, world</h1>;
```

---

## 6. Why does React use JSX instead of plain JavaScript?

Describing UI structure with nested function calls (`React.createElement(...)`) gets verbose and hard to read quickly, especially for deeply nested markup. JSX lets you write UI in a familiar, HTML-like shape while still having the full power of JavaScript available inside `{}` — expressions, loops, conditionals, function calls. It's technically optional (React works without it), but it's used almost universally because it's dramatically more readable.

```jsx
// With JSX
const element = <h1>Hello</h1>;

// Without JSX - what it compiles down to
const element = React.createElement('h1', null, 'Hello');
```

---

## 7. Is JSX the same as HTML?

No. JSX looks similar to HTML but has real differences: attributes are camelCase (`className` instead of `class`, `onClick` instead of `onclick`), every tag must be explicitly closed (`<img />`, not `<img>`), and you can embed live JavaScript expressions inside `{}`. Under the hood it isn't markup at all — it compiles into JavaScript function calls, not into an HTML string.

```jsx
// HTML: <label class="label" for="name"></label>

// JSX equivalent:
<label className="label" htmlFor="name"></label>
```

---

## 8. How does JSX get converted into JavaScript under the hood?

A compiler — Babel, or the TypeScript compiler — transforms JSX syntax into `React.createElement()` calls (or, with the modern automatic JSX runtime, into calls to an auto-imported `jsx()` helper) as part of the build step. The browser never sees JSX at all; it only ever runs the plain JavaScript that comes out the other end.

```jsx
// You write:
const element = <h1 className="title">Hello</h1>;

// Babel compiles it to:
const element = React.createElement('h1', { className: 'title' }, 'Hello');
```

---

## 9. What is a React element?

A React element is a plain, immutable JavaScript object describing what should appear on screen — a type (like `'div'` or a component), its props, and its children. It is not an actual DOM node; it's a lightweight description that React uses to work out what the real DOM should look like. JSX (or `React.createElement()`) is how you create one.

```jsx
const element = <h1>Hello</h1>;
// roughly equivalent to: { type: 'h1', props: { children: 'Hello' } }

console.log(typeof element); // "object"
```

---

## 10. What's the difference between a React element and a React component?

An element is a plain object describing a piece of UI at one moment — cheap to create, and immutable once made. A component is a function (or class) that, when called, returns element(s) — it's the blueprint, not the description itself. You render a component; the component's body returns the elements.

```jsx
// Welcome is a COMPONENT (a function)
function Welcome() {
  return <h1>Hello</h1>; // <h1>Hello</h1> is an ELEMENT
}

const element = <Welcome />; // this is also an element - "render Welcome here"
```

---

## 11. What is declarative UI?

Declarative UI means describing WHAT the interface should look like for a given state, rather than writing step-by-step instructions for HOW to get there. React re-runs the description whenever state changes and works out the necessary DOM updates itself — you never manually say "find this element and change its text."

```jsx
function Status({ isOnline }) {
  return <p>{isOnline ? 'Online' : 'Offline'}</p>;
}
```

---

## 12. What's the difference between declarative and imperative programming?

Imperative code spells out the exact sequence of steps needed to reach a result ("find this DOM node, then change its text, then add this class"). Declarative code describes the desired end result and lets something else — React, a SQL query planner, CSS — figure out the steps to get there. React fully embraces declarative UI: you describe what each state should look like, not how to transition between states.

```jsx
// Imperative
const el = document.getElementById('msg');
el.textContent = 'Hello';
el.classList.add('visible');

// Declarative (React)
function Message() {
  return <p className="visible">Hello</p>;
}
```

---

## 13. What is one-way data flow in React?

Data in React flows in a single direction: from parent components down to their children, via props. A child never directly reaches back up to modify a parent's data — if a child needs to trigger a change, the parent passes it a function to call instead. This makes it far easier to trace where data comes from and predict how a change will ripple through the app, compared to two-way binding where data can flow (and be mutated) in either direction.

```jsx
function Parent() {
  const [count, setCount] = React.useState(0);
  return <Child count={count} onIncrement={() => setCount(count + 1)} />;
}

function Child({ count, onIncrement }) {
  // count flows down; onIncrement is how Child asks Parent to change it
  return <button onClick={onIncrement}>Count: {count}</button>;
}
```

---

## 14. Why should components be reusable?

Reusable components avoid duplicating UI markup and logic throughout an app — one `<Button />` or `<Card />` can be used dozens of times with different props instead of copy-pasting similar code everywhere. That keeps the codebase easier to maintain (fix a bug or tweak a style once, in one place) and keeps the UI visually consistent across the app.

```jsx
function Button({ label, onClick, variant = 'primary' }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}

// Reused with different props, no duplicated markup
<Button label="Save" onClick={handleSave} />
<Button label="Delete" onClick={handleDelete} variant="danger" />
```

---

## 15. What makes a good React component?

A good component generally does one thing well (single responsibility), exposes a clear and minimal set of props, doesn't mix unrelated concerns (fetching data, running business logic, and rendering complex markup all crammed into one place), is predictable (same props/state always produce the same output), and stays small enough to read and understand at a glance. If a component is hard to name clearly in a few words, that's often a sign it's doing too much.

```jsx
// Hard to reuse or reason about - mixes fetching, formatting, and rendering
function UserProfileMess({ userId }) {
  const [user, setUser] = React.useState(null);
  React.useEffect(() => {
    fetch(`/api/users/${userId}`).then((r) => r.json()).then(setUser);
  }, [userId]);
  if (!user) return <p>Loading...</p>;
  return <div>{user.name.toUpperCase()} — {new Date(user.joined).toDateString()}</div>;
}

// Better - a small, focused, reusable presentational component
function UserCard({ name, joinedDate }) {
  return <div>{name} — {joinedDate}</div>;
}
```

---

## Practice

Build each of these from scratch, without copying an existing tutorial — the point is to practice turning a requirement into a component on your own:

- **Profile** — a card showing a name, avatar, and short bio.
- **Navbar** — a horizontal navigation bar with a logo and a few links.
- **Button** — a reusable button that accepts a label and an `onClick` handler.
- **Card** — a generic container component that other content can be placed inside.
- **ProductCard** — an image, title, price, and an "Add to cart" button.
- **Footer** — a simple page footer with copyright text and links.

As you build each one, ask yourself: what should be a prop? What's hardcoded versus configurable? Would this component still make sense if it were reused somewhere else in the app?
