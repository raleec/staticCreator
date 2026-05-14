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
- [Generated Output](#generated-output)
- [Generated Code Reference](#generated-code-reference)
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

## Generated Output

Clicking **Generate & Download** produces a ZIP archive named `{ServiceName}-api.zip` with the following structure:

```
{ServiceName}/
├── openapi.yaml
├── {ServiceName}.csproj
├── Program.cs
├── host.json
├── local.settings.json
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

Each file contains a static class with five HTTP trigger methods corresponding to the five operations above. Routes use the plural, camelCase form of the table name (e.g. `Product` → `products`).

The generated functions are scaffolded stubs — the HTTP wiring, request parsing, and response serialisation are in place, but the data access layer is left for you to implement.

### `Models/{Table}.cs`

A simple C# POCO with public properties matching the column definitions. Nullable columns use nullable reference types (`string?`, `int?`, etc.).

### `Program.cs`

Configures the .NET 8 isolated Functions host with:
- `AddApplicationInsightsTelemetryWorkerService`
- `ConfigureFunctionsWebApplication`
- OpenAPI document generation via `Microsoft.Azure.Functions.Worker.Extensions.OpenApi`

### `{ServiceName}.csproj`

Targets `net8.0` with the following key package references:

| Package | Purpose |
|---|---|
| `Microsoft.Azure.Functions.Worker` | Isolated worker host |
| `Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore` | ASP.NET Core HTTP binding |
| `Microsoft.Azure.Functions.Worker.Extensions.OpenApi` | OpenAPI middleware |
| `Microsoft.ApplicationInsights.WorkerService` | Telemetry |

---

## Deploying the Generated API

The generated project is a standalone Azure Functions app and is **not** tied to any Static Web App. It can be deployed independently and shared across multiple front-ends.

### Quick start

```bash
cd {ServiceName}
dotnet restore
dotnet build
func start          # requires Azure Functions Core Tools
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
