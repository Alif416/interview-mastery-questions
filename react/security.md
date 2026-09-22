# React Security

## 1. What is XSS?

Cross-Site Scripting (XSS) is an attack where malicious script gets injected into a page and executes in a victim's browser with the site's own trust and permissions — able to read cookies, make requests as the logged-in user, or manipulate the page. It typically happens when untrusted input (user-submitted text, URL parameters) gets rendered as raw HTML/script instead of being treated as plain text.

---

## 2. How does React protect against XSS?

By default, React escapes any value you render inside JSX — `{someValue}` is always inserted as plain text, never interpreted as HTML, even if it contains `<script>` tags or other markup. This means the most common source of XSS (rendering untrusted text) is safe automatically, without you having to remember to escape it yourself.

```jsx
const userInput = '<script>alert("hacked")</script>';

function Comment({ text }) {
  return <p>{text}</p>; // safe - rendered as literal text, not executed as HTML
}
```

---

## 3. Why is `dangerouslySetInnerHTML` dangerous?

`dangerouslySetInnerHTML` explicitly bypasses React's automatic escaping and injects a raw HTML string directly into the DOM — if that string contains attacker-controlled content, it opens the door to exactly the XSS attack React normally protects you from by default. The name is intentionally alarming as a reminder of that risk.

```jsx
function Comment({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
  // if `html` came from user input without sanitization, this is an XSS hole
}
```

---

## 4. When might you legitimately use `dangerouslySetInnerHTML`?

When you genuinely need to render actual HTML markup — rendering rich text from a trusted CMS, or content already sanitized on the server — rather than plain text. It's not inherently forbidden, just something that requires deliberately verifying the source is trusted or the content has been sanitized first.

---

## 5. How should user-generated HTML be sanitized?

Run it through a dedicated sanitization library (like DOMPurify) before ever passing it to `dangerouslySetInnerHTML` — the library strips out dangerous elements and attributes (`<script>` tags, `onerror` handlers, `javascript:` URLs) while preserving safe formatting markup, rather than trying to hand-write regex-based escaping, which is very easy to get wrong.

```jsx
import DOMPurify from 'dompurify';

function Comment({ html }) {
  const clean = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

---

## 6. What is CSRF?

Cross-Site Request Forgery (CSRF) tricks a logged-in user's browser into making an unwanted request to a site they're authenticated with — since the browser automatically attaches cookies to requests, a malicious site can trigger a request (like a form submit) that the target site can't distinguish from a legitimate one, unless it's specifically protected against this.

---

## 7. Where should authentication tokens be stored?

The safest common option is an `HttpOnly` cookie set by the server — JavaScript can't read it at all, which makes it immune to being stolen via an XSS attack, and the browser sends it automatically on requests. Storing tokens in `localStorage` is common in practice but is readable by any JavaScript running on the page, meaning a successful XSS attack can steal the token directly — a real tradeoff to be aware of, not just a style choice.

---

## 8. How should sensitive data be handled?

Never trust the frontend to be the only barrier — always re-validate and re-authorize sensitive actions on the server too, since anything running in the browser can be inspected or tampered with. Minimize what sensitive data is even sent to the client in the first place (don't return fields the UI doesn't need), and use HTTPS everywhere so data isn't exposed in transit.

---

## 9. Why shouldn't secrets be placed in frontend code?

Anything shipped to the browser — including values baked in at build time via environment variables — is visible to anyone who opens the browser's dev tools or views the page source. API keys, database credentials, or any secret that grants real access must live only on a server, where the client never has direct access to it; the frontend should call your own backend, which then uses the secret on the client's behalf.

```jsx
// Never do this - this "secret" ships in the JS bundle and is trivially readable by anyone
const STRIPE_SECRET_KEY = 'sk_live_...'; // visible in devtools, page source, bundle analysis

// Instead: the frontend calls YOUR backend, and the backend holds the real secret
fetch('/api/create-payment', { method: 'POST', body: JSON.stringify(orderData) });
```
