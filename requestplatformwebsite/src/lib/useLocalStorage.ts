//can technically delete now -> moved to supabase
import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  const setStoredValue = (update: T | ((prev: T) => T)) => {
    setValue(prev => {
      const newValue = typeof update === 'function'
        ? (update as (prev: T) => T)(prev)
        : update;
      try {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      } catch {}
      return newValue;
    });
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setStoredValue] as const;
}
