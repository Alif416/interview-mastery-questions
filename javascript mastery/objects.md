# Objects and Prototypes

> This is where many JavaScript developers become much stronger.

---

## 1. What is an object?

An object is a collection of key-value pairs, where keys (called properties) are strings or symbols and values can be any type, including other objects or functions. Objects are the fundamental composite data structure in JavaScript — arrays, functions, dates, regexes, and class instances are all objects under the hood, each with extra internal behavior layered on top of the base object mechanics.

Properties can be added, removed, and reassigned dynamically at runtime, since object shape in JavaScript is not fixed by a type declaration. Internally, an object also carries a hidden link to another object called its prototype, which is used to resolve property lookups that fail on the object itself.

```js
const user = {
  name: "Ada",
  age: 30,
  greet() {
    return `Hi, I'm ${this.name}`;
  },
};

console.log(user.name); // "Ada"
console.log(user.greet()); // "Hi, I'm Ada"

user.role = "engineer"; // properties can be added after creation
```

---

## 2. What is the difference between an object and a primitive?

Primitives (`string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`) are immutable values stored and compared by value — two primitives with the same content are strictly equal. Objects are mutable, stored and compared by reference — two distinct objects with identical contents are never strictly equal, because equality checks whether both variables point to the same location in memory.

Primitives have no own properties or methods; when you call a method like `"abc".toUpperCase()`, JavaScript temporarily wraps the primitive in a corresponding wrapper object (`String`, `Number`, `Boolean`), performs the call, and discards the wrapper. Objects genuinely hold their properties and can be extended, mutated, or have properties deleted at any time.

```js
let a = 5;
let b = a;
b = 10;
console.log(a); // 5 — primitives are copied by value

const obj1 = { x: 5 };
const obj2 = obj1;
obj2.x = 10;
console.log(obj1.x); // 10 — objects are copied by reference

console.log({ x: 1 } === { x: 1 }); // false, different references
console.log(5 === 5); // true, same value
```

| | Primitive | Object |
|---|---|---|
| Mutability | Immutable | Mutable |
| Stored/compared | By value | By reference |
| Assignment | Copies the value | Copies the reference |
| Has own properties | No (auto-boxed temporarily) | Yes |

---

## 3. What is the difference between shallow copy and deep copy?

A shallow copy duplicates only the top-level properties of an object. If any of those properties are themselves objects or arrays, the copy stores a reference to the same nested object rather than a new one — mutating a nested value through the copy also mutates the original. `{...obj}`, `Object.assign({}, obj)`, and `Array.prototype.slice()` all produce shallow copies.

A deep copy recursively duplicates every level of nested structure, so the copy shares no object references with the original at any depth. `structuredClone()` (built into modern JS engines) performs a true deep copy, including support for `Map`, `Set`, dates, and circular references. Before `structuredClone` existed, deep copies were commonly done with `JSON.parse(JSON.stringify(obj))`, which works for plain data but silently drops functions, `undefined`, symbols, and loses `Date`/`Map`/`Set` types.

```js
const original = { name: "Ada", address: { city: "London" } };

// Shallow copy
const shallow = { ...original };
shallow.address.city = "Paris";
console.log(original.address.city); // "Paris" — nested object was shared

// Deep copy
const original2 = { name: "Ada", address: { city: "London" } };
const deep = structuredClone(original2);
deep.address.city = "Paris";
console.log(original2.address.city); // "London" — untouched
```

| | Shallow copy | Deep copy |
|---|---|---|
| Top-level properties | New copies | New copies |
| Nested objects | Shared by reference | Fully duplicated |
| Common tools | `{...obj}`, `Object.assign` | `structuredClone`, recursive clone |
| Risk | Mutating nested data leaks back | Slower, more memory for large graphs |

---

## 4. What happens when you assign one object to another variable?

Object variables in JavaScript hold a reference to the object's location in memory, not the object itself. When you assign an object to another variable, only that reference is copied — both variables end up pointing at the exact same underlying object. There is no duplication of the object's contents.

As a result, mutating the object through either variable is visible through the other, since there is really only one object involved. This is different from reassigning the variable itself: pointing one of the variables at a brand-new object does not affect the other, because that only changes what the variable refers to, not the shared object.

```js
const a = { count: 1 };
const b = a;

