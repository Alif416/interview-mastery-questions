# useReducer

## 1. What problem does `useReducer` solve?

When a piece of state has several related sub-values that change together, or is updated through many different kinds of actions, spreading that logic across a pile of separate `useState` calls (and scattered update logic near every event handler) gets messy and hard to follow. `useReducer` centralizes "how state changes in response to an action" into one function, making complex state transitions easier to read, test, and reason about in one place.

---

## 2. What is a reducer?

A reducer is a function that takes the current state and an action, and returns the next state: `(state, action) => newState`. It doesn't perform the action itself — it just describes what the state should become as a result of it.

```jsx
function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}
```

---

## 3. What is an action?

An action is a plain object describing *what happened* — conventionally with a `type` field (usually a string) identifying the kind of change, plus any extra data the reducer needs to compute the new state (often called the `payload`).

```jsx
{ type: 'ADD_ITEM', payload: { id: 1, name: 'Shoes', price: 49.99 } }
```

---

## 4. What should a reducer return?

A reducer should always return a complete, brand-new state value — never mutate the existing state object and return that same reference. Even for changes that only touch one field, you construct a new object (or array) representing the entire next state.

```jsx
function reducer(state, action) {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload }; // new object, existing fields spread in
    default:
      return state;
  }
}
```

---

## 5. Why should reducers be pure?

A pure reducer — same `(state, action)` input always produces the same output, with no side effects (no API calls, no mutating arguments, no relying on external variables) — is what makes state updates predictable and easy to test in isolation. It also plays well with things like React's Strict Mode double-invoking reducers in development to catch impurity bugs, and with dev tools that replay actions to reconstruct state history.

```jsx
// Impure - has a side effect, and depends on something outside its arguments
function badReducer(state, action) {
  console.log('action fired'); // side effect - don't do this in a reducer
  fetch('/api/log', { method: 'POST' }); // side effect - definitely don't do this
  return { ...state, count: state.count + Date.now() }; // depends on external Date.now()
}

// Pure - deterministic, no side effects
function goodReducer(state, action) {
  return { ...state, count: state.count + 1 };
}
```

---

## 6. How do you structure actions?

A common convention is `{ type: 'SOME_CONSTANT_STRING', payload: /* data needed for this action */ }`. Using a consistent shape (and often constants instead of raw strings for the `type` values) makes actions predictable to dispatch and easy to switch on inside the reducer.

```jsx
const ADD_ITEM = 'ADD_ITEM';
const REMOVE_ITEM = 'REMOVE_ITEM';

dispatch({ type: ADD_ITEM, payload: { id: 1, name: 'Shoes' } });
dispatch({ type: REMOVE_ITEM, payload: { id: 1 } });
```

---

## 7. What's the difference between `useState` and `useReducer`?

`useState` gives you a value and a setter — great for simple, independent pieces of state. `useReducer` gives you a state value and a `dispatch` function, with all the actual update logic centralized in one reducer function elsewhere — better once you have multiple related sub-values, or state that changes in several distinct, well-defined ways.

```jsx
// useState - simple, direct
const [count, setCount] = React.useState(0);
setCount(count + 1);

// useReducer - update logic lives in one place, called by "what happened"
const [state, dispatch] = React.useReducer(counterReducer, { count: 0 });
dispatch({ type: 'increment' });
```

---

## 8. When is `useReducer` better than `useState`?

Reach for `useReducer` when: state has multiple sub-values that often change together, the next state depends on complex logic involving the previous state, there are several distinct kinds of updates (add/remove/update/clear) that are clearer as named actions than as several separate setter calls, or you want update logic separated from your components so it's easier to test on its own.

---

## Practice

Build a **shopping cart** using `useReducer`, supporting these actions:

- `ADD_ITEM`
- `REMOVE_ITEM`
- `INCREASE_QUANTITY`
- `DECREASE_QUANTITY`
- `CLEAR_CART`

Keep the reducer function completely separate from the component, and make sure every case returns a new state object rather than mutating the existing cart in place.
