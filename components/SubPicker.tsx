import { MultiSelect } from "@mantine/core";

import type { CommonPickerProps } from "./CfgPicker";

type SubPickerProps = CommonPickerProps<string> & {
  rowColVar: string;
};

export function SubPicker(props: SubPickerProps) {
  const {
    exclusions,
    onSetExclusion,
    choices,
    forcedChoices = [],
    onSetForcedChoice,
    rowColVar,
  } = props;

  const handleExclusionChange = (newExclusions: string[]) => {
    onSetExclusion(newExclusions);
  };

  const handleForcedChange = (newForced: string[]) => {
    onSetForcedChoice(newForced);
  };

  return (
    <div style={{ display: "flex", gap: 5 }}>
      <span>
        <b>{rowColVar}</b>
      </span>

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
