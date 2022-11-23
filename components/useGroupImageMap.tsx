import { useMemo } from "react";

import { getUniversalIdFromImage } from "../libs/helpers";

import type { SdImage } from "../libs/shared-types/src";

export function useGroupImageMap(imageGroupData: SdImage[]) {
  const groupImageMap = useMemo(() => {
    const map: Record<string, SdImage> = {};
    imageGroupData.forEach((image) => {
      map[getUniversalIdFromImage(image)] = image;
    });
    return map;
  }, [imageGroupData]);

  return groupImageMap;
}
