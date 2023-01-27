import { Combination } from "js-combinatorics";

import type { ComboResult } from "./SdImageSubPopover";

export function getCombinations(
  activeChoices: string[],
  subCountPerItem: number,
  totalCount: number
): ComboResult {
  const results: string[][] = [];

  const allCombs = new Combination(activeChoices, subCountPerItem);

  const totalPossible = allCombs.length;

  if (totalPossible < totalCount) {
    return { results: Array.from(allCombs), totalPossible };
  }

  for (let i = 0; i < totalCount; i++) {
    results.push(allCombs.sample() ?? []);
  }
  return { results, totalPossible };
}
