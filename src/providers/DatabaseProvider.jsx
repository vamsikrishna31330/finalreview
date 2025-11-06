import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import schemaSql from '../data/schema.sql?raw';
import seedSql from '../data/seed.sql?raw';

const STORAGE_KEY = 'farming-platform-db';

const bufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = buffer;
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
};

const base64ToBuffer = (base64) => {
  const binary = atob(base64);
  const length = binary.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export const DatabaseContext = createContext({
  ready: false,
  error: null,
  execute: () => [],
  run: () => ({ lastInsertId: null, changes: 0 }),
  query: () => [],
  runScript: () => {},
  resetDatabase: () => {},
  exportDatabase: () => new Uint8Array(),
  importDatabase: () => {},
  revision: 0
});

export const DatabaseProvider = ({ children }) => {
  const [SQL, setSQL] = useState(null);
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const [revision, setRevision] = useState(0);

  const persistDatabase = useCallback((database) => {
    if (typeof window === 'undefined' || !database) {
      return;
    }
    const exported = database.export();
    window.localStorage.setItem(STORAGE_KEY, bufferToBase64(exported));
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        const SQLLib = await initSqlJs({ locateFile: () => wasmUrl });
        let database;
        const persisted = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
        if (persisted) {
          const buffer = base64ToBuffer(persisted);
          database = new SQLLib.Database(buffer);
        } else {
          database = new SQLLib.Database();
          database.exec(schemaSql);
          database.exec(seedSql);
          persistDatabase(database);
        }
        setSQL(SQLLib);
        setDb(database);
        setReady(true);
      } catch (err) {
        setError(err);
      }
    };
    initialize();
  }, []);

  const ensureDb = useCallback(() => {
    if (!db) {
      throw new Error('Database not ready');
    }
    return db;
  }, [db]);

  const run = useCallback(
    (sql, params = []) => {
      const database = ensureDb();
      const stmt = database.prepare(sql);
      try {
        stmt.run(params);
      } finally {
        stmt.free();
      }
      const lastInfo = database.exec('SELECT last_insert_rowid() as lastInsertId, changes() as changes;');
      const values = lastInfo?.[0]?.values?.[0] ?? [null, 0];
      setRevision((prev) => prev + 1);
      persistDatabase(database);
      return { lastInsertId: values[0], changes: values[1] };
    },
    [ensureDb, persistDatabase]
  );

  const execute = useCallback(
    (sql, params = []) => {
      const database = ensureDb();
      const stmt = database.prepare(sql);
      try {
        stmt.bind(params);
        const rows = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        return rows;
      } finally {
        stmt.free();
      }
    },
    [ensureDb]
  );

  const query = useCallback(
    (sql, params = []) => {
      const database = ensureDb();
      const stmt = database.prepare(sql);
      const rows = [];
      try {
        stmt.bind(params);
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
      } finally {
        stmt.free();
      }
      return rows;
    },
    [ensureDb]
  );

  const runScript = useCallback(
    (script) => {
      const database = ensureDb();
      database.exec(script);
      setRevision((prev) => prev + 1);
      persistDatabase(database);
    },
    [ensureDb, persistDatabase]
  );

  const resetDatabase = useCallback(() => {
    if (!SQL) {
      return;
    }
    if (db) {
      db.close();
    }
    const database = new SQL.Database();
    database.exec(schemaSql);
    database.exec(seedSql);
    setDb(database);
    setReady(true);
    setRevision((prev) => prev + 1);
    persistDatabase(database);
  }, [SQL, db, persistDatabase]);

  const exportDatabase = useCallback(() => {
    const database = ensureDb();
    return database.export();
  }, [ensureDb]);

  const importDatabase = useCallback(
    (buffer) => {
      if (!SQL) {
        return;
      }
      const database = new SQL.Database(buffer);
      if (db) {
        db.close();
      }
      setDb(database);
      setReady(true);
      setRevision((prev) => prev + 1);
      persistDatabase(database);
    },
    [SQL, db, persistDatabase]
  );

  const value = useMemo(
    () => ({
      ready,
      error,
      execute,
      run,
      query,
      runScript,
      resetDatabase,
      exportDatabase,
      importDatabase,
      revision
    }),
    [ready, error, execute, run, query, runScript, resetDatabase, exportDatabase, importDatabase, revision]
  );

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
};
