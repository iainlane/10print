import { useEffect, useState } from "react";
import { z } from "zod";

export function usePersistentState<T, S extends z.ZodType<T>>(
  key: string,
  schema: S,
): [z.infer<S>, React.Dispatch<React.SetStateAction<z.infer<S>>>] {
  const [state, setState] = useState<z.infer<S>>(() => {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) {
      return schema.parse(undefined);
    }

    const parsed: unknown = JSON.parse(storedValue);

    return schema.parse(parsed);
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
