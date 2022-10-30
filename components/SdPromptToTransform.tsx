import { Button, Popover } from "@mantine/core";
import { useEffect, useState } from "react";

import { getBreakdownDelta } from "../libs/helpers";
import {
  PromptBreakdown,
  PromptSelection,
  SdImageTransform,
  SdImageTransformMulti,
  SdImageTransformTextSub,
} from "../libs/shared-types/src";
import { PromptEditor } from "./PromptEditor";

interface PromptEditorProps {
  promptBreakdown: PromptBreakdown;

  onNewTransform: (newTransform: SdImageTransform) => void;
}

export function SdPromptToTransform(props: PromptEditorProps) {
  const { promptBreakdown, onNewTransform } = props;

  const [breakdown, setBreakdown] = useState<PromptBreakdown>(promptBreakdown);

  // push props into state update
  useEffect(() => {
    setBreakdown(promptBreakdown);
  }, [promptBreakdown]);

  const handleCreateTransform = () => {
    // get delta between breakdown in props and breakdown in editor
    const deltaTransform = getBreakdownDelta(promptBreakdown, breakdown, false);

    const multiTransform: SdImageTransformMulti = {
      type: "multi",
      transforms: deltaTransform,
      field: "unknown",
    };

    onNewTransform(multiTransform);
  };

  const handleCreateSubTransform = (selection: PromptSelection) => {
    console.log("handleCreateSubTransform");

    const subTransform: SdImageTransformTextSub = {
      type: "text",
      field: "unknown",
      action: "substitute",
      original: selection.originalText,
      value: "",
    };

    console.log("subTransform", subTransform);
  };

  // const selections = uniq(
  //   breakdown.parts.reduce((acc, part) => {
  //     if (part.selections) {
  //       acc.push(...part.selections);
  //     }
  //     return acc;
  //   }, [] as PromptSelection[])
  // );

  // console.log("selectionNames", selections);

  return (
    <div>
      <Popover closeOnClickOutside>
        <Popover.Dropdown>
          <div
            style={{
              width: 600,
            }}
          >
            <Button onClick={handleCreateTransform}>
              create xform for text
            </Button>
            {/* {selections.map((selection) => (
              <Button
                key={selection.name}
                onClick={() => handleCreateSubTransform(selection)}
                color="green"
              >
                xform for {selection.name}
              </Button>
            ))} */}

            <PromptEditor
              initialBreakdown={breakdown}
              onBreakdownChange={setBreakdown}
              shouldAllowSelection
            />
          </div>
        </Popover.Dropdown>
        <Popover.Target>
          <Button>xform</Button>
        </Popover.Target>
      </Popover>
    </div>
  );
}
