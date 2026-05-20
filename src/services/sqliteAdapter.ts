import { Capacitor } from "@capacitor/core";
import { logger } from "../utils/logger";

type SQLitePrimitive = string | number | boolean | null;
type SQLiteValue = SQLitePrimitive | Uint8Array;

type SQLiteChanges = {
  changes?: {
    changes?: number;
    lastId?: number;
    values?: unknown[];
  };
};

type SQLiteQueryResult = {
  values?: Record<string, unknown>[];
};

type SQLiteDBConnectionLike = {
  open: () => Promise<void>;
  close: () => Promise<void>;
  execute: (statements: string, transaction?: boolean, isSQL92?: boolean) => Promise<SQLiteChanges>;
  run: (
    statement: string,
    values?: SQLiteValue[],
    transaction?: boolean,
    returnMode?: string,
    isSQL92?: boolean
  ) => Promise<SQLiteChanges>;
  query: (statement: string, values?: SQLiteValue[], isSQL92?: boolean) => Promise<SQLiteQueryResult>;
  beginTransaction?: () => Promise<SQLiteChanges>;
  commitTransaction?: () => Promise<SQLiteChanges>;
  rollbackTransaction?: () => Promise<SQLiteChanges>;
};

type SQLiteConnectionLike = {
  createConnection: (
    database: string,
    encrypted: boolean,
    mode: string,
    version: number,
    readonly: boolean
  ) => Promise<SQLiteDBConnectionLike>;
  retrieveConnection?: (database: string, readonly: boolean) => Promise<SQLiteDBConnectionLike>;
  isConnection?: (database: string, readonly: boolean) => Promise<{ result?: boolean }>;
  closeConnection?: (database: string, readonly: boolean) => Promise<void>;
  initWebStore?: () => Promise<void>;
  saveToStore?: (database: string) => Promise<void>;
};

type SQLiteModuleLike = {
  CapacitorSQLite: unknown;
  SQLiteConnection: new (sqlite: unknown) => SQLiteConnectionLike;
};

type SQLiteModuleLoader = () => Promise<SQLiteModuleLike>;

export type SQLiteBackend = "sqlite" | "web-storage";

export type SQLiteRecordId = string | number;

export type SQLiteEntity = {
  id: SQLiteRecordId;
  createdAt?: string;
  updatedAt?: string;
};

export type SQLiteTableDefinition = {
  name: string;
  createStatement?: string;
};

export type SQLiteAdapterOptions = {
  database?: string;
  version?: number;
  encrypted?: boolean;
  mode?: string;
  readonly?: boolean;
  tables?: SQLiteTableDefinition[];
  allowWebFallback?: boolean;
  moduleLoader?: SQLiteModuleLoader;
  now?: () => Date;
};

export type SQLiteListOptions = {
  whereSql?: string;
  values?: SQLiteValue[];
  orderBy?: "created_at" | "updated_at" | "id";
  direction?: "ASC" | "DESC";
  limit?: number;
  offset?: number;
};

export type SQLiteAdapterStatus = {
  initialized: boolean;
  backend: SQLiteBackend | null;
  database: string;
  platform: string;
};

const DEFAULT_DATABASE = "huzur_phase3";
const DEFAULT_VERSION = 1;
const DEFAULT_MODE = "no-encryption";
const DEFAULT_TABLES: SQLiteTableDefinition[] = [];
const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

const defaultModuleLoader: SQLiteModuleLoader = async () => {
  return import("@capacitor-community/sqlite") as Promise<SQLiteModuleLike>;
};

const assertIdentifier = (identifier: string, label: string): string => {
  if (!IDENTIFIER_PATTERN.test(identifier)) {
    throw new Error(`[SQLiteAdapter] Invalid ${label}: ${identifier}`);
  }
  return identifier;
};

const jsonParse = <T>(value: string): T => JSON.parse(value) as T;

const normalizeId = (id: SQLiteRecordId): string => String(id);

const changesCount = (changes: SQLiteChanges): number => Number(changes.changes?.changes ?? 0);

class WebStorageSQLiteFallback {
  private readonly prefix: string;
  private readonly memory = new Map<string, string>();

