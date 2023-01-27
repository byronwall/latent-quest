import { PowerSet } from "js-combinatorics";

import type { ComboResult } from "./SdImageSubPopover";

export function getPowerSet(
  activeChoices: string[],
  totalCount: number
): ComboResult {
  const results: string[][] = [];

  const allPowerSets = new PowerSet(activeChoices);

  const totalPossible = allPowerSets.length;
  if (totalPossible < totalCount) {
    const results = Array.from(allPowerSets).filter((c) => c.length > 0);
    return { results: results, totalPossible };
  }

  for (let i = 0; i < totalCount; i++) {
    const sample = allPowerSets.sample() ?? [];

    if (sample.length === 0 || sample[0] === "") {
      continue;
    }

    results.push(sample);
  }
  return { results, totalPossible };
}
