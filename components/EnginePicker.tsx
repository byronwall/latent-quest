import { MultiSelect } from "@mantine/core";

import { engine_choices } from "./SdNewImagePrompt";
import { Button } from "./Button";

import type { CommonPickerProps } from "./CommonPickerProps";

type EnginePickerProps = CommonPickerProps<string>;

export function EnginePicker(props: EnginePickerProps) {
  const {
    onAddItem,
    exclusions,
    onSetExclusion,
    choices,
    forcedChoices = [],
    onSetForcedChoice,
  } = props;

  const handleExclusionChange = (newExclusions: string[]) => {
    onSetExclusion(newExclusions);
  };

  const handleForcedChange = (newForced: string[]) => {
    onSetForcedChoice(newForced);
  };

  return (
    <div style={{ display: "flex", gap: 5 }}>
      <span>engine picker</span>
      {engine_choices.map((engine) => (
        <Button key={engine} onClick={() => onAddItem(engine)}>
          {engine}
        </Button>
      ))}
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
