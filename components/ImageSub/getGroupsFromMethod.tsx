import { getPowerSet } from "./getPowerSet";
import { getPickN } from "./getPickN";
import { getCombinations } from "./getCombinations";
import { getPermutations } from "./getPermutations";
import { getPeelOff } from "./getPeelOff";

import type { ComboResult } from "./SdImageSubPopover";

export function getGroupsFromMethod({
  activeChoices,
  subCountPerItem,
  totalGenerations,
  method,
}: {
  activeChoices: string[];
  subCountPerItem: number;
  totalGenerations: number;
  method: string;
}): ComboResult {
  switch (method) {
    case "permutation":
      return getPermutations(activeChoices, subCountPerItem, totalGenerations);
    case "combination":
      return getCombinations(activeChoices, subCountPerItem, totalGenerations);
    case "pick_n":
      return getPickN(activeChoices, subCountPerItem, totalGenerations);
    case "power_set":
      return getPowerSet(activeChoices, totalGenerations);
    case "peel_off":
      return getPeelOff(activeChoices, totalGenerations);
  }

  throw new Error("invalid method");
}
