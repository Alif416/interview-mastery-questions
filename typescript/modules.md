# Modules & TypeScript Project Structure

## 1. What's the difference between `.ts` and `.tsx` files?

Both are TypeScript source files — `.tsx` is specifically for files that contain JSX syntax (like React components), since the compiler needs to know to parse `<Tag>`-style syntax as JSX rather than, say, the angle-bracket type assertion syntax. Plain `.ts` files can't contain JSX at all.

---

## 2. Why use `import type`?

`import type` explicitly imports something that's only used as a type, never as a runtime value — the compiler can then safely strip that import out of the compiled JavaScript entirely, since nothing at runtime actually needs it. This keeps the compiled output smaller and makes the intent explicit: "this import exists only for type checking."

```ts
import type { User } from "./types";
import { fetchUser } from "./api"; // this one IS used at runtime, so a normal import

function greet(user: User) {
  return `Hello, ${user.name}`;
}
```

---

## 3. What are type-only exports?

Similarly, `export type` marks an export as type-only, making it explicit (and enforceable) that whatever's exported can only ever be imported as a type, not used as a runtime value — useful for keeping a module's actual runtime exports clearly separated from its type-only ones.

```ts
export type { User } from "./models"; // only usable via `import type`
```

---

## 4. What is a `.d.ts` file?

A `.d.ts` ("declaration") file contains only type information — no actual implementation, no runtime code — describing the shape of something that exists elsewhere, typically plain JavaScript. It lets TypeScript type-check against JavaScript code (including third-party libraries) that wasn't itself written in TypeScript.

```ts
// mylib.d.ts
declare function greet(name: string): string;
```

---

## 5. What is module resolution?

Module resolution is the process TypeScript uses to figure out, given an import statement like `import { User } from "./models"`, exactly which file (and which types) that import actually refers to — following relative paths, checking `node_modules`, and respecting settings in `tsconfig.json` that control the resolution strategy.

---

## 6. How does TypeScript find type definitions?

For your own code, it reads the `.ts`/`.tsx` files directly. For plain JavaScript libraries, it looks for a bundled `.d.ts` file — many modern packages ship their own — or falls back to checking the separate, community-maintained `@types/` packages (like `@types/react`) on npm, which provide type definitions for libraries that don't include their own.
