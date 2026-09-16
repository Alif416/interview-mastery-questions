# Arrays and Data Transformation

> These are essential for React because you constantly transform data.

---

## 1. What is the difference between map() and forEach()?

`map()` transforms every element and returns a **new array** of the same length. `forEach()` runs a callback for its **side effects** and returns `undefined`. If you find yourself doing `arr.forEach(x => results.push(fn(x)))`, that is a `map()` in disguise.

Because `map()` returns a value, it composes: you can chain `.filter()`, `.sort()`, or another `.map()` directly off the result. `forEach()` cannot be chained meaningfully because there's nothing to chain onto.

| | map() | forEach() |
|---|---|---|
| Return value | New array (same length) | `undefined` |
| Purpose | Transform data | Side effects (logging, DOM writes, mutating external state) |
| Chainable | Yes | No |
| Typical React use | Rendering a list of JSX elements | Rarely used — prefer map/reduce |

```js
const prices = [10, 20, 30];

const withTax = prices.map(p => p * 1.1);
// withTax => [11, 22, 33]
// prices is untouched

const forEachResult = prices.forEach(p => p * 1.1);
// forEachResult => undefined
```

---

## 2. What is the difference between filter() and find()?

`filter()` returns a **new array** containing every element that matches the predicate — it could be empty, or contain all elements. `find()` returns the **first matching element itself** (or `undefined` if nothing matches) — never an array.

Use `filter()` when you need all matches (e.g., "all products under $50"). Use `find()` when you expect at most one match, typically a lookup by unique id.

```js
const users = [
  { id: 1, active: true },
  { id: 2, active: false },
  { id: 3, active: true },
];

const activeUsers = users.filter(u => u.active);
// activeUsers => [{id:1,...}, {id:3,...}]  (array, possibly empty)

const firstActive = users.find(u => u.active);
// firstActive => {id: 1, active: true}  (single object or undefined)
```

| | filter() | find() |
|---|---|---|
| Returns | New array of all matches | First matching element (or `undefined`) |
| Empty/no-match result | `[]` | `undefined` |
| Stops early | No, checks every element | Yes, stops at first match |

---

## 3. What is the difference between find() and findIndex()?

Both scan the array and stop at the first element satisfying the predicate, but `find()` returns the **element**, while `findIndex()` returns its **index** (or `-1` if nothing matches, analogous to how `find()` returns `undefined`).

Use `findIndex()` when you need to mutate at a position (`arr.splice(idx, 1)`) or need the position for a subsequent operation. Use `find()` when you just need the data itself.

```js
const products = [
  { id: 101, name: 'Keyboard' },
  { id: 102, name: 'Mouse' },
];

const product = products.find(p => p.id === 102);
// product => { id: 102, name: 'Mouse' }

const index = products.findIndex(p => p.id === 102);
// index => 1

const missingIndex = products.findIndex(p => p.id === 999);
// missingIndex => -1
```

---

## 4. What is the difference between some() and every()?

`some()` returns `true` if **at least one** element passes the predicate — it short-circuits on the first success. `every()` returns `true` only if **all** elements pass — it short-circuits on the first failure. Both return a boolean, never the matching elements themselves.

A subtle gotcha: `every()` on an empty array returns `true` (vacuous truth), and `some()` on an empty array returns `false`. This trips people up when validating empty form arrays.

```js
const cart = [
  { name: 'Laptop', inStock: true },
  { name: 'Monitor', inStock: false },
];

const anyInStock = cart.some(item => item.inStock);
// anyInStock => true

const allInStock = cart.every(item => item.inStock);
// allInStock => false

[].every(x => x > 0); // => true  (vacuously true)
[].some(x => x > 0);  // => false
```

| | some() | every() |
|---|---|---|
| True when | At least one element matches | All elements match |
| Short-circuits on | First `true` result | First `false` result |
| Empty array result | `false` | `true` |

---

## 5. What does reduce() return?

`reduce()` returns whatever the **final accumulator value** is — it is not tied to returning an array. The accumulator can be a number, string, object, array, or anything else, depending on what you pass as the initial value and what the callback returns each iteration. This flexibility is why `reduce()` can implement `map()`, `filter()`, `sum()`, `groupBy()`, and more.

