import { useState, useEffect } from 'react';
import { api } from '../api.js';

export function useLoad(path, key = '') {
  const [state, set] = useState({ data: null, error: '', loading: true });
  useEffect(() => {
    let active = true;
    set((s) => ({ ...s, error: '', loading: true }));
    api(path)
      .then((data) => active && set({ data, error: '', loading: false }))
      .catch((e) => active && set({ data: null, error: e.message, loading: false }));
    return () => {
      active = false;
    };
  }, [path, key]);
  return state;
}
