import {
  getTextForBreakdown,
  SdImage,
  SdImagePlaceHolder,
} from "../libs/shared-types/src";
import { selRegex } from "./getSelectionFromPromptPart";

export function getTextOnlyFromPromptPartWithLabel(text: string) {
  const result = text.replaceAll(selRegex, (match, p1, p2) => {
    return p2;
  });

  // remove pipe and do commas
  // TODO: consider allowing different separators
  return result.replaceAll("|", ", ");
}

export function getFinalPromptText(image: SdImage | SdImagePlaceHolder) {
  const promptText = getTextForBreakdown(image.promptBreakdown);
  return getTextOnlyFromPromptPartWithLabel(promptText);
}
