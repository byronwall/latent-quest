import { MultiSelect } from "@mantine/core";

import { Button } from "./Button";
import { fixedStrength } from "./SdVariantMenu";
import { getVariantStrengthDisplayValue } from "./transform_helpers";

import type { CommonPickerProps } from "./CommonPickerProps";

type VariantStrengthPickerProps = CommonPickerProps<number>;

export function VariantStrengthPicker(props: VariantStrengthPickerProps) {
  const {
    exclusions,
    onSetExclusion,
    choices,
    forcedChoices = [],
    onSetForcedChoice,
    onAddItem,
  } = props;

  const handleExclusionChange = (newExclusions: string[]) => {
    const newExclusionsNum = newExclusions.map((s) => parseFloat(s));
    onSetExclusion(newExclusionsNum);
  };

  const handleForcedChange = (newForced: string[]) => {
    const newForcedNum = newForced.map((s) => parseFloat(s));
    onSetForcedChoice(newForcedNum);
  };

  return (
    <div style={{ display: "flex", gap: 5 }}>
      <span>variant strength picker</span>
      {fixedStrength.map((variantStrength) => (
        <Button
          key={variantStrength}
          onClick={() => onAddItem(variantStrength)}
        >
          {getVariantStrengthDisplayValue(variantStrength)}
        </Button>
      ))}
      <span>exclusions</span>
      <MultiSelect
        data={choices.map((s) => s.toString())}
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