b.count = 99;
console.log(a.count); // 99 — same underlying object

b = { count: 0 }; // reassigning b to a new object
// (this line would actually throw, since b is const;
//  with `let b = a` it would just make b point elsewhere,
//  leaving `a` unaffected)
```

---

## 5. What is object destructuring?

Object destructuring is syntax for extracting properties from an object into standalone variables in a single expression, matching by property name rather than position. It reduces repetitive `obj.prop` access and supports renaming, default values, and pulling out remaining properties with a rest pattern.

Destructuring can be nested to pull values out of nested objects directly, and it works anywhere a binding pattern is allowed — variable declarations, function parameters, and assignment targets.

```js
const user = { name: "Ada", age: 30, address: { city: "London" } };

const { name, age: userAge, country = "UK", ...rest } = user;
console.log(name, userAge, country); // "Ada" 30 "UK"
console.log(rest); // { address: { city: "London" } }

const {
  address: { city },
} = user;
console.log(city); // "London"

function printUser({ name, age }) {
  console.log(`${name} is ${age}`);
}
printUser(user); // "Ada is 30"
```

---

## 6. What is optional chaining?

Optional chaining (`?.`) short-circuits a property access, method call, or index lookup to `undefined` instead of throwing when the value immediately before the `?.` is `null` or `undefined`. It replaces verbose manual guards like `obj && obj.a && obj.a.b` with a single concise chain, and stops evaluating the rest of the chain as soon as it hits a nullish value.

It composes with property access (`?.`), computed access (`?.[]`), and function calls (`?.()`), which is useful for optionally calling a callback that may not have been provided.

```js
const user = { profile: { name: "Ada" } };

console.log(user.profile?.name); // "Ada"
console.log(user.settings?.theme); // undefined, no error thrown
console.log(user.settings?.theme?.color); // undefined, short-circuits early

const callback = null;
callback?.(); // does nothing, does not throw

console.log(user.roles?.[0]); // undefined, safe computed access
```

---

## 7. What is nullish coalescing?

The nullish coalescing operator (`??`) returns its right-hand operand only when the left-hand operand is `null` or `undefined`; for every other value — including `0`, `""`, `false`, and `NaN` — it returns the left-hand operand unchanged. It is commonly paired with optional chaining to supply a default when a chained lookup resolves to `undefined`.

It differs from `||`, which falls back on any falsy value, not just nullish ones. This distinction matters whenever a legitimate value like `0` or an empty string should be preserved rather than treated as "missing."

```js
const count = 0;

console.log(count || 10); // 10 — 0 is falsy, so || falls back
console.log(count ?? 10); // 0 — 0 is not nullish, so ?? keeps it

const user = { name: "" };
console.log(user.name ?? "Anonymous"); // "" — kept, not nullish
console.log(user.age ?? 18); // 18 — age is undefined
```

---

## 8. What is the difference between Object.keys(), Object.values(), and Object.entries()?

All three inspect an object's own enumerable string-keyed properties (they ignore inherited and symbol-keyed properties) and return the results as an array. `Object.keys()` returns just the property names, `Object.values()` returns just the corresponding values, and `Object.entries()` returns `[key, value]` pairs, which is especially useful for iterating with `for...of` or converting an object into a `Map`.

Because all three return plain arrays, the full array method surface (`map`, `filter`, `reduce`, and so on) is available for transforming object data, which is not directly possible by iterating the object itself.

```js
const scores = { alice: 90, bob: 75, carol: 88 };

