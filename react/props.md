# Props

## 1. What are props?

Props are how a parent component passes data and configuration into a child component — similar to how arguments are passed into a function. A component receives its props as a single object and uses them to decide what to render.

```jsx
function PriceTag(props) {
  return <span>${props.amount}</span>;
}

<PriceTag amount={19.99} />
```

---

## 2. How do you pass props to a component?

Pass them as JSX attributes on the component's tag — each attribute becomes a key on the props object the component receives. String values can be written directly in quotes; any other JavaScript value (numbers, booleans, objects, arrays, functions) needs curly braces.

```jsx
<UserCard name="Alif" age={25} isActive={true} tags={['admin', 'staff']} />
```

---

## 3. How do you destructure props?

Instead of reading values off a single `props` object (`props.name`, `props.age`), you can destructure the specific fields you need directly in the function's parameter list. It's more concise, and it makes it immediately obvious what a component actually depends on.

```jsx
// Without destructuring
function UserCard(props) {
  return <p>{props.name} ({props.age})</p>;
}

// With destructuring - clearer about what this component uses
function UserCard({ name, age }) {
  return <p>{name} ({age})</p>;
}
```

---

## 4. Can props be modified by the component that receives them?

No — props should be treated as read-only inside the component that receives them. A component should never reassign or mutate its own props directly; if it needs a different value, it should compute a new local variable instead, or lift the change up to the parent via a callback prop.

```jsx
function Countdown({ seconds }) {
  seconds = seconds - 1; // don't reassign a prop
  return <p>{seconds}</p>;
}

// Better - derive a new local value instead
function Countdown({ seconds }) {
  const displaySeconds = Math.max(seconds - 1, 0);
  return <p>{displaySeconds}</p>;
}
```

---

## 5. How do you pass an object as a prop?

Wrap the object in curly braces — either inline or as a variable — and the child receives it as the value of that prop, accessing its fields normally.

```jsx
function Address({ location }) {
  return <p>{location.city}, {location.country}</p>;
}

<Address location={{ city: 'Dhaka', country: 'Bangladesh' }} />
```

---

## 6. How do you pass an array as a prop?

Same idea — pass the array inside curly braces. The child typically iterates over it with `.map()` to render each item.

```jsx
function TagList({ tags }) {
  return (
    <ul>
      {tags.map((tag) => <li key={tag}>{tag}</li>)}
    </ul>
  );
}

<TagList tags={['react', 'javascript', 'frontend']} />
```

---

## 7. How do you pass a function as a prop?

Pass a reference to the function — without calling it, so no parentheses — inside curly braces. The child can then call that function whenever it needs to, typically in response to an event.

```jsx
function SaveButton({ onSave }) {
  return <button onClick={onSave}>Save</button>;
}

<SaveButton onSave={() => console.log('Saved!')} />
```

---

## 8. Why would you pass a function to a child component?

Since props only ever flow downward, a function prop is how a child can communicate back UP to its parent — the child calls the function (often with some data) when something happens, and the parent's own logic decides what to do about it. This keeps the child reusable and "dumb" (it doesn't need to know what saving, deleting, or anything else actually involves) while the parent stays in control.

```jsx
function Parent() {
  function handleDelete(id) {
    console.log('Deleting item', id);
  }
  return <Item id={42} onDelete={handleDelete} />;
}

function Item({ id, onDelete }) {
  return <button onClick={() => onDelete(id)}>Delete</button>;
}
```

---

## 9. What are callback props?

A callback prop is specifically a function prop that a child calls to notify its parent that something happened — by convention usually named `onSomething` (`onClick`, `onSave`, `onDelete`). It's the standard pattern for child-to-parent communication in React.

```jsx
function SearchBox({ onSearch }) {
  const [query, setQuery] = React.useState('');
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
    />
  );
}
```

---

## 10. What is the `children` prop?

`children` is an implicit prop containing whatever content was placed between a component's opening and closing JSX tags. It lets a component wrap and render content without needing to know the shape of that content in advance.

```jsx
function Panel({ children }) {
  return <div className="panel">{children}</div>;
}

<Panel>
  <p>Any content can go here.</p>
</Panel>
```

---

## 11. What is component composition?

Composition means building UI by nesting and combining components — often passing components in via `children` — rather than making one component try to handle every possible configuration through an ever-growing pile of props. It's how React encourages reuse instead of relying on class inheritance.

```jsx
function Layout({ children }) {
  return (
    <div className="layout">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

<Layout>
  <Dashboard /> {/* composed inside Layout - Layout doesn't need to know what Dashboard is */}
</Layout>
```

---

## 12. How can props lead to prop drilling?

If a deeply nested component needs a piece of data, that data has to be passed as a prop through every component in between — even the ones that never use it themselves. As a component tree gets deeper, this "drilling" tightly couples intermediate components to data they don't actually care about, and makes the tree harder to refactor or reorganize.

```jsx
function App() {
  const theme = 'dark';
  return <Page theme={theme} />;
}
function Page({ theme }) {
  return <Content theme={theme} />; // just passing it through
}
function Content({ theme }) {
  return <div className={theme}>...</div>; // finally used here
}
```

---

## Practice

Build a reusable set of components, each configurable entirely through props:

- `<Button />` — label, variant (primary/secondary/danger), `onClick`, disabled state.
- `<Modal />` — open/closed, a title, and arbitrary content via `children`.
- `<Card />` — a generic container that accepts `children` and optional styling props.
- `<Input />` — value, `onChange`, placeholder, and an error message prop.
- `<Table />` — columns and rows passed in as data, rendered generically.

For each one, resist the urge to hardcode anything specific to a single use case — if you find yourself wanting to special-case something, that's usually a sign it should be a new prop instead.
