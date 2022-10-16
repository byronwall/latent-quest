import { Group, NumberInput, Radio } from "@mantine/core";
import {
  SdImageTransformNumberDelta,
  SdImageTransformNumberRaw,
} from "../libs/shared-types/src";
import { produce } from "immer";

import { ImageTransformEditorProps } from "./ImageTransformEditor";
import { useProduceUpdater } from "./useProduceUpdater";

type ImageTransformNumberEditorProps = ImageTransformEditorProps<
  SdImageTransformNumberDelta | SdImageTransformNumberRaw
>;

export function ImageTransformNumberEditor(
  props: ImageTransformNumberEditorProps
) {
  const { transform, onChange } = props;

  const update = useProduceUpdater(transform, onChange);

  const handleFieldChange = (field: SdImageTransformNumberDelta["field"]) =>
    update((draft) => {
      draft.field = field;
    });

  const handleValueChange = (value: number) => {
    onChange(
      produce(transform, (draft) => {
        if (draft.type === "num-raw") {
          draft.value = value;
        }
        if (draft.type === "num-delta") {
          draft.delta = value;
        }
      })
    );
  };

  return (
    <div>
      <Group>
        <Radio.Group onChange={handleFieldChange} value={transform.field}>
          <Radio value="cfg" label="cfg" />
          <Radio value="steps" label="steps" />
          <Radio value="seed" label="seed" />
        </Radio.Group>
        <NumberInput
          onChange={handleValueChange}
          label={transform.type === "num-raw" ? "value" : "delta"}
          value={
            transform.type === "num-raw" ? transform.value : transform.delta
          }
        />
      </Group>
    </div>
  );
}
