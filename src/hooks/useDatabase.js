import { useContext } from 'react';
import { DatabaseContext } from '../providers/DatabaseProvider.jsx';

export const useDatabase = () => {
  return useContext(DatabaseContext);
};
