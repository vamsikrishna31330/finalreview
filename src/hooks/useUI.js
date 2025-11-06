import { useContext } from 'react';
import { UIContext } from '../providers/UIProvider.jsx';

export const useUI = () => {
  return useContext(UIContext);
};
