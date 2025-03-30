import { useEffect, useState } from "react";
import { z } from "zod";

export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  schema: z.ZodSchema<T>,
): [z.infer<typeof schema>, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue === null) return defaultValue;

      const parsed: unknown = JSON.parse(storedValue);

      const { success, data, error } = schema.safeParse(parsed);
      if (!success) {
        console.warn(
          `Invalid data for key "${key}" in localStorage. Using default.`,
          error,
        );

        // Clear invalid data
        localStorage.removeItem(key);

        return defaultValue;
      }

      return data;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}
