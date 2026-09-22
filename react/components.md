# Components

*Note: the original list had two near-identical questions ("What are children props?" and "What is the children prop?") — they've been merged into one below rather than answering the same thing twice.*

## 1. What is a functional component?

A functional component is a JavaScript function that accepts props as its argument and returns JSX describing what should render. Since React 16.8 introduced Hooks, functional components can also hold state and run side effects, which is why they're now the standard way to write React components (class components are largely legacy at this point).

```jsx
function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// Equivalent, with destructuring
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```

---

## 2. What is a component tree?

A component tree is the hierarchical structure formed when components render other components — a parent containing children, which may themselves contain children, and so on. It mirrors the shape of the JSX you write, and it's what React walks through when rendering and reconciling updates.

```jsx
function App() {
  return (
    <Layout>
      <Header />
      <Main>
        <Sidebar />
        <Content />
      </Main>
    </Layout>
  );
}
// Tree: App -> Layout -> [Header, Main -> [Sidebar, Content]]
```

---

## 3. What are props?

Props ("properties") are the inputs a component receives from its parent — similar to arguments passed into a function. They're how a parent configures a child's behavior and appearance, and they can be any JavaScript value: strings, numbers, objects, arrays, or even functions.

```jsx
function Badge({ label, color }) {
  return <span style={{ color }}>{label}</span>;
}

<Badge label="New" color="green" />
```

---

## 4. How does a parent communicate with a child?

A parent communicates with a child by passing data down as props. The child receives whatever the parent gives it and renders based on that — it has no way to reach back "up" and read or change the parent's own variables directly.

```jsx
function Parent() {
  const message = 'Hi from parent';
  return <Child text={message} />;
}

function Child({ text }) {
  return <p>{text}</p>;
}
```

---

## 5. How does a child communicate with a parent?

A child can't directly change a parent's state, so instead the parent hands it a callback function as a prop, and the child calls that function (usually with some data) when something happens. Data still only ever flows one way — down — but this lets a child trigger a change in its parent.

```jsx
function Parent() {
  function handleChildClick(message) {
    console.log('Child said:', message);
  }
  return <Child onNotify={handleChildClick} />;
}

function Child({ onNotify }) {
  return <button onClick={() => onNotify('Hello, Parent!')}>Click me</button>;
}
```

---

## 6. Why are props read-only?

Props are read-only from the receiving component's point of view because they belong to the parent — the parent owns and controls that value. If a child could freely change its own props, the parent's data could change without the parent ever knowing, making the app's data flow unpredictable and hard to debug. Treating props as read-only is exactly what makes React's one-way data flow reliable.

```jsx
function Child({ count }) {
  count = count + 1; // don't reassign a prop directly
  return <p>{count}</p>;
}

// Better - compute a new local value instead
function Child({ count }) {
  const displayCount = count + 1; // fine - a new value, the prop itself is untouched
  return <p>{displayCount}</p>;
}
```

---

## 7. What happens if you mutate props directly?

Mutating a prop in place — especially an object or array, which is passed by reference — can silently corrupt the parent's own state, since the child is holding a reference to the exact same data the parent owns. React won't necessarily throw an error, but it breaks the predictability of one-way data flow, can cause the UI to get out of sync (React often detects changes by reference comparison, so an in-place mutation may not even trigger a re-render), and makes bugs very difficult to trace back to their source.

```jsx
function TodoList({ todos }) {
  todos.push({ id: 4, text: 'New' }); // mutates the PARENT's array in place - bad
  return <ul>{todos.map((t) => <li key={t.id}>{t.text}</li>)}</ul>;
}

// Correct - create a new array and let the parent own the update
function TodoList({ todos, onAdd }) {
  function addTodo() {
    onAdd([...todos, { id: 4, text: 'New' }]);
  }
  return <button onClick={addTodo}>Add</button>;
}
```

---

## 8. What is the `children` prop?

`children` is a special, automatically-supplied prop containing whatever JSX is nested between a component's opening and closing tags. It lets a component render arbitrary content handed to it by its parent, without needing to know ahead of time what that content will actually be — this is the foundation of component composition.

