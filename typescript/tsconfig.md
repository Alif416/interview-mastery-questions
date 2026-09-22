# tsconfig.json ⭐

You need to understand the important compiler settings, not just copy them.

```json
{
  "compilerOptions": {
    "target": "...",
    "module": "...",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true
  }
}
```

## 1. What is tsconfig.json?

tsconfig.json is the configuration file that tells the TypeScript compiler how to behave — which files to include, which JavaScript version to compile down to, how strict the type checking should be, and dozens of other options that shape how a project is type-checked and compiled.

---

## 2. What does `target` control?

`target` sets which version of JavaScript the compiler outputs — newer syntax (like optional chaining, or class fields) gets either preserved as-is or transformed into older, more widely-compatible syntax, depending on which ECMAScript version you target and what environments you actually need to support.

---

## 3. What does `module` control?

`module` sets which module system the compiled output uses — `CommonJS` (`require`/`module.exports`, traditional Node), `ESNext`/`ES2020` (native `import`/`export`, modern bundlers), or others — matching whatever your runtime or bundler actually expects.

---

## 4. What does `strict` do?

`strict` is a single flag that enables a whole bundle of stricter type-checking rules at once — including `noImplicitAny`, `strictNullChecks`, and several other related flags — rather than requiring you to turn each one on individually.

---

## 5. Why use `strict: true`?

Without it, TypeScript allows a lot of loose, unsafe patterns by default — implicit `any`, treating `null`/`undefined` as assignable to anything — that undercut much of the value TypeScript is supposed to provide. `strict: true` is the widely recommended baseline for any real project: it catches significantly more bugs at compile time, and nearly every professional TypeScript codebase enables it.

---

## 6. What is `noImplicitAny`?

`noImplicitAny` (part of `strict`) makes it an error when TypeScript can't infer a type and would otherwise silently fall back to `any` — forcing you to add an explicit annotation instead of accidentally losing type safety without realizing it.

```ts
// with noImplicitAny: true
function greet(name) { // error - 'name' implicitly has an 'any' type
  return `Hello, ${name}`;
}
```

---

## 7. What is `strictNullChecks`?

`strictNullChecks` (part of `strict`) makes `null` and `undefined` their own distinct types that aren't automatically assignable to every other type — a variable typed `string` genuinely cannot be `null` unless you explicitly write `string | null`. Without this flag, TypeScript silently allows `null`/`undefined` anywhere, a major source of runtime crashes in untyped JavaScript.

---

## 8. What is `noUnusedLocals`?

`noUnusedLocals` flags any local variable that's declared but never actually used — helping catch dead code, leftover debugging variables, and typos where you meant to reference a different variable.

---

## 9. What is `noUnusedParameters`?

`noUnusedParameters` does the same thing for function parameters — flagging a parameter that's declared but never used inside the function body. A genuinely-unused parameter you still need to accept (for positional reasons, like an unused callback argument) can be prefixed with `_` to silence the warning.

---

## 10. What does `noEmit` do?

`noEmit` tells the compiler to only perform type checking, without actually writing out any compiled `.js` files — common in setups where a separate tool (Babel, esbuild, or a bundler) handles the actual compilation, and `tsc` is run purely as a type-checking step.

---

## 11. What does `esModuleInterop` do?

`esModuleInterop` smooths over differences between CommonJS and ES module import/export semantics, allowing `import React from "react"`-style default imports to work correctly against CommonJS packages that don't actually have a real "default" export. Without it, some imports from CommonJS libraries would require more awkward syntax to work correctly.

---

## A Note on tsconfig.json

Do not just copy a tsconfig from a template and move on. Understand what the major options — `strict`, `target`, `module`, `esModuleInterop` — actually control, so you can reason about *why* a particular setting is on or off, and adjust it deliberately when a project's needs call for it.
