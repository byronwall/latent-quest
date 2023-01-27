import { useState, useEffect } from "react";

export function useOnScreenAlt(ref, rootMargin = "0px") {
  // State and setter for storing whether element is visible
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update our state when observer callback fires
        setIntersecting(entry.isIntersecting);
      },
      {
        rootMargin,
      }
    );
    if (ref.current) {
      observer.observe(currentRef);
    }
    return () => {
      try {
        if (currentRef !== null) {
          observer.unobserve(currentRef);
        }
      } catch (e) {
        console.log(e);
      }
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount
  return isIntersecting;
}
