import { Button, MultiSelect } from "@mantine/core";
import { CommonPickerProps } from "./CfgPicker";

interface StepsPickerProps extends CommonPickerProps<number> {}

const stepsFixedChoices = [10, 20, 30, 40, 50, 80];

export function StepsPicker(props: StepsPickerProps) {
  const {
    onAddItem,
    exclusions,
    onSetExclusion,
    choices,
    forcedChoices = [],
    onSetForcedChoice,
  } = props;

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
      <span>steps picker</span>
      {stepsFixedChoices.map((steps) => (
        <Button key={steps} onClick={() => onAddItem(steps)}>
          {steps}
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
