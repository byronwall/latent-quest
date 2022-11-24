import { Button, MultiSelect } from "@mantine/core";

import type { CommonPickerProps } from "./CommonPickerProps";

type EnginePickerProps = CommonPickerProps<string>;

const engineFixedChoices = ["SD 1.5", "DALL-E"];

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
      {engineFixedChoices.map((engine) => (
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
