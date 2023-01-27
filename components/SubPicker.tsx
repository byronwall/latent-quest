import { MultiSelect } from "@mantine/core";
import { orderBy, uniq } from "lodash-es";

import { Button } from "./Button";
import { Switch } from "./MantineWrappers";
import { SdImageSubPopover } from "./ImageSub/SdImageSubPopover";

import type { SdImageStudyDefSettingsSub } from "../libs/shared-types/src";
import type { CommonPickerProps } from "./CommonPickerProps";

type SubPickerProps = CommonPickerProps<string> & {
  settings: SdImageStudyDefSettingsSub;
};

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
    mainImage,
    onAddItem,
  } = props;

  const { isExactMatch = false } = settings;

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

      <SdImageSubPopover
        initialSelections={sortedChoices}
        image={mainImage}
        availableCategories={rowColVar}
        onReceiveSubs={onAddItem}
      />

      <Button color="pink" onClick={props.onResetChoices}>
        clear extras
      </Button>

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
