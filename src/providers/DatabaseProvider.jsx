import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api.js';

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
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Just test connection, don't run queries during init
        await api.testConnection();
        setReady(true);
      } catch (err) {
        console.error('Database initialization error:', err);
        setError(err);
      }
    };
    initialize();
  }, []);

  const ensureDb = useCallback(() => {
    if (!ready) {
      throw new Error('Database not ready');
    }
    return api;
  }, [ready]);

  const run = useCallback(
    async (sql, params = []) => {
      const database = ensureDb();
      const result = await database.run(sql, params);
      setRevision((prev) => prev + 1);
      return result;
    },
    [ensureDb]
  );

  const execute = useCallback(
    async (sql, params = []) => {
      const database = ensureDb();
      return await database.execute(sql, params);
    },
    [ensureDb]
  );

  const query = useCallback(
    async (sql, params = []) => {
      const database = ensureDb();
      return await database.query(sql, params);
    },
    [ensureDb]
  );

  const runScript = useCallback(
    async (script) => {
      // For scripts, we'll split them into individual statements
      const statements = script.split(';').filter(stmt => stmt.trim());
      for (const statement of statements) {
        await api.execute(statement.trim());
      }
      setRevision((prev) => prev + 1);
    },
    []
  );

  const resetDatabase = useCallback(async () => {
    // This would need a dedicated endpoint on the server
    console.warn('Reset database not implemented for API mode');
  }, []);

  const exportDatabase = useCallback(() => {
    // PostgreSQL doesn't export the same way as SQLite
    // This would require pg_dump or similar tools
    return new Uint8Array();
  }, []);

  const importDatabase = useCallback(
    async (buffer) => {
      // PostgreSQL doesn't import the same way as SQLite
      // This would require psql or similar tools
      console.warn('Import database not supported for PostgreSQL');
    },
    []
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
