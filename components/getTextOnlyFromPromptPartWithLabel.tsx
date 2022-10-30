import { PromptPart } from "../libs/shared-types/src";
import { selRegex } from "./getSelectionFromPromptPart";

export function getTextOnlyFromPromptPartWithLabel(text: string) {
  const result = text.replaceAll(selRegex, (match, p1, p2) => {
    return p2;
  });

  return result;
}
