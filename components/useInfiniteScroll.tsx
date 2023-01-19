import { useEffect, useMemo, useRef, useState } from "react";

import useOnScreen from "./useOnScreen";

export function useInfiniteScroll<T>(
  groupList: T[],
  initialCount = 12,
  step = 4
) {
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const refEndOfList = useRef<HTMLDivElement>(null);

  const isVisible = useOnScreen(refEndOfList);

  const visibleItems = useMemo(
    () => groupList.slice(0, visibleCount),
    [groupList, visibleCount]
  );

  useEffect(() => {
    if (isVisible) {
      setVisibleCount(Math.min(groupList.length, visibleCount + step));
    }
  }, [isVisible, groupList.length, step, visibleCount]);

  const hasMore = visibleCount < groupList.length;

  return { visibleItems, refEndOfList, hasMore };
}
