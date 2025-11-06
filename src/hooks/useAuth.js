import { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider.jsx';

export const useAuth = () => {
  return useContext(AuthContext);
};
