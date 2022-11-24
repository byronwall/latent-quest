import type { SdImage, SdImagePlaceHolder } from "../libs/shared-types/src";

export function isPlaceholder(
  item: SdImage | SdImagePlaceHolder
): item is SdImagePlaceHolder {
  return !isFullImage(item);
}

export function isFullImage(
  item: SdImage | SdImagePlaceHolder
): item is SdImage {
  return "id" in item;
}