console.log(Object.keys(scores)); // ["alice", "bob", "carol"]
console.log(Object.values(scores)); // [90, 75, 88]
console.log(Object.entries(scores)); // [["alice",90],["bob",75],["carol",88]]

for (const [name, score] of Object.entries(scores)) {
  console.log(`${name}: ${score}`);
}

const passed = Object.entries(scores).filter(([, score]) => score >= 80);
console.log(passed); // [["alice",90],["carol",88]]
```

---

## 9. What is a prototype?

A prototype is an object that another object is linked to internally, used as a fallback source for properties and methods that aren't found directly on the object itself. Every object has an internal `[[Prototype]]` slot (exposed in most engines via `__proto__`) pointing to its prototype, and that prototype can itself have its own prototype, forming a chain.

Prototypes are how JavaScript implements shared behavior without copying methods onto every instance: instead of every array carrying its own `push` function, all arrays share `Array.prototype`, which defines `push` once. Functions used as constructors expose a `.prototype` property, which becomes the prototype of every object they construct with `new`.

```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function () {
  return `${this.name} makes a sound`;
};

const dog = new Animal("Rex");
console.log(dog.speak()); // "Rex makes a sound"
console.log(Object.getPrototypeOf(dog) === Animal.prototype); // true
```

---

## 10. What is the prototype chain?

The prototype chain is the sequence of linked prototype objects JavaScript walks when looking up a property that isn't found directly on an object. Lookup starts on the object itself, then moves to its `[[Prototype]]`, then that object's `[[Prototype]]`, and so on, until the property is found or the chain ends at `null` (the prototype of `Object.prototype`).

This is what makes methods like `.toString()` or `.hasOwnProperty()` available on plain objects even though they're never defined on the object itself — they live on `Object.prototype`, at the end of the chain. If a property exists at multiple levels of the chain, the closest one (nearest the original object) wins, which is how instance properties "shadow" prototype properties of the same name.

```js
const base = { greet() { return "hi"; } };
const mid = Object.create(base);
const instance = Object.create(mid);

console.log(instance.greet()); // "hi" — found via base, two links up
console.log(Object.getPrototypeOf(instance) === mid); // true
console.log(Object.getPrototypeOf(mid) === base); // true
console.log(Object.getPrototypeOf(base)); // Object.prototype
console.log(Object.getPrototypeOf(Object.prototype)); // null — end of chain
```

---

## 11. What is prototypal inheritance?

Prototypal inheritance is JavaScript's mechanism for one object to reuse and build on the properties and methods of another by linking to it through the prototype chain, rather than by copying members from a class blueprint (classical inheritance). An object "inherits" a property simply by having a prototype that owns it — no duplication occurs, and a change to the prototype's method is instantly visible to every object linked to it.

`Object.create(proto)` creates a new object with `proto` as its prototype directly. Constructor functions with `new`, and `class`/`extends`, are both higher-level syntax that ultimately set up the same kind of prototype link under the hood.

```js
const vehicle = {
  start() {
    return `${this.type} is starting`;
  },
};

const car = Object.create(vehicle);
car.type = "Car";

console.log(car.start()); // "Car is starting" — inherited via prototype
console.log(car.hasOwnProperty("start")); // false, it's inherited, not own
console.log(car.hasOwnProperty("type")); // true, own property
```

---

## 12. What is the difference between __proto__ and prototype?

`__proto__` is a legacy accessor property (getter/setter) exposed on `Object.prototype` that reads or sets the internal `[[Prototype]]` of a *specific object instance* — it exists on every object and points to that object's prototype. `.prototype`, by contrast, is a plain, ordinary property that exists only on *functions*; it is the object that will become the `[[Prototype]]` of every instance created by calling that function with `new`.

In short, `.prototype` is a blueprint sitting on the constructor function, while `__proto__` is the actual live link on an instance pointing back to that blueprint (or to whatever object was set as its prototype). The modern, standard way to read or set an object's prototype is `Object.getPrototypeOf()` / `Object.setPrototypeOf()` rather than `__proto__`, which is preserved mainly for legacy compatibility.

```js
function Person(name) {
  this.name = name;
}

