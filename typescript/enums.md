# Enums

```ts
enum Role {
  USER,
  ADMIN
}
```

## 1. What is an enum?

An enum defines a named set of related constant values — a way to give meaningful names to a fixed set of options, similar in spirit to a union of literals, but implemented as an actual runtime construct rather than purely a compile-time type.

```ts
enum Role {
  USER,
  ADMIN,
}

let role: Role = Role.ADMIN;
```

---

## 2. What's the difference between numeric and string enums?

A numeric enum (the default) assigns each member an auto-incrementing number starting at 0, unless you specify values explicitly. A string enum requires every member to have an explicit string value — string enums are generally easier to debug (the value itself is meaningful when logged) and don't have numeric enums' "reverse mapping" quirk.

```ts
enum RoleNumeric {
  USER,   // 0
  ADMIN,  // 1
}

enum RoleString {
  USER = "USER",
  ADMIN = "ADMIN",
}

console.log(RoleNumeric.ADMIN); // 1 - not very informative on its own
console.log(RoleString.ADMIN);  // "ADMIN" - self-explanatory
```

---

## 3. What are the runtime implications of enums?

Unlike most TypeScript type-only constructs (which are fully erased at compile time), a regular enum generates real JavaScript code — an actual object exists at runtime. Numeric enums additionally generate a "reverse mapping" (looking up the name from the value), which adds extra code to the compiled output that a plain union of literals never would.

```ts
enum Role { USER, ADMIN }
// compiles to something like:
// var Role;
// (function (Role) {
//   Role[Role["USER"] = 0] = "USER";
//   Role[Role["ADMIN"] = 1] = "ADMIN";
// })(Role || (Role = {}));
```

---

## 4. What are `const` enums?

A `const enum` is fully inlined at compile time — every usage is replaced directly with its literal value, and no runtime object is generated at all, avoiding the extra output regular enums produce. The tradeoff is some tooling/bundler limitations (they can't always be used across certain module boundaries), which is part of why some codebases avoid them.

```ts
const enum Role {
  USER,
  ADMIN,
}

let role = Role.ADMIN; // compiles directly to `let role = 1;` - no Role object exists at runtime
```

---

## 5. When might a union of literals be preferable to an enum?

A union of literals (`"admin" | "user"`) is purely a compile-time construct — it generates zero runtime code, has no reverse-mapping quirks, and works naturally with plain strings you might already be receiving from an API, without needing to convert to/from an enum. This is why many modern TypeScript codebases default to literal unions and reserve enums for cases that specifically benefit from being an actual runtime object.

---

## A Note on Enums

Don't just memorize enum syntax. Understand *why* many modern TypeScript codebases use literal unions instead: unions add zero runtime overhead, avoid enum quirks like numeric reverse mapping, and interoperate more naturally with plain string data from APIs. Enums still have their place, but they're no longer the automatic default they once were.
