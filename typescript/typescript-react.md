# TypeScript + React ⭐⭐⭐

This should be your highest-priority practical section, since you're already learning React.

## 1. How do you type component props?

Define a `type` (or `interface`) describing the props shape, and use it to type the destructured parameter in the component function.

```tsx
type ButtonProps = {
  title: string;
  onClick: () => void;
};

function Button({ title, onClick }: ButtonProps) {
  return <button onClick={onClick}>{title}</button>;
}
```

---

## 2. How do you type optional props?

Add `?` after the prop name in the props type — the same as any optional object property — allowing the parent to omit it, often paired with a default value in the destructuring.

```tsx
type ButtonProps = {
  title: string;
  variant?: "primary" | "danger";
};

function Button({ title, variant = "primary" }: ButtonProps) {
  return <button className={variant}>{title}</button>;
}
```

---

## 3. How do you type `children`?

Use React's built-in `React.ReactNode` type, which covers everything JSX is allowed to render.

```tsx
type CardProps = {
  children: React.ReactNode;
};

function Card({ children }: CardProps) {
  return <div className="card">{children}</div>;
}
```

---

## 4. How do you type callback props?

Type the prop as a function signature describing its parameters and return type — the same as typing any callback parameter, just applied to a prop instead.

```tsx
type SearchBoxProps = {
  onSearch: (query: string) => void;
};

function SearchBox({ onSearch }: SearchBoxProps) {
  const [query, setQuery] = React.useState("");
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onSearch(query)}
    />
  );
}
```

---

## 5. How do you type event handlers?

React provides specific event types for each element and event kind — like `React.ChangeEvent<HTMLInputElement>` for an input's `onChange`, or `React.MouseEvent<HTMLButtonElement>` for a button's `onClick` — giving `event.target` (and similar properties) the correct, specific type. *(Covered in full depth in React Events + TypeScript.)*

```tsx
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  console.log(e.target.value);
}
```
