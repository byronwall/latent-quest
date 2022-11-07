import { Button, Popover } from "@mantine/core";

import { SdImage } from "../libs/shared-types/src";
import { PopoverCommon } from "./MantineWrappers";
import { SdNewImagePrompt } from "./SdNewImagePrompt";

interface SdImageModifyPromptProps {
  defaultImage?: SdImage;
}

export function SdImageModifyPopover(props: SdImageModifyPromptProps) {
  const { defaultImage } = props;

  return (
    <PopoverCommon>
      <Popover.Dropdown>
        <div
          style={{
            width: 600,
          }}
        >
          <SdNewImagePrompt defaultImage={defaultImage} />
        </div>
      </Popover.Dropdown>
      <Popover.Target>
        <Button compact color="orange">
          modify
        </Button>
      </Popover.Target>
    </PopoverCommon>
  );
}