const p = new Person("Ada");

console.log(typeof Person.prototype); // "object" — exists on the function
console.log(p.__proto__ === Person.prototype); // true
console.log(Object.getPrototypeOf(p) === Person.prototype); // true, preferred form
console.log(p.prototype); // undefined — instances don't have .prototype
```

| | `__proto__` | `.prototype` |
|---|---|---|
| Lives on | Any object instance | Functions only |
| Points to | That object's own `[[Prototype]]` | Object to be used as the `[[Prototype]]` of instances created via `new` |
| Purpose | Read/set an instance's prototype link | Define shared methods for future instances |
| Preferred API | `Object.getPrototypeOf`/`setPrototypeOf` | Direct property access |

---

## 13. What is the difference between a constructor function and a class?

A constructor function is an ordinary function that, by convention, is invoked with `new` to build objects, attaching shared methods manually via `.prototype`. A `class` is syntactic sugar over the same prototype mechanism — under the hood, a class still produces a constructor function with a `.prototype` object — but it comes with stricter, safer defaults.

Methods defined inside a `class` body are non-enumerable by default (they won't show up in `for...in` or `Object.keys()`), whereas methods manually assigned to `SomeFn.prototype.method = ...` are enumerable by default. A class cannot be invoked without `new` — doing so throws a `TypeError` — while a constructor function can be called without `new`, silently running with `this` bound to the global object (non-strict mode) or `undefined` (strict mode), which is a common source of bugs. Classes are also not hoisted the way function declarations are: they exist in a temporal dead zone and throw a `ReferenceError` if referenced before their declaration is evaluated. Finally, the entire body of a class is implicitly in strict mode, regardless of the surrounding code.

```js
function PersonFn(name) {
  this.name = name;
}
PersonFn.prototype.greet = function () {
  return `Hi, ${this.name}`;
};

class PersonClass {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return `Hi, ${this.name}`;
  }
}

console.log(Object.keys(PersonFn.prototype)); // ["greet"] — enumerable
console.log(Object.keys(PersonClass.prototype)); // [] — non-enumerable

PersonFn("Bob"); // runs silently, `this` is global/undefined
// PersonClass("Bob"); // throws: Class constructor cannot be invoked without 'new'
```

| | Constructor function | Class |
|---|---|---|
| Callable without `new` | Yes (buggy `this`) | No (`TypeError`) |
| Method enumerability | Enumerable by default | Non-enumerable by default |
| Hoisting | Fully hoisted | In temporal dead zone |
| Strict mode | Not implied | Always implied |

---

## 14. What does the new keyword do?

When a function is invoked with `new`, four things happen in order. First, a brand-new plain object is created. Second, that object's internal `[[Prototype]]` is set to the constructor function's `.prototype` property, linking it into the prototype chain. Third, the constructor function is called with `this` bound to the new object, so any `this.x = ...` assignments inside the function populate it. Fourth, the new object is returned automatically — unless the constructor explicitly returns its own object value, in which case that returned object is used instead (an explicit primitive return value is ignored).

This sequence is exactly what lets `instanceof` work, since the new object's prototype chain includes `Constructor.prototype`.

```js
function Person(name) {
  this.name = name;
  // no explicit return -> the new object is returned automatically
}

const p = new Person("Ada");
console.log(p.name); // "Ada"
console.log(p instanceof Person); // true

function Weird() {
  this.value = 1;
  return { value: 99 }; // explicit object return overrides the new object
}
console.log(new Weird().value); // 99
```

---

## 15. What is the difference between call, apply, and bind?

`call` and `apply` both invoke a function immediately with an explicitly supplied `this` value; they differ only in how they pass arguments — `call` takes them as a comma-separated list, while `apply` takes them as a single array. `bind` does not invoke the function at all; instead it returns a new function with `this` (and optionally some leading arguments) permanently locked in, ready to be called later, as many times as needed.

These are most often used to borrow a method from one object and run it against another, or to fix the `this` context of a callback before passing it somewhere that will call it without its original receiver (such as an event handler).

```js
const person = { name: "Ada" };

