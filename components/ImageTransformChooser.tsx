import { Select } from "@mantine/core";

import { SdImageTransformHolder } from "../libs/shared-types/src";
import { useAppStore } from "../model/store";

interface ImageTransformChooserProps {
  holder: SdImageTransformHolder | undefined;
  onChange: (holder: SdImageTransformHolder) => void;
  disabled?: boolean;
}

export function ImageTransformChooser(props: ImageTransformChooserProps) {
  // des props
  const { holder, onChange, disabled } = props;

  const defaultTransformers = useAppStore((s) => s.transformHolders);

  const selectData = defaultTransformers.map((list) => list.name);

  const handleChange = (value: string) => {
    const newHolder = defaultTransformers.find((list) => list.name === value);
    if (newHolder) {
      onChange(newHolder);
    }
  };

  return (
    <Select
      value={holder?.name}
      data={selectData}
      onChange={handleChange}
      searchable
      disabled={disabled}
    />
  );
}
