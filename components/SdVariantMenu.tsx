import { Popover, Tooltip } from "@mantine/core";
import { useState } from "react";
import { IconVersions } from "@tabler/icons";

import { Button } from "./Button";
import { handleCreateVariant } from "./handleCreateVariant";
import { SelectEngine } from "./SelectEngine";

import type { SdImage, SdImageEngines } from "../libs/shared-types/src";

interface SdVariantPopoverProps {
  image: SdImage;
}

// percentage is 1 - this number
export const fixedStrength = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.3, 0.1];

export function SdVariantPopover(props: SdVariantPopoverProps) {
  const { image } = props;

  const defaultSdEngine: SdImageEngines =
    image.engine === "DALL-E" ? "SD 2.1 512px" : image.engine;

  const [engine, setEngine] = useState<SdImageEngines>(defaultSdEngine);

  const handleCustomClick = () => {
    const strength = prompt(
      "Enter strength: 0 = wholly new image; 1 = original image"
    );

    if (strength === null) {
      return;
    }

    const strengthNum = parseFloat(strength);
    const clampedStrength = Math.max(0, Math.min(1, strengthNum));

    const sdStrength = 1 - clampedStrength;

    handleCreateVariant(image, engine, sdStrength);
  };

  const [isOpened, setIsOpened] = useState(false);

  return (
    <Popover
      shadow="sm"
      opened={isOpened}
      onClose={() => setIsOpened(false)}
      withArrow
    >
      <Popover.Target>
        <Tooltip label="Show variant creation menu">
          <Button onClick={() => setIsOpened(!isOpened)}>
            <IconVersions />
          </Button>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <div className="flex max-w-[88vw] flex-col gap-1 sm:max-w-[352px]">
          <p className="text-lg font-bold">create variant of image</p>
          <p className="font-medium">SD variants (0% = brand new image)</p>

          <div className="max-w-[160px]">
            <SelectEngine value={engine} onChange={setEngine} />
          </div>
          <div className="flex flex-wrap gap-1">
            {fixedStrength.map((strength) => (
              <Button
                onClick={() => handleCreateVariant(image, engine, strength)}
                key={strength}
              >
                {Math.round(100 * (1 - strength))}%
              </Button>
            ))}
            <Button onClick={handleCustomClick}>custom...</Button>
          </div>
          <p className="font-medium">DALL-E</p>
          <div>
            <Button
              onClick={() => handleCreateVariant(image, "DALL-E")}
              color="indigo"
            >
              DALL-E
            </Button>
          </div>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
