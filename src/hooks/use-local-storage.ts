"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("local-storage", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("local-storage", callback);
  };
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);

  const getServerSnapshot = useCallback(() => null, []);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  let storedValue = initialValue;
  if (raw !== null) {
    try {
      storedValue = JSON.parse(raw);
    } catch {
      storedValue = initialValue;
    }
  }

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        let prev = initialValue;
        const currentRaw = window.localStorage.getItem(key);
        if (currentRaw !== null) {
          try {
            prev = JSON.parse(currentRaw);
          } catch {
            prev = initialValue;
          }
        }
        const valueToStore =
          value instanceof Function ? value(prev) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        window.dispatchEvent(new Event("local-storage"));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, initialValue]
  );

  return [storedValue, setValue];
}
