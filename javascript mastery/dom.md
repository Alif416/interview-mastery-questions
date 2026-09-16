# DOM and Browser APIs

> You don't need to master every browser API, but you should understand the fundamentals.

---

## 1. What is the DOM?

The DOM (Document Object Model) is a live, in-memory tree structure that represents the structure of a page. Every HTML element becomes a node in this tree, and JavaScript can read, traverse, and mutate that tree through the `document` object and its APIs. When you change the DOM, the browser re-renders the affected parts of the page.

Because the DOM is an object representation, it exposes properties and methods that don't exist in raw HTML — things like `parentNode`, `nextSibling`, `classList`, or `addEventListener`. The DOM is also not exclusive to HTML; XML documents are parsed into a DOM tree too, and browsers expose a separate but related CSSOM for stylesheets.

```js
// The DOM is an object graph, not text
const heading = document.querySelector('h1');
console.log(heading.textContent); // reads current DOM state
heading.textContent = 'Updated';  // mutates the live tree
console.log(heading.nodeType);    // 1 (ELEMENT_NODE)
console.log(heading.parentNode);  // a DOM node object, not a string
```

---

## 2. What is the difference between the DOM and HTML?

HTML is the static, textual source markup — a file or string that describes the initial structure of a page. The DOM is what the browser builds by parsing that HTML into a tree of live objects. The two are related but not the same thing, and they can diverge over time.

Once the page loads, JavaScript can add, remove, or modify DOM nodes, but those changes do not rewrite the original HTML source. If you view the page source (`Ctrl+U` / "View Source"), you see the original HTML the server sent; if you inspect the DOM via DevTools' Elements panel, you see the current, possibly mutated, tree.

| | HTML | DOM |
|---|---|---|
| Nature | Static text/markup | Live, in-memory object tree |
| Source | File sent by server or written by hand | Built by parsing HTML (and updated by JS) |
| Mutable at runtime? | No — editing it does nothing after parse | Yes — JS can add/remove/change nodes |
| Reflects current page state? | No, only the original source | Yes, always current |
| Inspected via | "View Page Source" | DevTools "Elements" panel |

```js
// DOM mutation does not touch the original HTML source
document.body.innerHTML += '<p>New paragraph</p>';
// "View Source" still shows the original file — this <p> won't appear there
```

---

## 3. What is event bubbling?

Event bubbling is the phase of the DOM event flow where an event, after firing on its target element, propagates upward through each ancestor in turn, all the way to the root (`document`, and ultimately `window`). Any listener attached to an ancestor with the default (non-capture) mode will fire during this upward pass.

Most DOM events bubble by default (`click`, `input`, `keydown`), though some do not (`focus`, `blur`, `mouseenter`, `mouseleave` — though `focusin`/`focusout` and `mouseover`/`mouseout` do bubble).

```js
document.getElementById('outer').addEventListener('click', () => {
  console.log('outer handler');
});
document.getElementById('inner').addEventListener('click', () => {
  console.log('inner handler');
});

// Clicking #inner logs:
// "inner handler"  (fires on target first)
// "outer handler"  (then bubbles up to ancestor)
```

---

## 4. What is event capturing?

Event capturing is the opposite phase of the DOM event flow: instead of propagating up from the target, the event travels down from the root toward the target. In the full W3C event flow, capturing happens first (root to target), then the event reaches the target, then it bubbles back up (target to root).

By default, `addEventListener` registers a listener for the bubbling phase. To listen during capturing, pass `true` as the third argument (or `{ capture: true }`).

```js
document.getElementById('outer').addEventListener(
  'click',
  () => console.log('outer capturing'),
  true // capture phase
);
document.getElementById('inner').addEventListener('click', () => {
  console.log('inner target');
});

// Clicking #inner logs:
// "outer capturing"  (capture phase runs first, root -> target)
// "inner target"     (then the target's own handler fires)
```

| | Bubbling | Capturing |
|---|---|---|
| Direction | Target → ancestors (up) | Root → target (down) |
| Order in event flow | Second phase | First phase |
| Default for `addEventListener`? | Yes | No — must opt in |
| How to enable | omit 3rd arg / `{capture:false}` | 3rd arg `true` / `{capture:true}` |
| Common use | Event delegation | Intercepting before target handles it |

---

## 5. What is event delegation?

