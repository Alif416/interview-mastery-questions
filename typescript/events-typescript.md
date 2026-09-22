# React Events + TypeScript

Master:

```ts
React.ChangeEvent<HTMLInputElement>
React.FormEvent<HTMLFormElement>
React.MouseEvent<HTMLButtonElement>
React.KeyboardEvent<HTMLInputElement>
```

## 1. How do you type an input event?

Use `React.ChangeEvent<HTMLInputElement>` for the event parameter — this correctly types `event.target` as an `HTMLInputElement`, giving you accurate access to `.value`, `.checked`, and other input-specific properties.

```tsx
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  console.log(e.target.value);
}

<input onChange={handleChange} />
```

---

## 2. How do you type form submission?

Use `React.FormEvent<HTMLFormElement>` for the `onSubmit` handler's event parameter — most commonly used just to call `.preventDefault()`.

```tsx
function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
}

<form onSubmit={handleSubmit}>{/* ... */}</form>
```

---

## 3. How do you type a button click?

Use `React.MouseEvent<HTMLButtonElement>` — or, for a click handler on some other element type, swap in that element's type instead (`HTMLDivElement`, `HTMLAnchorElement`, etc.).

```tsx
function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
  console.log("Clicked", e.currentTarget);
}

<button onClick={handleClick}>Click</button>
```

---

## 4. How do you type keyboard events?

Use `React.KeyboardEvent<HTMLInputElement>` (or whichever element it's attached to) — giving you correctly typed access to `.key`, `.code`, and modifier flags like `.shiftKey`.

```tsx
function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === "Enter") {
    console.log("Submitted:", e.currentTarget.value);
  }
}

<input onKeyDown={handleKeyDown} />
```

---

## 5. How do you type `event.target.value` safely?

The event type parameter — like `<HTMLInputElement>` in `React.ChangeEvent<HTMLInputElement>` — determines what `event.target` is typed as. Matching it to the actual element the handler is attached to guarantees `event.target.value` (or `.checked`, etc.) is typed correctly and safely, without needing a manual type assertion.

```tsx
// Correct - target typed as HTMLInputElement, .value is safely a string
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  const value: string = e.target.value; // no assertion needed
}
```
