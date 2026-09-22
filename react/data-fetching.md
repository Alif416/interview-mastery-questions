# Data Fetching & APIs

## 1. What is the Fetch API?

The Fetch API is the browser's built-in interface for making HTTP requests — `fetch(url)` returns a Promise that resolves with a `Response` object, which you then typically parse with `.json()` (also a Promise) to get the actual data.

```jsx
fetch('/api/users')
  .then((res) => res.json())
  .then((data) => console.log(data));
```

---

## 2. How do you fetch data in React?

Trigger the fetch inside a `useEffect` (so it runs after render, as a side effect, not during rendering itself), and store the result in state so the component re-renders once the data arrives.

```jsx
function UserList() {
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

---

## 3. How do you handle loading?

Track a `loading` boolean in state, set it `true` right before the request starts, and `false` once it resolves (whether it succeeds or fails) — then render a loading indicator conditionally based on that flag.

```jsx
function UserList() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    fetch('/api/users')
      .then((res) => res.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

---

## 4. How do you handle errors?

Catch rejected promises (network failures) and also explicitly check `response.ok` (since `fetch` doesn't reject on HTTP error statuses like 404/500 — only on network-level failures), storing an error message in state to render appropriately.

```jsx
React.useEffect(() => {
  fetch('/api/users')
    .then((res) => {
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      return res.json();
    })
    .then(setUsers)
    .catch((err) => setError(err.message))
    .finally(() => setLoading(false));
}, []);
```

---

## 5. How do you handle empty results?

Check the length of the returned data once loading finishes (and there's no error), and render a distinct "empty state" message instead of an empty list — an empty list with no explanation reads as broken, not as "there's genuinely nothing here."

```jsx
if (loading) return <Spinner />;
if (error) return <ErrorMessage message={error} />;
if (users.length === 0) return <p>No users found.</p>;
return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
```

---

## 6. What happens when a component unmounts during a request?

The request itself keeps running in the background — it isn't automatically cancelled just because the component is gone. If the `.then()` callback later tries to call `setState` on an unmounted component, React logs a warning (in older versions) since updating state on something no longer on screen serves no purpose and can mask a memory/logic issue.

---

## 7. How do you cancel requests?

Use an `AbortController`: create one in the effect, pass its `signal` to `fetch`, and call `controller.abort()` in the effect's cleanup function — which runs automatically when the component unmounts, or when the effect re-runs due to a dependency change.

```jsx
React.useEffect(() => {
  const controller = new AbortController();

  fetch(`/api/users/${userId}`, { signal: controller.signal })
    .then((res) => res.json())
    .then(setUser)
    .catch((err) => {
      if (err.name !== 'AbortError') setError(err.message);
    });

  return () => controller.abort();
}, [userId]);
```

---

## 8. How do you avoid race conditions?

A race condition happens when a fast-changing dependency (like a search query) triggers multiple overlapping requests, and an *older* request happens to resolve *after* a newer one — overwriting the correct, more recent result with stale data. Guard against it either by cancelling the previous request when a new one starts (via `AbortController`), or by tracking whether the effect is still "current" and ignoring the result if it isn't.

```jsx
React.useEffect(() => {
  let ignore = false;

  fetch(`/api/search?q=${query}`)
    .then((res) => res.json())
    .then((data) => {
      if (!ignore) setResults(data); // only apply the result if this effect is still the latest one
    });

  return () => { ignore = true; }; // a newer effect run marks this one stale
}, [query]);
```

---

## 9. How do you implement pagination?

Track the current page (or offset) in state, include it in the request, and re-fetch whenever it changes — usually alongside "next"/"previous" controls, and often the total count or a "has more" flag from the API to know when to disable the "next" button.

```jsx
function PaginatedList() {
  const [page, setPage] = React.useState(1);
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    fetch(`/api/items?page=${page}`).then((res) => res.json()).then(setItems);
  }, [page]);

  return (
    <>
      <ul>{items.map((i) => <li key={i.id}>{i.name}</li>)}</ul>
      <button onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
      <button onClick={() => setPage((p) => p + 1)}>Next</button>
    </>
  );
}
```

---

## 10. How do you implement infinite scrolling?

Instead of replacing the list on each fetch, append new results to the existing list, and trigger the next fetch when the user scrolls near the bottom — typically detected with an `IntersectionObserver` watching a sentinel element at the end of the list.

```jsx
function InfiniteList() {
  const [items, setItems] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const sentinelRef = React.useRef(null);

  React.useEffect(() => {
    fetch(`/api/items?page=${page}`)
      .then((res) => res.json())
      .then((newItems) => setItems((prev) => [...prev, ...newItems])); // append, don't replace
  }, [page]);

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setPage((p) => p + 1);
    });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <ul>{items.map((i) => <li key={i.id}>{i.name}</li>)}</ul>
      <div ref={sentinelRef} /> {/* fetch more once this scrolls into view */}
    </>
  );
}
```

---

## 11. How do you cache API data?

At a basic level, store already-fetched data in a map keyed by request parameters (like the URL or query), and check that cache before making a new request. Doing this well — cache invalidation, background refetching, sharing cached data between components that request the same thing — is exactly what dedicated data-fetching libraries exist to handle, since it's easy to get subtly wrong by hand.

```jsx
const cache = new Map();

function useCachedFetch(url) {
  const [data, setData] = React.useState(cache.get(url) ?? null);

  React.useEffect(() => {
    if (cache.has(url)) return; // already cached, skip the request
    fetch(url)
      .then((res) => res.json())
      .then((result) => {
        cache.set(url, result);
        setData(result);
      });
  }, [url]);

  return data;
}
```

---

## 12. What is server state?

Server state is data that actually lives on a server — fetched over the network, potentially shared across multiple users, and out of sync the moment it's fetched (someone else could change it a second later). It needs to be fetched, cached, kept fresh, and reconciled with the server, which is fundamentally different from data your component just owns locally.

---

## 13. What is client state?

Client state is data that only exists in the browser and is owned entirely by your application — a form's current input value, whether a modal is open, the active tab. It doesn't need fetching or syncing with a server; it's just local UI state, typically managed with `useState`/`useReducer`/Context.

---

## Data-fetching libraries

Once these concepts click, it's worth learning a dedicated data-fetching library such as **TanStack Query**. Understand *why* you'd reach for one — caching, background refetching, deduplication, race-condition handling, pagination/infinite-query helpers, all solved once — before learning its specific API. Hand-rolling all of the above with raw `useEffect` for a real app is exactly the pain these libraries exist to remove.
