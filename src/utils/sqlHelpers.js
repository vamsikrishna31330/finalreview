import { useDatabase } from '../hooks/useDatabase.js';

export const useSqlHelpers = () => {
  const { execute, run } = useDatabase();

  const selectAll = (table) => {
    return execute(`SELECT * FROM ${table}`);
  };

  const insert = (table, payload) => {
    const keys = Object.keys(payload);
    const placeholders = keys.map(() => '?').join(', ');
    const values = Object.values(payload);
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    return run(sql, values);
  };

  const update = (table, payload, whereClause, params = []) => {
    const keys = Object.keys(payload);
    const assignments = keys.map((key) => `${key} = ?`).join(', ');
    const values = [...Object.values(payload), ...params];
    const sql = `UPDATE ${table} SET ${assignments} WHERE ${whereClause}`;
    return run(sql, values);
  };

  const remove = (table, whereClause, params = []) => {
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    return run(sql, params);
  };

  return {
    selectAll,
    insert,
    update,
    remove
  };
};
