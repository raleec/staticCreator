# API Builder Reference

The API Builder generates a complete, contract-first Azure Functions API from a visual table designer. It is a standalone tool — no site configuration is required. Access it via the **API Builder** button in the Management Portal header.

---

## Table of Contents

- [Overview](#overview)
- [Configuration Fields](#configuration-fields)
- [Tables and Columns](#tables-and-columns)
- [Column Types](#column-types)
- [SQL Import](#sql-import)
- [Save and Load Configurations](#save-and-load-configurations)
- [Mock Data Simulator](#mock-data-simulator)
- [Generated Output](#generated-output)
- [Generated Code Reference](#generated-code-reference)
- [Connecting to SQL Server](#connecting-to-sql-server)
- [Deploying the Generated API](#deploying-the-generated-api)

---

## Overview

The API Builder takes a service name, version, base URL, and a set of table definitions and outputs a ready-to-compile .NET 8 Azure Functions project alongside a matching OpenAPI 3.0.3 spec.

The generated API follows a **contract-first** pattern: the `openapi.yaml` is the authoritative description of the surface and the C# code is derived from it. All breaking changes should increment the version in the URL path.

---

## Configuration Fields

| Field | Required | Description |
|---|---|---|
| **Service Name** | ✅ | PascalCase or alphanumeric name for the service (e.g. `ProductCatalog`). Used as the C# project and namespace name. |
| **Version** | ✅ | API version string, typically `v1`. Appears in the `servers` URL path. |
| **Base URL** | ✅ | Root URL of the deployed API (e.g. `https://api.example.com`). Used in the OpenAPI `servers` block. |

**Validation rules:**
- Service Name must match `/^[a-zA-Z][a-zA-Z0-9_]*$/` — start with a letter, then letters/digits/underscores only
- Version must be non-empty
- Base URL must be non-empty
- At least one table must be defined

---

## Tables and Columns

Each **table** represents one entity (e.g. `Product`, `Order`). The API Builder generates a full CRUD set of Azure Functions for each table.

### Table fields

| Field | Required | Description |
|---|---|---|
| **Table Name** | ✅ | PascalCase singular noun (e.g. `Product`). Used as the C# class name, OpenAPI schema name, and route segment. |
| **Description** | | Optional description included in the OpenAPI spec. |
| **Columns** | ✅ | One or more column definitions (see below). Exactly one column must be marked as primary key. |

**Validation rules:**
- Table Name must match `/^[A-Z][a-zA-Z0-9]*$/` — PascalCase
- Exactly one primary key column per table
- All column names must be non-empty PascalCase

### Column fields

| Field | Required | Description |
|---|---|---|
| **Name** | ✅ | PascalCase property name (e.g. `ProductName`). Used as the C# property and OpenAPI field name (lowercased first letter in JSON). |
| **Type** | ✅ | Data type — see [Column Types](#column-types). |
| **Nullable** | | Whether the field can be null. Non-nullable fields are listed in the OpenAPI `required` array. Primary key columns are always non-nullable. |
| **Primary Key** | | Marks the column as the entity identifier. Exactly one PK per table required. PK columns are marked `readOnly: true` in the OpenAPI spec. |
| **Description** | | Optional description included in the OpenAPI spec. |

> Each new table is pre-populated with a `Id` column of type `GUID` set as the primary key.

---

## Column Types

| UI Label | C# type | OpenAPI type/format | SQL equivalents |
|---|---|---|---|
| String (varchar) | `string` | `string` | `nvarchar`, `varchar`, `char`, `nchar`, `text` |
| Integer (int) | `int` | `integer` / `int32` | `int`, `bigint`, `smallint`, `tinyint` |
| Decimal (numeric) | `decimal` | `number` / `double` | `decimal`, `numeric`, `money`, `float`, `real` |
| Boolean (bit) | `bool` | `boolean` | `bit` |
| DateTime (datetimeoffset) | `DateTimeOffset` | `string` / `date-time` | `datetime`, `datetime2`, `datetimeoffset`, `date` |
| GUID (uniqueidentifier) | `Guid` | `string` / `uuid` | `uniqueidentifier` |

---

## SQL Import

Each table has an **Import from SQL** panel that parses a raw SQL column-definition block into table columns automatically.

### Accepted input

Paste column definitions copied directly from SSMS, Azure Data Studio, or a `.sql` file — with or without the surrounding `CREATE TABLE` statement:

```sql
[Id]          [uniqueidentifier] NOT NULL,
[ProductName] [nvarchar](255)    NOT NULL,
[Price]       [decimal](10, 2)   NOT NULL,
[CreatedAt]   [datetimeoffset]   NOT NULL,
[IsActive]    [bit]              NULL,
[Notes]       [nvarchar](max)    NULL
```

### Behaviour

- Column names are converted to **PascalCase** (e.g. `product_name` → `ProductName`)
- SQL types are mapped to the nearest `ColumnType` (see table above); unknown types default to `string`
- `NULL` / `NOT NULL` is honoured for the `nullable` flag
- `isPrimaryKey` is always `false` on imported columns — designate the PK manually after import
- Existing primary key columns in the table are **preserved and deduplicated** — imported columns whose names match an existing PK are skipped
- Lines that cannot be parsed (constraints, comments, blank lines) are silently skipped

---

## Save and Load Configurations

API Builder configurations can be saved to and loaded from JSON files, independent of any site.

| Button | Action |
|---|---|
| **Save Config** | Downloads the current configuration as `{ServiceName}-api-config.json` |
| **Load Config** | Opens a file picker to load a previously saved `.json` configuration |

The saved format is an `ApiBuilderExportBundle`:

```json
{
  "version": "1.0",
  "exportedAt": "2026-05-15T10:00:00.000Z",
  "config": {
    "serviceName": "ProductCatalog",
    "version": "v1",
    "baseUrl": "https://api.example.com",
    "tables": [ ... ]
  }
}
```

Both the bundle format and a bare `ApiBuilderConfig` object are accepted on import for convenience.

---

## Mock Data Simulator

The **Mock Simulator** button (next to "Save Config" in the header) generates realistic sample data for every table in the current configuration and produces a self-contained JavaScript file that lets a Static Web App run against a simulated backend with **no real API or database required**.

### Why use it?

| Scenario | Benefit |
|---|---|
| UI prototyping | Test forms, tables, and page layouts without a deployed backend |
| Offline development | Work disconnected; all data is stored in the browser |
| Demo environments | Ship a live, interactive demo without infrastructure |
| Integration testing | Validate front-end API calls against a known dataset |

### How it works

1. Click **Mock Simulator** in the API Builder header.
2. Use the **Rows per table** slider to choose how many sample records to generate (1–20, default 5).
3. Switch between the **Data JSON** and **Seed Script** tabs to preview what will be generated.
4. Download the output you need:

| Button | File | Description |
|---|---|---|
| **Download JSON** | `{serviceName}-mock-data.json` | Raw mock records keyed by plural camelCase table name |
| **Download Seed Script (.js)** | `{serviceName}-mock-sim.js` | Self-contained JS that seeds localStorage and patches `window.fetch` |

### Using the seed script

Add the downloaded script to your HTML page **before** any code that calls the API:

```html
<head>
  <!-- Load the mock simulator first so fetch calls are intercepted -->
  <script src="myservice-mock-sim.js"></script>
  <script src="app.js"></script>
</head>
```

Once the script is loaded it:

1. **Seeds** `localStorage` with the generated records (only on the first page load — existing data is preserved across refreshes).
2. **Intercepts** any `window.fetch` call whose URL starts with the configured base path and routes it through an in-memory CRUD implementation backed by `localStorage`.
3. **Passes through** all other `fetch` calls to the real network unchanged.

### Intercepted routes

Replace `<table>` with the plural camelCase entity name (e.g. `Product` → `products`):

| Method | Path | Response |
|---|---|---|
| `GET` | `…/<table>/list` | `{ items: [...], totalCount: N }` |
| `GET` | `…/<table>/:id` | Single item or `404` |
| `POST` | `…/<table>/create` | Created item (`201`) — auto-generates `id` if omitted |
| `PUT` | `…/<table>/:id` | Replaced item (`200`) |
| `DELETE` | `…/<table>/:id` | `204 No Content` |

All write operations are immediately persisted back to `localStorage` so state survives page refreshes.

### Resetting to the original seed data

Open the browser DevTools console and run:

```js
localStorage.removeItem('mock__MyService'); // replace with your service name
```

Then reload the page — the original seed data will be restored automatically.

### Mock data generation rules

Values are generated deterministically based on column type and name:

| Column hint (case-insensitive) | Generated value |
|---|---|
| `email` | `user1@example.com` |
| `phone` / `tel` / `telephone` | `+1-555-0001` |
| `url` / `website` / `link` / `href` / `src` | `https://example.com/…` |
| `image` / `photo` / `avatar` / `picture` / `img` | `https://picsum.photos/seed/…` |
| `status` / `state` | Cycles through `Active`, `Inactive`, `Pending`, `Archived` |
| `category` / `type` / `kind` / `class` / `group` / `tag` | `Category A`, `Category B`, … |
| `code` / `sku` / `reference` / `serial` / `barcode` | `PRD-0001`, `PRD-0002`, … |
| `id` (exact, non-PK string) | `PRD-0001`, `PRD-0002`, … |
| `slug` / `handle` | `tablename-1`, `tablename-2`, … |
| `price` / `cost` / `amount` / `total` / `subtotal` / `fee` / `charge` | Realistic decimal values |
| `rate` / `percent` / `pct` / `ratio` | Decimal ratio (0.05–0.95) |
| `latitude` / `lat` | Decimal latitude near 40.71 |
| `longitude` / `lon` / `lng` | Decimal longitude near -74.01 |
| `weight` / `mass` | Decimal weight values |
| `discount` | Decimal discount (0–20) |
| `count` / `quantity` / `stock` / `qty` / `inventory` | Integer multiples of 10 |
| `age` | Integer 25–64 |
| `year` | Integer 2020–2025 |
| `order` / `seq` / `number` / `num` / `index` / `rank` | Integer starting at 1001 |
| `score` / `point` / `rating` | Integer 1–5 |
| `size` / `width` / `height` / `length` | Integer multiples of 5 |
| `name` / `title` / `label` / `heading` / `subject` | `{Table} Item 1`, `{Table} Item 2`, … |
| `firstName` / `given name` | Cycles through first-name list |
| `lastName` / `surname` / `family name` | Cycles through surname list |
| `fullName` / `displayName` | Full name (`First Last`) |
| `description` / `notes` / `comment` / `remark` / `summary` / `bio` / `content` | Full-sentence placeholder text |
| `address` / `street` / `addr` | Street address (e.g. `123 Main Street`) |
| `city` / `town` | Cycles through city names |
| `state` / `province` / `region` | Two-letter state/province code |
| `country` / `nation` | Country name |
| `zip` / `postal` | Five-digit postal code |
| `currency` | Currency code (USD, EUR, …) |
| `language` / `locale` / `lang` | Locale code (en-US, fr-FR, …) |
| `version` / `ver` / `revision` | Semantic version string (`1.0.0`, `2.0.0`, …) |
| `hash` / `token` / `secret` / `key` / `password` | `<redacted>` |
| `datetime` columns | ISO-8601 dates spaced 13 days apart starting 2024-01-01 |
| `boolean` columns | Alternates `true` / `false` |
| `guid` columns | Deterministic UUID v4-like strings |
| nullable columns | `null` returned for every 4th row |

---

## Generated Output

Clicking **Generate & Download** produces a ZIP archive named `{ServiceName}-api.zip` with the following structure:

```
{ServiceName}/
├── openapi.yaml
├── {ServiceName}.csproj
├── Program.cs
├── host.json
├── local.settings.json
├── Data/
│   └── AppDbContext.cs
├── Models/
│   ├── {Table1}.cs
│   └── {Table2}.cs
└── Functions/
    ├── {Table1}Functions.cs
    └── {Table2}Functions.cs
```

---

## Generated Code Reference

### `openapi.yaml`

A complete OpenAPI 3.0.3 spec including:

- `servers` block with the base URL and version path
- Per-table schemas (`{Table}` and `Paged{Table}`)
- Standard `ErrorResponse` / `ErrorDetail` error envelope
- Full CRUD paths for each table:
  - `GET /{tables}` — list (returns `Paged{Table}`)
  - `POST /{tables}` — create (returns `201 Created`)
  - `GET /{tables}/{id}` — get by ID
  - `PUT /{tables}/{id}` — full replace
  - `DELETE /{tables}/{id}` — delete (returns `204 No Content`)

### `{Table}Functions.cs`

Each file contains a class with five HTTP trigger methods corresponding to the five operations above. Routes use the plural, camelCase form of the table name (e.g. `Product` → `products`).

The generated functions use **Entity Framework Core** via the injected `AppDbContext` for all data operations. Full CRUD is implemented out of the box:

- **List** — queries the DbSet with `$top`/`$skip` pagination and returns a `PagedResult<T>` with `TotalCount` and `NextLink`.
- **Create** — adds the entity to the DbSet and calls `SaveChangesAsync`.
- **Get by ID** — uses `FindAsync` and returns `404 Not Found` if not found.
- **Replace** — uses `FindAsync` + `SetValues` to update the tracked entity and calls `SaveChangesAsync`.
- **Delete** — uses `FindAsync` + `Remove` and calls `SaveChangesAsync`.

### `Models/{Table}.cs`

A simple C# POCO with public properties matching the column definitions. Nullable columns use nullable reference types (`string?`, `int?`, etc.).

### `Data/AppDbContext.cs`

An Entity Framework Core `DbContext` subclass with:
- One `DbSet<T>` per table.
- `OnModelCreating` configuration that maps each entity to its table by name and sets the primary key.

### `Program.cs`

Configures the .NET 8 isolated Functions host with:
- `AddApplicationInsightsTelemetryWorkerService`
- `ConfigureFunctionsWebApplication`
- OpenAPI document generation via `Microsoft.Azure.Functions.Worker.Extensions.OpenApi`
- `AddDbContext<AppDbContext>` wired to `UseSqlServer` with the `SqlConnectionString` app setting and retry-on-failure enabled.

### `{ServiceName}.csproj`

Targets `net8.0` with the following key package references:

| Package | Purpose |
|---|---|
| `Microsoft.Azure.Functions.Worker` | Isolated worker host |
| `Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore` | ASP.NET Core HTTP binding |
| `Microsoft.Azure.Functions.Worker.Extensions.OpenApi` | OpenAPI middleware |
| `Microsoft.ApplicationInsights.WorkerService` | Telemetry |
| `Microsoft.EntityFrameworkCore.SqlServer` | EF Core SQL Server provider |
| `Microsoft.EntityFrameworkCore.Design` | EF Core tooling (migrations, scaffolding) |

---

## Connecting to SQL Server

The generated project includes a complete Entity Framework Core setup out of the box. `AppDbContext` is pre-configured with a `DbSet<T>` for every table and wired into `Program.cs` via `AddDbContext<AppDbContext>`. All you need to do is supply a connection string and run migrations.

---

### Step 1 — Configure the connection string

Update `SqlConnectionString` in `local.settings.json` for local development:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "SqlConnectionString": "Server=<server>.database.windows.net;Database=<db>;Authentication=Active Directory Default;"
  }
}
```

> **Recommendation:** Use **Managed Identity** (`Authentication=Active Directory Default`) in all non-local environments rather than a username and password. Grant the Function App's system-assigned identity the `db_datareader` / `db_datawriter` roles on the target database.

For local development, use SQL auth or Azure CLI credentials (`Authentication=Active Directory Default` will pick up `az login`).

---

### Step 2 — Create and apply migrations

```bash
cd {ServiceName}
dotnet tool install --global dotnet-ef   # if not already installed
dotnet ef migrations add InitialCreate
dotnet ef database update
```

This generates migration files from the `AppDbContext` model and applies them to the database configured in `local.settings.json`.

---

### Step 3 — Run and test

```bash
dotnet restore
dotnet build
func start          # requires Azure Functions Core Tools
```

All five CRUD operations per table are immediately functional once the database is reachable.

---

### Data access library comparison

| Feature | EF Core (generated) | Dapper | Raw ADO.NET |
|---|---|---|---|
| **Setup effort** | None — already generated | Low | Low |
| **Query style** | LINQ | Raw SQL with mapping | Raw SQL + manual mapping |
| **Schema migrations** | Built-in (`dotnet ef migrations`) | Manual | Manual |
| **Performance** | Good (with `.AsNoTracking()`) | Excellent | Excellent |
| **Best for** | New projects, code-first schema | Existing DB, stored procs | Maximum control |

---

### Authentication to SQL Server

| Environment | Recommended method |
|---|---|
| Local development | `Authentication=Active Directory Default` (picks up `az login`) or SQL auth |
| Azure (same tenant) | System-assigned Managed Identity — no credentials in config |
| Azure (cross-tenant) | User-assigned Managed Identity or service principal with certificate |

To grant a Function App's Managed Identity access to Azure SQL:

```sql
CREATE USER [<function-app-name>] FROM EXTERNAL PROVIDER;
ALTER ROLE db_datareader ADD MEMBER [<function-app-name>];
ALTER ROLE db_datawriter ADD MEMBER [<function-app-name>];
```

---

## Deploying the Generated API

The generated project is a standalone Azure Functions app and is **not** tied to any Static Web App. It can be deployed independently and shared across multiple front-ends.

### Quick start

```bash
cd {ServiceName}
dotnet restore
dotnet build
dotnet ef migrations add InitialCreate   # generate initial EF migration
dotnet ef database update                # apply migration to local database
func start                               # requires Azure Functions Core Tools
```

### Deploy to Azure

```bash
# Create a Function App (if not already created)
az functionapp create \
  --resource-group <rg> \
  --consumption-plan-location eastus \
  --runtime dotnet-isolated \
  --functions-version 4 \
  --name <app-name> \
  --storage-account <storage>

# Publish
dotnet publish -c Release
func azure functionapp publish <app-name>
```

### Sharing across multiple SWAs

Because the API is a standalone Functions app, multiple Static Web Apps can call the same base URL. Configure CORS on the Function App to allow each SWA's origin:

```bash
az functionapp cors add \
  --name <app-name> \
  --resource-group <rg> \
  --allowed-origins "https://swa1.azurestaticapps.net" "https://swa2.azurestaticapps.net"
```

Or place Azure API Management in front of the Functions app for fine-grained per-client access policies.
