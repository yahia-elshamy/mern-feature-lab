# API-01: CRUD Operations

A minimal REST API for managing **products**, built with Express 5, MongoDB, and Mongoose. It covers the four basic data operations (Create, Read, Update, Delete) and is the foundation for the later tasks in this repository (validation, pagination, authentication, testing).

> **Status:** Implemented and manually tested with Postman. Automated tests are planned; see [Known Limitations](#known-limitations).

## Learning Objectives

- Design a resource-based REST API with the correct HTTP methods and status codes.
- Define a Mongoose schema with built-in validators and timestamps.
- Separate responsibilities into routes, controllers, models, and middleware.
- Handle async errors with Express 5 and a centralized error-handling middleware.
- Validate MongoDB `ObjectId` values before querying.

## Key Concepts

- **CRUD to HTTP mapping:** `POST` creates, `GET` reads, `PATCH` partially updates, `DELETE` removes.
- **Schema validation:** Mongoose validators (`required`, `min`, `maxlength`, `trim`) enforce data rules at the model level.
- **Async error handling in Express 5:** rejected promises and errors thrown inside async handlers are forwarded to the error middleware automatically, so no `try/catch` or `next(err)` is needed in controllers.
- **Centralized error handling:** one middleware returns a consistent JSON error shape.

## Technologies Used

| Tool | Version (from `package.json`) |
|------|-------------------------------|
| Node.js | Not pinned; use a currently supported LTS release |
| Express | ^5.3.0 |
| Mongoose | ^9.11.4 |
| dotenv | ^18.0.9 |
| nodemon | ^3.1.14 (development) |

## Project Structure

```
api-01-crud-operations/
├── Controllers/
│   └── productController.js   # CRUD logic
├── Middlewares/
│   └── errorMiddleware.js     # Centralized error handler
├── Models/
│   └── Product.js             # Mongoose schema and model
├── Routes/
│   └── productRoutes.js       # Route definitions
├── .env.example               # Environment variable placeholders
├── index.js                   # App entry point and DB connection
└── package.json
```

## How It Works

1. `index.js` loads environment variables, registers `express.json()`, mounts the product routes at `/api/products`, and registers the error handler.
2. The server connects to MongoDB first. If the connection fails, the process exits with code `1`; otherwise it starts listening.
3. Each route calls a controller, which validates the input, queries MongoDB through the `Product` model, and sends a JSON response.
4. Any error thrown in a controller reaches `errorMiddleware.js`, which responds with `{ "message": "..." }`.

## Data Model

| Field | Type | Rules |
|-------|------|-------|
| `name` | String | Required, trimmed, max 100 characters |
| `price` | Number | Required, minimum `0` |
| `description` | String | Required, trimmed, 10 to 255 characters |
| `category` | String | Required |
| `createdAt`, `updatedAt` | Date | Added automatically (`timestamps: true`) |

## API Endpoints

Base path: `/api/products`

| Method | Endpoint | Description | Success |
|--------|----------|-------------|---------|
| `POST` | `/api/products` | Create a product | `201` |
| `GET` | `/api/products` | List all products | `200` |
| `GET` | `/api/products/:id` | Get one product | `200` |
| `PATCH` | `/api/products/:id` | Partially update a product | `200` |
| `DELETE` | `/api/products/:id` | Delete a product | `200` |

### Request and Response Examples

Response bodies follow the structure used in the controllers. `<objectId>` and `<date>` are placeholders.

**Create a product**

```http
POST /api/products
Content-Type: application/json

{
  "name": "Wireless Mouse",
  "price": 25.5,
  "description": "Ergonomic wireless mouse with USB receiver",
  "category": "Accessories"
}
```

```json
{
  "message": "Product created successfully",
  "data": {
    "_id": "<objectId>",
    "name": "Wireless Mouse",
    "price": 25.5,
    "description": "Ergonomic wireless mouse with USB receiver",
    "category": "Accessories",
    "createdAt": "<date>",
    "updatedAt": "<date>"
  }
}
```

**List products**

```json
{
  "message": "Products founded",
  "count": 1,
  "data": [ { "_id": "<objectId>", "name": "Wireless Mouse", "...": "..." } ]
}
```

**Update a product**

```http
PATCH /api/products/<objectId>
Content-Type: application/json

{ "price": 19.99 }
```

**Error response (all endpoints)**

```json
{ "message": "Product not found" }
```

## Validation and Error Handling

| Case | Status | Handled by |
|------|--------|------------|
| Missing required field on create (`price: 0` is accepted) | `400` | Controller |
| Malformed `:id` (`ObjectId.isValid` fails) | `400` | Controller |
| Valid `:id` that matches no document | `404` | Controller |
| Mongoose `ValidationError` (for example a negative price) | `400` | Error middleware |
| Mongoose `CastError` | `400` | Error middleware |
| Any other unexpected error | `500` | Error middleware |

- On update, `runValidators: true` makes Mongoose validate the changed fields, and `new: true` returns the updated document.
- For `ValidationError`, the messages of all invalid fields are joined into a single `message`.
- For `500` errors, the real error is logged on the server with `console.error`, and the client receives only `"Internal server error"` so internal details are not leaked.

## Security Considerations

- The `.env` file is excluded through `.gitignore`; only `.env.example` with placeholders is committed.
- Input is validated at the boundary (required fields, ID format, schema rules).
- This API has **no authentication or authorization**. It is intended as a learning example and must not be exposed publicly as is. Authentication is covered in later tasks.

## Setup and Usage

**Prerequisites:** Node.js (LTS) and a running MongoDB instance (local or hosted).

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env

# 3. Start the development server
npm run dev
```

Test the endpoints with Postman, Thunder Client, or `curl`.

### Environment Variables

| Variable | Description | Example placeholder |
|----------|-------------|---------------------|
| `PORT` | Port the server listens on (defaults to `5000` if unset) | `3000` |
| `MONGO_URI` | MongoDB connection string. Include a database name, otherwise MongoDB uses the default `test` database | `mongodb://localhost:27017/<database-name>` |

## Testing

The endpoints were tested manually with Postman by the author. No automated tests are included yet; they are planned in a later task.

## Known Limitations

- **No explicit whitelist on update:** `PATCH` passes `req.body` directly to `findByIdAndUpdate`. Mongoose's default strict mode ignores fields that are not in the schema, but an explicit allow-list would make the intent clearer.
- **No pagination, filtering, or sorting** on the list endpoint.
- **No automated tests.**
- Some response messages are inconsistent in wording and capitalization (for example `"Products founded"` and `"product found"`).

## Future Improvements

- Add pagination, filtering, and sorting (see the search and pagination task in the roadmap).
- Add request validation with a dedicated schema validator.
- Add automated tests (Jest and Supertest).
- Move `nodemon` to `devDependencies` and add a `start` script.
- Add a custom error class that carries its own status code.

## References

- [Express 5: Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [Express: Routing](https://expressjs.com/en/guide/routing.html)
- [Mongoose: Validation](https://mongoosejs.com/docs/validation.html)
- [Mongoose: Models and `findByIdAndUpdate`](https://mongoosejs.com/docs/api/model.html)
- [MDN: HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [MDN: HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)