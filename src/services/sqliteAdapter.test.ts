import { beforeEach, describe, expect, it, vi } from "vitest";
import { Capacitor } from "@capacitor/core";
import { createSQLiteAdapter, type SQLiteEntity } from "./sqliteAdapter";

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    getPlatform: vi.fn(() => "android"),
  },
}));

vi.mock("../utils/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  },
}));

type StoredRow = {
  id: string;
  value: string;
  created_at: string;
  updated_at: string;
};

type TestRecord = SQLiteEntity & {
  title: string;
  completed?: boolean;
};

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, configurable: true });

const setPlatform = (platform: string): void => {
  vi.mocked(Capacitor.getPlatform).mockReturnValue(platform);
};

const createNativeModule = () => {
  const rows = new Map<string, StoredRow>();
  const db = {
    open: vi.fn(async () => undefined),
    close: vi.fn(async () => undefined),
    execute: vi.fn(async () => ({ changes: { changes: 0 } })),
    run: vi.fn(async (statement: string, values: unknown[] = []) => {
      if (statement.startsWith("INSERT")) {
        const [id, value, createdAt, updatedAt] = values as [string, string, string, string];
        const previous = rows.get(id);
        rows.set(id, {
          id,
          value,
          created_at: previous?.created_at ?? createdAt,
          updated_at: updatedAt,
        });
        return { changes: { changes: 1, lastId: Number(id) || 0 } };
      }

      if (statement.startsWith("DELETE FROM") && values.length > 0) {
        const deleted = rows.delete(String(values[0]));
        return { changes: { changes: deleted ? 1 : 0 } };
      }

      if (statement.startsWith("DELETE FROM")) {
        rows.clear();
      }

      return { changes: { changes: 0 } };
    }),
    query: vi.fn(async (statement: string, values: unknown[] = []) => {
      if (statement.includes("WHERE id = ?")) {
        const row = rows.get(String(values[0]));
        return { values: row ? [{ value: row.value }] : [] };
      }

      return {
        values: Array.from(rows.values()).map((row) => ({ value: row.value })),
      };
    }),
    beginTransaction: vi.fn(async () => ({ changes: { changes: 0 } })),
    commitTransaction: vi.fn(async () => ({ changes: { changes: 0 } })),
    rollbackTransaction: vi.fn(async () => ({ changes: { changes: 0 } })),
  };

  const connection = {
    isConnection: vi.fn(async () => ({ result: false })),
    createConnection: vi.fn(async () => db),
    retrieveConnection: vi.fn(async () => db),
    closeConnection: vi.fn(async () => undefined),
    saveToStore: vi.fn(async () => undefined),
  };

  const SQLiteConnection = vi.fn(function SQLiteConnection() {
    return connection;
  });

  return {
    db,
    connection,
    module: {
      CapacitorSQLite: {},
      SQLiteConnection,
    },
  };
};

