import { useEffect, useState } from "react";

import type { RefObject } from "react";

export default function useOnScreen(ref: RefObject<HTMLElement>) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    // this must all happen in useEffect to avoid SSR issues where IntersectionObserver is not defined
    if (ref.current === null) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      return setIntersecting(entry.isIntersecting);
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return isIntersecting;
}
