import JSZip from 'jszip';
import type { ApiBuilderConfig, ApiBuilderExportBundle, TableDefinition, ColumnType } from '../types';

// ─── Public entry-points ──────────────────────────────────────────────────────

const API_EXPORT_VERSION = '1.0';

/**
 * Serialises an ApiBuilderConfig to a JSON export bundle string.
 */
export function exportApiConfigAsJson(cfg: ApiBuilderConfig): string {
  const bundle: ApiBuilderExportBundle = {
    version: API_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    config: cfg,
  };
  return JSON.stringify(bundle, null, 2);
}

/**
 * Triggers a browser download for a JSON export of the API config.
 */
export function downloadApiConfigJson(cfg: ApiBuilderConfig): void {
  const json = exportApiConfigAsJson(cfg);
  const blob = new Blob([json], { type: 'application/json' });
  triggerDownload(blob, `${sanitise(cfg.serviceName)}-api-config.json`);
}

/**
 * Parses an API Builder config export bundle from a File.
 * Accepts both the wrapped `ApiBuilderExportBundle` format and a bare
 * `ApiBuilderConfig` object for convenience.
 * Returns the config or throws an error if the format is invalid.
 */
export async function importApiConfigFromFile(file: File): Promise<ApiBuilderConfig> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('File is not valid JSON.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid API config file.');
  }

  // Accept both the export bundle { version, exportedAt, config } and a raw config.
  const candidate =
    'config' in parsed && 'version' in parsed
      ? (parsed as ApiBuilderExportBundle).config
      : parsed;

  if (!isApiBuilderConfig(candidate)) {
    throw new Error(
      'File does not contain a valid API Builder configuration. ' +
        'Expected fields: serviceName, version, baseUrl, tables.',
    );
  }

  return candidate;
}

/** Type-guard for ApiBuilderConfig. */
function isApiBuilderConfig(value: unknown): value is ApiBuilderConfig {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.serviceName === 'string' &&
    typeof v.version === 'string' &&
    typeof v.baseUrl === 'string' &&
    Array.isArray(v.tables)
  );
}

/**
 * Generates a ZIP archive containing:
 *  - openapi.yaml           – OpenAPI 3.x contract (contract-first)
 *  - {ServiceName}.csproj   – .NET 8 isolated Functions project file
 *  - Program.cs             – Host builder with OpenAPI registration
 *  - host.json              – Functions host configuration
 *  - local.settings.json    – Local dev settings template
 *  - Models/{Table}.cs      – C# model classes (one per table)
 *  - Functions/{Table}Functions.cs – HTTP trigger Functions (one per table)
 *
 * The generated code targets .NET 8 isolated Functions with OpenAPI support
 * via Microsoft.Azure.Functions.Worker.Extensions.OpenApi.
 */
