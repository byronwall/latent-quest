import {
  PromptPart,
  PromptSelection,
  SdImage,
  SdImagePlaceHolder,
} from "../libs/shared-types/src";

export const selRegex = /{([^}]*?)\s?:\s?([^}]*?)}/g;

export function getSelectionFromPromptPart(part: PromptPart) {
  // regex to match string with {artist: XXXX} in it
  // if it matches, return the XXXX
  // if it doesn't match, return null

  const matches2 = Array.from(part.text?.matchAll(selRegex) ?? []);

  const results = matches2.map<PromptSelection>((match) => ({
    name: match[1],
    originalText: match[2],
  }));

  return results;
}

export type SdSubLookup = Record<string, string[]>;

export function getSelectionAsLookup(image: SdImage | SdImagePlaceHolder) {
  const lookup: SdSubLookup = {};

  image.promptBreakdown?.parts.forEach((part) => {
    const selections = getSelectionFromPromptPart(part);
    selections.forEach((sel) => {
      // allow pipe or comma to split for now
      // pipe is intended to be long term
      const parts = sel.originalText.split(/[\|,]/);

      lookup[sel.name] = parts.map((p) => p.trim());
    });
  });

  return lookup;
}