  constructor(database: string) {
    this.prefix = `sqlite:${database}:`;
  }

  upsert<T extends SQLiteEntity>(table: string, record: T): void {
    this.writeTable(table, {
      ...this.readTable(table),
      [normalizeId(record.id)]: record,
    });
  }

  getById<T extends SQLiteEntity>(table: string, id: SQLiteRecordId): T | null {
    return (this.readTable(table)[normalizeId(id)] as T | undefined) ?? null;
  }

  getAll<T extends SQLiteEntity>(table: string, options: SQLiteListOptions = {}): T[] {
    const rows = Object.values(this.readTable(table)) as T[];
    const direction = options.direction ?? "ASC";
    const orderBy = options.orderBy;
    const ordered = orderBy
      ? [...rows].sort((left, right) => {
          const leftValue = String(this.fieldForOrder(left, orderBy));
          const rightValue = String(this.fieldForOrder(right, orderBy));
          return direction === "ASC"
            ? leftValue.localeCompare(rightValue)
            : rightValue.localeCompare(leftValue);
        })
      : rows;
    const offset = Math.max(0, options.offset ?? 0);
    const limit = options.limit === undefined ? ordered.length : Math.max(0, options.limit);
    return ordered.slice(offset, offset + limit);
  }

  delete(table: string, id: SQLiteRecordId): boolean {
    const rows = this.readTable(table);
    const key = normalizeId(id);
    if (!(key in rows)) {
      return false;
    }
    delete rows[key];
    this.writeTable(table, rows);
    return true;
  }

  clearTable(table: string): void {
    this.writeTable(table, {});
  }

  private fieldForOrder(record: SQLiteEntity, orderBy: NonNullable<SQLiteListOptions["orderBy"]>): SQLiteRecordId | string {
    if (orderBy === "created_at") return record.createdAt ?? "";
    if (orderBy === "updated_at") return record.updatedAt ?? "";
    return record.id;
  }

  private storageKey(table: string): string {
    return `${this.prefix}${table}`;
  }

  private readTable(table: string): Record<string, SQLiteEntity> {
    const key = this.storageKey(table);
    const stored = this.getStorageValue(key);
    if (!stored) return {};
    return jsonParse<Record<string, SQLiteEntity>>(stored);
  }

  private writeTable(table: string, rows: Record<string, SQLiteEntity>): void {
    this.setStorageValue(this.storageKey(table), JSON.stringify(rows));
  }

  private getStorageValue(key: string): string | null {
    try {
      return globalThis.localStorage?.getItem(key) ?? this.memory.get(key) ?? null;
    } catch {
      return this.memory.get(key) ?? null;
    }
  }

  private setStorageValue(key: string, value: string): void {
    this.memory.set(key, value);
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // Memory storage remains the fallback when localStorage is unavailable or full.
    }
  }
}

export class CapacitorSQLiteAdapter {
  private readonly database: string;
  private readonly version: number;
  private readonly encrypted: boolean;
  private readonly mode: string;
  private readonly readonly: boolean;
  private readonly tables: SQLiteTableDefinition[];
  private readonly allowWebFallback: boolean;
  private readonly moduleLoader: SQLiteModuleLoader;
  private readonly now: () => Date;
  private connection: SQLiteConnectionLike | null = null;
  private db: SQLiteDBConnectionLike | null = null;
  private fallback: WebStorageSQLiteFallback | null = null;
  private initPromise: Promise<void> | null = null;
  private initialized = false;
  private backend: SQLiteBackend | null = null;

  constructor(options: SQLiteAdapterOptions = {}) {
    this.database = options.database ?? DEFAULT_DATABASE;
    this.version = options.version ?? DEFAULT_VERSION;
    this.encrypted = options.encrypted ?? false;
    this.mode = options.mode ?? DEFAULT_MODE;
    this.readonly = options.readonly ?? false;
    this.tables = options.tables ?? DEFAULT_TABLES;
    this.allowWebFallback = options.allowWebFallback ?? true;
    this.moduleLoader = options.moduleLoader ?? defaultModuleLoader;
    this.now = options.now ?? (() => new Date());
  }

