# Events

## 1. How does event handling work in React?

You attach event handlers directly in JSX using camelCase props like `onClick` or `onChange`, passing a function reference. React doesn't attach these listeners individually to each DOM node the way vanilla JS does — it registers a single listener at the root of the app and works out which component's handler to call based on where the event originated, which keeps things efficient even with many interactive elements on the page.

```jsx
function Button() {
  function handleClick() {
    console.log('Clicked!');
  }
  return <button onClick={handleClick}>Click me</button>;
}
```

---

## 2. What is a Synthetic Event?

A Synthetic Event is React's own wrapper around the browser's native event object. It normalizes behavior across different browsers so your event-handling code works consistently everywhere, while still exposing familiar methods like `preventDefault()` and `stopPropagation()`, and giving you access to the underlying native event via `event.nativeEvent` if you ever need it directly.

```jsx
function Input() {
  function handleChange(event) {
    console.log(event.target.value); // event here is a SyntheticEvent
  }
  return <input onChange={handleChange} />;
}
```

---

## 3. How do you handle click events?

Pass a function to the `onClick` prop on the element you want to react to clicks on. The function receives the event object as its argument if you need details about the click.

```jsx
function LikeButton() {
  const [liked, setLiked] = React.useState(false);
  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? '❤️ Liked' : '🤍 Like'}
    </button>
  );
}
```

---

## 4. How do you handle input events?

Use `onChange` on the input, reading the new value off `event.target.value` (or `event.target.checked` for checkboxes). This is the foundation of controlled inputs, covered in more depth in the Forms topic.

```jsx
function NameInput() {
  const [name, setName] = React.useState('');
  return (
    <input
      value={name}
      onChange={(event) => setName(event.target.value)}
    />
  );
}
```

---

## 5. What is event bubbling?

Event bubbling is the browser behavior where an event triggered on a nested element also fires on each of its ancestor elements, moving upward through the DOM tree — a click on a button inside a `<div>` triggers the button's click handler, then the div's, then the div's parent, and so on. React's event system follows this same bubbling behavior.

```jsx
function App() {
  return (
    <div onClick={() => console.log('div clicked')}>
      <button onClick={() => console.log('button clicked')}>Click</button>
    </div>
  );
}
// Clicking the button logs: "button clicked" THEN "div clicked" (bubbles upward)
```

---

## 6. What is event propagation?

Event propagation is the general term for how an event travels through the DOM — it has two phases: **capturing** (top-down, from the root toward the target) and **bubbling** (bottom-up, from the target back toward the root). Most event handlers, including React's by default, listen during the bubbling phase.

---

## 7. What is `preventDefault()`?

`preventDefault()` stops the browser's default behavior for an event from happening — like a form actually submitting and reloading the page, or a link actually navigating. You call it on the event object inside your handler when you want to handle something yourself instead of letting the browser's built-in behavior run.

```jsx
function Form() {
  function handleSubmit(event) {
    event.preventDefault(); // stop the page from reloading
    console.log('Handled manually instead');
  }
  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

---

## 8. What is `stopPropagation()`?

`stopPropagation()` stops an event from continuing to bubble (or capture) up to ancestor elements, so their handlers never get called for this particular event. It's useful when a nested interactive element (like a delete button inside a clickable card) shouldn't also trigger the outer element's click handler.

```jsx
function Card({ onCardClick, onDelete }) {
  return (
    <div onClick={onCardClick}>
      <button
        onClick={(event) => {
          event.stopPropagation(); // don't let this click also trigger onCardClick
          onDelete();
        }}
      >
        Delete
      </button>
    </div>
  );
}
```

---

## 9. Why shouldn't you call a function immediately in an event handler?

```jsx
onClick={handleClick}
// vs
onClick={handleClick()}
```

`onClick={handleClick}` passes a *reference* to the function — React will call it later, exactly when the click happens. `onClick={handleClick()}` actually **calls** `handleClick` immediately, during render, and then uses whatever it *returns* as the `onClick` value. If `handleClick` doesn't return a function, clicking does nothing (or throws), and worse, `handleClick()` runs on every single render — not on click — which can trigger the function's side effects (like a state update) at the wrong time, potentially causing an infinite render loop.

```jsx
function Counter() {
  const [count, setCount] = React.useState(0);

  function increment() {
    setCount(count + 1);
  }

  // Correct - passes a reference, called only when clicked
  return <button onClick={increment}>{count}</button>;

  // Wrong - calls increment() immediately during render,
  // which calls setCount, which triggers another render, which calls increment() again... infinite loop
  // return <button onClick={increment()}>{count}</button>;

  // If you need to pass an argument, wrap it in an inline arrow function instead:
  // <button onClick={() => setCount(count + 1)}>{count}</button>
}
```