The callback signature is `(accumulator, currentElement, index, array) => newAccumulator`, and the second argument to `reduce()` is the initial accumulator value. Omitting the initial value causes `reduce()` to use the first array element as the initial accumulator and start iterating from index 1 — this throws on an empty array, so always pass an explicit initial value.

```js
const orderItems = [
  { name: 'Book', price: 15 },
  { name: 'Pen', price: 2 },
];

const total = orderItems.reduce((sum, item) => sum + item.price, 0);
// total => 17  (a number)

const asObject = orderItems.reduce((acc, item) => {
  acc[item.name] = item.price;
  return acc;
}, {});
// asObject => { Book: 15, Pen: 2 }  (an object)
```

---

## 6. How does sort() work?

By default, `Array.prototype.sort()` converts every element to a **string** and compares them in UTF-16 code-unit order — lexicographically, not numerically or by any type-aware rule. This is why it works fine for arrays of strings but produces surprising results for numbers.

To control ordering, pass a comparator function `(a, b) => number`. If the comparator returns a negative number, `a` sorts before `b`; if positive, `a` sorts after `b`; if zero, their relative order is left unchanged (sort is stable as of ES2019, so equal elements keep their original relative order).

```js
const words = ['banana', 'Apple', 'cherry'];
words.sort();
// => ['Apple', 'banana', 'cherry']  (uppercase sorts before lowercase in UTF-16)

const numbers = [10, 2, 1];
numbers.sort();
// => [1, 10, 2]  <-- WRONG for numbers! "10" < "2" as strings
```

---

## 7. Why does sort() mutate the original array?

`sort()` (along with `reverse()`, `splice()`, `push()`, `pop()`, `shift()`, and `unshift()`) is defined by the spec to sort the elements **in place** and then return a reference to that same array. This is a leftover design choice from early JavaScript, prioritizing performance (no extra allocation) over immutability, and it's a common source of subtle bugs — especially in React, where mutating state or props directly breaks change detection and can cause stale renders.

Because `sort()` returns the same array it mutated, `const sorted = arr.sort(...)` makes `sorted` and `arr` the **same reference** — sorting `sorted` later also silently reorders `arr` anywhere else it's used. The fix is to sort a copy.

```js
const original = [{ price: 30 }, { price: 10 }, { price: 20 }];

const sortedCopy = [...original].sort((a, b) => a.price - b.price);
// sortedCopy is a new array, sorted ascending by price
// original is STILL [{price:30}, {price:10}, {price:20}] — unchanged
```

---

## 8. How do you sort numbers correctly?

Always pass a comparator to `sort()` when sorting numbers: `arr.sort((a, b) => a - b)` for ascending, `arr.sort((a, b) => b - a)` for descending. Never rely on the default comparator, which stringifies elements and compares them lexicographically — that's the "10 before 2" bug from question 6.

For large arrays or floating-point values, `a - b` can theoretically misbehave with `NaN` or `Infinity` edge cases, so an explicit conditional comparator is sometimes safer, but `a - b` is standard practice for typical numeric data.

```js
const prices = [100, 25, 3, 40];

const ascending = [...prices].sort((a, b) => a - b);
// ascending => [3, 25, 40, 100]

const descending = [...prices].sort((a, b) => b - a);
// descending => [100, 40, 25, 3]
```

---

## 9. How do you remove duplicates from an array?

For an array of **primitives** (numbers, strings), the simplest approach is spreading into a `Set`, since `Set` only stores unique values: `[...new Set(arr)]`.

For an array of **objects** deduplicated by a specific key, a `Set` alone won't work because object references are always unique — you instead track seen keys with a `Set` while filtering, or key a `Map` by that property (a `Map` naturally overwrites duplicate keys, keeping the last occurrence).

