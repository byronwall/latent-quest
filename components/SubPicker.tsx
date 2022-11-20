import { MultiSelect } from "@mantine/core";
import { orderBy, uniq } from "lodash-es";

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

  const sortedChoices = uniqAndSort(choices.map((s) => s.toString()));
  const sortedExclusions = uniqAndSort(exclusions.map((s) => s.toString()));
  const sortedForced = uniqAndSort(forcedChoices.map((s) => s.toString()));

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
    </div>
  );
}

function uniqAndSort<T>(arr: T[]): T[] {
  return orderBy(uniq(arr));
}
