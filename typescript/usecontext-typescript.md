# React Context + TypeScript

Very important for real projects.

## 1. How do you type Context?

Define an interface/type describing the value the Context will hold, and pass it as `createContext`'s generic.

```tsx
interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);
```

---

## 2. How do you handle a possibly-undefined context value?

Since a component could theoretically render outside the Provider — where the Context falls back to its default value — type the Context as `T | null` (or `| undefined`), then write a custom hook that checks for that case and throws a clear error, narrowing the type to just `T` for every actual caller.

```tsx
function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context; // narrowed to AuthContextValue (not null) past this check
}
```

---

## 3. How do you create a typed Provider?

Build a component that manages the actual state/logic and renders `Context.Provider`, passing a correctly-typed `value` — consumers then get full type safety through the custom hook above.

```tsx
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);

  async function login(email: string, password: string) {
    setUser(await fakeLogin(email, password));
  }
  function logout() {
    setUser(null);
  }

  const value: AuthContextValue = { user, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

---

## 4. How do you type context actions?

Type each action — like `login`/`logout` above — as a function signature directly in the Context's value type, the same way you'd type any function prop, just as a field on the context value instead.

---

## 5. How do you type a reducer used with Context?

Type the reducer the same way you would outside of Context — state type, discriminated-union action type — then type the Context's value as an object holding both the current `state` and the `dispatch` function, giving consumers full type safety for both reading state and dispatching actions. *(Covered in depth in React useReducer + TypeScript.)*

```tsx
type State = { count: number };
type Action = { type: "increment" } | { type: "decrement" };

interface CounterContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const CounterContext = React.createContext<CounterContextValue | null>(null);
```
