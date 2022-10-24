import { Button, Popover } from "@mantine/core";
import { useState } from "react";

import { getBreakdownDelta } from "../libs/helpers";
import {
  PromptBreakdown,
  SdImageTransform,
  SdImageTransformMulti,
} from "../libs/shared-types/src";
import { PromptEditor } from "./PromptEditor";

interface PromptEditorProps {
  promptBreakdown: PromptBreakdown;

  onNewTransform: (newTransform: SdImageTransform) => void;
}

export function SdPromptToTransform(props: PromptEditorProps) {
  const { promptBreakdown, onNewTransform } = props;

  const [breakdown, setBreakdown] = useState<PromptBreakdown>(promptBreakdown);

  const handleCreateTransform = () => {
    // get delta between breakdown in props and breakdown in editor
    const deltaTransform = getBreakdownDelta(promptBreakdown, breakdown, false);

    console.log("deltaTransform", deltaTransform);

    const multiTransform: SdImageTransformMulti = {
      type: "multi",
      transforms: deltaTransform,
      field: "unknown",
    };

    onNewTransform(multiTransform);
  };

  return (
    <Popover closeOnClickOutside>
      <Popover.Dropdown>
        <div
          style={{
            width: 600,
          }}
        >
          <Button onClick={handleCreateTransform}>
            create transform for current
          </Button>
          <PromptEditor
            initialBreakdown={breakdown}
            onBreakdownChange={setBreakdown}
          />
        </div>
      </Popover.Dropdown>
      <Popover.Target>
        <Button>xform</Button>
      </Popover.Target>
    </Popover>
  );
}