Event delegation is a pattern where, instead of attaching a listener to every individual child element, you attach a single listener to a common ancestor and use `event.target` (and `closest()`) inside that handler to figure out which descendant actually triggered the event. It works because of bubbling — a click on any descendant eventually bubbles up to the ancestor's listener.

This is efficient for large or dynamic lists: you avoid attaching hundreds of listeners, and — crucially — it automatically covers elements added to the DOM *after* the listener was registered, since the listener lives on the stable parent, not on each child.

```js
// One listener handles clicks on any current or future <li>
document.getElementById('todo-list').addEventListener('click', (event) => {
  const item = event.target.closest('li');
  if (!item) return; // click wasn't on/inside an <li>

  if (event.target.matches('.delete-btn')) {
    item.remove();
  }
});

// New items added later are handled automatically — no re-binding needed
const newItem = document.createElement('li');
newItem.innerHTML = 'Buy milk <button class="delete-btn">x</button>';
document.getElementById('todo-list').appendChild(newItem);
```

---

## 6. What is the difference between preventDefault() and stopPropagation()?

`preventDefault()` cancels the browser's built-in default action associated with an event — for example, stopping a link from navigating, a form from submitting, or a checkbox from toggling. It does **not** stop the event from continuing to propagate to other listeners on ancestors or descendants.

`stopPropagation()` stops the event from continuing its journey through the DOM (bubbling further up, or capturing further down), so other listeners later in the propagation path never see it. It does **not** cancel the browser's default action — a form could still submit even if propagation is stopped.

These two are independent and are frequently called together, but they solve different problems.

| | `preventDefault()` | `stopPropagation()` |
|---|---|---|
| Stops browser default action | Yes | No |
| Stops event propagation | No | Yes |
| Other listeners on same element still run | Yes | Depends (`stopImmediatePropagation()` stops those too) |
| Typical use | Stop link navigation / form submit | Stop a delegated parent handler from also firing |

```js
form.addEventListener('submit', (event) => {
  event.preventDefault(); // stop the page from reloading via form submission
  // event still bubbles to any listener on document, for example
});

innerButton.addEventListener('click', (event) => {
  event.stopPropagation(); // outer click handler will NOT run
  // but if innerButton were e.g. a submit button, default submit still occurs
  // unless preventDefault() is also called
});
```

---

## 7. What is the difference between localStorage, sessionStorage, and cookies?

`localStorage` persists data with no expiration date — it survives browser restarts and stays until explicitly cleared (by code or the user). It offers roughly 5-10MB per origin, is never automatically sent to the server, and is scoped per-origin (shared across all tabs of the same origin).

`sessionStorage` behaves like `localStorage` in API and size, but its data only lives for the duration of the tab's session — closing the tab clears it. It's also per-origin, but additionally scoped per-tab, so two tabs on the same site don't share `sessionStorage`.

Cookies are much smaller (about 4KB), can be given an explicit expiration date, and — unlike the two Storage APIs — are automatically attached to every matching HTTP request the browser makes to the server, making them readable server-side. Cookies can be scoped with `path`/`domain` attributes and hardened with `httpOnly` (inaccessible to JS) and `secure` (HTTPS only) flags.

| | localStorage | sessionStorage | Cookies |
|---|---|---|---|
| Expiry | None (manual clear) | Ends when tab closes | Configurable expiry date |
| Size limit | ~5-10MB | ~5-10MB | ~4KB |
| Sent to server automatically | No | No | Yes, on every matching request |
| Scope | Per-origin, shared across tabs | Per-origin, per-tab | Per path/domain, configurable |
| Server-readable | No | No | Yes |
| Extra security flags | N/A | N/A | `httpOnly`, `secure`, `sameSite` |

```js
localStorage.setItem('theme', 'dark');        // survives browser restart
sessionStorage.setItem('draftId', 'abc123');  // gone when this tab closes
document.cookie = 'sessionToken=xyz; max-age=3600; secure'; // sent with every request
```

---

## 8. What is the Fetch API?

The Fetch API is a promise-based interface for making HTTP requests from the browser, designed as a modern replacement for `XMLHttpRequest`. `fetch(url, options)` returns a `Promise` that resolves to a `Response` object once the server responds with headers (the body is read separately via methods like `.json()` or `.text()`, which return their own promises).

