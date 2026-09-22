# TypeScript + React

If you're learning TypeScript, this belongs alongside your React fundamentals, not as a separate, later add-on.

## 1. How do you type component props?

Define an interface (or type alias) describing the props, and use it to type the function's parameter.

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'danger'; // optional prop
}

function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button className={variant} onClick={onClick}>{label}</button>;
}
```

---

## 2. How do you type `children`?

Use React's built-in `React.ReactNode` type, which covers everything JSX is allowed to render (elements, strings, numbers, fragments, `null`, arrays of any of those).

```tsx
interface CardProps {
  children: React.ReactNode;
}

function Card({ children }: CardProps) {
  return <div className="card">{children}</div>;
}
```

---

## 3. How do you type `useState`?

TypeScript usually infers the type automatically from the initial value you pass in. When the initial value doesn't fully describe the type you need (commonly, starting at `null` before data loads), pass the type explicitly with a generic.

```tsx
const [count, setCount] = React.useState(0); // inferred as number

const [user, setUser] = React.useState<User | null>(null); // explicit - starts null, becomes a User later
```

---

## 4. How do you type event handlers?

React provides specific event types for each kind of DOM element and event — like `React.ChangeEvent<HTMLInputElement>` for an input's `onChange`, or `React.FormEvent<HTMLFormElement>` for a form's `onSubmit`.

```tsx
function NameInput() {
  const [name, setName] = React.useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={handleChange} />
    </form>
  );
}
```

---

## 5. How do you type API responses?

Define an interface describing the expected shape of the data, and apply it where the response is parsed — either by asserting the type on `.json()`'s result, or by typing the state that will eventually hold it.

```tsx
interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  return res.json(); // trusted to match the User shape - consider runtime validation for untrusted APIs
}
```

---

## 6. How do you type Context?

Type the value the Context will hold (often as a union including a "not yet available" state, since a component could theoretically render before the Provider mounts), and pass that type as a generic to `createContext`.

```tsx
interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context; // narrowed to AuthContextValue (not null) past this check
}
```

---

## 7. How do you type reducers?

Type the state shape, and type actions as a union of object shapes discriminated by a `type` field — TypeScript then narrows `action.payload` correctly inside each `case`, based on `action.type`.

```tsx
interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: number } }
  | { type: 'CLEAR_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      return { items: [...state.items, action.payload] }; // payload is CartItem here
    case 'REMOVE_ITEM':
      return { items: state.items.filter((i) => i.id !== action.payload.id) };
    case 'CLEAR_CART':
      return { items: [] };
  }
}
```

---

## 8. How do you type custom hooks?

Type the parameters normally, and type the return value explicitly if it's a tuple (like `useState` returns) — without an explicit tuple type, TypeScript may infer a plain array type instead, which loses the fixed-position typing you actually want.

```tsx
function useToggle(initial: boolean): [boolean, () => void] {
  const [value, setValue] = React.useState(initial);
  const toggle = () => setValue((v) => !v);
  return [value, toggle]; // explicit tuple return type keeps positions typed correctly
}
```

---

## 9. What are generic components?

A generic component uses a type parameter so it can work correctly with different data shapes while still being fully type-checked — like a `<List>` component that renders any array type, with its `renderItem` callback correctly typed to match whatever array was actually passed in.

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map((item, i) => <li key={i}>{renderItem(item)}</li>)}</ul>;
}

// TypeScript infers T as User here, so renderItem's `user` parameter is correctly typed
<List items={users} renderItem={(user) => <span>{user.name}</span>} />
```

---

## 10. How do you avoid using `any` unnecessarily?

Reach for `unknown` instead of `any` when a value's type genuinely isn't known yet (it forces you to narrow/check it before use, unlike `any` which disables checking entirely), define real interfaces for API responses and props instead of typing them loosely, and let TypeScript infer types where it can rather than widening them to `any` out of impatience. `any` should be a deliberate, rare escape hatch — not a default reached for whenever a type is inconvenient to write out.

```tsx
// any - disables type checking entirely, easy to introduce bugs
function processData(data: any) {
  return data.value.toUpperCase(); // no error, even if data.value doesn't exist
}

// unknown - forces a check before use
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    // safely narrowed before access
  }
}
```
