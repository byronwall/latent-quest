import { useEffect, useState } from "react";

// array of 10 unique colors as hex values
export function useControlledUncontrolled<T>(
  initialValue: T,
  onChange: (newPrompt: T) => void | undefined,
  defaultValue: T
) {
  const [prompt, setPrompt] = useState<T>(initialValue ?? defaultValue);

  // push a change in the props into state
  useEffect(() => {
    setPrompt(initialValue);
  }, [initialValue]);

  // communicate a change in state back to the props
  useEffect(() => {
    onChange?.(prompt);
  }, [prompt, onChange]);

  return [prompt, setPrompt] as const;
}
