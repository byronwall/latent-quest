import { Button, Modal, Stack } from "@mantine/core";
import Image from "next/image";
import { useState } from "react";

import { getTextForBreakdown, SdImage } from "../libs/shared-types/src";
import { getImageUrl } from "./ImageList";

// import zoom in from tabler
import { IconZoomIn } from "@tabler/icons";

// nextjs image
type SdImageCompProps = {
  image: SdImage;
  size: number;

  disablePopover?: boolean;
};

export function SdImageComp(props: SdImageCompProps) {
  // des props
  const { image, size, disablePopover } = props;

  // state for modal state
  const [modalOpened, setModalOpened] = useState(false);

  if (image === undefined) {
    return null;
  }

  return (
    <>
      <div style={{ position: "relative" }}>
        <Image src={getImageUrl(image.url)} width={size} height={size} />
        <div
          style={{
            // top right corner
            position: "absolute",
            top: 0,
            right: 0,
          }}
        >
          <Button
            onClick={(evt) => {
              evt.preventDefault();
              evt.stopPropagation();
              setModalOpened(true);
            }}
            variant="subtle"
          >
            <IconZoomIn />
          </Button>
        </div>
      </div>
      {!disablePopover && (
        <Modal opened={modalOpened} onClose={() => setModalOpened(false)}>
          <Stack>
            <div>
              <Image src={getImageUrl(image.url)} width={512} height={512} />
              <div style={{ width: "100%" }}>
                {getTextForBreakdown(image.promptBreakdown)}
              </div>
            </div>
          </Stack>
        </Modal>
      )}
    </>
  );
}