```js
const ids = [1, 2, 2, 3, 3, 3];
const uniqueIds = [...new Set(ids)];
// uniqueIds => [1, 2, 3]

const users = [
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Linus' },
  { id: 1, name: 'Ada (dup)' },
];

// Filter with a seen-Set (keeps first occurrence)
const seen = new Set();
const uniqueUsers = users.filter(u => {
  if (seen.has(u.id)) return false;
  seen.add(u.id);
  return true;
});
// uniqueUsers => [{id:1,name:'Ada'}, {id:2,name:'Linus'}]

// Map keyed by id (keeps last occurrence)
const byId = new Map(users.map(u => [u.id, u]));
const uniqueUsers2 = [...byId.values()];
// uniqueUsers2 => [{id:1,name:'Ada (dup)'}, {id:2,name:'Linus'}]
```

---

## 10. How do you group an array of objects by a property?

The classic approach is `reduce()`: initialize an empty object (or `Map`), and for each element push it into the array at `acc[key]`, creating that array on first encounter with `acc[key] ??= []`.

As of ES2024, `Object.groupBy()` is a built-in that does exactly this without manual `reduce` bookkeeping — it takes an array and a callback returning the group key, and returns a plain object (with `null`-prototype) of key → array. It's not yet universally available in every runtime, so knowing the manual `reduce` version is still expected in interviews.

```js
const products = [
  { name: 'Laptop', category: 'Electronics' },
  { name: 'Shirt', category: 'Clothing' },
  { name: 'Phone', category: 'Electronics' },
];

// Manual reduce approach
const groupedReduce = products.reduce((acc, product) => {
  (acc[product.category] ??= []).push(product);
  return acc;
}, {});
// groupedReduce => { Electronics: [Laptop, Phone], Clothing: [Shirt] }

// ES2024 built-in
const groupedBuiltin = Object.groupBy(products, product => product.category);
// groupedBuiltin => { Electronics: [Laptop, Phone], Clothing: [Shirt] }
```

---

## 11. How do you flatten a nested array?

`Array.prototype.flat(depth)` flattens nested arrays up to `depth` levels (default `1`); pass `Infinity` to flatten arbitrarily deep nesting regardless of how many levels exist.

Before `flat()` existed (or when you need custom flattening logic per element), the same result can be built manually with `reduce()` and `concat()`, recursing for deeper levels.

```js
const nested = [1, [2, 3], [4, [5, 6]]];

nested.flat();
// => [1, 2, 3, 4, [5, 6]]   (only 1 level deep)

nested.flat(Infinity);
// => [1, 2, 3, 4, 5, 6]     (fully flattened)

// Manual version with reduce
const flattenOnce = arr => arr.reduce((acc, el) => acc.concat(el), []);
// flattenOnce([1, [2, 3], [4, 5]]) => [1, 2, 3, 4, 5]
```

---

## 12. How do you merge two arrays without mutating them?

Use the spread operator, `[...a, ...b]`, or `.concat()` — both return a **new** array and leave the originals untouched. Never use `a.push(...b)`; `push()` mutates `a` in place, which is a common source of bugs when `a` is React state or a shared reference elsewhere.

```js
const currentItems = [1, 2, 3];
const newItems = [4, 5];

const merged = [...currentItems, ...newItems];
// merged => [1, 2, 3, 4, 5]
// currentItems is untouched: [1, 2, 3]

const mergedConcat = currentItems.concat(newItems);
// mergedConcat => [1, 2, 3, 4, 5]  (also non-mutating)

// AVOID:
// currentItems.push(...newItems);  // mutates currentItems in place
```

---

## 13. How do you update one object inside an array immutably?

Use `map()` to build a new array where the target element is replaced with a new object (via spread plus overrides), and every other element is passed through unchanged. This is the standard React pattern for updating one item in a state array without mutating the original array or the original object.

The key is that non-matching elements return the **same reference**, so React's shallow-equality checks can skip re-rendering rows that didn't change, while the matching element gets a brand-new object reference so React knows to re-render it.

```js
const todos = [
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Walk dog', done: false },
];

const updated = todos.map(todo =>
  todo.id === 2 ? { ...todo, done: true } : todo
);
// updated => [
//   { id: 1, text: 'Buy milk', done: false },  // same reference as before
//   { id: 2, text: 'Walk dog', done: true }    // new object
// ]
// todos is untouched
```

---

## 14. How do you find the most frequent element in an array?

Build a frequency map first — an object or a `Map` counting occurrences of each value — typically with `reduce()`. Then iterate the frequency map's entries to find the key with the maximum count, either with another `reduce()` or by sorting entries and taking the top one.

