import { Menu } from "@mantine/core";

import { Button } from "./Button";
import { handleCreateVariant } from "./handleCreateVariant";

import type { SdImage } from "../libs/shared-types/src";

interface SdVariantMenuProps {
  image: SdImage;
}

// percentage is 1 - this number
export const fixedStrength = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.3, 0.1];

export function SdVariantMenu(props: SdVariantMenuProps) {
  const { image } = props;

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

    handleCreateVariant(image, "SD 1.5", sdStrength);
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button compact color="indigo">
          variants...
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>SD variants (0% = brand new image)</Menu.Label>
        {fixedStrength.map((strength) => (
          <Menu.Item
            onClick={() => handleCreateVariant(image, "SD 1.5", strength)}
            key={strength}
          >
            {Math.round(100 * (1 - strength))}%
          </Menu.Item>
        ))}
        <Menu.Divider />

        <Menu.Item onClick={handleCustomClick}>custom...</Menu.Item>
        <Menu.Divider />
        <Menu.Label>DALL-E</Menu.Label>
        <Menu.Item
          onClick={() => handleCreateVariant(image, "DALL-E")}
          color="indigo"
        >
          DALL-E
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
