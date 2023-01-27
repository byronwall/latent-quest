import { orderBy } from "lodash-es";

import type { ComboResult } from "./SdImageSubPopover";

export function getPickN(
  _activeChoices: string[],
  subCountPerItem: number,
  totalCount: number
): ComboResult {
  const groupsToRun: string[][] = [];

  const activeChoices = orderBy(_activeChoices, (c) => Math.random());

  const itemCount = Math.min(totalCount, activeChoices.length);

  for (let index = 0; index < itemCount; index++) {
    // for i in subCountPerItem
    for (let i = 0; i < subCountPerItem; i++) {
      if (i === 0) {
        groupsToRun.push([]);
      }
      const group = activeChoices[index + i];
      groupsToRun[groupsToRun.length - 1].push(group);
    }
  }

  return {
    results: groupsToRun,
    totalPossible: activeChoices.length,
  };
}
