import { MultiSelect } from "@mantine/core";
import { orderBy, uniq } from "lodash-es";

import { Switch } from "./MantineWrappers";

import type { CommonPickerProps } from "./CfgPicker";

type SubPickerProps = CommonPickerProps<string>;

export function SubPicker(props: SubPickerProps) {
  const {
    exclusions,
    onSetExclusion,
    choices,
    forcedChoices = [],
    onSetForcedChoice,
    rowColVar,
    settings,
    onSetSettings,
  } = props;

  const { isExactMatch } = settings;

  const allValues = isExactMatch
    ? choices
    : choices.flatMap((c) => c.split("|").map((v) => v.trim()));

  const sortedChoices = uniqAndSort(allValues);
  const sortedExclusions = uniqAndSort(exclusions.map((s) => s.toString()));
  const sortedForced = uniqAndSort(forcedChoices.map((s) => s.toString()));

  const handleExactMatchChange = (newExactMatch: boolean) => {
    onSetSettings({ ...settings, isExactMatch: newExactMatch });
  };

  return (
    <div style={{ display: "flex", gap: 5 }}>
      <span>
        <b>{rowColVar}</b>
      </span>

      <span>exclusions</span>
      <MultiSelect
        data={sortedChoices}
        value={sortedExclusions}
        onChange={(newExclusions: string[]) => {
          onSetExclusion(newExclusions);
        }}
        clearable
        searchable
      />
      <span>forced choices</span>
      <MultiSelect
        data={sortedChoices}
        value={sortedForced}
        onChange={(newForced: string[]) => {
          onSetForcedChoice(newForced);
        }}
        clearable
        searchable
      />
      <Switch
        label="exact match"
        checked={isExactMatch}
        onChange={handleExactMatchChange}
      />
    </div>
  );
}

function uniqAndSort<T>(arr: T[]): T[] {
  return orderBy(uniq(arr));
}
