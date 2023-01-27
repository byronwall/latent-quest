import type { ComboResult } from "./SdImageSubPopover";

export function getPeelOff(
  activeChoices: string[],
  totalGenerations: number
): ComboResult {
  const groups: string[][] = [];

  for (let i = 0; i < totalGenerations; i++) {
    const indexToKeep = Math.floor(
      (i / totalGenerations) * activeChoices.length
    );

    const group = activeChoices.slice(0, activeChoices.length - indexToKeep);
    groups.push(group);
  }

  return {
    results: groups,
    totalPossible: activeChoices.length,
  };
}
