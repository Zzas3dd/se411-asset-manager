# Asset Manager

SE411 Project (Fall 2026-27). A company computer asset management system.

- Part 1: React frontend.
- Part 2: Java Spring Boot backend with REST APIs, connected to the React frontend.

## Features

- Menu to move between pages
- View all assets in a paginated table (5 per page) loaded from Spring Boot
- View detailed information for each asset, loaded by ID from Spring Boot
- Add new assets (saved through the Spring Boot API)
- Edit existing assets
- Delete assets with confirmation
- Search assets by name, serial number, or assigned employee (across all pages)
- Filter assets by status (across all pages)
- About page with the team members

## Project structure

```
se411-asset-manager/
├── backend/        Spring Boot REST API (Java 21, Maven)
├── src/            React frontend (Vite)
├── docs/           Architecture, requirements and other documents
└── package.json    Frontend dependencies and scripts
```

## How to run

Run the backend first, then the frontend, in two terminals.

### 1. Backend (Spring Boot)

Requirements: Java 21. Maven is included through the Maven wrapper.

```bash
cd backend
./mvnw spring-boot:run        # macOS / Linux
mvnw.cmd spring-boot:run      # Windows
```

The API runs on http://localhost:8080. On startup it loads the six Part 1
computers, so the API has data straight away. Data is kept in memory and
resets when the backend restarts.

### 2. Frontend (React)

Requirements: Node.js 20 or later.

```bash
npm install
npm run dev
```

Then open http://localhost:5173

The frontend calls the backend at `http://localhost:8080` by default. To use
another address, create a `.env` file in the project root:

```
VITE_API_URL=http://localhost:8080
```

## How to run the tests

Backend (JUnit 5 + Mockito):

```bash
cd backend
./mvnw test
```

Frontend (Vitest + React Testing Library):

```bash
npm test
```

The frontend tests mock the backend, so they do not need Spring Boot running.

## API endpoints

Base URL: `http://localhost:8080`

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/assets` | Add a new asset |
| GET | `/api/assets/{id}` | Get one asset by ID |
| GET | `/api/assets?page=0&size=5` | Get one page of assets |
| PUT | `/api/assets/{id}` | Update an asset |

Asset fields: `id`, `name`, `type`, `serialNumber`, `assignedTo`, `status`,
`purchaseDate` (format `YYYY-MM-DD`).

Validation errors (400) return `{ "error": "message" }`. 404 and 500 return an empty body, so the API does not reveal internal details.

### GET /api/assets/{id}

Returns the full asset.

```
GET /api/assets/1
```

```json
{
  "id": 1,
  "name": "Dell Latitude 5440",
  "type": "Laptop",
  "serialNumber": "DL5440-8XK21",
  "assignedTo": "Sara Alqahtani",
  "status": "In Use",
  "purchaseDate": "2024-02-11"
}
```

| Status | When |
| --- | --- |
| 200 OK | The asset exists |
| 404 Not Found | No asset has this ID (empty body, `ResponseEntity.notFound().build()`) |
| 400 Bad Request | The ID is not a number |
| 500 Internal Server Error | Unexpected server error (empty body, no internal details) |

### GET /api/assets (pagination)

Returns one page of assets. Default order is by ID, so pages are stable.

| Parameter | Required | Default | Rules |
| --- | --- | --- | --- |
| `page` | No | `0` | Page number, starts at 0. Must not be negative. |
| `size` | No | `5` | Assets per page, from 1 to 100 (response size limit). |
| `sort` | No | `id,asc` | `field` or `field,asc` or `field,desc`. Fields: `id`, `name`, `type`, `serialNumber`, `assignedTo`, `status`, `purchaseDate`. |
| `search` | No | none | Matches name, serial number or assigned employee. Not case-sensitive. |
| `status` | No | none | Exact status: `In Use`, `In Stock`, `Under Repair`, `Retired`. `All` means no filter. |

Search and status are applied to all assets before the result is split into
pages. This means a search finds an asset even when it is not on the
current page.

```
GET /api/assets?page=0&size=5
```

```json
{
  "content": [ { "id": 1, "name": "Dell Latitude 5440", "...": "..." } ],
  "page": 0,
  "size": 5,
  "totalElements": 6,
  "totalPages": 2,
  "first": true,
  "last": false
}
```

| Field | Meaning |
| --- | --- |
| `content` | Assets on the requested page |
| `page` | Current page number (starts at 0) |
| `size` | Requested page size |
| `totalElements` | Number of assets that match the search and filter |
| `totalPages` | Number of pages (0 when nothing matches) |
| `first` | `true` on the first page |
| `last` | `true` when there is no next page |

| Status | When |
| --- | --- |
| 200 OK | Valid request. An empty store or a page past the end returns `content: []` with correct totals. |
| 400 Bad Request | `page` is negative, `size` is outside 1 to 100, or `sort` is invalid. Body: `{ "error": "message" }` |
| 500 Internal Server Error | Unexpected server error (empty body) |

More examples:

```
GET /api/assets?page=1&size=5
GET /api/assets?page=0&size=5&sort=purchaseDate,desc
GET /api/assets?page=0&size=5&search=lenovo
GET /api/assets?page=0&size=5&status=In%20Use
```

### PUT /api/assets/{id}

Updates an existing asset. Send all fields (the `id` in the body is ignored;
the ID in the URL is used).

```
PUT /api/assets/1
Content-Type: application/json
```

```json
{
  "name": "Dell Latitude 5550",
  "type": "Laptop",
  "serialNumber": "DL5440-8XK21",
  "assignedTo": "Sara Alqahtani",
  "status": "In Stock",
  "purchaseDate": "2024-02-11"
}
```

Returns the updated asset (same shape as `GET /api/assets/{id}`).

Validation (same rules as POST):

- `name`, `type`, `serialNumber`, `status`, `purchaseDate` are required
- `type`: `Laptop`, `Desktop` or `Monitor`
- `status`: `In Use`, `In Stock`, `Under Repair` or `Retired`
- `purchaseDate` cannot be in the future
- `serialNumber` must not belong to another asset (not case-sensitive).
  Keeping the asset's own serial number is allowed.

| Status | When |
| --- | --- |
| 200 OK | The asset was updated |
| 400 Bad Request | Invalid or missing fields, or duplicate serial number. Body: `{ "error": "message" }` |
| 404 Not Found | No asset has this ID. Body: `{ "error": "Asset not found." }` |

## Documents

- [Architecture](docs/ARCHITECTURE.md)
- [Requirements](docs/REQUIREMENTS.md)
- [Technology stack and features](docs/TECH_STACK_AND_FEATURES.md)
- [AI usage](docs/AI_USAGE.md)