A critical gotcha: `fetch()` only rejects its promise on a network-level failure (DNS failure, no connectivity, CORS block) — it does **not** reject for HTTP error status codes like 404 or 500. Those still resolve successfully with `response.ok` set to `false`. You are responsible for checking `response.ok` (or `response.status`) yourself and throwing/handling accordingly.

```js
async function getUser(id) {
  const response = await fetch(`/api/users/${id}`);

  // fetch does NOT throw for 404/500 — you must check manually
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

getUser(42).catch((err) => console.error(err.message));
```

---

## 9. What is CORS?

CORS (Cross-Origin Resource Sharing) is a browser-enforced security mechanism that restricts a script running on one origin from reading the response of a request made to a different origin, unless the server explicitly opts in via response headers such as `Access-Control-Allow-Origin`. It exists to protect users from malicious sites silently reading data from other sites the user is authenticated on.

The key detail is *where* it's enforced: CORS is a browser-side restriction, not a server-side one. For many cross-origin requests the actual HTTP request still reaches the server and the server still processes it — the browser simply withholds the response from the calling JavaScript if the proper CORS headers aren't present. For "non-simple" requests (custom headers, methods like `PUT`/`DELETE`, non-standard content types), the browser first sends a preflight `OPTIONS` request to check whether the actual request is allowed before sending it.

```js
// Called from https://myapp.com against https://api.other.com
fetch('https://api.other.com/data')
  .then((res) => res.json())
  .catch((err) => {
    // If api.other.com doesn't send Access-Control-Allow-Origin,
    // the browser blocks JS from reading the response — this catches that.
    console.error('Blocked or failed:', err);
  });

// Server must respond with a header like:
// Access-Control-Allow-Origin: https://myapp.com
// (or "*" for any origin) for the browser to expose the response to JS
```

---

## 10. What is the difference between DOMContentLoaded and load?

`DOMContentLoaded` fires as soon as the browser has fully parsed the initial HTML and constructed the DOM tree, without waiting for external resources like stylesheets, images, or subframes/iframes to finish loading. This is usually the right event for initializing JS that only needs to query/manipulate DOM elements.

`load` fires later — only once the entire page, including all external resources (images, CSS, fonts, iframes), has fully finished loading. It's the right event for logic that genuinely depends on assets being ready, such as measuring an image's natural dimensions.

```js
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM is ready — safe to query elements');
  // images may still be loading at this point
});

window.addEventListener('load', () => {
  console.log('Everything (images, CSS, iframes) has finished loading');
});
```

| | DOMContentLoaded | load |
|---|---|---|
| Fires when | HTML parsed, DOM tree built | All resources fully loaded |
| Waits for images/CSS/iframes | No | Yes |
| Fires | Earlier | Later |
| Typical use | Bind event listeners, query DOM | Measure images, hide loading spinners |

---

## 11. What is debouncing?

Debouncing is a technique for limiting how often a function runs by delaying its execution until a pause of at least N milliseconds has occurred with no further invocations. Every new call resets the timer, so the wrapped function only actually executes once the caller "settles down."

The canonical use case is a search-as-you-type input: you don't want to fire a network request on every keystroke, only after the user pauses typing.

```js
// Conceptually: typing "hello" quickly with a 300ms debounce only
// triggers one call, 300ms after the last keystroke ("o")
input.addEventListener('input', debounce(() => {
  console.log('search fired');
}, 300));
```

---

## 12. What is throttling?

Throttling is a technique for limiting how often a function runs by guaranteeing it executes at most once every N milliseconds, regardless of how many times it's actually called during that window. Unlike debouncing, throttling doesn't wait for a pause — it enforces a steady maximum execution rate.

This is well suited to high-frequency events like `scroll`, `resize`, or `mousemove`, where you want regular updates but not on every single event firing (which could be hundreds per second).

```js
// Conceptually: scrolling continuously with a 200ms throttle
// runs the handler roughly every 200ms, not on every scroll event
window.addEventListener('scroll', throttle(() => {
  console.log('scroll position:', window.scrollY);
}, 200));
```

---

## 13. How do you implement debounce?

A debounce implementation keeps track of a pending timeout. Each time the wrapped function is called, it clears any existing timeout and schedules a new one for N milliseconds later. The wrapped function's actual logic only runs if no new call arrives before the timer expires.

