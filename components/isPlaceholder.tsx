import type { SdImage, SdImagePlaceHolder } from "../libs/shared-types/src";

export function isPlaceholder(
  item: SdImage | SdImagePlaceHolder
): item is SdImagePlaceHolder {
  return !("id" in item);
}