function introduce(greeting, punctuation) {
  return `${greeting}, I'm ${this.name}${punctuation}`;
}

console.log(introduce.call(person, "Hello", "!")); // "Hello, I'm Ada!"
console.log(introduce.apply(person, ["Hi", "."])); // "Hi, I'm Ada."

const boundIntroduce = introduce.bind(person, "Hey");
console.log(boundIntroduce("?")); // "Hey, I'm Ada?" — called later
```

| | `call` | `apply` | `bind` |
|---|---|---|---|
| Invokes immediately | Yes | Yes | No |
| Argument form | Comma-separated | Array | Comma-separated (partial application) |
| Return value | Function's result | Function's result | A new bound function |

---

## 16. What is the difference between Object.freeze() and Object.seal()?

`Object.freeze()` locks an object down completely at the top level: no properties can be added, removed, or reassigned, and property descriptors (like `writable` and `configurable`) can't be changed either. `Object.seal()` is less restrictive — it prevents adding or removing properties, but existing properties remain writable and can still be reassigned to new values.

Both are shallow: they only lock the object's own top-level properties. If a frozen or sealed object has a nested object as a property value, that nested object is untouched by the freeze/seal and remains fully mutable unless it is frozen or sealed separately. Both operations also fail silently in non-strict mode when a disallowed mutation is attempted, and throw a `TypeError` in strict mode.

```js
"use strict";

const frozen = Object.freeze({ name: "Ada", nested: { level: 1 } });
frozen.name = "Bob"; // throws in strict mode, ignored otherwise
frozen.nested.level = 2; // allowed! freeze is shallow
console.log(frozen.name, frozen.nested.level); // "Ada" 2

const sealed = Object.seal({ name: "Ada" });
sealed.name = "Bob"; // allowed, reassignment permitted
sealed.age = 30; // throws in strict mode, ignored otherwise
console.log(sealed.name, sealed.age); // "Bob" undefined
```

| | `Object.freeze()` | `Object.seal()` |
|---|---|---|
| Add new properties | No | No |
| Remove properties | No | No |
| Reassign existing properties | No | Yes |
| Depth | Shallow | Shallow |

---

## Practice

Build a small `User` constructor using prototypes, then rewrite it using a class.

```js
// --- Constructor function + prototype ---
function User(name, email) {
  this.name = name;
  this.email = email;
}

User.prototype.greet = function () {
  return `Hi, I'm ${this.name}`;
};

User.prototype.updateEmail = function (newEmail) {
  this.email = newEmail;
  return this.email;
};

const u1 = new User("Ada", "ada@example.com");
console.log(u1.greet()); // "Hi, I'm Ada"
console.log(u1.updateEmail("ada@newmail.com")); // "ada@newmail.com"

// --- Equivalent ES6 class ---
class UserClass {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  greet() {
    return `Hi, I'm ${this.name}`;
  }

  updateEmail(newEmail) {
    this.email = newEmail;
    return this.email;
  }
}

const u2 = new UserClass("Ada", "ada@example.com");
console.log(u2.greet()); // "Hi, I'm Ada"
console.log(u2.updateEmail("ada@newmail.com")); // "ada@newmail.com"
```

Both forms produce objects with the same shape: instance properties (`name`, `email`) set in the constructor, and shared methods (`greet`, `updateEmail`) living once on the shared `prototype` object rather than being duplicated per instance. The subtle difference is enumerability — `User.prototype.greet` is enumerable by default and would show up in a `for...in` loop over an instance, while `UserClass.prototype.greet` is non-enumerable, so it is hidden from `for...in` and `Object.keys()` even though it's still callable and visible via the prototype chain.
