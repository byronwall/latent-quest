import { Permutation } from "js-combinatorics";

import type { ComboResult } from "./SdImageSubPopover";

export function getPermutations(
  activeChoices: string[],
  subCountPerItem: number,
  totalCount: number
): ComboResult {
  const results: string[][] = [];

  const allPerms = new Permutation(activeChoices, subCountPerItem);

  const totalPossible = allPerms.length;
  if (totalPossible < totalCount) {
    return { results: Array.from(allPerms), totalPossible: allPerms.length };
  }

  for (let i = 0; i < totalCount; i++) {
    results.push(allPerms.sample() ?? []);
  }
  return { results, totalPossible };
}
