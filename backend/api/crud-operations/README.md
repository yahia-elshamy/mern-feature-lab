# API-02: Request Validation with Joi

A products REST API (built in [API-01](../api-01-crud-operations/README.md)) extended with **request validation using [Joi](https://joi.dev/api/)**. Incoming request bodies are checked against schemas in a reusable Express middleware before they reach the controllers or the database.

> **Status:** Implemented and manually tested with Postman. Automated tests are planned; see [Known Limitations](#known-limitations).

## Overview

In API-01, validation happened in two places: manual checks inside the controllers and Mongoose schema validators. This task adds a dedicated validation layer at the edge of the API:

- Invalid requests are rejected with `400` before any controller logic or database query runs.
- All validation errors are returned together in one consistent JSON shape.
- Unknown fields are removed and string fields are trimmed before the controller receives the body.

## Learning Objectives

- Define Joi schemas for create and update operations.
- Reuse field rules instead of duplicating them (`Joi.object().fork()`).
- Customize error messages with `.messages()` and the `{#label}` template.
- Build a reusable middleware with the factory pattern (`validate(schema)`).
- Understand `abortEarly`, `stripUnknown`, and the structure of `error.details`.
- Understand why validated data (`value`) must replace `req.body`.

## Key Concepts

- **Schema:** a description of the allowed shape of the data. Fields are optional unless `.required()` is applied.
- **Validation result:** `schema.validate(data, options)` returns `{ error, value }`. `value` is the cleaned copy (trimmed, unknown keys removed); `error.details` is an array of problems, each with `message`, `path`, and `type`.
- **Message keys:** custom messages are attached to Joi error types such as `string.empty`, `string.base`, `number.base`, `any.required`, and `object.min`.
- **Middleware factory:** `validate(schema)` returns the real `(req, res, next)` middleware, so one function can protect any route with any schema.
- **Defense in depth:** Joi rejects bad input early; Mongoose validators remain as a second layer at the model level.

## Technologies Used

| Tool | Version |
|------|---------|
| Node.js | Not pinned; use a currently supported LTS release |
| Express | See `package.json` |
| Mongoose | See `package.json` |
| Joi | See `package.json` |
| dotenv | See `package.json` |

## Project Structure

New and changed files compared to API-01:

```
Middlewares/
└── validate.js               # NEW: reusable validation middleware
Validators/
└── productValidator.js       # NEW: Joi schemas (create and update)
Routes/
└── productRoutes.js          # CHANGED: validation middleware added to write routes
```

All other files are unchanged from API-01.

## How It Works

1. A request reaches a protected route, for example `POST /api/products`.
2. `validate(schema)` runs `schema.validate(req.body, { abortEarly: false, stripUnknown: true })`.
3. If `error` exists, the middleware responds with `400` and a list of all problems. The controller is never called.
4. Otherwise, `req.body` is replaced with the cleaned `value` and `next()` is called.
5. The controller receives trimmed data that contains only known fields.

## Validation Rules

Field rules are defined once in `productFields` and shared by both schemas.

| Field | Rules |
|-------|-------|
| `name` | String, trimmed, 3 to 100 characters |
| `price` | Number, positive (greater than `0`) |
| `description` | String, trimmed, 10 to 255 characters |
| `category` | String, trimmed, 2 to 50 characters |

| Schema | Behavior |
|--------|----------|
| `createProductSchema` | All four fields are required (applied with `fork()`) |
| `updateProductSchema` | All fields are optional, but the body must contain at least one key (`object.min(1)`) |

Custom messages are defined for the common error types of each field. The required message uses the `{#label}` template, so it is written once and filled with the field name automatically.

## Middleware Options

| Option | Value | Why |
|--------|-------|-----|
| `abortEarly` | `false` | Return every error at once instead of only the first, which is better for form-based clients |
| `stripUnknown` | `true` | Silently remove fields that are not in the schema (for example a client-supplied `isAdmin`) |

## API Endpoints

Base path: `/api/products`

| Method | Endpoint | Validation |
|--------|----------|------------|
| `POST` | `/api/products` | Body validated with `createProductSchema` |
| `GET` | `/api/products` | None |
| `GET` | `/api/products/:id` | `ObjectId` check in the controller |
| `PATCH` | `/api/products/:id` | Body validated with `updateProductSchema` |
| `DELETE` | `/api/products/:id` | `ObjectId` check in the controller |

### Request and Response Examples

The message texts below come from the custom messages in the validator. `{#label}` messages include the field name in quotes, as Joi renders it.

**Create with multiple problems**

```http
POST /api/products
Content-Type: application/json

{
  "price": "abc",
  "description": "Ergonomic wireless mouse with USB receiver",
  "category": "Accessories"
}
```

```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "name", "message": "\"name\" is required" },
    { "field": "price", "message": "price must be a valid numbers" }
  ]
}
```

**Update with an empty body**

```http
PATCH /api/products/<objectId>
Content-Type: application/json

{}
```

```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "", "message": "you must update at least one field" }
  ]
}
```

The `field` is empty because this error belongs to the whole object, not to a specific key.

**Valid update**

```http
PATCH /api/products/<objectId>
Content-Type: application/json

{ "price": 19.99, "isAdmin": true }
```

`isAdmin` is not in the schema, so it is removed before the controller runs. Successful responses are unchanged from API-01.

## Validation and Error Handling

| Case | Status | Handled by |
|------|--------|------------|
| Joi schema violation on create or update | `400` | `validate` middleware |
| Empty body on update | `400` | `validate` middleware (`object.min`) |
| Malformed `:id` | `400` | Controller (`ObjectId.isValid`) |
| Valid `:id` that matches no document | `404` | Controller |
| Mongoose `ValidationError` or `CastError` | `400` | Error middleware |
| Unexpected errors | `500` | Error middleware |

Validation failures from Joi return `{ "message": "Validation failed", "errors": [...] }`. Other errors still return `{ "message": "..." }` as in API-01.

## Security Considerations

- Input is validated at the system boundary, before reaching business logic or the database.
- `stripUnknown` prevents unexpected fields from reaching the controller (a basic defense against mass-assignment style attacks).
- The cleaned `value` replaces `req.body`, so the controller never works with the raw input.
- Client-side validation is not trusted; validation always runs on the server.
- This API still has **no authentication or authorization**. It is a learning example and must not be exposed publicly as is.

## Setup and Usage

Setup is the same as API-01, with one extra dependency:

```bash
npm install
npm install joi
cp .env.example .env
npm run dev
```

Environment variables (`PORT`, `MONGO_URI`) are unchanged. Use placeholders only in `.env.example`.

## Testing

The endpoints were tested manually with Postman, including valid requests, missing required fields, wrongly typed values, empty strings, unknown fields, and an empty update body. No automated tests are included yet.

## Known Limitations

- **Only `req.body` is validated.** `req.params` (the `:id`) and `req.query` are not validated with Joi yet; the `ObjectId` check still lives in the controllers.
- **Two error shapes:** validation errors return `{ message, errors }`, while other errors return `{ message }`.
- **`price` boundary mismatch:** Joi requires `price > 0`, while the Mongoose model still allows `0`. Joi is stricter, so a price of `0` is rejected at the API.
- **Unknown fields are removed silently.** The client is not told that a field was ignored.
- No maximum or precision limit on `price`.
- No automated tests.

## Future Improvements

- Validate `req.params` and `req.query` with the same middleware (for example, by passing the request part to validate as a parameter).
- Unify error responses across the validation and error middlewares.
- Align the Mongoose `price` rule with the Joi rule.
- Add automated tests with Jest and Supertest.
- Evaluate whether unknown fields should be rejected instead of stripped.

## References

- [Joi API Reference](https://joi.dev/api/)
- [Express: Writing Middleware](https://expressjs.com/en/guide/writing-middleware.html)
- [Express: Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [Mongoose: Validation](https://mongoosejs.com/docs/validation.html)
- [MDN: HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)