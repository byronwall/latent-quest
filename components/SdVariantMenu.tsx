import { Button, Menu } from "@mantine/core";

import { SdImage } from "../libs/shared-types/src";
import { SdVariantHandler } from "./SdCardOrTableCell";

interface SdVariantMenuProps {
  onCreateVariant: SdVariantHandler;
  image: SdImage;
}

const fixedStrength = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];

export function SdVariantMenu(props: SdVariantMenuProps) {
  const { onCreateVariant, image } = props;

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

    onCreateVariant(image, "SD 1.5", sdStrength);
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button compact color="indigo">
          SD variant...
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>strength (0% = brand new image)</Menu.Label>
        {fixedStrength.map((strength) => (
          <Menu.Item
            onClick={() => onCreateVariant(image, "SD 1.5", strength)}
            key={strength}
          >
            {Math.round(100 * (1 - strength))}%
          </Menu.Item>
        ))}
        <Menu.Divider />

        <Menu.Item onClick={handleCustomClick}>custom...</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
