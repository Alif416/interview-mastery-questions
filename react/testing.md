# Testing

## 1. Why test React applications?

Tests catch regressions before users do — they let you refactor and add features with confidence that existing behavior still works, document how a component is actually supposed to behave, and are far cheaper to run than manually re-clicking through the whole app after every change.

---

## 2. What is unit testing?

Unit testing checks one small, isolated piece of logic on its own — a single pure function, like a validation rule or a price calculation — with no rendering or DOM involved at all.

```jsx
test('calculateDiscount applies 10% over $100', () => {
  expect(calculateDiscount({ total: 150 })).toBe(15);
});
```

---

## 3. What is component testing?

Component testing renders an actual React component (in a simulated DOM environment) and asserts on what it produces — checking that the right text appears, that clicking a button updates the display, that a prop is reflected correctly — without needing a real browser or a full running app.

```jsx
test('renders the greeting', () => {
  render(<Greeting name="Alif" />);
  expect(screen.getByText('Hello, Alif!')).toBeInTheDocument();
});
```

---

## 4. What is integration testing?

Integration testing checks that several pieces work correctly *together* — multiple components interacting, a component plus the hooks/context it depends on, a form plus its validation and submission logic — rather than testing any single piece in total isolation.

---

## 5. What is end-to-end testing?

End-to-end (E2E) testing runs the entire real application in an actual browser and simulates a real user's full journey through it — logging in, adding something to a cart, checking out — verifying the whole system works together, front end and back end included. Tools like Playwright or Cypress are commonly used for this.

---

## 6. What should you test?

Focus on behavior users actually care about: does clicking this button do the right thing, does this form reject invalid input and accept valid input, does this component show the correct content for a given set of props/state. Prioritize critical paths (checkout, auth, anything that would be a real problem if broken) and logic that's easy to get subtly wrong (validation, calculations, conditional rendering).

---

## 7. What should you NOT test?

Avoid testing implementation details that users can't observe — internal state variable names, exactly which internal function got called, or the precise DOM structure/class names a library happens to render. Tests tightly coupled to internals break every time you refactor, even when the actual behavior hasn't changed, which defeats the confidence tests are supposed to provide. Also skip testing things a framework/library already guarantees (like "does `useState` update state" — that's React's job to have already tested).

---

## 8. How do you test user interactions?

Use a library like React Testing Library to render the component, find elements the way a real user would (by visible text, label, or role — not by internal implementation details), and simulate events on them, then assert the resulting UI changed as expected.

```jsx
test('increments the counter on click', async () => {
  render(<Counter />);
  const button = screen.getByRole('button', { name: /increment/i });
  await userEvent.click(button);
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

---

## 9. How do you test forms?

Simulate typing into fields and submitting, then assert on the outcome — either that validation errors appear for invalid input, or that a submit handler was called with the correct data for valid input.

```jsx
test('shows an error for an invalid email', async () => {
  render(<SignupForm />);
  await userEvent.type(screen.getByLabelText('Email'), 'not-an-email');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
});
```

---

## 10. How do you mock APIs?

Replace the real network call with a fake one that returns controlled, predictable data — either by mocking the fetching function directly, or by intercepting network requests at a lower level (tools like MSW — Mock Service Worker — intercept actual `fetch` calls, so components under test don't need any special "test mode"). This keeps tests fast, reliable, and independent of a real backend being available.

```jsx
test('displays fetched users', async () => {
  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => [{ id: 1, name: 'Alif' }],
  });

  render(<UserList />);
  expect(await screen.findByText('Alif')).toBeInTheDocument();
});
```

---

## 11. How do you test API states?

Mock the fetch to resolve/reject/hang in each of the states you need to verify, and assert on what the component shows for each: a loading indicator while the (mocked, delayed) request is pending, the actual data once it resolves, and an error message when the mock is set up to reject.

```jsx
test('shows an error message when the request fails', async () => {
  vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
  render(<UserList />);
  expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
});
```

---

## Tools to learn

Learn **React Testing Library** (for rendering components and interacting with them the way a user would) paired with **Vitest** (as the test runner and assertion library). Together they cover the vast majority of component and integration testing needs for a React app.
