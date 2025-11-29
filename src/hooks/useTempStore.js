import { useEffect, useState } from 'react';
import { useSqlQuery } from './useSqlQuery.js';
import { tempStore } from '../utils/tempStore.js';

export const useTempStore = (tableName, sql, params = []) => {
  const { data: dbData, loading, error } = useSqlQuery(sql, params);
  const [data, setData] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize with database data or sample data
  useEffect(() => {
    if (!isInitialized) {
      if (dbData && Array.isArray(dbData) && dbData.length > 0) {
        // Use database data if available
        tempStore.initialize(tableName, dbData);
      }
      // Always use the current data from tempStore (sample data if no DB data)
      setData(tempStore.getAll(tableName));
      setIsInitialized(true);
    }
  }, [dbData, tableName, isInitialized]);

  // Create function
  const create = (item) => {
    const newItem = tempStore.create(tableName, item);
    setData(tempStore.getAll(tableName));
    return newItem;
  };

  // Update function
  const update = (id, updates) => {
    const updatedItem = tempStore.update(tableName, id, updates);
    setData(tempStore.getAll(tableName));
    return updatedItem;
  };

  // Delete function
  const remove = (id) => {
    const deletedItem = tempStore.delete(tableName, id);
    setData(tempStore.getAll(tableName));
    return deletedItem;
  };

  // Refresh from database
  const refresh = () => {
    setData(tempStore.getAll(tableName));
  };

  return {
    data,
    loading,
    error,
    create,
    update,
    delete: remove,
    refresh,
    isInitialized
  };
};
