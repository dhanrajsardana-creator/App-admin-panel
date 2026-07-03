import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a stable debounced version of `fn`. Latest args win. The pending
 * call is flushed/cancelled on unmount. Used for auto-save while typing.
 */
export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delay = 600
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => cancel, [cancel]);

  return useCallback(
    (...args: A) => {
      cancel();
      timer.current = setTimeout(() => fnRef.current(...args), delay);
    },
    [cancel, delay]
  );
}