describe("CapacitorSQLiteAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setPlatform("android");
  });

  it("initializes native SQLite once for concurrent callers", async () => {
    const native = createNativeModule();
    const adapter = createSQLiteAdapter({
      database: "phase3_test",
      tables: [{ name: "items" }],
      moduleLoader: vi.fn(async () => native.module),
    });

    await Promise.all([adapter.initialize(), adapter.initialize(), adapter.initialize()]);

    expect(native.module.SQLiteConnection).toHaveBeenCalledTimes(1);
    expect(native.connection.createConnection).toHaveBeenCalledTimes(1);
    expect(native.db.open).toHaveBeenCalledTimes(1);
    expect(native.db.execute).toHaveBeenCalledWith(expect.stringContaining("CREATE TABLE IF NOT EXISTS items"), false);
    expect(adapter.getStatus()).toMatchObject({ initialized: true, backend: "sqlite" });
  });

  it("performs typed CRUD through the SQLite document table", async () => {
    const native = createNativeModule();
    const adapter = createSQLiteAdapter({
      database: "phase3_test",
      moduleLoader: vi.fn(async () => native.module),
      now: () => new Date("2026-05-19T10:00:00.000Z"),
    });

    const inserted = await adapter.upsert<TestRecord>("tasks", { id: "a", title: "Sync cache" });
    const loaded = await adapter.getById<TestRecord>("tasks", "a");
    const all = await adapter.getAll<TestRecord>("tasks");
    const deleted = await adapter.delete("tasks", "a");
    const missing = await adapter.getById<TestRecord>("tasks", "a");

    expect(inserted).toEqual({
      id: "a",
      title: "Sync cache",
      createdAt: "2026-05-19T10:00:00.000Z",
      updatedAt: "2026-05-19T10:00:00.000Z",
    });
    expect(loaded).toEqual(inserted);
    expect(all).toEqual([inserted]);
    expect(deleted).toBe(true);
    expect(missing).toBeNull();
  });

  it("falls back to web storage on web while preserving the CRUD contract", async () => {
    setPlatform("web");
    const adapter = createSQLiteAdapter({
      database: "phase3_web",
      now: () => new Date("2026-05-19T11:00:00.000Z"),
    });

    await adapter.upsert<TestRecord>("notes", { id: 1, title: "Offline note", completed: false });
    await adapter.upsert<TestRecord>("notes", { id: 2, title: "Second note", completed: true });

    expect(adapter.getStatus()).toMatchObject({ initialized: true, backend: "web-storage" });
    expect(await adapter.getById<TestRecord>("notes", 1)).toMatchObject({
      id: 1,
      title: "Offline note",
      completed: false,
    });
    expect(await adapter.getAll<TestRecord>("notes", { orderBy: "id", direction: "DESC", limit: 1 })).toEqual([
      expect.objectContaining({ id: 2, title: "Second note" }),
    ]);
    expect(await adapter.delete("notes", 1)).toBe(true);
    expect(await adapter.getById<TestRecord>("notes", 1)).toBeNull();
  });

  it("uses fallback when native plugin loading fails and fallback is allowed", async () => {
    const adapter = createSQLiteAdapter({
      database: "phase3_missing_plugin",
      moduleLoader: vi.fn(async () => {
        throw new Error("Cannot find package '@capacitor-community/sqlite'");
      }),
    });

    await adapter.initialize();

    expect(adapter.getStatus().backend).toBe("web-storage");
  });

  it("closes partial native resources before falling back after initialization failure", async () => {
    const native = createNativeModule();
    native.db.open.mockRejectedValueOnce(new Error("open failed"));
    const adapter = createSQLiteAdapter({
      database: "phase3_partial_init",
      moduleLoader: vi.fn(async () => native.module),
    });

    await adapter.initialize();

    expect(adapter.getStatus().backend).toBe("web-storage");
    expect(native.db.close).toHaveBeenCalledTimes(1);
    expect(native.connection.closeConnection).toHaveBeenCalledWith("phase3_partial_init", false);
  });

  it("rejects unsafe table identifiers before building SQL", async () => {
    const native = createNativeModule();
    const adapter = createSQLiteAdapter({
      moduleLoader: vi.fn(async () => native.module),
    });

    await expect(adapter.upsert("tasks; DROP TABLE tasks", { id: "a" })).rejects.toThrow("Invalid table name");
    expect(native.connection.createConnection).not.toHaveBeenCalled();
  });

  it("rolls back native transactions when work fails", async () => {
    const native = createNativeModule();
    const adapter = createSQLiteAdapter({
      moduleLoader: vi.fn(async () => native.module),
    });

    await expect(
      adapter.transaction(async () => {
        throw new Error("write failed");
      })
    ).rejects.toThrow("write failed");

    expect(native.db.beginTransaction).toHaveBeenCalledTimes(1);
    expect(native.db.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(native.db.commitTransaction).not.toHaveBeenCalled();
  });
});
