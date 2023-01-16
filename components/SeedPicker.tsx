import { MultiSelect, NumberInput } from "@mantine/core";
import { IconArrowsShuffle, IconPlus } from "@tabler/icons";
import { useState } from "react";

import { Button } from "./Button";

import { getRandomSeed } from "../libs/shared-types/src";

import type { CommonPickerProps } from "./CommonPickerProps";

type SeedPickerProps = CommonPickerProps<number>;

export function SeedPicker(props: SeedPickerProps) {
  const {
    onAddItem,
    choices,
    exclusions,
    onSetExclusion,
    onSetForcedChoice,
    forcedChoices = [],
  } = props;

  const [seed, setSeed] = useState<number | undefined>(undefined);

  const handleExclusionChange = (newExclusions: string[]) => {
    const newExclusionsNum = newExclusions.map((s) => parseInt(s, 10));
    onSetExclusion(newExclusionsNum);
  };

  const handleForcedChange = (newForced: string[]) => {
    const newForcedNum = newForced.map((s) => parseInt(s, 10));
    onSetForcedChoice(newForcedNum);
  };

  return (
    <div style={{ display: "flex", gap: 5 }}>
      <span>seed picker</span>
      <Button onClick={() => onAddItem(getRandomSeed())}>
        random <IconArrowsShuffle />
      </Button>

      <NumberInput
        placeholder="custom"
        value={seed}
        onChange={(value) => setSeed(value)}
        rightSection={
          <Button
            onClick={() => {
              if (seed) {
                onAddItem(seed);
                setSeed(undefined);
              }
            }}
          >
            <IconPlus />
          </Button>
        }
        style={{ width: 150, marginRight: 10 }}
      />
      <span>exclusions</span>
      <MultiSelect
        data={exclusions.map((s) => s.toString())}
        value={exclusions.map((s) => s.toString())}
        onChange={handleExclusionChange}
        clearable
      />
      <span>forced choices</span>
      <MultiSelect
        data={choices.map((s) => s.toString())}
        value={forcedChoices.map((s) => s.toString())}
        onChange={handleForcedChange}
        clearable
        searchable
      />
    </div>
  );
}