  getStatus(): SQLiteAdapterStatus {
    return {
      initialized: this.initialized,
      backend: this.backend,
      database: this.database,
      platform: Capacitor.getPlatform(),
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.initializeInternal().finally(() => {
      this.initPromise = null;
    });

    return this.initPromise;
  }

  async close(): Promise<void> {
    try {
      await this.closeNativeResources();
    } finally {
      this.fallback = null;
      this.initialized = false;
      this.backend = null;
      this.initPromise = null;
    }
  }

  async execute(statements: string, transaction = true): Promise<number> {
    await this.initialize();
    if (!this.db) {
      return 0;
    }
    return changesCount(await this.db.execute(statements, transaction));
  }

  async query<T extends Record<string, unknown> = Record<string, unknown>>(
    statement: string,
    values: SQLiteValue[] = []
  ): Promise<T[]> {
    await this.initialize();
    if (!this.db) {
      throw new Error("[SQLiteAdapter] Raw SQL query is unavailable on web-storage fallback");
    }
    const result = await this.db.query(statement, values);
    return (result.values ?? []) as T[];
  }

  async upsert<T extends SQLiteEntity>(table: string, input: T): Promise<T> {
    assertIdentifier(table, "table name");
    await this.initialize();

    const timestamp = this.now().toISOString();
    const existing = await this.getById<T>(table, input.id);
    const record = {
      ...input,
      createdAt: input.createdAt ?? existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    } as T;

    if (this.fallback) {
      this.fallback.upsert(table, record);
      return record;
    }

    const db = this.requireDb();
    await this.ensureTable(table);
    await db.run(
      `INSERT INTO ${table} (id, value, created_at, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at`,
      [normalizeId(record.id), JSON.stringify(record), record.createdAt ?? timestamp, record.updatedAt ?? timestamp]
    );
    await this.persistWebStore();
    return record;
  }

  async getById<T extends SQLiteEntity>(table: string, id: SQLiteRecordId): Promise<T | null> {
    assertIdentifier(table, "table name");
    await this.initialize();

    if (this.fallback) {
      return this.fallback.getById<T>(table, id);
    }

    const db = this.requireDb();
    await this.ensureTable(table);
    const result = await db.query(`SELECT value FROM ${table} WHERE id = ? LIMIT 1`, [normalizeId(id)]);
    const value = result.values?.[0]?.value;
    return typeof value === "string" ? jsonParse<T>(value) : null;
  }

  async getAll<T extends SQLiteEntity>(table: string, options: SQLiteListOptions = {}): Promise<T[]> {
    assertIdentifier(table, "table name");
    this.assertListOptions(options);
    await this.initialize();

    if (this.fallback) {
      return this.fallback.getAll<T>(table, options);
    }

    const db = this.requireDb();
    await this.ensureTable(table);
    const values = options.values ?? [];
    const where = options.whereSql ? ` WHERE ${options.whereSql}` : "";
    const orderBy = options.orderBy ? ` ORDER BY ${options.orderBy} ${options.direction ?? "ASC"}` : "";
    const limit = options.limit === undefined ? "" : " LIMIT ?";
    const offset = options.offset === undefined ? "" : " OFFSET ?";
    const pagingValues = [
      ...(options.limit === undefined ? [] : [options.limit]),
      ...(options.offset === undefined ? [] : [options.offset]),
    ];
    const result = await db.query(
      `SELECT value FROM ${table}${where}${orderBy}${limit}${offset}`,
      [...values, ...pagingValues]
    );
    return (result.values ?? [])
      .map((row) => row.value)
      .filter((value): value is string => typeof value === "string")
      .map((value) => jsonParse<T>(value));
  }

  async delete(table: string, id: SQLiteRecordId): Promise<boolean> {
    assertIdentifier(table, "table name");
    await this.initialize();

    if (this.fallback) {
      return this.fallback.delete(table, id);
    }

    const db = this.requireDb();
    await this.ensureTable(table);
    const result = await db.run(`DELETE FROM ${table} WHERE id = ?`, [normalizeId(id)]);
    await this.persistWebStore();
    return changesCount(result) > 0;
  }

  async clearTable(table: string): Promise<void> {
    assertIdentifier(table, "table name");
    await this.initialize();

    if (this.fallback) {
      this.fallback.clearTable(table);
      return;
    }

    const db = this.requireDb();
    await this.ensureTable(table);
    await db.run(`DELETE FROM ${table}`);
    await this.persistWebStore();
  }

  async transaction<T>(work: (adapter: this) => Promise<T>): Promise<T> {
    await this.initialize();
    if (this.fallback || !this.db?.beginTransaction || !this.db.commitTransaction || !this.db.rollbackTransaction) {
      return work(this);
    }

    await this.db.beginTransaction();
    try {
      const result = await work(this);
      await this.db.commitTransaction();
      await this.persistWebStore();
      return result;
    } catch (error) {
      await this.db.rollbackTransaction();
      throw error;
    }
  }

  private async initializeInternal(): Promise<void> {
    const platform = Capacitor.getPlatform();
    if (platform === "web") {
      await this.initializeFallback();
      return;
    }

    try {
      const module = await this.moduleLoader();
      this.connection = new module.SQLiteConnection(module.CapacitorSQLite);
      const existing = await this.connection.isConnection?.(this.database, this.readonly).catch(() => ({ result: false }));
      this.db = existing?.result
        ? await this.connection.retrieveConnection?.(this.database, this.readonly) ?? null
        : await this.connection.createConnection(this.database, this.encrypted, this.mode, this.version, this.readonly);

      if (!this.db) {
        throw new Error("SQLite connection could not be created");
      }

      await this.db.open();
      for (const table of this.tables) {
        await this.ensureTable(table.name, table.createStatement);
      }
      this.backend = "sqlite";
      this.initialized = true;
    } catch (error) {
      await this.closeNativeResources().catch((closeError) => {
        logger.warn("[SQLiteAdapter] Failed to close partial native SQLite connection", closeError);
      });
      logger.warn("[SQLiteAdapter] Native SQLite unavailable, using fallback", error);
      if (!this.allowWebFallback) {
        throw error;
      }
      await this.initializeFallback();
    }
  }

  private async initializeFallback(): Promise<void> {
    this.fallback = new WebStorageSQLiteFallback(this.database);
    this.backend = "web-storage";
    this.initialized = true;
  }

  private requireDb(): SQLiteDBConnectionLike {
    if (!this.db) {
      throw new Error("[SQLiteAdapter] SQLite connection is not initialized");
    }
    return this.db;
  }

  private async closeNativeResources(): Promise<void> {
    const db = this.db;
    const connection = this.connection;
    this.db = null;
    this.connection = null;

    if (db) {
      await db.close();
    }
    await connection?.closeConnection?.(this.database, this.readonly);
  }

  private async ensureTable(table: string, createStatement?: string): Promise<void> {
    assertIdentifier(table, "table name");
    if (this.fallback) return;
    const db = this.requireDb();
    await db.execute(
      createStatement ??
        `CREATE TABLE IF NOT EXISTS ${table} (
          id TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_${table}_updated_at ON ${table} (updated_at);`,
      false
    );
  }

  private assertListOptions(options: SQLiteListOptions): void {
    if (options.orderBy) {
      assertIdentifier(options.orderBy, "order by");
    }
    if (options.limit !== undefined && (!Number.isInteger(options.limit) || options.limit < 0)) {
      throw new Error("[SQLiteAdapter] limit must be a non-negative integer");
    }
    if (options.offset !== undefined && (!Number.isInteger(options.offset) || options.offset < 0)) {
      throw new Error("[SQLiteAdapter] offset must be a non-negative integer");
    }
  }

  private async persistWebStore(): Promise<void> {
    if (Capacitor.getPlatform() === "web") {
      await this.connection?.saveToStore?.(this.database);
    }
  }
}

export const createSQLiteAdapter = (options: SQLiteAdapterOptions = {}): CapacitorSQLiteAdapter =>
  new CapacitorSQLiteAdapter(options);

export const sqliteAdapter = createSQLiteAdapter();

export default sqliteAdapter;
