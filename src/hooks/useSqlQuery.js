import { useEffect, useState } from 'react';
import { useDatabase } from './useDatabase.js';

export const useSqlQuery = (sql, params = [], options = {}) => {
  const { query, ready, revision } = useDatabase();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ready || !sql) {
      return;
    }
    let cancelled = false;
    const runQuery = () => {
      try {
        setLoading(true);
        const rows = query(sql, params);
        if (!cancelled) {
          setData(rows);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    runQuery();
    return () => {
      cancelled = true;
    };
  }, [sql, JSON.stringify(params), ready, revision, query, options.key ?? null]);

  return { data, loading, error };
};
