import { Select } from "@mantine/core";

import { engine_choices } from "./SdNewImagePrompt";

import type { SdImageEngines } from "../libs/shared-types/src";

type SelectEngineProps = {
  value: SdImageEngines;
  onChange: (engine: SdImageEngines) => void;
};

export function SelectEngine(props: SelectEngineProps) {
  const { value, onChange } = props;

  return (
    <Select
      label="engine"
      placeholder="engine"
      dropdownPosition="bottom"
      data={engine_choices}
      value={value}
      onChange={(val: any) => onChange(val ?? "SD 1.5")}
      className="min-w-[140px]"
    />
  );
}
