import { Popover, Stack } from "@mantine/core";
import { getTextForBreakdown, SdImage } from "../libs/shared-types/src";
import { getImageUrl } from "./ImageList";

type SdImageCompProps = {
  image: SdImage;
  size: number;

  disablePopover?: boolean;
};

export function SdImageComp(props: SdImageCompProps) {
  // des props
  const { image, size, disablePopover } = props;

  if (image === undefined) {
    return null;
  }

  return (
    <Popover
      width={200}
      position="right"
      withArrow
      shadow="lg"
      withinPortal
      closeOnClickOutside
      opened={disablePopover ? false : undefined}
    >
      <Popover.Target>
        <img
          src={getImageUrl(image.url)}
          style={{
            aspectRatio: 1,
            width: size,
            maxWidth: "100%",
          }}
        />
      </Popover.Target>
      <Popover.Dropdown>
        <Stack>
          <div>
            <img
              src={getImageUrl(image.url)}
              style={{
                aspectRatio: 1,
              }}
            />
            <div style={{ width: "100%" }}>
              {getTextForBreakdown(image.promptBreakdown)}
            </div>
          </div>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
