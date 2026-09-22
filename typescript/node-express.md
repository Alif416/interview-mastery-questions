# TypeScript + Node/Express

Since you're learning Express, master typing across the whole request lifecycle.

## 1. How do you type request objects?

Express's `Request` type (from `@types/express`) already covers the standard fields (`body`, `params`, `query`, `headers`, etc.), but those default to loosely-typed shapes. You typically parameterize `Request<Params, ResBody, ReqBody, Query>` with your own types for a specific route's expected params/body/query, giving accurate autocomplete and checking for that route.

```ts
import { Request } from "express";

interface CreateUserBody {
  name: string;
  email: string;
}

function handler(req: Request<{}, {}, CreateUserBody>) {
  const { name, email } = req.body; // typed as CreateUserBody, not any
}
```

---

## 2. How do you type response objects?

Use Express's `Response` type, optionally parameterized with the shape of the JSON body you're sending back — `res.json()` and `res.status().json()` then get checked against that shape.

```ts
import { Response } from "express";

interface UserResponse {
  id: number;
  name: string;
}

function handler(req: Request, res: Response<UserResponse>) {
  res.json({ id: 1, name: "Alex" }); // checked against UserResponse
}
```

---

## 3. How do you type middleware?

A middleware function is typed with Express's `Request`, `Response`, and `NextFunction` parameter types — `NextFunction` types the `next()` callback used to pass control to the next middleware/handler.

```ts
import { Request, Response, NextFunction } from "express";

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
```

---

## 4. How do you type route handlers?

Type each handler's parameters with `Request`/`Response` (parameterized with route-specific types as needed), and let the return type be inferred — route handlers typically don't return a meaningful value, they call `res.send()`/`res.json()` instead.

```ts
import { Request, Response } from "express";

app.get("/users/:id", (req: Request<{ id: string }>, res: Response) => {
  const userId = req.params.id; // typed as string, matching the route's :id param
  res.json({ id: userId });
});
```

---

## 5. How do you type environment variables?

By default, `process.env` values are typed as `string | undefined` — Node/TypeScript can't know at compile time whether a given env var was actually set. You can narrow this with runtime validation at startup (checking required variables exist and throwing early if not), and optionally augment `NodeJS.ProcessEnv`'s type via declaration merging for better autocomplete on your specific expected variables.

```ts
// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    PORT: string;
  }
}

const dbUrl = process.env.DATABASE_URL; // now typed as string, not string | undefined
```

---

## 6. How do you type database models?

Define a type/interface matching each table or collection's shape, ideally generated or kept in sync with your actual schema. Many ORMs — Prisma, Drizzle, TypeORM — can generate these types directly from your schema definition, rather than hand-writing them and risking drift.

```ts
interface UserModel {
  id: number;
  email: string;
  passwordHash: string;
  createdAt: Date;
}
```

---

## 7. How do you type service functions?

Type a service function's parameters and return type the same as any other function — typically taking validated input data and returning a domain type (like `User`), independent of any Express-specific `Request`/`Response` types. Service functions shouldn't need to know they're being called from an HTTP handler at all.

```ts
async function createUser(data: CreateUserInput): Promise<User> {
  // business logic, database calls, etc. - no Request/Response types here at all
}
```

---

## 8. How do you type error handling?

Since a `catch` block's error is typed `unknown` by default in modern TypeScript (you genuinely can't know what was thrown), narrow it before use — typically checking `instanceof Error` to safely access `.message`, or checking for your own custom error classes to handle specific error types differently.

```ts
try {
  await createUser(data);
} catch (err) {
  if (err instanceof Error) {
    console.error(err.message); // safe - narrowed to Error
  }
  res.status(500).json({ error: "Something went wrong" });
}
```

---

## 9. How do you type API responses on the server side?

Define the response shape as a type — the same way as on the client — and use it both to type what the server actually sends (`Response<ResponseShape>`) and to type what a client consuming this API should expect. Ideally, share that type definition between frontend and backend (in a monorepo, or a shared types package) so both sides can never drift out of sync.

---

## Layered Architecture

You should eventually be comfortable tracing types through a typical layered backend:

```
Controller
   ↓
Service
   ↓
Repository
   ↓
Database
```

Understand what type moves between each layer: the Controller typically works with `Request`/`Response` types and raw, unvalidated input; the Service layer works with validated domain types and contains business logic; the Repository layer works with database model types and handles persistence; and the Database itself is the source of truth those model types are meant to represent.
