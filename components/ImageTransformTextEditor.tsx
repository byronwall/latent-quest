import { Group, Input, Radio, Stack } from "@mantine/core";
import {
  BreakdownType,
  PromptBreakdownSortOrder,
  SdImageTransformText,
} from "../libs/shared-types/src";

import { ImageTransformEditorProps } from "./ImageTransformEditor";
import { useProduceUpdater } from "./useProduceUpdater";

type ImageTransformTextEditorProps =
  ImageTransformEditorProps<SdImageTransformText>;

export function ImageTransformTextEditor(props: ImageTransformTextEditorProps) {
  const { transform, onChange } = props;

  const update = useProduceUpdater(transform, onChange);

  return (
    <div>
      <Stack>
        <Radio.Group
          onChange={(field: BreakdownType) =>
            update((draft) => {
              draft.field = field;
            })
          }
          value={transform.field}
        >
          {PromptBreakdownSortOrder.map((breakdownType) => (
            <Radio
              key={breakdownType}
              value={breakdownType}
              label={breakdownType}
            />
          ))}
        </Radio.Group>

        <Radio.Group
          onChange={(action: SdImageTransformText["action"]) =>
            update((draft) => {
              draft.action = action;
            })
          }
          value={transform.action}
        >
          {["add", "set"].map((breakdownType) => (
            <Radio
              key={breakdownType}
              value={breakdownType}
              label={breakdownType}
            />
          ))}
        </Radio.Group>

        <Input
          value={transform.value}
          onChange={(evt) =>
            update((draft) => {
              draft.value = evt.currentTarget.value;
            })
          }
        />
      </Stack>
    </div>
  );
}
