# Forms

## 1. What is a controlled component?

A controlled component is a form input whose value is driven entirely by React state — the input's `value` comes from state, and every keystroke updates that state via `onChange`. React is the single source of truth for what the input displays.

```jsx
function ControlledInput() {
  const [value, setValue] = React.useState('');
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}
```

---

## 2. What is an uncontrolled component?

An uncontrolled component lets the DOM itself manage the input's value, the same way a plain HTML form would — React doesn't track every keystroke in state. Instead, you read the current value only when you need it, typically with a `ref`.

```jsx
function UncontrolledInput() {
  const inputRef = React.useRef(null);

  function handleSubmit() {
    console.log(inputRef.current.value); // read the value only when needed
  }

  return (
    <>
      <input ref={inputRef} defaultValue="" />
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}
```

---

## 3. What's the difference between controlled and uncontrolled inputs?

A controlled input's value lives in React state and is set explicitly (`value={state}`), so React re-renders on every change and always knows the current value — this makes validation, conditional disabling, and formatting-as-you-type straightforward. An uncontrolled input's value lives in the DOM itself (`defaultValue` sets the initial value only), and you only read it on demand via a ref — simpler for basic cases, but harder to react to changes as they happen.

---

## 4. How do you manage form state?

For a controlled form, keep each field's value in state — either as separate `useState` calls per field, or as a single object holding all the fields together, updated via one shared handler that reads the field's `name`.

```jsx
function Form() {
  const [form, setForm] = React.useState({ name: '', email: '' });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <>
      <input name="name" value={form.name} onChange={handleChange} />
      <input name="email" value={form.email} onChange={handleChange} />
    </>
  );
}
```

---

## 5. How do you handle multiple inputs?

Give each input a `name` attribute matching a key in your state object, then use one `handleChange` function for all of them — reading `event.target.name` to know which field to update, using computed property syntax (`[name]: value`) to update just that one key.

```jsx
function handleChange(e) {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));
}
```

---

## 6. How do you validate a form?

Run validation logic against the current form values — either on every change (for instant feedback), on blur (when a field loses focus), or on submit (checking everything at once). Store the validation results (usually an object of field → error message) in state, so the UI can react to them.

```jsx
function validate(form) {
  const errors = {};
  if (!form.email.includes('@')) errors.email = 'Enter a valid email';
  if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
  return errors;
}
```

---

## 7. How do you show validation errors?

Store errors in state (typically keyed by field name), then conditionally render an error message next to the relevant field when one exists for it.

```jsx
function Field({ label, error, ...inputProps }) {
  return (
    <div>
      <label>{label}</label>
      <input {...inputProps} />
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

---

## 8. How do you handle form submission?

Attach an `onSubmit` handler to the `<form>` element (not `onClick` on the button — this also catches submission via pressing Enter), call `event.preventDefault()` to stop the browser's default full-page reload, then run your validation/submission logic.

```jsx
function Form() {
  function handleSubmit(event) {
    event.preventDefault();
    console.log('Submitting...');
  }
  return (
    <form onSubmit={handleSubmit}>
      {/* fields */}
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## 9. How do you handle asynchronous form submission?

Mark the submit handler `async`, track a `submitting`/`loading` state so the UI can show feedback (and disable the submit button), `await` the request, and then update state based on whether it succeeded or failed.

```jsx
function Form() {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await fetch('/api/submit', { method: 'POST' /* ...body */ });
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

---

## 10. How do you prevent duplicate submissions?

Disable the submit button (or otherwise block a second submit) while a `submitting` state is `true`, and only re-enable it once the request finishes — whether it succeeds or fails. This is exactly what the `disabled={submitting}` in the example above accomplishes: a second click while a request is in flight simply does nothing.

---

## 11. How do you reset a form?

For a controlled form, reset each field's state back to its initial values (often by calling `setForm(initialState)` again). For an uncontrolled form, you can call the native `form.reset()` method, or simply update the `key` on the form/inputs to force React to remount them with fresh default values.

```jsx
const initialForm = { name: '', email: '' };

function Form() {
  const [form, setForm] = React.useState(initialForm);

  function handleReset() {
    setForm(initialForm);
  }

  return (
    <>
      {/* fields bound to form */}
      <button type="button" onClick={handleReset}>Reset</button>
    </>
  );
}
```

---

## Practice

Build a **Registration Form** with these fields:

- Name
- Email
- Password
- Confirm Password
- Age
- Terms checkbox

Wire it through this full flow: **Validation → Submit → Loading → Success/Error.** Specifically:

- Validate on submit (and, if you want a challenge, also on blur).
- Show a field-specific error message for each invalid field.
- Disable the submit button while "submitting" (simulate a network delay with `setTimeout`).
- Show a loading indicator during submission.
- Show a success message on success, or an error message if the simulated request "fails."
- Make sure a second click while it's submitting does nothing.
