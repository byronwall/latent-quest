import { Button, MultiSelect } from "@mantine/core";

export interface CommonPickerProps<T> {
  choices: any[];

  onAddItem: (cfg: T) => void;

  forcedChoices?: T[];
  onSetForcedChoice: (cfg: T[]) => void;

  exclusions: T[];
  onSetExclusion: (cfg: T[]) => void;
}

type CfgPickerProps = CommonPickerProps<number>;

const cfgFixedChoices = [2, 4, 6, 8, 10, 12, 14, 16];

export function CfgPicker(props: CfgPickerProps) {
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
      <span>cfg picker</span>
      {cfgFixedChoices.map((cfg) => (
        <Button key={cfg} onClick={() => onAddItem(cfg)}>
          {cfg}
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
