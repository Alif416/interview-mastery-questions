# React useRef + TypeScript

```ts
const inputRef = useRef<HTMLInputElement>(null);
```

## 1. How do you type a DOM ref?

Pass the specific DOM element type as `useRef`'s generic, initialized to `null` — React will fill in the actual element once it mounts.

```tsx
const inputRef = React.useRef<HTMLInputElement>(null);

<input ref={inputRef} />
```

---

## 2. What is `useRef<HTMLInputElement | null>`?

It's the explicit way of writing the same thing `useRef<HTMLInputElement>(null)` gives you implicitly — a ref whose `.current` is typed as `HTMLInputElement | null`, since it's `null` until the element mounts, and the actual DOM node afterward. TypeScript infers this union automatically when you call `useRef<HTMLInputElement>(null)`, so both forms end up equivalent.

```ts
const inputRef = useRef<HTMLInputElement>(null);
// inputRef.current: HTMLInputElement | null
```

---

## 3. Why does `ref.current` initially contain `null`?

Because the ref is created before the component has actually rendered any real DOM — React only attaches the actual DOM node to `ref.current` after the element mounts. For that brief window (and any time before mounting), `.current` genuinely has no element to point to yet, and typing it as `null` reflects that honestly.

---

## 4. How do you type a mutable ref for a non-DOM value?

Pass the value's type as the generic, and initialize `.current` directly — not `null`, unless `null` is a genuinely valid state. Unlike a DOM ref, a ref used to store a plain value doesn't need the "starts null until mount" pattern.

```tsx
const countRef = React.useRef<number>(0); // starts at an actual value, not null
countRef.current += 1; // no null-check needed
```