```jsx
function Card({ children }) {
  return <div className="card">{children}</div>;
}

<Card>
  <h2>Title</h2>
  <p>Some content goes here.</p>
</Card>
// Card's `children` prop is: <h2>Title</h2><p>Some content...</p>
```

---

## 9. What is component composition?

Composition means building complex UIs by combining small, focused components together — often by passing components in as `children` — rather than building one giant, heavily-configurable component with dozens of props and flags. It's React's preferred alternative to inheritance for sharing and combining behavior.

```jsx
function Modal({ children }) {
  return (
    <div className="modal-overlay">
      <div className="modal">{children}</div>
    </div>
  );
}

function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <Modal>
      <p>Are you sure?</p>
      <button onClick={onConfirm}>Yes</button>
      <button onClick={onCancel}>No</button>
    </Modal>
  );
}
// ConfirmDialog is built by composing Modal with its own content,
// not by configuring Modal with a pile of extra props.
```

---

## 10. What is prop drilling?

Prop drilling is passing a prop down through several layers of components that don't actually use it themselves, purely to get it to a deeply nested component that does. It couples the intermediate components to data they don't care about, and makes the tree harder to refactor.

```jsx
function App() {
  const user = { name: 'Alif' };
  return <Page user={user} />;
}
function Page({ user }) {
  return <Sidebar user={user} />; // Page doesn't use `user`, just forwards it
}
function Sidebar({ user }) {
  return <Profile user={user} />; // Sidebar doesn't use it either
}
function Profile({ user }) {
  return <p>{user.name}</p>; // finally used, 3 levels down
}
```

---

## 11. How can prop drilling be solved?

A few common options: React Context (lets a deeply nested component read a value directly, without every component in between having to pass it along), component composition (passing already-rendered components as `children`, so intermediate layers don't need to know about the data at all), or an external state management library (Redux, Zustand) for state that many unrelated parts of the tree need.

```jsx
const UserContext = React.createContext(null);

function App() {
  const user = { name: 'Alif' };
  return (
    <UserContext.Provider value={user}>
      <Page />
    </UserContext.Provider>
  );
}
function Page() { return <Sidebar />; }
function Sidebar() { return <Profile />; }
function Profile() {
  const user = React.useContext(UserContext); // reads directly, no drilling
  return <p>{user.name}</p>;
}
```

---

## 12. When should you split a component into smaller ones?

Consider splitting when a component is handling more than one clear responsibility, a chunk of its JSX is repeated (or could be reused elsewhere), a piece of the UI has its own independent state or logic, or the component has simply become hard to read at a glance. Splitting should make the code easier to understand and reuse — not just create files for the sake of it.

```jsx
// Before: one component doing too much
function Dashboard() {
  return (
    <div>
      <div className="stats">{/* 20 lines of stats markup */}</div>
      <div className="chart">{/* 30 lines of chart markup */}</div>
    </div>
  );
}

// After: split into focused pieces
function Dashboard() {
  return (
    <div>
      <StatsPanel />
      <RevenueChart />
    </div>
  );
}
```

---

## 13. What makes a component "too large"?

There's no strict line-count rule, but common warning signs include: it's hard to describe what the component does in one sentence, it mixes concerns (data fetching, business logic, and complex rendering all in the same place), it juggles many unrelated pieces of state, or a small change requires scrolling through a lot of unrelated code to find the right spot. If a component is clearly doing several distinct jobs at once, that's usually a sign it should be split.

```jsx
// A "too large" component - fetching, validating, formatting, AND rendering, all in one place
function OrderPageDoesEverything() {
  // 15 lines of fetching logic
  // 20 lines of validation logic
  // 10 lines of formatting helpers
  // 60 lines of JSX
  // ...all in one function
}
```

---

## Practice

Build this exact structure:

```
App
 ├── Navbar
 ├── Sidebar
 └── Dashboard
      ├── StatsCard
      ├── Chart
      └── RecentTransactions
```

Then, for each component, write down (in comments or a short note) what data it needs, whether that data should be a prop or local state, and which component should actually own it. This is the real exercise — the component tree itself is easy to build; deciding where each piece of data belongs is the skill that matters.