```js
function debounce(fn, delay) {
  let timeoutId;

  return function debounced(...args) {
    clearTimeout(timeoutId); // cancel the previous pending call
    timeoutId = setTimeout(() => {
      fn.apply(this, args); // only runs after `delay` ms of silence
    }, delay);
  };
}

// Usage
const logSearch = debounce((query) => console.log('searching for:', query), 300);
logSearch('h');
logSearch('he');
logSearch('hel'); // only this call actually runs fn, 300ms after it fires
```

---

## 14. How do you implement throttle?

A simple throttle implementation tracks the timestamp of the last execution. On each call, it checks whether enough time (`limit` ms) has passed since the last run; if so, it runs immediately and updates the timestamp, otherwise it ignores the call (or, in a trailing variant, schedules one final call for the end of the window).

```js
function throttle(fn, limit) {
  let lastCallTime = 0;

  return function throttled(...args) {
    const now = Date.now();
    if (now - lastCallTime >= limit) {
      lastCallTime = now;
      fn.apply(this, args); // runs at most once per `limit` ms
    }
  };
}

// Variant with a trailing call using a lock + timeout, so the final
// event in a burst isn't dropped:
function throttleTrailing(fn, limit) {
  let locked = false;
  let lastArgs = null;

  return function throttled(...args) {
    lastArgs = args;
    if (locked) return;

    locked = true;
    fn.apply(this, lastArgs);

    setTimeout(() => {
      locked = false;
      if (lastArgs) fn.apply(this, lastArgs); // trailing call
      lastArgs = null;
    }, limit);
  };
}
```

| | Debounce | Throttle |
|---|---|---|
| Executes | After N ms of inactivity | At most once per N ms, regardless of activity |
| Timer behavior | Resets on every call | Fixed-rate window |
| Good for | Search input, resize-end, autosave | Scroll, mousemove, drag, resize-live |
| Guarantees a call during continuous activity? | No — could be delayed indefinitely if calls keep coming | Yes — runs periodically |

---

## 15. What is the difference between setTimeout() and setInterval()?

`setTimeout(fn, delay)` schedules `fn` to run once, after at least `delay` milliseconds have passed. `setInterval(fn, delay)` schedules `fn` to run repeatedly, roughly every `delay` milliseconds, until it's explicitly stopped with `clearInterval()`.

An important nuance for both: the `delay` is a **minimum**, not a guarantee. JavaScript is single-threaded with an event loop, so if the call stack is busy (synchronous work) or the microtask queue is backed up, the actual firing can happen later than requested — timers never fire early, but they can fire late.

```js
setTimeout(() => {
  console.log('runs once, after >= 1000ms');
}, 1000);

const intervalId = setInterval(() => {
  console.log('runs every >= 500ms until cleared');
}, 500);

setTimeout(() => clearInterval(intervalId), 2000); // stop after ~2s

// Demonstrating "minimum, not guaranteed" delay:
setTimeout(() => console.log('fired'), 0);
for (let i = 0; i < 1e9; i++) {} // blocks the thread
console.log('this logs first, before the timeout callback,
  even though the timeout delay was 0');
```

---

## Practice

Build a search input that fetches results with debounce.

```js
const input = document.querySelector('#search');
const resultsEl = document.querySelector('#results');

// Debounce helper, implemented from scratch
function debounce(fn, delay) {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

let activeController = null; // cancels any in-flight stale request

async function runSearch(query) {
  if (!query) {
    resultsEl.textContent = '';
    return;
  }

  // Abort the previous request so a slow, stale response can't
  // overwrite results from a newer, faster one
  if (activeController) activeController.abort();
  activeController = new AbortController();

  try {
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(query)}`,
      { signal: activeController.signal }
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    resultsEl.innerHTML = data.items
      .map((item) => `<li>${item.title}</li>`)
      .join('');
  } catch (err) {
    if (err.name === 'AbortError') return; // expected — a newer search superseded this one
    console.error(err);
    resultsEl.textContent = 'Something went wrong.';
  }
}

const debouncedSearch = debounce((query) => runSearch(query), 300);

input.addEventListener('input', (event) => {
  debouncedSearch(event.target.value.trim());
});
```

Debouncing matters here because it avoids firing a network request on every single keystroke — without it, typing a five-letter word would trigger five separate requests, most of which are immediately wasted.
