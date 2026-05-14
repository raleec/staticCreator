import type { TableColumn, ColumnType } from '../types';

/**
 * Maps a SQL Server data type token to the nearest `ColumnType`.
 * The mapping is intentionally lenient: unknown types fall back to 'string'.
 */
function mapSqlType(sqlType: string): ColumnType {
  const t = sqlType.toLowerCase().trim();
  if (['nvarchar', 'varchar', 'char', 'nchar', 'ntext', 'text', 'sysname'].includes(t)) return 'string';
  if (['int', 'bigint', 'smallint', 'tinyint'].includes(t)) return 'int';
  if (['decimal', 'numeric', 'money', 'smallmoney', 'float', 'real'].includes(t)) return 'decimal';
  if (t === 'bit') return 'boolean';
  if (['datetime', 'datetime2', 'date', 'time', 'datetimeoffset', 'smalldatetime'].includes(t)) return 'datetime';
  if (t === 'uniqueidentifier') return 'guid';
  return 'string';
}

/**
 * Converts an arbitrary SQL column name to PascalCase so it satisfies the
 * API Builder's `/^[A-Z][a-zA-Z0-9]*$/` validation rule.
 *
 * Strategy: capitalise the first alphabetic character and strip any
 * non-alphanumeric characters (e.g. underscores become word boundaries that
 * capitalise the next letter).
 */
function toPascalCase(name: string): string {
  // Split on underscores or transitions between lower→upper for snake_case /
  // mixed-case names, then capitalise each segment and join.
  const cleaned = name.replace(/[^a-zA-Z0-9_]/g, '');
  if (!cleaned) return 'Column';
  return cleaned
    .split('_')
    .filter(Boolean)
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
    .join('');
}

/**
 * Parses a SQL Server CREATE TABLE column-definition block into an array of
 * `TableColumn` objects.
 *
 * Accepted input formats (any combination per line):
 *   [ColumnName] [nvarchar](255) NULL
 *   [ColumnName] [int] NOT NULL
 *   ColumnName   decimal(8, 0)   NULL
 *
 * Lines that cannot be parsed (e.g. constraints, blank lines) are silently
 * skipped.  The caller is responsible for validating the result and deciding
 * whether to keep or discard bad rows.
 *
 * @param sql  Raw text pasted from SSMS or a .sql file – including the outer
 *             parentheses if present.
 * @returns    An array of `TableColumn` values. `isPrimaryKey` is always
 *             `false`; the user must designate the PK manually after import.
 */
export function parseSqlTableDef(sql: string): TableColumn[] {
  const columns: TableColumn[] = [];

  for (const raw of sql.split('\n')) {
    const line = raw.trim();

    // Skip empty lines, bare parentheses, and lines that start with SQL
    // structural keywords (CONSTRAINT, INDEX, PRIMARY KEY, FOREIGN KEY, UNIQUE)
    if (
      !line ||
      line === '(' ||
      line === ')' ||
      /^(constraint|index|primary\s+key|foreign\s+key|unique)\b/i.test(line)
    ) continue;

    // Strip leading/trailing brackets that wrap the whole line (e.g. just "(")
    const stripped = line.replace(/,$/, '').trim();

    // Match:  [name] or name  followed by  [type] or type  optionally (precision, scale)
    // and then NULL / NOT NULL
    const match = stripped.match(
      /^\[?([^\]\s,]+)\]?\s+\[?([a-zA-Z]+)\]?(?:\([^)]*\))?\s+(NOT\s+NULL|NULL)/i,
    );
    if (!match) continue;

    const [, rawName, rawType, nullability] = match;
    const nullable = !/^NOT/i.test(nullability.trim());

    columns.push({
      name: toPascalCase(rawName),
      type: mapSqlType(rawType),
      nullable,
      isPrimaryKey: false,
      description: '',
    });
  }

  return columns;
}