export async function downloadApiBuilderZip(cfg: ApiBuilderConfig): Promise<void> {
  const zip = new JSZip();
  const root = zip.folder(sanitise(cfg.serviceName))!;

  root.file('openapi.yaml', generateOpenApiSpec(cfg));
  root.file(`${sanitise(cfg.serviceName)}.csproj`, generateCsproj(cfg));
  root.file('Program.cs', generateProgramCs(cfg));
  root.file('host.json', generateHostJson());
  root.file('local.settings.json', generateLocalSettings());

  const data = root.folder('Data')!;
  data.file('AppDbContext.cs', generateAppDbContext(cfg));

  const models = root.folder('Models')!;
  const functions = root.folder('Functions')!;

  for (const table of cfg.tables) {
    models.file(`${table.name}.cs`, generateModelClass(cfg, table));
    functions.file(`${table.name}Functions.cs`, generateFunctionsClass(cfg, table));
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(blob, `${sanitise(cfg.serviceName)}-api.zip`);
}

// ─── OpenAPI YAML generator ───────────────────────────────────────────────────

/** Generates a complete OpenAPI 3.0.3 spec in YAML for the given config. */
export function generateOpenApiSpec(cfg: ApiBuilderConfig): string {
  const { serviceName, version, baseUrl, tables } = cfg;
  const v = version || 'v1';
  const base = baseUrl.replace(/\/$/, '');

  const lines: string[] = [];

  lines.push('openapi: 3.0.3');
  lines.push('info:');
  lines.push(`  title: ${serviceName} API`);
  lines.push(`  version: "1.0.0"`);
  lines.push(`  description: >-`);
  lines.push(`    Contract-first API for ${serviceName}.`);
  lines.push(`    All breaking changes require a new major version in the URL path.`);
  lines.push('servers:');
  lines.push(`  - url: ${base}/${v}/${camel(serviceName)}`);
  lines.push('');

  // ── Standard components ──────────────────────────────────────────────────
  lines.push('components:');
  lines.push('  schemas:');

  // Standard error envelope
  lines.push('    ErrorResponse:');
  lines.push('      type: object');
  lines.push('      properties:');
  lines.push('        error:');
  lines.push('          $ref: "#/components/schemas/ErrorDetail"');
  lines.push('    ErrorDetail:');
  lines.push('      type: object');
  lines.push('      required: [code, message]');
  lines.push('      properties:');
  lines.push('        code:');
  lines.push('          type: string');
  lines.push('          example: InvalidInput');
  lines.push('        message:');
  lines.push('          type: string');
  lines.push('        target:');
  lines.push('          type: string');
  lines.push('          nullable: true');
  lines.push('        details:');
  lines.push('          type: array');
  lines.push('          items:');
  lines.push('            $ref: "#/components/schemas/ErrorDetail"');
  lines.push('        correlationId:');
  lines.push('          type: string');
  lines.push('          format: uuid');
  lines.push('          nullable: true');

  // Per-table schemas
  for (const table of tables) {
    const schemaName = table.name;
    lines.push(`    ${schemaName}:`);
    lines.push('      type: object');
    const required = table.columns.filter((c) => !c.nullable);
    if (required.length > 0) {
      lines.push('      required:');
      for (const col of required) {
        lines.push(`        - ${lowerFirst(col.name)}`);
      }
    }
    if (table.description) {
      lines.push(`      description: ${table.description}`);
    }
    lines.push('      properties:');
    for (const col of table.columns) {
      lines.push(`        ${lowerFirst(col.name)}:`);
      const openApiType = toOpenApiType(col.type);
      lines.push(`          type: ${openApiType.type}`);
      if (openApiType.format) lines.push(`          format: ${openApiType.format}`);
      if (col.nullable) lines.push('          nullable: true');
      if (col.isPrimaryKey) lines.push('          readOnly: true');
      if (col.description) lines.push(`          description: ${col.description}`);
    }

    // Paged response wrapper
    lines.push(`    Paged${schemaName}:`);
    lines.push('      type: object');
    lines.push('      properties:');
    lines.push('        value:');
    lines.push('          type: array');
    lines.push('          items:');
    lines.push(`            $ref: "#/components/schemas/${schemaName}"`);
    lines.push('        nextLink:');
    lines.push('          type: string');
    lines.push('          nullable: true');
    lines.push('          description: URL for the next page of results, or null if no more pages.');
    lines.push('        totalCount:');
    lines.push('          type: integer');
    lines.push('          nullable: true');
  }

  // Standard security / headers
  lines.push('  parameters:');
  lines.push('    TopParam:');
  lines.push('      in: query');
  lines.push('      name: $top');
  lines.push('      schema:');
  lines.push('        type: integer');
  lines.push('        minimum: 1');
  lines.push('        maximum: 200');
  lines.push('        default: 50');
  lines.push("      description: Maximum number of items to return.");
  lines.push('    SkipParam:');
  lines.push('      in: query');
  lines.push('      name: $skip');
  lines.push('      schema:');
  lines.push('        type: integer');
  lines.push('        minimum: 0');
  lines.push('        default: 0');
  lines.push("      description: Number of items to skip (offset).");
  lines.push('  responses:');
  lines.push('    BadRequest:');
  lines.push('      description: Bad request – invalid input.');
  lines.push('      content:');
  lines.push('        application/json:');
  lines.push('          schema:');
  lines.push('            $ref: "#/components/schemas/ErrorResponse"');
  lines.push('    NotFound:');
  lines.push('      description: The requested resource was not found.');
  lines.push('      content:');
  lines.push('        application/json:');
  lines.push('          schema:');
  lines.push('            $ref: "#/components/schemas/ErrorResponse"');
  lines.push('    Unauthorized:');
  lines.push('      description: Missing or invalid Authorization header.');
  lines.push('      content:');
  lines.push('        application/json:');
  lines.push('          schema:');
  lines.push('            $ref: "#/components/schemas/ErrorResponse"');
  lines.push('  securitySchemes:');
  lines.push('    BearerAuth:');
  lines.push('      type: http');
  lines.push('      scheme: bearer');
  lines.push('      bearerFormat: JWT');
  lines.push('  headers:');
  lines.push('    x-correlation-id:');
  lines.push('      schema:');
  lines.push('        type: string');
  lines.push('        format: uuid');
  lines.push('      description: Correlation ID echoed from request (or server-generated).');
  lines.push('    x-api-version:');
  lines.push('      schema:');
  lines.push('        type: string');
  lines.push(`      description: API version in effect for this response (e.g. "${v}").`);
  lines.push('');

  lines.push('security:');
  lines.push('  - BearerAuth: []');
  lines.push('');

  // ── Paths ──────────────────────────────────────────────────────────────────
  lines.push('paths:');
  lines.push('  /health:');
  lines.push('    get:');
  lines.push('      summary: Health check');
  lines.push('      operationId: getHealth');
  lines.push('      security: []');
  lines.push('      responses:');
  lines.push('        "200":');
  lines.push('          description: Service is healthy.');

  for (const table of tables) {
    const resource = lowerFirst(table.name) + 's';
    const pkCol = table.columns.find((c) => c.isPrimaryKey) ?? table.columns[0];
    const pkName = pkCol ? lowerFirst(pkCol.name) : 'id';
    const pkType = pkCol ? toOpenApiType(pkCol.type) : { type: 'string', format: 'uuid' };
    const desc = table.description ? ` – ${table.description}` : '';

    // List
    lines.push(`  /${resource}:`);
    lines.push('    get:');
    lines.push(`      summary: List ${table.name} items${desc}`);
    lines.push(`      operationId: list${table.name}s`);
    lines.push('      parameters:');
    lines.push('        - $ref: "#/components/parameters/TopParam"');
    lines.push('        - $ref: "#/components/parameters/SkipParam"');
    lines.push('      responses:');
    lines.push('        "200":');
    lines.push(`          description: Paged list of ${table.name} items.`);
    lines.push('          headers:');
    lines.push('            x-correlation-id:');
    lines.push('              $ref: "#/components/headers/x-correlation-id"');
    lines.push('            x-api-version:');
    lines.push('              $ref: "#/components/headers/x-api-version"');
    lines.push('          content:');
    lines.push('            application/json:');
    lines.push('              schema:');
    lines.push(`                $ref: "#/components/schemas/Paged${table.name}"`);
    lines.push('        "401": { $ref: "#/components/responses/Unauthorized" }');

    // Create
    lines.push('    post:');
    lines.push(`      summary: Create a ${table.name}`);
    lines.push(`      operationId: create${table.name}`);
    lines.push('      requestBody:');
    lines.push('        required: true');
    lines.push('        content:');
    lines.push('          application/json:');
    lines.push('            schema:');
    lines.push(`              $ref: "#/components/schemas/${table.name}"`);
    lines.push('      responses:');
    lines.push('        "201":');
    lines.push(`          description: ${table.name} created successfully.`);
    lines.push('          headers:');
    lines.push('            x-correlation-id:');
    lines.push('              $ref: "#/components/headers/x-correlation-id"');
    lines.push('          content:');
    lines.push('            application/json:');
    lines.push('              schema:');
    lines.push(`                $ref: "#/components/schemas/${table.name}"`);
    lines.push('        "400": { $ref: "#/components/responses/BadRequest" }');
    lines.push('        "401": { $ref: "#/components/responses/Unauthorized" }');

    // Get by ID / Update / Delete
    lines.push(`  /${resource}/{${pkName}}:`);
    lines.push('    parameters:');
    lines.push(`      - in: path`);
    lines.push(`        name: ${pkName}`);
    lines.push('        required: true');
    lines.push('        schema:');
    lines.push(`          type: ${pkType.type}`);
    if (pkType.format) lines.push(`          format: ${pkType.format}`);

    lines.push('    get:');
    lines.push(`      summary: Get a ${table.name} by ID`);
    lines.push(`      operationId: get${table.name}ById`);
    lines.push('      responses:');
    lines.push('        "200":');
    lines.push(`          description: The requested ${table.name}.`);
    lines.push('          content:');
    lines.push('            application/json:');
    lines.push('              schema:');
    lines.push(`                $ref: "#/components/schemas/${table.name}"`);
    lines.push('        "401": { $ref: "#/components/responses/Unauthorized" }');
    lines.push('        "404": { $ref: "#/components/responses/NotFound" }');

    lines.push('    put:');
    lines.push(`      summary: Replace a ${table.name}`);
    lines.push(`      operationId: replace${table.name}`);
    lines.push('      requestBody:');
    lines.push('        required: true');
    lines.push('        content:');
    lines.push('          application/json:');
    lines.push('            schema:');
    lines.push(`              $ref: "#/components/schemas/${table.name}"`);
    lines.push('      responses:');
    lines.push('        "200":');
    lines.push(`          description: ${table.name} updated successfully.`);
    lines.push('          content:');
    lines.push('            application/json:');
    lines.push('              schema:');
    lines.push(`                $ref: "#/components/schemas/${table.name}"`);
    lines.push('        "400": { $ref: "#/components/responses/BadRequest" }');
    lines.push('        "401": { $ref: "#/components/responses/Unauthorized" }');
    lines.push('        "404": { $ref: "#/components/responses/NotFound" }');

    lines.push('    delete:');
    lines.push(`      summary: Delete a ${table.name}`);
    lines.push(`      operationId: delete${table.name}`);
    lines.push('      responses:');
    lines.push('        "204":');
    lines.push(`          description: ${table.name} deleted successfully.`);
    lines.push('        "401": { $ref: "#/components/responses/Unauthorized" }');
    lines.push('        "404": { $ref: "#/components/responses/NotFound" }');
  }

  return lines.join('\n');
}

// ─── .NET Isolated Function App generators ───────────────────────────────────

function generateCsproj(cfg: ApiBuilderConfig): string {
  return `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <AzureFunctionsVersion>v4</AzureFunctionsVersion>
    <OutputType>Exe</OutputType>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <RootNamespace>${sanitiseDot(cfg.serviceName)}</RootNamespace>
    <AssemblyName>${sanitiseDot(cfg.serviceName)}</AssemblyName>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Azure.Functions.Worker" Version="2.0.0" />
    <PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Http" Version="3.2.0" />
    <PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore" Version="2.0.0" />
    <PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.OpenApi" Version="1.5.1" />
    <PackageReference Include="Microsoft.Azure.Functions.Worker.Sdk" Version="2.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.*" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.*" PrivateAssets="all" />
  </ItemGroup>

</Project>
`;
}

function generateProgramCs(cfg: ApiBuilderConfig): string {
  const ns = sanitiseDot(cfg.serviceName);
  return `using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Extensions.OpenApi.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ${ns}.Data;

namespace ${ns};

public class Program
{
    public static void Main(string[] args)
    {
        var host = new HostBuilder()
            .ConfigureFunctionsWebApplication()
            .ConfigureOpenApi()
            .ConfigureServices((context, services) =>
            {
                services.AddApplicationInsightsTelemetryWorkerService();
                services.ConfigureFunctionsApplicationInsights();
                services.AddDbContext<AppDbContext>(options =>
                    options.UseSqlServer(
                        context.Configuration["SqlConnectionString"],
                        sqlOptions => sqlOptions.EnableRetryOnFailure()));
            })
            .Build();

        host.Run();
    }
}
`;
}

function generateHostJson(): string {
  return JSON.stringify(
    {
      version: '2.0',
      logging: {
        applicationInsights: {
          samplingSettings: {
            isEnabled: true,
            excludedTypes: 'Request',
          },
          enableLiveMetricsFilters: true,
        },
      },
      extensions: {
        http: {
          routePrefix: '',
        },
      },
    },
    null,
    2,
  );
}

function generateLocalSettings(): string {
  return JSON.stringify(
    {
      IsEncrypted: false,
      Values: {
        AzureWebJobsStorage: 'UseDevelopmentStorage=true',
        FUNCTIONS_WORKER_RUNTIME: 'dotnet-isolated',
        APPLICATIONINSIGHTS_CONNECTION_STRING: '',
        SqlConnectionString: 'Server=localhost;Database=MyDatabase;Trusted_Connection=True;TrustServerCertificate=True;',
      },
    },
    null,
    2,
  );
}

function generateAppDbContext(cfg: ApiBuilderConfig): string {
  const ns = sanitiseDot(cfg.serviceName);
  const dbSets = cfg.tables
    .map((t) => `    public DbSet<${t.name}> ${t.name}s { get; set; } = null!;`)
    .join('\n');

  return `using Microsoft.EntityFrameworkCore;
using ${ns}.Models;

namespace ${ns}.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
${dbSets}

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
${cfg.tables
  .map((t) => {
    const pkCol = t.columns.find((c) => c.isPrimaryKey) ?? t.columns[0];
    const pkName = pkCol ? pkCol.name : 'Id';
    return `        modelBuilder.Entity<${t.name}>(entity =>
        {
            entity.HasKey(e => e.${pkName});
            entity.ToTable("${t.name}");
        });`;
  })
  .join('\n')}
    }
}
`;
}


function generateModelClass(cfg: ApiBuilderConfig, table: TableDefinition): string {
  const ns = sanitiseDot(cfg.serviceName);
  const props = table.columns
    .map((col) => {
      const csType = toCSharpType(col.type, col.nullable);
      const required = !col.nullable && !col.isPrimaryKey ? '\n    [System.ComponentModel.DataAnnotations.Required]' : '';
      const initializer = propertyInitializer(col.type, col.nullable);
      return `${required}\n    public ${csType} ${col.name} { get; set; }${initializer}`;
    })
    .join('\n');

  return `namespace ${ns}.Models;

/// <summary>${table.description ?? `Represents a ${table.name} entity.`}</summary>
public class ${table.name}
{${props}
}
`;
}

function propertyInitializer(type: ColumnType, nullable: boolean): string {
  if (nullable) return ' = null;';
  if (type === 'string') return ' = string.Empty;';
  return ';';
}

function generateFunctionsClass(cfg: ApiBuilderConfig, table: TableDefinition): string {
  const ns = sanitiseDot(cfg.serviceName);
  const resource = lowerFirst(table.name) + 's';
  const v = cfg.version || 'v1';
  const svc = camel(cfg.serviceName);
  const routeBase = `${v}/${svc}/${resource}`;
  const pkCol = table.columns.find((c) => c.isPrimaryKey) ?? table.columns[0];
  const pkName = pkCol ? lowerFirst(pkCol.name) : 'id';
  const pkCsType = pkCol ? toCSharpType(pkCol.type, false) : 'string';

  return `using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using ${ns}.Data;
using ${ns}.Models;

namespace ${ns}.Functions;

public class ${table.name}Functions(ILogger<${table.name}Functions> logger, AppDbContext db)
{
    // ── GET /${resource} ──────────────────────────────────────────────────────

    [OpenApiOperation(operationId: "list${table.name}s", tags: ["${table.name}"],
        Summary = "List ${table.name} items", Visibility = OpenApiVisibilityType.Important)]
    [OpenApiParameter(name: "\\$top", In = ParameterLocation.Query, Type = typeof(int), Required = false,
        Description = "Maximum items to return (1–200, default 50).")]
    [OpenApiParameter(name: "\\$skip", In = ParameterLocation.Query, Type = typeof(int), Required = false,
        Description = "Items to skip (default 0).")]
    [OpenApiResponseWithBody(statusCode: System.Net.HttpStatusCode.OK,
        contentType: "application/json", bodyType: typeof(PagedResult<${table.name}>))]
    [OpenApiSecurity("bearer", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [Function("List${table.name}s")]
    public async Task<IActionResult> List${table.name}s(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "${routeBase}")] HttpRequest req)
    {
        logger.LogInformation("List${table.name}s invoked");

        var top  = int.TryParse(req.Query["\\$top"],  out var t) ? Math.Clamp(t, 1, 200) : 50;
        var skip = int.TryParse(req.Query["\\$skip"], out var s) ? Math.Max(s, 0) : 0;

        var total = await db.${table.name}s.CountAsync();
        var items = await db.${table.name}s.Skip(skip).Take(top).ToListAsync();

        var result = new PagedResult<${table.name}>
        {
            Value      = items,
            TotalCount = total,
            NextLink   = (skip + top < total)
                ? $"{req.Path}?\\$skip={skip + top}&\\$top={top}"
                : null,
        };

        return new OkObjectResult(result);
    }

    // ── POST /${resource} ─────────────────────────────────────────────────────

    [OpenApiOperation(operationId: "create${table.name}", tags: ["${table.name}"],
        Summary = "Create a ${table.name}", Visibility = OpenApiVisibilityType.Important)]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(${table.name}), Required = true)]
    [OpenApiResponseWithBody(statusCode: System.Net.HttpStatusCode.Created,
        contentType: "application/json", bodyType: typeof(${table.name}))]
    [OpenApiSecurity("bearer", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [Function("Create${table.name}")]
    public async Task<IActionResult> Create${table.name}(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "${routeBase}")] HttpRequest req)
    {
        logger.LogInformation("Create${table.name} invoked");
        var correlationId = GetOrCreateCorrelationId(req);

        ${table.name}? item;
        try
        {
            item = await System.Text.Json.JsonSerializer.DeserializeAsync<${table.name}>(
                req.Body, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch
        {
            return BadRequestError("InvalidJson", "Request body could not be parsed as JSON.", correlationId);
        }

        if (item is null)
            return BadRequestError("EmptyBody", "Request body is required.", correlationId);

        db.${table.name}s.Add(item);
        await db.SaveChangesAsync();

        return new CreatedAtRouteResult(null, item);
    }

    // ── GET /${resource}/{${pkName}} ──────────────────────────────────────────

    [OpenApiOperation(operationId: "get${table.name}ById", tags: ["${table.name}"],
        Summary = "Get a ${table.name} by ID", Visibility = OpenApiVisibilityType.Important)]
    [OpenApiParameter(name: "${pkName}", In = ParameterLocation.Path, Type = typeof(${pkCsType}), Required = true)]
    [OpenApiResponseWithBody(statusCode: System.Net.HttpStatusCode.OK,
        contentType: "application/json", bodyType: typeof(${table.name}))]
    [OpenApiSecurity("bearer", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [Function("Get${table.name}ById")]
    public async Task<IActionResult> Get${table.name}ById(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "${routeBase}/{${pkName}}")] HttpRequest req,
        ${pkCsType} ${pkName})
    {
        logger.LogInformation("Get${table.name}ById: {Id}", ${pkName});

        var item = await db.${table.name}s.FindAsync(${pkName});
        if (item is null)
            return new NotFoundResult();

        return new OkObjectResult(item);
    }

    // ── PUT /${resource}/{${pkName}} ──────────────────────────────────────────

    [OpenApiOperation(operationId: "replace${table.name}", tags: ["${table.name}"],
        Summary = "Replace a ${table.name}", Visibility = OpenApiVisibilityType.Important)]
    [OpenApiParameter(name: "${pkName}", In = ParameterLocation.Path, Type = typeof(${pkCsType}), Required = true)]
    [OpenApiRequestBody(contentType: "application/json", bodyType: typeof(${table.name}), Required = true)]
    [OpenApiResponseWithBody(statusCode: System.Net.HttpStatusCode.OK,
        contentType: "application/json", bodyType: typeof(${table.name}))]
    [OpenApiSecurity("bearer", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [Function("Replace${table.name}")]
    public async Task<IActionResult> Replace${table.name}(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "${routeBase}/{${pkName}}")] HttpRequest req,
        ${pkCsType} ${pkName})
    {
        logger.LogInformation("Replace${table.name}: {Id}", ${pkName});
        var correlationId = GetOrCreateCorrelationId(req);

        ${table.name}? item;
        try
        {
            item = await System.Text.Json.JsonSerializer.DeserializeAsync<${table.name}>(
                req.Body, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch
        {
            return BadRequestError("InvalidJson", "Request body could not be parsed as JSON.", correlationId);
        }

        if (item is null)
            return BadRequestError("EmptyBody", "Request body is required.", correlationId);

        var existing = await db.${table.name}s.FindAsync(${pkName});
        if (existing is null)
            return new NotFoundResult();

        db.Entry(existing).CurrentValues.SetValues(item);
        await db.SaveChangesAsync();

        return new OkObjectResult(existing);
    }

    // ── DELETE /${resource}/{${pkName}} ───────────────────────────────────────

    [OpenApiOperation(operationId: "delete${table.name}", tags: ["${table.name}"],
        Summary = "Delete a ${table.name}", Visibility = OpenApiVisibilityType.Important)]
    [OpenApiParameter(name: "${pkName}", In = ParameterLocation.Path, Type = typeof(${pkCsType}), Required = true)]
    [OpenApiResponseWithoutBody(statusCode: System.Net.HttpStatusCode.NoContent)]
    [OpenApiSecurity("bearer", SecuritySchemeType.Http, Scheme = OpenApiSecuritySchemeType.Bearer, BearerFormat = "JWT")]
    [Function("Delete${table.name}")]
    public async Task<IActionResult> Delete${table.name}(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "${routeBase}/{${pkName}}")] HttpRequest req,
        ${pkCsType} ${pkName})
    {
        logger.LogInformation("Delete${table.name}: {Id}", ${pkName});

        var item = await db.${table.name}s.FindAsync(${pkName});
        if (item is null)
            return new NotFoundResult();

        db.${table.name}s.Remove(item);
        await db.SaveChangesAsync();

        return new NoContentResult();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static string GetOrCreateCorrelationId(HttpRequest req)
    {
        if (req.Headers.TryGetValue("x-correlation-id", out var val) && !string.IsNullOrWhiteSpace(val))
            return val.ToString();
        return Guid.NewGuid().ToString();
    }

    private static ObjectResult BadRequestError(string code, string message, string correlationId)
        => new BadRequestObjectResult(new
        {
            error = new
            {
                code,
                message,
                correlationId,
            }
        });
}

/// <summary>Standard paged response envelope.</summary>
public sealed class PagedResult<T>
{
    public IEnumerable<T> Value { get; set; } = [];
    public string? NextLink { get; set; }
    public int? TotalCount { get; set; }
}
`;
}

// ─── Type mapping helpers ─────────────────────────────────────────────────────

function toOpenApiType(t: ColumnType): { type: string; format?: string } {
  switch (t) {
    case 'int':      return { type: 'integer', format: 'int32' };
    case 'decimal':  return { type: 'number', format: 'double' };
    case 'boolean':  return { type: 'boolean' };
    case 'datetime': return { type: 'string', format: 'date-time' };
    case 'guid':     return { type: 'string', format: 'uuid' };
    default:         return { type: 'string' };
  }
}

function toCSharpType(t: ColumnType, nullable: boolean): string {
  const base = (() => {
    switch (t) {
      case 'int':      return 'int';
      case 'decimal':  return 'decimal';
      case 'boolean':  return 'bool';
      case 'datetime': return 'DateTimeOffset';
      case 'guid':     return 'Guid';
      default:         return 'string';
    }
  })();
  if (nullable && base !== 'string') return `${base}?`;
  if (nullable && base === 'string') return 'string?';
  return base;
}

// ─── String helpers ───────────────────────────────────────────────────────────

function sanitise(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-.]/g, '_');
}

function sanitiseDot(name: string): string {
  return name.replace(/[^a-zA-Z0-9_.]/g, '_').replace(/^[0-9]/, '_$&');
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function camel(s: string): string {
  return lowerFirst(s.replace(/[_\s-]+(.)/g, (_, c: string) => c.toUpperCase()));
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