```js
const votes = ['red', 'blue', 'red', 'green', 'red', 'blue'];

const counts = votes.reduce((acc, vote) => {
  acc[vote] = (acc[vote] ?? 0) + 1;
  return acc;
}, {});
// counts => { red: 3, blue: 2, green: 1 }

const mostFrequent = Object.entries(counts).reduce((best, [value, count]) =>
  count > best.count ? { value, count } : best,
  { value: null, count: 0 }
);
// mostFrequent => { value: 'red', count: 3 }
```

---

## 15. How do you convert an array into an object?

`Object.fromEntries()` is the most direct tool: pass it an array of `[key, value]` pairs (which you typically build with `map()`), and it returns a plain object. This is the natural pairing for "array of objects, keyed by id" lookups.

Alternatively, `reduce()` can build the object manually, which gives more control when the value isn't just the whole item (e.g., picking specific fields).

```js
const products = [
  { id: 'p1', name: 'Keyboard' },
  { id: 'p2', name: 'Mouse' },
];

const byId = Object.fromEntries(products.map(p => [p.id, p]));
// byId => { p1: { id: 'p1', name: 'Keyboard' }, p2: { id: 'p2', name: 'Mouse' } }

// Equivalent with reduce
const byIdReduce = products.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {});
// byIdReduce => same result as byId
```

---

## Practice

Given a list of products, implement: Search, Filter by category, Sort by price, Group by category, Calculate total price, Remove duplicates

```js
const products = [
  { id: 1, name: 'Laptop', category: 'Electronics', price: 1200 },
  { id: 2, name: 'Headphones', category: 'Electronics', price: 150 },
  { id: 3, name: 'T-Shirt', category: 'Clothing', price: 25 },
  { id: 4, name: 'Jeans', category: 'Clothing', price: 60 },
  { id: 5, name: 'Laptop', category: 'Electronics', price: 1200 }, // duplicate of id 1's data, different id
];

// 1. Search by name (case-insensitive substring match) — returns a new array
function searchProducts(list, query) {
  const q = query.toLowerCase();
  return list.filter(p => p.name.toLowerCase().includes(q));
}
searchProducts(products, 'lap');
// => [{id:1, name:'Laptop', ...}, {id:5, name:'Laptop', ...}]

// 2. Filter by category — returns a new array
function filterByCategory(list, category) {
  return list.filter(p => p.category === category);
}
filterByCategory(products, 'Clothing');
// => [{id:3, name:'T-Shirt', ...}, {id:4, name:'Jeans', ...}]

// 3. Sort by price (ascending) — returns a NEW sorted array, does not touch the input
function sortByPrice(list, direction = 'asc') {
  const sorted = [...list].sort((a, b) =>
    direction === 'asc' ? a.price - b.price : b.price - a.price
  );
  return sorted;
}
sortByPrice(products).map(p => p.price);
// => [25, 60, 150, 1200, 1200]

// 4. Group by category — returns a new object
function groupByCategory(list) {
  return list.reduce((acc, product) => {
    (acc[product.category] ??= []).push(product);
    return acc;
  }, {});
}
groupByCategory(products);
// => { Electronics: [Laptop, Headphones, Laptop], Clothing: [T-Shirt, Jeans] }

// 5. Calculate total price — returns a number
function calculateTotal(list) {
  return list.reduce((sum, product) => sum + product.price, 0);
}
calculateTotal(products);
// => 2635

// 6. Remove duplicates by id — returns a new array (keeps first occurrence)
function removeDuplicates(list) {
  const seen = new Set();
  return list.filter(p => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}
removeDuplicates(products).length;
// => 5 (no duplicate ids in this sample; try removeDuplicates([...products, products[0]]).length => 5)
```

`sort()` mutates its receiver, which is why `sortByPrice` sorts a copy (`[...list].sort(...)`) rather than `list.sort(...)` — the caller's original array and reference stay intact. `search`, `filter`, `group`, `total`, and `removeDuplicates` above are all built from `map`/`filter`/`reduce`, none of which mutate their input; they always return new data, which is exactly the behavior React's re-render model depends on.
