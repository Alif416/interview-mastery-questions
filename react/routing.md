# React Router

If you're building with plain React (not a framework like Next.js that has routing built in), routing is something you set up yourself — this is where React Router comes in.

## 1. What is client-side routing?

Client-side routing changes what's displayed based on the URL entirely within the browser, using JavaScript to swap components in and out — without triggering a full page reload from the server on every navigation. The URL still changes (so back/forward/bookmarking work), but the page itself isn't re-fetched from scratch.

---

## 2. Why use React Router?

The browser has no built-in concept of "render this component for this URL" — React Router provides that mapping (URL → component), plus the navigation, parameter parsing, and nested-layout tooling needed to build a multi-page-feeling app on top of a single-page app.

---

## 3. What is a route?

A route is a mapping between a URL pattern and the component that should render when the current URL matches it.

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
</Routes>
```

---

## 4. What is a dynamic route?

A dynamic route contains a placeholder segment in its path that matches many different actual URLs, capturing the varying part as a parameter — like `/products/:id` matching `/products/1`, `/products/42`, and so on.

```jsx
<Route path="/products/:id" element={<ProductPage />} />
```

---

## 5. What are route parameters?

Route parameters are the dynamic pieces captured from the URL by a route's placeholder segments, accessible inside the matched component (in React Router, via the `useParams` hook).

```jsx
function ProductPage() {
  const { id } = useParams(); // reads the :id segment from the matched URL
  return <p>Showing product {id}</p>;
}
```

---

## 6. What are query parameters?

Query parameters are the key-value pairs after the `?` in a URL (`/products?sort=price&page=2`) — used for things like filters, sorting, or pagination state that you want reflected in (and shareable/bookmarkable via) the URL, without being part of the route's actual path structure.

```jsx
function ProductList() {
  const [searchParams] = useSearchParams();
  const sort = searchParams.get('sort'); // reads "price" from ?sort=price
  return <p>Sorted by {sort}</p>;
}
```

---

## 7. What are nested routes?

Nested routes let a route render inside a parent route's own layout — the parent component renders its shared UI (like a sidebar) plus an `<Outlet />` placeholder, and whichever child route currently matches renders into that placeholder.

```jsx
<Routes>
  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route path="profile" element={<Profile />} />   {/* /dashboard/profile */}
    <Route path="settings" element={<Settings />} />  {/* /dashboard/settings */}
  </Route>
</Routes>

function DashboardLayout() {
  return (
    <div>
      <Sidebar />
      <Outlet /> {/* Profile or Settings renders here, depending on the URL */}
    </div>
  );
}
```

---

## 8. What is navigation?

Navigation is moving between routes — either by the user clicking a link (`<Link to="/about">`), or programmatically from code (like redirecting after a successful form submission) using a hook such as `useNavigate`.

```jsx
function LoginForm() {
  const navigate = useNavigate();

  function handleSubmit() {
    // ...log in...
    navigate('/dashboard'); // programmatic navigation
  }

  return <Link to="/register">Don't have an account?</Link>; // declarative navigation
}
```

---

## 9. How do you redirect a user?

Call the navigation hook (`useNavigate` in React Router) with the target path, typically inside an effect or an event handler — for example, redirecting away from a login page once the user is already authenticated, or redirecting to a new URL after a successful action.

```jsx
function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) navigate('/dashboard'); // already logged in - redirect away from /login
  }, [user, navigate]);
}
```

---

## 10. What are protected routes?

Protected routes only render their content for users who meet some condition — usually being authenticated — and redirect anyone else elsewhere (typically to a login page). This is commonly implemented as a wrapper component that checks the condition before rendering its `children`/`<Outlet />`.

```jsx
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
}

<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

---

## 11. How do you handle a 404 page?

Add a catch-all route with a wildcard path (`*`) as the last route in your list — React Router matches it whenever no other route matches the current URL, rendering a "not found" component instead.

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="*" element={<NotFound />} /> {/* catches anything unmatched */}
</Routes>
```

---

## Practice

Set up routing for this structure:

```
/
/login
/register
/dashboard
/dashboard/profile
/products
/products/:id
```

Make `/dashboard` and `/dashboard/profile` protected (redirecting to `/login` if not authenticated), and add a catch-all 404 route for anything else.
