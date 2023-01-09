import { selRegex } from "./getSelectionFromPromptPart";

import { getTextForBreakdown } from "../libs/shared-types/src";

import type { SdImage, SdImagePlaceHolder } from "../libs/shared-types/src";

export function getTextOnlyFromPromptPartWithLabel(text: string) {
  const result = text.replaceAll(selRegex, (match, p1, p2) => {
    return p2;
  });

  // TODO: sort out the pipe  + comma stuff later -- breaks DreamStudio syntax
  return result;
}

export function getFinalPromptText(image: SdImage | SdImagePlaceHolder) {
  const promptText = getTextForBreakdown(image.promptBreakdown);
  return getTextOnlyFromPromptPartWithLabel(promptText);
}
